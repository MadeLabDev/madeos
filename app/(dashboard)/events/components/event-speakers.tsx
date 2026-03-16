"use client";

import { useCallback, useEffect, useState } from "react";

import { Plus, Search, Trash2, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { addSpeakerToEventAction, getEventSpeakersAction, removeSpeakerFromEventAction } from "@/lib/features/events/actions/event-post.actions";
import { EventPostRelation } from "@/lib/features/events/types/event-post.types";
import { getPostsAction } from "@/lib/features/post/actions/post.actions";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

interface EventSpeakersProps {
	eventId: string;
}

export function EventSpeakers({ eventId }: EventSpeakersProps) {
	const [speakers, setSpeakers] = useState<EventPostRelation[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [searchResults, setSearchResults] = useState<any[]>([]);
	const [searching, setSearching] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);

	// Initialize Pusher
	usePusher();

	// Subscribe to speaker updates
	useChannelEvent("private-global", "event_speaker_update", (data: any) => {
		const { action, eventId: updatedEventId } = data;
		if (updatedEventId === eventId && (action === "speaker_added" || action === "speaker_removed")) {
			loadSpeakers();
		}
	});

	const loadSpeakers = useCallback(async () => {
		try {
			setLoading(true);
			const result = await getEventSpeakersAction(eventId);
			if (result.success && result.data) {
				setSpeakers(result.data);
			} else {
				toast.error(result.message || "Failed to load speakers");
			}
		} catch (error) {
			toast.error("Failed to load speakers");
		} finally {
			setLoading(false);
		}
	}, [eventId]);

	const searchPosts = async (term: string) => {
		try {
			setSearching(true);
			const result = await getPostsAction({
				search: term.trim() || undefined,
				type: "speaker",
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

	const addSpeaker = async (postId: string) => {
		try {
			const result = await addSpeakerToEventAction(eventId, postId);
			if (result.success) {
				toast.success("Speaker added successfully");
				loadSpeakers();
				setDialogOpen(false);
				setSearchTerm("");
				setSearchResults([]);
			} else {
				toast.error(result.message || "Failed to add speaker");
			}
		} catch (error) {
			toast.error("Failed to add speaker");
		}
	};

	const removeSpeaker = async (postId: string) => {
		try {
			const result = await removeSpeakerFromEventAction(eventId, postId);
			if (result.success) {
				toast.success("Speaker removed successfully");
				loadSpeakers();
			} else {
				toast.error(result.message || "Failed to remove speaker");
			}
		} catch (error) {
			toast.error("Failed to remove speaker");
		}
	};

	useEffect(() => {
		loadSpeakers();
	}, [loadSpeakers]);

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
					<h3 className="text-lg font-medium">Event Speakers</h3>
					<p className="text-muted-foreground text-sm">Manage speakers for this event ({speakers.length} speakers)</p>
				</div>

				<Dialog
					open={dialogOpen}
					onOpenChange={setDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							Add Speaker
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>Add Speaker to Event</DialogTitle>
						</DialogHeader>

						<div className="space-y-4">
							<div className="relative">
								<Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
								<Input
									placeholder="Search speaker posts..."
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
															<User className="text-muted-foreground h-8 w-8" />
															<div>
																<h4 className="font-medium">{post.title}</h4>
																<p className="text-muted-foreground text-sm">{post.excerpt || "No description"}</p>
															</div>
														</div>
														<Button
															size="sm"
															onClick={() => addSpeaker(post.id)}
															disabled={speakers.some((s) => s.postId === post.id)}>
															{speakers.some((s) => s.postId === post.id) ? "Added" : "Add"}
														</Button>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								) : (
									<div className="text-muted-foreground py-8 text-center">No speaker posts found</div>
								)}
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{/* Speakers List */}
			{speakers.length > 0 ? (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{speakers.map((speaker) => (
						<Card key={speaker.postId}>
							<CardContent className="p-4">
								<div className="flex items-start justify-between">
									<div className="flex items-center space-x-3">
										<User className="text-muted-foreground h-8 w-8" />
										<div className="min-w-0 flex-1">
											<h4 className="truncate font-medium">{speaker.post.title}</h4>
											<p className="text-muted-foreground line-clamp-2 text-sm">{speaker.post.excerpt || "No description"}</p>
											<p className="text-muted-foreground mt-1 text-xs">Added {new Date(speaker.assignedAt).toLocaleDateString()}</p>
										</div>
									</div>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => removeSpeaker(speaker.postId)}
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
						<User className="text-muted-foreground mx-auto h-12 w-12" />
						<h3 className="mt-4 text-lg font-medium">No speakers yet</h3>
						<p className="text-muted-foreground">Add speakers to showcase the event presenters and experts.</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
