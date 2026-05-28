"use client";

import React, { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface KanbanColumnProps {
	id: string;
	title: string;
	description?: string;
	count?: number;
	children: ReactNode;
	className?: string;
}

export function KanbanColumn({
	title,
	description,
	count,
	children,
	className,
}: KanbanColumnProps) {
	return (
		<div className={cn("flex flex-col gap-3", className)}>
			<div className="space-y-1">
				<div className="flex items-center justify-between gap-2">
					<h3 className="font-semibold text-sm text-foreground">{title}</h3>
					{count !== undefined && (
						<span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
							{count}
						</span>
					)}
				</div>
				{description && (
					<p className="text-xs text-muted-foreground">{description}</p>
				)}
			</div>
			<div className="space-y-2 flex-1">
				{children}
			</div>
		</div>
	);
}

interface KanbanBoardProps {
	columns: {
		id: string;
		title: string;
		description?: string;
		count?: number;
		items: ReactNode;
	}[];
	className?: string;
}

export function KanbanBoard({ columns, className }: KanbanBoardProps) {
	return (
		<div
			className={cn(
				"grid gap-4",
				"grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
				className
			)}
		>
			{columns.map((column) => (
				<KanbanColumn
					key={column.id}
					id={column.id}
					title={column.title}
					description={column.description}
					count={column.count}
					className="bg-muted/30 rounded-lg border p-4 min-h-[400px]"
				>
					{column.items}
				</KanbanColumn>
			))}
		</div>
	);
}
