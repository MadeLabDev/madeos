"use client";

import { useState } from "react";

import { Eye, EyeOff, FileIcon, MoreVertical, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { deleteMedia, updateMediaVisibility } from "@/lib/features/media/actions";
import type { MediaItemProps } from "@/lib/features/media/types";

export function MediaGridItem({ id, name, url, type, size, visibility, uploadedBy, onVisibilityChange, onDelete, isSelected, onSelect }: MediaItemProps) {
	const [loading, setLoading] = useState(false);
	const [imageError, setImageError] = useState(false);
	const [currentVisibility, setCurrentVisibility] = useState(visibility);
	const [isDeleted, setIsDeleted] = useState(false);

	const isImage = type.startsWith("image/");

	const toggleVisibility = async () => {
		setLoading(true);
		const newVisibility = currentVisibility === "PUBLIC" ? "PRIVATE" : "PUBLIC";
		const result = await updateMediaVisibility(id, newVisibility as "PUBLIC" | "PRIVATE");

		if (result.success) {
			setCurrentVisibility(newVisibility);
			toast.success(`Changed to ${newVisibility}`);
			// Call parent callback for Pusher event handling
			onVisibilityChange?.(id, newVisibility);
		} else {
			toast.error(result.message);
		}
		setLoading(false);
	};

	const handleDelete = async () => {
		if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
			return;
		}

		setLoading(true);
		const result = await deleteMedia(id);

		if (result.success) {
			setIsDeleted(true);
			toast.success("Media deleted");
			// Call parent callback for Pusher event handling
			onDelete?.(id);
		} else {
			toast.error(result.message);
		}
		setLoading(false);
	};

	// Don't render if deleted
	if (isDeleted) {
		return null;
	}

	return (
		<Card className={`group relative overflow-hidden p-0 transition-shadow hover:shadow-md ${isSelected ? "ring-primary ring-2" : ""}`}>
			{/* Checkbox overlay */}
			<div className="absolute top-2 left-2 z-10">
				<Checkbox
					checked={isSelected || false}
					onCheckedChange={(checked) => onSelect?.(id, checked === true)}
					className="h-5 w-5"
				/>
			</div>

			{/* Preview */}
			<div className="bg-muted relative flex aspect-square items-center justify-center overflow-hidden">
				{isImage && !imageError ? (
					<Image
						src={encodeURI(url)}
						alt={name}
						fill
						className="object-cover"
						onError={() => {
							setImageError(true);
						}}
					/>
				) : (
					<FileIcon className="text-muted-foreground h-12 w-12" />
				)}
			</div>

			{/* Info */}
			<CardContent className="px-3 pb-3">
				<h3 className="mb-2 truncate text-sm font-medium">{name}</h3>

				<div className="space-y-2">
					<div className="flex items-center justify-between text-xs">
						<span className="text-muted-foreground">{(size / 1024 / 1024).toFixed(2)}MB</span>
						<Badge
							variant={visibility === "PUBLIC" ? "default" : "secondary"}
							className="text-xs">
							{visibility}
						</Badge>
					</div>

					{uploadedBy && <p className="text-muted-foreground truncate text-xs">{uploadedBy.name || uploadedBy.email}</p>}
				</div>

				{/* Actions */}
				<div className="mt-3 flex gap-2">
					<Button
						variant="outline"
						size="sm"
						className="flex-1"
						onClick={toggleVisibility}
						disabled={loading}>
						{visibility === "PUBLIC" ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
						<span className="ml-1 hidden sm:inline">{visibility === "PUBLIC" ? "Public" : "Private"}</span>
					</Button>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="outline"
								size="sm"
								disabled={loading}>
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem asChild>
								<a
									href={url}
									target="_blank"
									rel="noopener noreferrer"
									className="cursor-pointer">
									Open
								</a>
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => {
									navigator.clipboard.writeText(url);
									toast.success("URL copied to clipboard");
								}}>
								Copy URL
							</DropdownMenuItem>
							<DropdownMenuItem
								className="text-destructive"
								onClick={handleDelete}>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardContent>
		</Card>
	);
}
