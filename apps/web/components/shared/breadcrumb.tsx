"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "~/lib/utils";

interface BreadcrumbItem {
	label: string;
	href?: string;
}

interface BreadcrumbProps {
	items?: BreadcrumbItem[];
	className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
	const pathname = usePathname();

	// Generate breadcrumbs from pathname if not provided
	const generateBreadcrumbs = (): BreadcrumbItem[] => {
		if (items) return items;

		const segments = pathname.split("/").filter(Boolean);
		const breadcrumbs: BreadcrumbItem[] = [{ label: "Dashboard", href: "/events" }];

		let path = "";
		for (const segment of segments) {
			path += `/${segment}`;
			
			// Skip ID-based paths and edit/results paths in the breadcrumb display
			if (segment.match(/^[a-f0-9-]{36}$/)) {
				continue;
			}

			const label = segment
				.replace(/-/g, " ")
				.replace(/\b\w/g, (char) => char.toUpperCase());

			breadcrumbs.push({
				label,
				href: path,
			});
		}

		return breadcrumbs;
	};

	const breadcrumbs = generateBreadcrumbs();

	if (breadcrumbs.length <= 1) return null;

	return (
		<nav className={cn("flex items-center gap-1 text-sm text-muted-foreground", className)}>
			{breadcrumbs.map((item, index) => (
				<div key={item.href || index} className="flex items-center gap-1">
					{index > 0 && <ChevronRightIcon className="size-4 opacity-50" />}
					{item.href && index < breadcrumbs.length - 1 ? (
						<Link
							href={item.href}
							className="hover:text-foreground transition-colors underline-offset-2 hover:underline"
						>
							{item.label}
						</Link>
					) : (
						<span className={index === breadcrumbs.length - 1 ? "text-foreground font-medium" : ""}>
							{item.label}
						</span>
					)}
				</div>
			))}
		</nav>
	);
}
