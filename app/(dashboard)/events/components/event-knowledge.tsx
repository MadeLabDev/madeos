"use client";

import { useCallback, useEffect, useState } from "react";

import { Book, ExternalLink, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { KNOWLEDGE_TYPE_OPTIONS, KNOWLEDGE_VISIBILITY_OPTIONS } from "@/lib/config/module-types";
import { getArticlesAction } from "@/lib/features/knowledge/actions/knowledge.actions";
import { KnowledgeWithRelations } from "@/lib/features/knowledge/types";
import { formatDate } from "@/lib/utils";

interface EventKnowledgeProps {
	eventId: string;
}

export function EventKnowledge({ eventId }: EventKnowledgeProps) {
	const router = useRouter();
	const [articles, setArticles] = useState<KnowledgeWithRelations[]>([]);
	const [loading, setLoading] = useState(true);
	const loadEventKnowledge = useCallback(async () => {
		try {
			setLoading(true);
			// Get all knowledge articles and filter by eventId
			const result = await getArticlesAction({
				eventId: eventId,
				pageSize: 100, // Get all articles for this event
			});
			if (result.success && result.data) {
				setArticles(result.data.data || []);
			} else {
				console.error("Failed to load event knowledge:", result.message);
			}
		} catch (error) {
			console.error("Failed to load event knowledge:", error);
		} finally {
			setLoading(false);
		}
	}, [eventId, setLoading, setArticles]);

	useEffect(() => {
		loadEventKnowledge();
	}, [eventId, loadEventKnowledge]);

	const getVisibilityBadge = (visibility: string) => {
		const config = KNOWLEDGE_VISIBILITY_OPTIONS.find((option) => option.value === visibility);
		return <Badge variant={config?.badgeVariant || "outline"}>{config?.label || visibility}</Badge>;
	};

	const getArticleUrl = (article: KnowledgeWithRelations) => {
		if (article.visibility === "public") {
			return `/shared/${article.slug}`;
		} else if (article.visibility === "private") {
			return `/course/${article.slug}`;
		}
		return `/knowledge/${article.slug}`; // fallback
	};

	const getArticleViewUrl = (article: KnowledgeWithRelations) => {
		return `/knowledge/${article.id}`; // fallback
	};

	const getTypeBadge = (type: string) => {
		const config = KNOWLEDGE_TYPE_OPTIONS.find((option) => option.value === type);
		return <Badge variant={config?.badgeVariant || "outline"}>{config?.label || type}</Badge>;
	};

	if (loading) {
		return <Loader size="lg" />;
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-medium">Knowledge Articles</h3>
					<p className="text-muted-foreground text-sm">Articles available to event attendees</p>
				</div>
				<Button onClick={() => router.push("/knowledge/new?eventId=" + eventId)}>
					<Plus className="mr-2 h-4 w-4" />
					Add Article
				</Button>
			</div>

			{/* Articles List */}
			{articles.length > 0 ? (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{articles.map((article) => (
						<Card
							key={article.id}
							className="transition-shadow hover:shadow-md">
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between gap-2">
									<CardTitle className="line-clamp-2 text-base">{article.title}</CardTitle>
									<div className="flex flex-shrink-0 gap-1">
										{getVisibilityBadge(article.visibility)}
										{getTypeBadge(article.type)}
									</div>
								</div>
								{article.excerpt && <p className="text-muted-foreground line-clamp-2 text-sm">{article.excerpt}</p>}
							</CardHeader>
							<CardContent className="pt-0">
								<div className="text-muted-foreground flex items-center justify-between text-xs">
									<span>Views: {article.viewCount}</span>
									<span>{formatDate(article.createdAt)}</span>
								</div>
								<div className="mt-3 flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => router.push(getArticleViewUrl(article))}
										className="flex-1">
										<Book className="mr-1 h-3 w-3" />
										View
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => window.open(getArticleUrl(article), "_blank")}>
										<ExternalLink className="h-3 w-3" />
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : (
				<div className="py-12 text-center">
					<Book className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
					<h3 className="mb-2 text-lg font-medium">No knowledge articles</h3>
					<p className="text-muted-foreground mb-4">Create knowledge articles to provide additional resources for event attendees.</p>
					<Button onClick={() => router.push("/knowledge/new?eventId=" + eventId)}>
						<Plus className="mr-2 h-4 w-4" />
						Create First Article
					</Button>
				</div>
			)}
		</div>
	);
}
