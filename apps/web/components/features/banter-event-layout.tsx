"use client";

import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { QuestionRenderer } from "./question-renderer";
import { SendIcon, UsersIcon } from "lucide-react";
import { useTheme } from "~/hooks/use-theme";

interface BanterEventLayoutProps {
	eventId: string;
	eventTitle?: string;
	theme?: string | null;
	chatItems: any[];
	questionItems: any[];
	answers: Record<string, string[]>;
	participantId: string | null;
	participantMap: Record<string, string>;
	participantStatuses: Record<string, string>;
	onlineCount: number;
	isConnected: boolean;
	isFallbackActive: boolean;
	chatMessage: string;
	formErrors: Record<string, string>;
	onChatMessageChange: (message: string) => void;
	onChatTyping: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onSendChatMessage: (e: React.FormEvent) => Promise<void>;
	onAnswerChange: (itemId: string, value: string[]) => void;
	onFormSubmit: (e: React.FormEvent) => Promise<void>;
	onStatusUpdate: (status: string) => void;
}

export function BanterEventLayout({
	chatItems,
	eventTitle,
	theme,
	questionItems,
	answers,
	participantId,
	participantMap,
	participantStatuses,
	onlineCount,
	isConnected,
	isFallbackActive,
	chatMessage,
	formErrors,
	onChatMessageChange,
	onChatTyping,
	onSendChatMessage,
	onAnswerChange,
}: BanterEventLayoutProps) {
	const chatBottomRef = useRef<HTMLDivElement | null>(null);
	const parsedTheme = useTheme(theme);
	const isImageBackground = parsedTheme.type === "image";

	// Auto scroll to bottom on new messages
	useEffect(() => {
		if (chatBottomRef.current) {
			chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [chatItems]);

	return (
		<div
			style={parsedTheme.wrapperStyle}
			className={`w-full transition-all duration-300 ${parsedTheme.wrapperClass}`}
		>
			{isImageBackground && (
				<div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-none" />
			)}
			<div className={`p-4 md:p-6 ${isImageBackground ? "relative z-10" : ""}`}>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
					{/* Chat Room - Takes 2 columns on desktop, full width on mobile */}
					<Card className="lg:col-span-2 shadow-xl border-border bg-card/85 backdrop-blur-md flex flex-col">
						<CardHeader className="border-b bg-muted/40 p-4 pb-3">
							<div className="flex items-center justify-between">
								<CardTitle className="text-base flex items-center gap-2">
									<UsersIcon className="size-4 text-primary animate-pulse" />
									Banter Chat Room
								</CardTitle>
								<div>
									{isConnected ? (
										<div className="flex items-center gap-2 bg-emerald-500/10 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs px-3.5 py-1.5 rounded-full border border-emerald-500/20 shadow-sm">
											<span className="relative flex h-2 w-2">
												<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
												<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
											</span>
											<span className="font-semibold">{onlineCount} online</span>
										</div>
									) : (
										<div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs px-3.5 py-1.5 rounded-full border border-amber-500/20 shadow-sm">
											Offline Mode {isFallbackActive && "(Polling)"}
										</div>
									)}
								</div>
							</div>
							<CardDescription className="text-xs mt-1">Real-time conversation</CardDescription>
						</CardHeader>

						<CardContent className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/30 min-h-[350px]">
							{chatItems.length === 0 ? (
								<div className="text-center text-muted-foreground py-16 text-sm italic">
									No messages yet. Send a message to spark the banter!
								</div>
							) : (
								chatItems.map((msg) => {
									const senderAlias = msg.participantId ? participantMap[msg.participantId] : undefined;
									return (
										<div key={msg.id} className="flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-2">
											<Avatar className="size-8 border shadow-sm flex-shrink-0">
												<AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
													{senderAlias?.substring(0, 2).toUpperCase() || "PT"}
												</AvatarFallback>
											</Avatar>
											<div className="flex flex-col bg-card border rounded-2xl px-3.5 py-2 max-w-xs text-sm shadow-sm">
												<span className="font-bold text-[10px] text-primary tracking-wide uppercase">
													{senderAlias || "Anonymous"}
												</span>
												<p className="mt-0.5 break-words font-medium text-foreground">{msg.value}</p>
											</div>
										</div>
									);
								})
							)}
							<div ref={chatBottomRef} />
						</CardContent>

						<div className="p-3 border-t bg-muted/30">
							{Object.entries(participantStatuses).some(([pid, status]) => pid !== participantId && status === "typing") && (
								<p className="text-[11px] text-muted-foreground italic mb-2 animate-pulse pl-1">Someone is typing...</p>
							)}
							<form onSubmit={onSendChatMessage} className="flex gap-2">
								<Input
									placeholder="Say something nice..."
									value={chatMessage}
									onChange={onChatTyping}
									className="flex-1 bg-background/90"
								/>
								<Button type="submit" size="icon" disabled={!chatMessage.trim()} className="shadow-md">
									<SendIcon className="size-4" />
								</Button>
							</form>
						</div>
					</Card>

					{/* Poll Questions Sidebar */}
					<div className="space-y-4">
						<Card className="shadow-xl border-border bg-card/85 backdrop-blur-md">
							<CardHeader className="border-b bg-muted/40 p-4 pb-3">
								<CardTitle className="text-base">Poll Questions</CardTitle>
								<CardDescription className="text-xs">Vote on community topics</CardDescription>
							</CardHeader>
							<CardContent className="p-4 space-y-6 max-h-[600px] overflow-y-auto">
								{questionItems.length === 0 ? (
									<p className="text-center text-muted-foreground py-8 text-sm italic">
										No poll questions yet. Stay tuned!
									</p>
								) : (
									questionItems.map((item) => (
										<div key={item.id} className="space-y-2 pb-4 border-b last:border-b-0 last:pb-0">
											<QuestionRenderer
												item={item}
												answer={answers[item.id] ?? []}
												onChange={(val) => onAnswerChange(item.id, val)}
												error={formErrors[item.id]}
											/>
										</div>
									))
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
