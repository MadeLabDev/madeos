"use client";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { KnowledgeWithRelations } from "@/lib/features/knowledge/types";

interface ViewAssignedUsersModalProps {
	isOpen: boolean;
	onClose: () => void;
	article: KnowledgeWithRelations | null;
}

export function ViewAssignedUsersModal({ isOpen, onClose, article }: ViewAssignedUsersModalProps) {
	if (!article) return null;

	const assignedUsers = article.assignedUsers || [];

	return (
		<Dialog
			open={isOpen}
			onOpenChange={onClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Assigned Users</DialogTitle>
					<DialogDescription>
						Users assigned to: <span className="text-foreground font-semibold">{article.title}</span>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{assignedUsers.length === 0 ? (
						<div className="py-8 text-center">
							<p className="text-muted-foreground text-sm">{article.visibility === "public" ? "This is a public article - no specific users assigned" : "No users assigned to this article"}</p>
						</div>
					) : (
						<ScrollArea className="max-h-[240px] w-full rounded-md border p-2">
							<div className="space-y-1">
								{assignedUsers.map((au) => (
									<div
										key={au.userId}
										className="hover:bg-muted flex items-center justify-between gap-2 rounded p-2 text-sm transition-colors">
										<span className="text-foreground truncate font-medium">{au.user?.email}</span>
										{article.visibility === "private" && (
											<Badge
												variant="secondary"
												className="flex-shrink-0 text-xs">
												Private
											</Badge>
										)}
									</div>
								))}
							</div>
						</ScrollArea>
					)}

					<div className="space-y-2 border-t pt-4">
						<div className="text-muted-foreground text-xs">
							<p>
								<span className="font-semibold">Total Assigned Users:</span> {assignedUsers.length}
							</p>
							<p>
								<span className="font-semibold">Visibility:</span>{" "}
								<Badge
									variant={article.visibility === "public" ? "default" : "secondary"}
									className="ml-1">
									{article.visibility === "public" ? "Public" : "Private"}
								</Badge>
							</p>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
