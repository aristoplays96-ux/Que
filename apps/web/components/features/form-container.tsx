"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { LoadingSpinner } from "~/components/shared/loading-spinner";
import { cn } from "~/lib/utils";

interface FormContainerProps {
	eventId: string;
	title: string;
	description?: string;
	currentQuestionIndex?: number;
	totalQuestions?: number;
	showProgress?: boolean;
	isSubmitting?: boolean;
	onSubmit?: () => void;
	submitButtonLabel?: string;
	children: React.ReactNode;
	className?: string;
}

export function FormContainer({
	eventId,
	title,
	description,
	currentQuestionIndex = 0,
	totalQuestions = 1,
	showProgress = false,
	isSubmitting = false,
	onSubmit,
	submitButtonLabel = "Submit",
	children,
	className,
}: FormContainerProps) {
	const progressPercent = totalQuestions > 0 ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100) : 0;

	return (
		<div className={cn("w-full max-w-2xl mx-auto", className)}>
			<Card className="shadow-lg border-0">
				{/* Progress Bar */}
				{showProgress && totalQuestions > 1 && (
					<div className="h-1 bg-muted">
						<div
							className="h-full bg-primary transition-all duration-300"
							style={{ width: `${progressPercent}%` }}
						/>
					</div>
				)}

				<CardHeader>
					<div className="space-y-2">
						<CardTitle className="text-3xl font-bold tracking-tight">{title}</CardTitle>
						{description && (
							<CardDescription className="text-base leading-relaxed">{description}</CardDescription>
						)}
					</div>

					{/* Question Counter */}
					{showProgress && totalQuestions > 1 && (
						<div className="pt-2 border-t mt-4">
							<p className="text-xs font-medium text-muted-foreground">
								Question <span className="font-semibold text-foreground">{currentQuestionIndex + 1}</span> of{" "}
								<span className="font-semibold text-foreground">{totalQuestions}</span>
							</p>
						</div>
					)}
				</CardHeader>

				<CardContent className="space-y-6">
					{children}

					{onSubmit && (
						<Button
							onClick={onSubmit}
							disabled={isSubmitting}
							size="lg"
							className="w-full mt-8"
						>
							{isSubmitting ? (
								<>
									<LoadingSpinner className="mr-2 size-4" />
									Submitting...
								</>
							) : (
								submitButtonLabel
							)}
						</Button>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
