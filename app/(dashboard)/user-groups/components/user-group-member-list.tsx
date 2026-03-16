"use client";

import { useCallback, useEffect, useState } from "react";

import { Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Pagination } from "@/components/pagination/pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { getUserGroupMembersAction } from "@/lib/features/user-groups/actions";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

interface UserGroupMemberListProps {
	groupId: string;
	page: number;
	search: string;
	pageSize: number;
	onRemoveUser: (userId: string) => void;
}

export function UserGroupMemberList({ groupId, page, search, pageSize, onRemoveUser }: UserGroupMemberListProps) {
	const [members, setMembers] = useState<any[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);

	// Load members function
	const loadMembers = useCallback(async () => {
		setLoading(true);
		try {
			const result = await getUserGroupMembersAction(groupId, {
				page,
				search,
				pageSize,
			});
			if (result.success && result.data) {
				setMembers(result.data.members || []);
				setTotal(result.data.total || 0);
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to load members");
		} finally {
			setLoading(false);
		}
	}, [groupId, page, search, pageSize]);

	// Load on mount and when filters change
	useEffect(() => {
		loadMembers();
	}, [loadMembers]);

	// Pusher subscription
	usePusher();

	// Stable callbacks for Pusher events
	const handleMemberUpdate = useCallback(
		(eventData: any) => {
			const data = eventData.data || eventData;

			if (data.action === "user_group_members_updated" || data.action === "user_group_updated") {
				// Reload members when group is updated
				loadMembers();
			}
		},
		[loadMembers],
	);

	useChannelEvent("private-global", "user_group_update", handleMemberUpdate);

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle>Group Members</CardTitle>
					<div className="relative">
						<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
						<Input
							placeholder="Search members..."
							defaultValue={search}
							onChange={(e) => {
								const newSearch = e.target.value;
								const newUrl = new URL(window.location.href);
								if (newSearch) {
									newUrl.searchParams.set("search", newSearch);
									newUrl.searchParams.set("page", "1");
								} else {
									newUrl.searchParams.delete("search");
									newUrl.searchParams.delete("page");
								}
								window.history.pushState({}, "", newUrl.toString());
								loadMembers();
							}}
							className="w-64 pl-9"
						/>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{loading ? (
					<div className="flex items-center justify-center py-12">
						<Loader size="lg" />
					</div>
				) : members.length === 0 ? (
					<div className="text-muted-foreground py-8 text-center">
						<Search className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p>No members found</p>
						{search && (
							<Button
								variant="outline"
								className="mt-4"
								onClick={() => {
									const newUrl = new URL(window.location.href);
									newUrl.searchParams.delete("search");
									newUrl.searchParams.delete("page");
									window.history.pushState({}, "", newUrl.toString());
									loadMembers();
								}}>
								<X className="mr-2 h-4 w-4" />
								Clear Search
							</Button>
						)}
					</div>
				) : (
					<>
						<div className="space-y-4">
							{members.map((member) => (
								<div
									key={member.id}
									className="flex items-center justify-between rounded-lg border p-4">
									<div className="flex items-center gap-3">
										<div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
											<span className="text-sm font-medium">{member.user.name?.charAt(0)?.toUpperCase() || member.user.email.charAt(0).toUpperCase()}</span>
										</div>
										<div>
											<p className="font-medium">{member.user.name || "No name"}</p>
											<p className="text-muted-foreground text-sm">{member.user.email}</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<div className="text-muted-foreground text-right text-sm">
											<p>Added {new Date(member.assignedAt).toLocaleDateString()}</p>
										</div>
										<Button
											variant="outline"
											size="sm"
											onClick={() => onRemoveUser(member.userId)}
											className="text-destructive hover:text-destructive">
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
							))}
						</div>

						{/* Pagination */}
						{total > 0 && (
							<Pagination
								page={page}
								total={total}
								pageSize={pageSize}
								itemName="members"
								baseUrl={`/user-groups/${groupId}`}
								search={search}
							/>
						)}
					</>
				)}
			</CardContent>
		</Card>
	);
}
