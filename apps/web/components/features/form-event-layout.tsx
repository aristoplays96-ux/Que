"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { QuestionRenderer } from "./question-renderer";
import { CheckCircleIcon } from "lucide-react";

interface FormEventLayoutProps {
	eventTitle: string;
	eventDescription?: string;
	eventType: "form" | "poll";
	questionItems: any[];
	answers: Record<string, string[]>;
	submitted: boolean;
	formErrors: Record<string, string>;
	isSubmitting: boolean;
	onAnswerChange: (itemId: string, value: string[]) => void;
	onFormSubmit: (e: React.FormEvent) => Promise<void>;
}

export function FormEventLayout({
	eventTitle,
	eventDescription,
	eventType,
	questionItems,
	answers,
	submitted,
	formErrors,
	isSubmitting,
	onAnswerChange,
	onFormSubmit,
}: FormEventLayoutProps) {
	if (submitted) {
		return (
			<Card className="shadow-xl border-border bg-card/90 backdrop-blur-md">
				<CardContent className="flex flex-col items-center justify-center py-20 space-y-4">
					<div className="p-3 bg-emerald-500/10 dark:bg-emerald-950/20 rounded-full">
						<CheckCircleIcon className="size-12 text-emerald-600 dark:text-emerald-400" />
					</div>
					<div className="text-center space-y-2">
						<h3 className="text-xl font-bold text-foreground">Thank You!</h3>
						<p className="text-muted-foreground text-sm max-w-xs">
							Your response has been recorded. We appreciate your feedback!
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	const progressPercentage =
		questionItems.length > 0
			? (Object.keys(answers).filter((id) => answers[id] && answers[id].length > 0).length / questionItems.length) * 100
			: 0;

	return (
		<form onSubmit={onFormSubmit} className="space-y-6">
			<Card className="shadow-xl border-border bg-card/90 backdrop-blur-md">
				<CardHeader className="border-b bg-muted/40 p-4 pb-3">
					<CardTitle className="text-lg">{eventTitle}</CardTitle>
					{eventDescription && <CardDescription className="mt-1 text-sm">{eventDescription}</CardDescription>}

					{questionItems.length > 0 && (
						<div className="mt-4 space-y-2">
							<div className="flex justify-between items-center text-xs text-muted-foreground">
								<span>Progress</span>
								<span>
									{Object.keys(answers).filter((id) => answers[id] && answers[id].length > 0).length} of {questionItems.length}
								</span>
							</div>
							<div className="w-full bg-muted rounded-full h-2 overflow-hidden">
								<div
									className="h-full bg-primary transition-all duration-300"
									style={{ width: `${progressPercentage}%` }}
								/>
							</div>
						</div>
					)}
				</CardHeader>

				<CardContent className="pt-6 space-y-6">
					{questionItems.length === 0 ? (
						<p className="text-center text-muted-foreground py-12 text-sm italic">
							No questions added yet to this {eventType}.
						</p>
					) : (
						questionItems.map((item, index) => (
							<div key={item.id} className="space-y-2">
								<div className="flex items-center gap-2 mb-2">
									<span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
										{index + 1} of {questionItems.length}
									</span>
								</div>
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

			{questionItems.length > 0 && (
				<div className="flex gap-3">
					<Button
						type="submit"
						disabled={isSubmitting || Object.keys(answers).length === 0}
						className="flex-1 shadow-lg"
						size="lg"
					>
						{isSubmitting ? "Submitting..." : "Submit Response"}
					</Button>
				</div>
			)}
		</form>
	);
}
