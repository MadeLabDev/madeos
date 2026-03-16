import { Suspense } from "react";

import { Database, Eye, FileText, Save } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/page-loading";

export const dynamic = "force-dynamic";

export const metadata = {
	title: "Meta Configuration",
	description: "Manage dynamic field schemas and module instances",
};

export const revalidate = 0;

export default function MetaPage() {
	return (
		<Suspense fallback={<PageLoading />}>
			<div className="space-y-6">
				{/* Header */}
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Meta Configuration</h1>
					<p className="text-muted-foreground mt-2">Create and manage dynamic field schemas and module instances for your application.</p>
				</div>

				{/* Cards */}
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					{/* Module Types Card */}
					<Card>
						<CardHeader className="pb-3">
							<div className="flex items-start justify-between">
								<div>
									<CardTitle className="flex items-center gap-2">
										<FileText className="h-5 w-5" />
										Module Types
									</CardTitle>
									<CardDescription className="mt-2">Define field schemas and data structures for different modules</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className="pt-0">
							<p className="text-muted-foreground mb-4 text-sm">Create custom field types and validation rules for your dynamic data structures.</p>
							<div className="flex gap-2">
								<Link href="/meta/module-types">
									<Button
										variant="outline"
										size="sm">
										<Eye className="mr-2 h-4 w-4" />
										View All
									</Button>
								</Link>
								<Link href="/meta/module-types/new">
									<Button size="sm">
										<Save className="mr-2 h-4 w-4" />
										Create New
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>

					{/* Module Instances Card */}
					<Card>
						<CardHeader className="pb-3">
							<div className="flex items-start justify-between">
								<div>
									<CardTitle className="flex items-center gap-2">
										<Database className="h-5 w-5" />
										Module Instances
									</CardTitle>
									<CardDescription className="mt-2">Create instances based on defined module type schemas</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className="pt-0">
							<p className="text-muted-foreground mb-4 text-sm">Instantiate modules using the field schemas you have defined.</p>
							<div className="flex gap-2">
								<Link href="/meta/module-instances">
									<Button
										variant="outline"
										size="sm">
										<Eye className="mr-2 h-4 w-4" />
										View All
									</Button>
								</Link>
								<Link href="/meta/module-instances/new">
									<Button size="sm">
										<Save className="mr-2 h-4 w-4" />
										Create New
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Info Card */}
				<Card className="bg-muted/50">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">Getting Started</CardTitle>
					</CardHeader>
					<CardContent className="text-muted-foreground space-y-2 text-sm">
						<p>
							<strong>Step 1:</strong> Create a Module Type with your desired fields and validation rules
						</p>
						<p>
							<strong>Step 2:</strong> Create Module Instances based on that Module Type
						</p>
						<p>
							<strong>Step 3:</strong> Use the module instances in your application to store structured data
						</p>
					</CardContent>
				</Card>
			</div>
		</Suspense>
	);
}
