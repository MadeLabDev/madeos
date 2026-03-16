import { AlarmClockMinus, Book, Calendar, CheckSquare, ContactRound, CreditCard, Database, DollarSign, FileText, FolderOpen, FormInput, GraduationCap, Grid3x3, Handshake, HelpCircle, Home, ImageIcon, Layers, type LucideIcon, Megaphone, MessageSquare, Network, Package, Palette, Presentation, Settings, Tag, TestTube, Ticket, UserPlus, Users } from "lucide-react";

export interface SidebarMenuItem {
	label: string;
	href: string;
	icon: LucideIcon;
	display?: boolean;
	permission?: {
		module: string;
		action: string;
	};
	children?: SidebarMenuItem[];
	/**
	 * Additional path patterns to match for active state.
	 * Useful for items with query parameters or dynamic paths.
	 * Examples: ["/?type=blog", "/post/categories?type=blog"]
	 */
	matchPaths?: string[];
}

// display: false => Nếu chưa hoàn thành

export const SIDEBAR_MENU_ITEMS: SidebarMenuItem[] = [
	{
		label: "Dashboard",
		href: "/dashboard",
		icon: Home,
	},
	{
		label: "Profile Builder",
		href: "/profile/builder",
		icon: ContactRound,
		permission: {
			module: "users",
			action: "read",
		},
	},
	{
		label: "Events x Education",
		href: "#events-education",
		icon: Calendar,
		children: [
			{
				label: "Events",
				href: "/events",
				icon: AlarmClockMinus,
				matchPaths: ["/events", "/events/new", "/events/:id", "/events/:id/edit"],
				permission: {
					module: "events",
					action: "read",
				},
			},
			{
				label: "Attendees",
				href: "/events/attendees",
				icon: UserPlus,
				display: true,
				matchPaths: ["/events/attendees", "/events/attendees/new", "/events/attendees/:id"],
				permission: {
					module: "events",
					action: "read",
				},
			},
			{
				label: "Check-In",
				href: "/events/check-in",
				icon: CheckSquare,
				display: true,
				matchPaths: ["/events/check-in", "/events/check-in/new", "/events/check-in/:id"],
				permission: {
					module: "events",
					action: "update",
				},
			},
			{
				label: "My Registrations",
				href: "/events/my-registrations",
				icon: Ticket,
				display: true,
				matchPaths: ["/events/my-registrations", "/events/my-registrations/new", "/events/my-registrations/:id"],
				permission: {
					module: "events",
					action: "read",
				},
			},
			{
				label: "Sponsors",
				href: "/post?type=sponsor",
				icon: Handshake,
				permission: {
					module: "sponsors",
					action: "read",
				},
				children: [
					{
						label: "List",
						href: "/post?type=sponsor",
						icon: FileText,
						matchPaths: ["/post?type=sponsor", "/post/new?type=sponsor", "/post/:id?type=sponsor", "/post/:id/edit?type=sponsor"],
						permission: {
							module: "sponsors",
							action: "read",
						},
					},
					{
						label: "Categories",
						href: "/post/categories?type=sponsor",
						icon: Tag,
						matchPaths: ["/post/categories?type=sponsor", "/post/categories/new?type=sponsor", "/post/categories/*?type=sponsor", "/post/categories/:id?type=sponsor", "/post/categories/:id/edit?type=sponsor"],
						permission: {
							module: "sponsors",
							action: "read",
						},
					},
					{
						label: "Tags",
						href: "/post/tags?type=sponsor",
						icon: Tag,
						matchPaths: ["/post/tags?type=sponsor", "/post/tags/new?type=sponsor", "/post/tags/*?type=sponsor", "/post/tags/:id?type=sponsor", "/post/tags/:id/edit?type=sponsor"],
						permission: {
							module: "sponsors",
							action: "read",
						},
					},
				],
			},
			{
				label: "Speakers",
				href: "/post?type=speaker",
				icon: Handshake,
				permission: {
					module: "speakers",
					action: "read",
				},
				children: [
					{
						label: "List",
						href: "/post?type=speaker",
						icon: FileText,
						matchPaths: ["/?type=speaker", "/post?type=speaker", "/post/new?type=speaker", "/post/:id?type=speaker", "/post/:id/edit?type=speaker"],
						permission: {
							module: "speakers",
							action: "read",
						},
					},
					{
						label: "Categories",
						href: "/post/categories?type=speaker",
						icon: Tag,
						matchPaths: ["/post/categories?type=speaker", "/post/categories/new?type=speaker", "/post/categories/*?type=speaker", "/post/categories/:id?type=speaker", "/post/categories/:id/edit?type=speaker"],
						permission: {
							module: "speakers",
							action: "read",
						},
					},
					{
						label: "Tags",
						href: "/post/tags?type=speaker",
						icon: Tag,
						matchPaths: ["/post/tags?type=speaker", "/post/tags/new?type=speaker", "/post/tags/*?type=speaker", "/post/tags/:id?type=speaker", "/post/tags/:id/edit?type=speaker"],
						permission: {
							module: "speakers",
							action: "read",
						},
					},
				],
			},
		],
	},
	{
		label: "Testing x Development",
		href: "#testing-development",
		icon: TestTube,
		display: true,
		permission: {
			module: "testing",
			action: "read",
		},
		children: [
			{
				label: "Test Orders",
				href: "/test-management/orders",
				icon: CheckSquare,
				display: true,
				permission: {
					module: "testing",
					action: "read",
				},
				matchPaths: ["/test-management/orders", "/test-management/orders/new", "/test-management/orders/*", "/test-management/new", "/test-management/:id", "/test-management/:id/edit"],
			},
			{
				label: "Samples",
				href: "/test-management/samples",
				icon: TestTube,
				display: true,
				permission: {
					module: "testing",
					action: "read",
				},
				matchPaths: ["/test-management/samples", "/test-management/samples/new", "/test-management/samples/*", "/test-management/samples/:id", "/test-management/samples/:id/edit"],
			},
			{
				label: "Tests",
				href: "/test-management/tests",
				icon: CheckSquare,
				display: true,
				permission: {
					module: "testing",
					action: "read",
				},
				matchPaths: ["/test-management/tests", "/test-management/tests/new", "/test-management/tests/*", "/test-management/tests/bulk-create"],
			},
			{
				label: "Test Suites",
				href: "/test-management/suites",
				icon: Layers,
				display: true,
				permission: {
					module: "testing",
					action: "read",
				},
				matchPaths: ["/test-management/suites", "/test-management/suites/new", "/test-management/suites/*", "/test-management/suites/:id", "/test-management/suites/:id/edit"],
			},
			{
				label: "Reports",
				href: "/test-management/reports",
				icon: FileText,
				display: true,
				permission: {
					module: "testing",
					action: "read",
				},
				matchPaths: ["/test-management/reports", "/test-management/reports/new", "/test-management/reports/*", "/test-management/reports/:id", "/test-management/reports/:id/edit"],
			},
			{
				label: "Engagements",
				href: "/engagements",
				icon: Layers,
				display: true,
				permission: {
					module: "customers",
					action: "read",
				},
				matchPaths: ["/engagements", "/engagements/new", "/engagements/*", "/engagements/:id", "/engagements/:id/edit"],
			},
			{
				label: "Contacts",
				href: "/contacts",
				icon: ContactRound,
				display: true,
				permission: {
					module: "customers",
					action: "read",
				},
				matchPaths: ["/contacts", "/contacts/new", "/contacts/*", "/contacts/:id", "/contacts/:id/edit"],
			},
			{
				label: "Opportunities",
				href: "/opportunities",
				icon: Handshake,
				display: true,
				permission: {
					module: "customers",
					action: "read",
				},
				matchPaths: ["/opportunities", "/opportunities/new", "/opportunities/*", "/opportunities/:id", "/opportunities/:id/edit"],
			},
			{
				label: "Interactions",
				href: "/interactions",
				icon: MessageSquare,
				display: true,
				permission: {
					module: "customers",
					action: "read",
				},
				matchPaths: ["/interactions", "/interactions/new", "/interactions/*", "/interactions/:id", "/interactions/:id/edit"],
			},
		],
	},
	{
		label: "Design x Development",
		href: "/design-projects",
		icon: Palette,
		display: true,
		permission: {
			module: "design",
			action: "read",
		},
		children: [
			{
				label: "Projects",
				href: "/design-projects/projects",
				icon: FolderOpen,
				display: true,
				permission: {
					module: "design",
					action: "read",
				},
				matchPaths: ["/design-projects/projects", "/design-projects/projects/new", "/design-projects/projects/*", "/design-projects/projects/:id", "/design-projects/projects/:id/edit"],
			},
			{
				label: "Briefs",
				href: "/design-projects/briefs",
				icon: FileText,
				display: true,
				permission: {
					module: "design",
					action: "read",
				},
				matchPaths: ["/design-projects/briefs", "/design-projects/briefs/new", "/design-projects/briefs/*", "/design-projects/briefs/:id", "/design-projects/briefs/:id/edit"],
			},
			{
				label: "Designs",
				href: "/design-projects/designs",
				icon: Palette,
				display: true,
				permission: {
					module: "design",
					action: "read",
				},
				matchPaths: ["/design-projects/designs", "/design-projects/designs/new", "/design-projects/designs/*", "/design-projects/designs/:id", "/design-projects/designs/:id/edit"],
			},
			{
				label: "Tech Packs",
				href: "/design-projects/tech-packs",
				icon: Package,
				display: true,
				permission: {
					module: "design",
					action: "read",
				},
				matchPaths: ["/design-projects/tech-packs", "/design-projects/tech-packs/new", "/design-projects/tech-packs/*", "/design-projects/tech-packs/:id", "/design-projects/tech-packs/:id/edit"],
			},
			{
				label: "Design Decks",
				href: "/design-projects/design-decks",
				icon: Presentation,
				display: true,
				permission: {
					module: "design",
					action: "read",
				},
				matchPaths: ["/design-projects/design-decks", "/design-projects/design-decks/new", "/design-projects/design-decks/*", "/design-projects/design-decks/:id", "/design-projects/design-decks/:id/edit"],
			},
			{
				label: "Reviews",
				href: "/design-projects/design-reviews",
				icon: MessageSquare,
				display: true,
				permission: {
					module: "design",
					action: "read",
				},
				matchPaths: ["/design-projects/design-reviews", "/design-projects/design-reviews/new", "/design-projects/design-reviews/*", "/design-projects/design-reviews/:id", "/design-projects/design-reviews/:id/edit"],
			},
		],
	},
	{
		label: "Training x Support",
		href: "#training-support",
		icon: GraduationCap,
		permission: {
			module: "ops",
			action: "read",
		},
		children: [
			{
				label: "Training Engagements",
				href: "/training-support",
				icon: GraduationCap,
				display: true,
				permission: {
					module: "ops",
					action: "read",
				},
				matchPaths: ["/training-support", "/training-support/new", "/training-support/:id", "/training-support/:id/edit"],
			},
			{
				label: "Attendees",
				href: "/training-support/attendees",
				icon: UserPlus,
				display: true,
				permission: {
					module: "ops",
					action: "read",
				},
				matchPaths: ["/training-support/attendees", "/training-support/attendees/new", "/training-support/attendees/:id"],
			},
			{
				label: "Check-In",
				href: "/training-support/check-in",
				icon: CheckSquare,
				display: true,
				permission: {
					module: "ops",
					action: "update",
				},
				matchPaths: ["/training-support/check-in", "/training-support/check-in/new", "/training-support/check-in/:id"],
			},
			{
				label: "My Registrations",
				href: "/training-support/my-registrations",
				icon: Ticket,
				display: true,
				permission: {
					module: "ops",
					action: "read",
				},
				matchPaths: ["/training-support/my-registrations", "/training-support/my-registrations/new", "/training-support/my-registrations/:id"],
			},
			{
				label: "Training Schedule",
				href: "/training-support/sessions",
				icon: Calendar,
				permission: {
					module: "training",
					action: "read",
				},
			},
			{
				label: "SOP Library",
				href: "/training-support/sop-library",
				icon: FileText,
				display: true,
				permission: {
					module: "training",
					action: "read",
				},
				matchPaths: ["/training-support/sop-library", "/training-support/sop-library/new", "/training-support/sop-library/:id", "/training-support/sop-library/:id/edit"],
			},
			{
				label: "Assessments",
				href: "/training-support/assessments",
				icon: CheckSquare,
				display: true,
				permission: {
					module: "training",
					action: "read",
				},
				matchPaths: ["/training-support/assessments", "/training-support/assessments/new", "/training-support/assessments/:id", "/training-support/assessments/:id/edit"],
			},
		],
	},

	{
		label: "Knowledge Base",
		href: "#training-knowledge",
		icon: Book,
		permission: {
			module: "knowledge",
			action: "read",
		},
		children: [
			{
				label: "Course",
				href: "/course",
				icon: Calendar,
				matchPaths: ["/course", "/course/new", "/course/*", "/course/:id", "/course/:id/edit"],
				permission: {
					module: "knowledge",
					action: "read",
				},
			},
			{
				label: "Articles",
				href: "/knowledge",
				icon: Book,
				matchPaths: ["/knowledge", "/knowledge/new", "/knowledge/:id", "/knowledge/:id/edit"],
				permission: {
					module: "knowledge",
					action: "read",
				},
			},
			{
				label: "Categories",
				href: "/knowledge/categories",
				icon: Tag,
				matchPaths: ["/knowledge/categories", "/knowledge/categories/new", "/knowledge/categories/:id", "/knowledge/categories/:id/edit"],
				permission: {
					module: "knowledge",
					action: "read",
				},
			},
			{
				label: "Tags",
				href: "/knowledge/tags",
				icon: Tag,
				matchPaths: ["/knowledge/tags", "/knowledge/tags/new", "/knowledge/tags/*", "/knowledge/tags/:id", "/knowledge/tags/:id/edit"],
				permission: {
					module: "knowledge",
					action: "read",
				},
			},
		],
	},
	{
		label: "Blog",
		href: "#blog",
		icon: FileText,
		permission: {
			module: "blog",
			action: "read",
		},
		children: [
			{
				label: "Posts",
				href: "/post?type=blog",
				icon: FileText,
				matchPaths: ["/?type=blog", "/post?type=blog", "/post/new?type=blog", "/post/:id?type=blog", "/post/:id/edit?type=blog"],
				permission: {
					module: "blog",
					action: "read",
				},
			},
			{
				label: "Categories",
				href: "/post/categories?type=blog",
				icon: Tag,
				matchPaths: ["/post/categories?type=blog", "/post/categories/new?type=blog", "/post/categories/*?type=blog", "/post/categories/:id?type=blog", "/post/categories/:id/edit?type=blog"],
				permission: {
					module: "blog",
					action: "read",
				},
			},
			{
				label: "Tags",
				href: "/post/tags?type=blog",
				icon: Tag,
				matchPaths: ["/post/tags?type=blog", "/post/tags/new?type=blog", "/post/tags/*?type=blog", "/post/tags/:id?type=blog", "/post/tags/:id/edit?type=blog"],
				permission: {
					module: "blog",
					action: "read",
				},
			},
		],
	},
	{
		label: "Business Ecosystem",
		href: "#customers",
		icon: Users,
		children: [
			{
				label: "Customers",
				href: "/customers?type=customer",
				icon: Users,
				matchPaths: ["/customers?type=customer", "/customers/new?type=customer", "/customers/*?type=customer", "/customers/:id?type=customer", "/customers/:id/edit?type=customer"],
				permission: {
					module: "customers",
					action: "read",
				},
			},
			{
				label: "Partners",
				href: "/customers?type=partner",
				icon: Handshake,
				matchPaths: ["/customers?type=partner", "/customers/new?type=partner", "/customers/*?type=partner", "/customers/:id?type=partner", "/customers/:id/edit?type=partner"],
				permission: {
					module: "partner",
					action: "read",
				},
			},
			{
				label: "Vendors",
				href: "/customers?type=vendor",
				icon: Handshake,
				matchPaths: ["/customers?type=vendor", "/customers/new?type=vendor", "/customers/*?type=vendor", "/customers/:id?type=vendor", "/customers/:id/edit?type=vendor"],
				permission: {
					module: "vendor",
					action: "read",
				},
			},
		],
	},
	{
		label: "Finance",
		href: "#finance",
		icon: DollarSign,
		permission: {
			module: "finance",
			action: "read",
		},
		children: [
			{
				label: "Pricing",
				href: "/pricing",
				icon: CreditCard,
				display: true,
				permission: {
					module: "finance",
					action: "read",
				},
			},
			{
				label: "Billing",
				href: "/billing",
				icon: FileText,
				display: true,
				permission: {
					module: "finance",
					action: "read",
				},
			},
			{
				label: "Payment",
				href: "/payment",
				icon: DollarSign,
				display: true,
				permission: {
					module: "finance",
					action: "read",
				},
			},
		],
	},
	{
		label: "Marketing",
		href: "/marketing",
		icon: Megaphone,
		display: true,
		permission: {
			module: "marketing",
			action: "read",
		},
		children: [
			{
				label: "Campaign Templates",
				href: "/marketing/templates",
				icon: FileText,
				matchPaths: ["/marketing/templates", "/marketing/templates/new", "/marketing/templates/:id", "/marketing/templates/:id/edit"],
				permission: {
					module: "marketing",
					action: "read",
				},
			},
			{
				label: "Campaigns",
				href: "/marketing/campaigns",
				icon: Megaphone,
				permission: {
					module: "marketing",
					action: "read",
				},
			},
			{
				label: "Microsites",
				href: "/marketing/microsites",
				icon: Palette,
				permission: {
					module: "marketing",
					action: "read",
				},
			},
			{
				label: "Sponsors",
				href: "/marketing/sponsors",
				icon: Handshake,
				permission: {
					module: "marketing",
					action: "read",
				},
			},
		],
	},
	{
		label: "Form Data",
		href: "/form-data",
		icon: FormInput,
		permission: {
			module: "meta",
			action: "read",
		},
	},
	{
		label: "Medias",
		href: "/medias",
		icon: ImageIcon,
		permission: {
			module: "media",
			action: "read",
		},
	},
	{
		label: "Meta",
		href: "/meta",
		icon: Layers,
		permission: {
			module: "meta",
			action: "read",
		},
		children: [
			{
				label: "Module Types",
				href: "/meta/module-types",
				icon: Grid3x3,
				matchPaths: ["/meta/module-types", "/meta/module-types/new", "/meta/module-types/*", "/meta/module-types/:id", "/meta/module-types/:id/edit"],
				permission: {
					module: "meta",
					action: "read",
				},
			},
			{
				label: "Module Instances",
				href: "/meta/module-instances",
				icon: Layers,
				matchPaths: ["/meta/module-instances", "/meta/module-instances/new", "/meta/module-instances/*", "/meta/module-instances/:id", "/meta/module-instances/:id/edit"],
				permission: {
					module: "meta",
					action: "read",
				},
			},
		],
	},
	{
		label: "Administration",
		href: "#administration",
		icon: Settings,
		permission: {
			module: "users",
			action: "read",
		},
		children: [
			{
				label: "Users",
				href: "/users",
				icon: Users,
				matchPaths: ["/users", "/users/new", "/users/*", "/users/:id", "/users/:id/edit"],
				permission: {
					module: "users",
					action: "read",
				},
			},
			{
				label: "User Groups",
				href: "/user-groups",
				icon: Network,
				matchPaths: ["/user-groups", "/user-groups/new", "/user-groups/*", "/user-groups/:id", "/user-groups/:id/edit"],
				permission: {
					module: "users",
					action: "read",
				},
			},
			{
				label: "Roles",
				href: "/roles",
				icon: FileText,
				matchPaths: ["/roles", "/roles/new", "/roles/*", "/roles/:id", "/roles/:id/edit"],
				permission: {
					module: "roles",
					action: "read",
				},
			},
			{
				label: "Settings",
				href: "/settings",
				icon: Settings,
				matchPaths: ["/settings"],
				permission: {
					module: "settings",
					action: "read",
				},
			},
			{
				label: "Billing Management",
				href: "/billing-management",
				icon: DollarSign,
				matchPaths: ["/billing-management"],
				permission: {
					module: "finance",
					action: "read",
				},
			},
			{
				label: "Backup",
				href: "/backup",
				icon: Database,
				matchPaths: ["/backup"],
				permission: {
					module: "backup",
					action: "read",
				},
			},
		],
	},
	{
		label: "AI Assistant",
		href: "/ai-chat",
		icon: MessageSquare,
		display: true, // Will be shown conditionally based on RAG status
	},
	{
		label: "Help",
		href: "/help",
		icon: HelpCircle,
	},
	{
		label: "Contact",
		href: "/contact-us",
		icon: MessageSquare,
	},
];
