"use client";

import { useCallback, useEffect, useState } from "react";

import { Building, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { addSponsorToEventAction, getEventSponsorsAction, removeSponsorFromEventAction } from "@/lib/features/events/actions/event-post.actions";
import { EventPostRelation } from "@/lib/features/events/types/event-post.types";
import { getPostsAction } from "@/lib/features/post/actions/post.actions";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

interface EventSponsorsProps {
	eventId: string;
}

export function EventSponsors({ eventId }: EventSponsorsProps) {
	const [sponsors, setSponsors] = useState<EventPostRelation[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [searchResults, setSearchResults] = useState<any[]>([]);
	const [searching, setSearching] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);

	// Initialize Pusher
	usePusher();

	// Subscribe to sponsor updates
	useChannelEvent("private-global", "event_sponsor_update", (data: any) => {
		const { action, eventId: updatedEventId } = data;
		if (updatedEventId === eventId && (action === "sponsor_added" || action === "sponsor_removed")) {
			loadSponsors();
		}
	});

	const loadSponsors = useCallback(async () => {
		try {
			setLoading(true);
			const result = await getEventSponsorsAction(eventId);
			if (result.success && result.data) {
				setSponsors(result.data);
			} else {
				toast.error(result.message || "Failed to load sponsors");
			}
		} catch (error) {
			toast.error("Failed to load sponsors");
		} finally {
			setLoading(false);
		}
	}, [eventId]);

	const searchPosts = async (term: string) => {
		try {
			setSearching(true);
			const result = await getPostsAction({
				search: term.trim() || undefined,
				type: "sponsor",
				isPublished: true,
				pageSize: 20,
			});

			if (result.success && result.data) {
				setSearchResults(result.data.items);
			} else {
				setSearchResults([]);
			}
		} catch (error) {
			toast.error("Failed to search posts");
			setSearchResults([]);
		} finally {
			setSearching(false);
		}
	};

	const addSponsor = async (postId: string) => {
		try {
			const result = await addSponsorToEventAction(eventId, postId);
			if (result.success) {
				toast.success("Sponsor added successfully");
				loadSponsors();
				setDialogOpen(false);
				setSearchTerm("");
				setSearchResults([]);
			} else {
				toast.error(result.message || "Failed to add sponsor");
			}
		} catch (error) {
			toast.error("Failed to add sponsor");
		}
	};

	const removeSponsor = async (postId: string) => {
		try {
			const result = await removeSponsorFromEventAction(eventId, postId);
			if (result.success) {
				toast.success("Sponsor removed successfully");
				loadSponsors();
			} else {
				toast.error(result.message || "Failed to remove sponsor");
			}
		} catch (error) {
			toast.error("Failed to remove sponsor");
		}
	};

	useEffect(() => {
		loadSponsors();
	}, [loadSponsors]);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			searchPosts(searchTerm);
		}, 300);

		return () => clearTimeout(timeoutId);
	}, [searchTerm]);

	useEffect(() => {
		if (dialogOpen) {
			searchPosts("");
		}
	}, [dialogOpen]);

	if (loading) {
		return <Loader size="md" />;
	}

	return (
		<div className="space-y-4">
			{/* Header with Add Button */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-medium">Event Sponsors</h3>
					<p className="text-muted-foreground text-sm">Manage sponsors for this event ({sponsors.length} sponsors)</p>
				</div>

				<Dialog
					open={dialogOpen}
					onOpenChange={setDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							Add Sponsor
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>Add Sponsor to Event</DialogTitle>
						</DialogHeader>

						<div className="space-y-4">
							<div className="relative">
								<Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
								<Input
									placeholder="Search sponsor posts..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-9"
								/>
							</div>

							<div className="max-h-96 overflow-y-auto">
								{searching ? (
									<div className="flex items-center justify-center py-8">
										<Loader size="sm" />
									</div>
								) : searchResults.length > 0 ? (
									<div className="space-y-2">
										{searchResults.map((post) => (
											<Card
												key={post.id}
												className="hover:bg-muted/50 cursor-pointer">
												<CardContent className="p-4">
													<div className="flex items-center justify-between">
														<div className="flex items-center space-x-3">
															<Building className="text-muted-foreground h-8 w-8" />
															<div>
																<h4 className="font-medium">{post.title}</h4>
																<p className="text-muted-foreground text-sm">{post.excerpt || "No description"}</p>
															</div>
														</div>
														<Button
															size="sm"
															onClick={() => addSponsor(post.id)}
															disabled={sponsors.some((s) => s.postId === post.id)}>
															{sponsors.some((s) => s.postId === post.id) ? "Added" : "Add"}
														</Button>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								) : (
									<div className="text-muted-foreground py-8 text-center">No sponsor posts found</div>
								)}
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{/* Sponsors List */}
			{sponsors.length > 0 ? (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{sponsors.map((sponsor) => (
						<Card key={sponsor.postId}>
							<CardContent className="p-4">
								<div className="flex items-start justify-between">
									<div className="flex items-center space-x-3">
										<Building className="text-muted-foreground h-8 w-8" />
										<div className="min-w-0 flex-1">
											<h4 className="truncate font-medium">{sponsor.post.title}</h4>
											<p className="text-muted-foreground line-clamp-2 text-sm">{sponsor.post.excerpt || "No description"}</p>
											<p className="text-muted-foreground mt-1 text-xs">Added {new Date(sponsor.assignedAt).toLocaleDateString()}</p>
										</div>
									</div>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => removeSponsor(sponsor.postId)}
										className="text-destructive hover:text-destructive">
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : (
				<Card>
					<CardContent className="p-8 text-center">
						<Building className="text-muted-foreground mx-auto h-12 w-12" />
						<h3 className="mt-4 text-lg font-medium">No sponsors yet</h3>
						<p className="text-muted-foreground">Add sponsors to showcase the event supporters and partners.</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
