"use client";

import { useMemo, useState } from "react";

import { BookOpen, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

// Static FAQ data - no database needed
const FAQ_DATA = [
	{
		id: "getting-started",
		category: "Getting Started",
		questions: [
			{
				id: "how-to-login",
				question: "How do I log in to MADE Laboratory?",
				answer: "You can log in using your email address and password. If you don't have an account, contact your administrator to create one for you.",
			},
			{
				id: "forgot-password",
				question: "I forgot my password. What should I do?",
				answer: 'Click on "Forgot Password" on the login page and enter your email address. You will receive a reset link via email. Follow the instructions in the email to create a new password.',
			},
		],
	},
	{
		id: "events",
		category: "Events",
		questions: [
			{
				id: "what-are-events",
				question: "What are Events in MADE Laboratory?",
				answer: "Events are training courses and educational content designed to help users learn about business processes, techniques, and best practices. Events include video lessons, quizzes, and interactive content.",
			},
			{
				id: "how-to-access-events",
				question: "How do I access Events?",
				answer: "Navigate to the Events section from the main menu. You can browse available courses, view your progress.",
			},
		],
	},
	{
		id: "users-roles",
		category: "Users & Roles",
		questions: [
			{
				id: "manage-permissions",
				question: "How do I manage user permissions?",
				answer: "Administrators can assign roles and customize permissions per user. Permissions control what features and data each user can access based on their responsibilities.",
			},
			{
				id: "user-groups",
				question: "What are user groups?",
				answer: "User groups allow you to organize users by teams or departments. You can assign knowledge articles and notifications to specific groups for targeted training and communication.",
			},
		],
	},
	{
		id: "troubleshooting",
		category: "Troubleshooting",
		questions: [
			{
				id: "page-not-loading",
				question: "A page is not loading. What should I do?",
				answer: "Try refreshing the page. If the problem persists, clear your browser cache and cookies, or try a different browser. Contact support if the issue continues.",
			},
			{
				id: "permission-denied",
				question: "I'm getting a permission denied error.",
				answer: "This means you don't have access to that feature. Contact your administrator to check your role permissions or request access to the needed functionality.",
			},
			{
				id: "data-not-saving",
				question: "My changes are not saving.",
				answer: "Check your internet connection. If you're still having issues, try logging out and back in. Make sure you have the necessary permissions to make changes.",
			},
			{
				id: "contact-support",
				question: "How do I contact support?",
				answer: "Use the Help menu to access this FAQ, or contact your system administrator. For technical issues, include screenshots and steps to reproduce the problem.",
			},
		],
	},
];

interface HelpContentProps {
	searchQuery: string;
}

export function HelpContent({ searchQuery }: HelpContentProps) {
	const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

	// Filter FAQ based on search query
	const filteredFAQ = useMemo(() => {
		if (!searchQuery.trim()) {
			return FAQ_DATA;
		}

		const query = searchQuery.toLowerCase();
		return FAQ_DATA.map((category) => ({
			...category,
			questions: category.questions.filter((q) => q.question.toLowerCase().includes(query) || q.answer.toLowerCase().includes(query)),
		})).filter((category) => category.questions.length > 0);
	}, [searchQuery]);

	const toggleExpanded = (itemId: string) => {
		const newExpanded = new Set(expandedItems);
		if (newExpanded.has(itemId)) {
			newExpanded.delete(itemId);
		} else {
			newExpanded.add(itemId);
		}
		setExpandedItems(newExpanded);
	};

	const totalQuestions = FAQ_DATA.reduce((total, category) => total + category.questions.length, 0);
	const filteredQuestions = filteredFAQ.reduce((total, category) => total + category.questions.length, 0);

	return (
		<div className="mt-10 space-y-4">
			{/* Search Results Summary */}
			{searchQuery && (
				<div className="text-muted-foreground pb-2 text-center text-sm">
					{filteredQuestions} of {totalQuestions} questions
				</div>
			)}

			{/* FAQ Categories */}
			{filteredFAQ.map((category) => (
				<div
					key={category.id}
					className="space-y-3">
					<h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
						<BookOpen className="text-muted-foreground h-5 w-5" />
						{category.category}
					</h3>
					<div className="ml-6 space-y-2">
						{category.questions.map((faq) => (
							<div
								key={faq.id}
								className="overflow-hidden rounded-md border">
								<Button
									variant="ghost"
									className="hover:bg-muted/50 h-auto w-full justify-between p-3 text-left"
									onClick={() => toggleExpanded(faq.id)}>
									<span className="text-sm font-medium">{faq.question}</span>
									{expandedItems.has(faq.id) ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
								</Button>
								{expandedItems.has(faq.id) && (
									<div className="px-3 pb-3">
										<div className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</div>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			))}

			{/* No Results */}
			{filteredFAQ.length === 0 && searchQuery && (
				<div className="py-8 text-center">
					<HelpCircle className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
					<h3 className="mb-2 text-lg font-medium">No results found</h3>
					<p className="text-muted-foreground">Try adjusting your search terms or browse all categories above.</p>
				</div>
			)}

			{/* Footer */}
			<div className="mt-10 border-t pt-5 text-center">
				<p className="text-muted-foreground text-sm">Still need help? Contact your system administrator or support team.</p>
			</div>
		</div>
	);
}
