"use client";

import { useEvent } from "~/hooks/use-event";
import { useItems } from "~/hooks/use-items";
import { useCreateResponse } from "~/hooks/use-create-response";
import { useCreateItem } from "~/hooks/use-create-item";
import { useCreateParticipant } from "~/hooks/use-create-participant";
import { useSocket } from "~/hooks/use-socket";
import { BanterEventLayout } from "~/components/features/banter-event-layout";
import { FormEventLayout } from "~/components/features/form-event-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { LoadingSpinner } from "~/components/shared/loading-spinner";
import { toast } from "sonner";
import React, { useState, useEffect } from "react";
import { useParticipants } from "~/hooks/use-participants";
import { CheckCircleIcon, ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export default function PublicEventPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = React.use(params);
	const [isMounted, setIsMounted] = useState(false);
	const { data: event, isLoading: isLoadingEvent } = useEvent(id);
	const { data: items, isLoading: isLoadingItems } = useItems(id);
	const { data: participants } = useParticipants(id);

	// Ensure component only renders after client-side hydration
	useEffect(() => {
		setIsMounted(true);
	}, []);
	
	const createResponse = useCreateResponse();
	const createItem = useCreateItem();
	const createParticipant = useCreateParticipant();

	const participantMap = React.useMemo(() => {
		const map: Record<string, string> = {};
		if (participants) {
			participants.forEach((p) => {
				map[p.id] = p.alias;
			});
		}
		return map;
	}, [participants]);

	// Live WebSockets Integration
	const {
		isConnected,
		isFallbackActive,
		onlineCount,
		participantStatuses,
		updateStatus,
	} = useSocket(id);

	// Client UI State
	const [participantId, setParticipantId] = useState<string | null>(null);
	const [alias, setAlias] = useState("");
	const [isJoined, setIsJoined] = useState(false);
	
	// Form & Chat State
	const [answers, setAnswers] = useState<Record<string, string[]>>({});
	const [chatMessage, setChatMessage] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});

	// Join event participant session
	const handleJoinEvent = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!alias.trim()) {
			toast.error("Please enter a nickname/alias to participate");
			return;
		}

		try {
			const res = await createParticipant.mutateAsync({
				eventId: id,
				alias: alias.trim(),
			});
			setParticipantId(res.id);
			setIsJoined(true);
			updateStatus("idle");
			toast.success(`Joined as ${alias.trim()}`);
		} catch (err) {
			console.error("Failed to join event", err);
		}
	};

	// Handle standard form/poll responses submission
	const handleFormSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!event || !items) return;

		const questions = items.filter((i) => i.category === "question");
		const errors: Record<string, string> = {};
		
		questions.forEach((q) => {
			const ans = answers[q.id];
			if (q.required && (!ans || ans.length === 0 || !ans[0]?.trim())) {
				errors[q.id] = "This question is required";
			}
		});

		if (Object.keys(errors).length > 0) {
			setFormErrors(errors);
			toast.error("Please answer all required questions");
			return;
		}

		setFormErrors({});
		updateStatus("completed");

		try {
			await createResponse.mutateAsync({
				eventId: id,
				participantId: participantId || undefined,
				answers: Object.entries(answers).map(([itemId, val]) => ({
					itemId,
					value: val,
				})),
			});
			setSubmitted(true);
			toast.success("Response submitted successfully!");
		} catch (err) {
			console.error("Submission failed", err);
			toast.error("Failed to submit response");
			updateStatus("idle");
		}
	};

	// Handle sending chat message in Banter event type
	const handleSendChatMessage = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!chatMessage.trim() || !participantId) return;

		const text = chatMessage.trim();
		setChatMessage("");
		updateStatus("idle");

		try {
			await createItem.mutateAsync({
				eventId: id,
				category: "chat",
				value: text,
				participantId: participantId || undefined,
			});
		} catch (err) {
			toast.error("Failed to send message");
		}
	};

	// Track when user is typing to update presence status in real time
	const handleInputChange = (itemId: string, val: string[]) => {
		setAnswers((prev) => ({ ...prev, [itemId]: val }));
	};

	const handleChatTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
		setChatMessage(e.target.value);
		if (e.target.value.trim().length > 0) {
			updateStatus("typing");
		} else {
			updateStatus("idle");
		}
	};

	if (!isMounted) {
		return null;
	}

	if (isLoadingEvent) {
		return (
			<div className="flex h-screen items-center justify-center bg-background">
				<LoadingSpinner />
			</div>
		);
	}

	if (!event) {
		return (
			<div className="flex h-screen items-center justify-center bg-background">
				<Card>
					<CardContent className="pt-6 text-center space-y-4">
						<p className="text-destructive font-semibold">Event Not Found</p>
						<p className="text-sm text-muted-foreground">The event link is invalid or has expired.</p>
						<Link href="/events">
							<Button variant="outline" size="sm">
								<ArrowLeftIcon className="size-4 mr-2" />
								Back to Events
							</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Step 1: Force joining alias to participate
	if (!isJoined) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
				<Card className="w-full max-w-md shadow-xl border-border bg-card/90 backdrop-blur-md">
					<CardHeader className="text-center">
						<CardTitle className="text-2xl">{event.title}</CardTitle>
						<CardDescription className="mt-2">{event.description || "Enter your nickname to participate"}</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleJoinEvent} className="space-y-4">
							<Input
								placeholder="Enter your nickname or alias"
								value={alias}
								onChange={(e) => setAlias(e.target.value)}
								maxLength={30}
								autoFocus
							/>
							<Button type="submit" className="w-full" disabled={createParticipant.isLoading}>
								{createParticipant.isLoading ? "Joining..." : `Join ${event.type === "banter" ? "Chat Room" : event.type === "poll" ? "Poll" : "Form"}`}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Step 2: Show success after response recorded (for forms/polls only)
	if (submitted && event.type !== "banter") {
		return (
			<div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
				<Card className="w-full max-w-md text-center shadow-xl border-border bg-card/90 backdrop-blur-md">
					<CardContent className="pt-12 pb-12 space-y-5">
						<div className="p-3 bg-emerald-500/10 dark:bg-emerald-950/20 rounded-full w-fit mx-auto">
							<CheckCircleIcon className="size-16 text-emerald-600 dark:text-emerald-400" />
						</div>
						<h2 className="text-2xl font-bold">Thank You!</h2>
						<p className="text-muted-foreground text-sm">Your response has been recorded. We appreciate your participation!</p>
						<Link href="/events">
							<Button variant="outline" size="sm" className="gap-2">
								<ArrowLeftIcon className="size-4" />
								Back to Events
							</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	const questionItems = (items ?? []).filter((i) => i.category === "question");
	const chatItems = (items ?? []).filter((i) => i.category === "chat");

	return (
		<div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
			<div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
				<Link href="/events" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
					<ArrowLeftIcon className="size-4" />
					Back to Events
				</Link>

				{isLoadingItems ? (
					<div className="flex items-center justify-center py-12">
						<LoadingSpinner />
					</div>
				) : event.type === "banter" ? (
					<BanterEventLayout
						eventId={id}
						chatItems={chatItems}
						questionItems={questionItems}
						answers={answers}
						participantId={participantId}
						participantMap={participantMap}
						participantStatuses={participantStatuses}
						onlineCount={onlineCount}
						isConnected={isConnected}
						isFallbackActive={isFallbackActive}
						chatMessage={chatMessage}
						formErrors={formErrors}
						onChatMessageChange={setChatMessage}
						onChatTyping={handleChatTyping}
						onSendChatMessage={handleSendChatMessage}
						onAnswerChange={handleInputChange}
						onFormSubmit={handleFormSubmit}
						onStatusUpdate={updateStatus}
					/>
				) : (
					<FormEventLayout
						eventTitle={event.title}
						eventDescription={event.description || undefined}
						eventType={event.type === "poll" ? "poll" : "form"}
						questionItems={questionItems}
						answers={answers}
						submitted={submitted}
						formErrors={formErrors}
						isSubmitting={createResponse.isLoading}
						onAnswerChange={handleInputChange}
						onFormSubmit={handleFormSubmit}
					/>
				)}
			</div>
		</div>
	);
}
