"use client";

import React from "react";

/**
 * Hook to parse and apply theme strings from events
 * Theme format:
 *   - "class:..." -> Tailwind CSS classes (e.g., "class:bg-blue-500 text-white")
 *   - "image:..." -> Background image URL (e.g., "image:https://...")
 *   - "" or null -> Default theme
 */

export interface ParsedTheme {
	type: "class" | "image" | "default";
	value: string;
	wrapperClass: string;
	wrapperStyle: React.CSSProperties;
}

export function useTheme(theme?: string | null): ParsedTheme {
	if (!theme) {
		return {
			type: "default",
			value: "",
			wrapperClass: "bg-gradient-to-b from-background to-muted/20",
			wrapperStyle: {},
		};
	}

	// Parse "class:..." format
	if (theme.startsWith("class:")) {
		const classes = theme.replace("class:", "").trim();
		return {
			type: "class",
			value: classes,
			wrapperClass: classes,
			wrapperStyle: {},
		};
	}

	// Parse "image:..." format
	if (theme.startsWith("image:")) {
		const imageUrl = theme.replace("image:", "").trim();
		return {
			type: "image",
			value: imageUrl,
			wrapperClass: "relative",
			wrapperStyle: {
				backgroundImage: `url(${imageUrl})`,
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundAttachment: "fixed",
			},
		};
	}

	// Fallback to default if format is unrecognized
	return {
		type: "default",
		value: "",
		wrapperClass: "bg-gradient-to-b from-background to-muted/20",
		wrapperStyle: {},
	};
}
