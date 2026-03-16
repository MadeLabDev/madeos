"use client";

import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { FieldDefinition } from "@/lib/features/profile/types/user-profile.types";

interface ModuleDisplayFieldProps {
	field: FieldDefinition;
	value: any;
}

export function ModuleDisplayField({ field, value }: ModuleDisplayFieldProps) {
	// Don't render if value is empty
	if (value === null || value === undefined || value === "") {
		return null;
	}

	const renderValue = () => {
		switch (field.type) {
			case "text":
			case "email":
			case "url":
			case "number":
				return <p className="text-sm">{String(value)}</p>;

			case "textarea":
				return <p className="text-sm whitespace-pre-wrap">{String(value)}</p>;

			case "select":
			case "radio":
				// Find the option label
				const option = field.options?.find((opt) => String(opt.value) === String(value));
				return <p className="text-sm">{option?.label || String(value)}</p>;

			case "multiselect":
			case "checkbox":
				if (Array.isArray(value) && value.length > 0) {
					return (
						<div className="flex flex-wrap gap-1">
							{value.map((val: any, index: number) => {
								const option = field.options?.find((opt) => String(opt.value) === String(val));
								return (
									<Badge
										key={index}
										variant="secondary"
										className="text-xs">
										{option?.label || String(val)}
									</Badge>
								);
							})}
						</div>
					);
				}
				return null;

			case "boolean":
				return (
					<Badge
						variant={value ? "default" : "secondary"}
						className="text-xs">
						{value ? "Yes" : "No"}
					</Badge>
				);

			case "date":
				try {
					return <p className="text-sm">{new Date(value).toLocaleDateString()}</p>;
				} catch {
					return <p className="text-sm">{String(value)}</p>;
				}

			case "daterange":
				if (value?.start || value?.end) {
					const start = value.start ? new Date(value.start).toLocaleDateString() : "";
					const end = value.end ? new Date(value.end).toLocaleDateString() : "";
					return (
						<p className="text-sm">
							{start} - {end}
						</p>
					);
				}
				return null;

			case "tags":
				if (Array.isArray(value) && value.length > 0) {
					return (
						<div className="flex flex-wrap gap-1">
							{value.map((tag: string, index: number) => (
								<Badge
									key={index}
									variant="outline"
									className="text-xs">
									{tag}
								</Badge>
							))}
						</div>
					);
				}
				return null;

			case "file":
			case "image":
				if (typeof value === "string" && value) {
					return (
						<div className="space-y-2">
							{field.type === "image" ? (
								<div className="relative h-64 w-full">
									<Image
										src={value}
										alt={field.label}
										fill
										className="rounded border object-contain"
									/>
								</div>
							) : (
								<a
									href={value}
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm text-blue-600 hover:underline">
									Download File
								</a>
							)}
						</div>
					);
				}
				return null;

			default:
				return <p className="text-sm">{String(value)}</p>;
		}
	};

	return (
		<div className="space-y-2">
			<Label className="text-sm font-medium">{field.label}</Label>
			{renderValue()}
		</div>
	);
}
