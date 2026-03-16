"use client";

import { useState } from "react";

import { Building2, CreditCard, Database, Image, Mail, Save, Settings as SettingsIcon, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SettingsTabsProps } from "@/lib/features/settings/types";

import { EmailTestForm } from "./email-test-form";
import { IndexingSettingsForm } from "./indexing-settings-form";
import { MediaSettingsForm } from "./media-settings-form";
import { PaymentSettingsForm } from "./payment-settings-form";
import { RAGSettingsForm } from "./rag-settings-form";
import { SettingsForm } from "./settings-form";
import { SystemSettingsForm } from "./system-settings-form";

export function SettingsTabs({ settingsObj, onSuccess }: SettingsTabsProps) {
	const [activeTab, setActiveTab] = useState("company");
	const [isLoading, setIsLoading] = useState(false);

	const handleHeaderSubmit = async () => {
		// Email test tab has its own submit button, skip header submit
		if (activeTab === "email") {
			return;
		}

		const form = document.querySelector(`form[data-settings-${activeTab}-form]`) as HTMLFormElement;
		if (form) {
			const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
			submitBtn?.click();
		}
	};

	// const handleCancel = () => {
	//   const form = document.querySelector(`form[data-settings-${activeTab}-form]`) as HTMLFormElement;
	//   const cancelBtn = form?.querySelector('button[data-action="cancel"]') as HTMLButtonElement;
	//   cancelBtn?.click();
	// };

	return (
		<div className="container mx-auto max-w-6xl space-y-6 py-8">
			{/* Header with Actions */}
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						{activeTab === "company" && "Company Information"}
						{activeTab === "system" && "System Settings"}
						{activeTab === "media" && "Media Settings"}
						{activeTab === "payment" && "Payment Settings"}
						{activeTab === "email" && "Email Test"}
						{activeTab === "rag" && "RAG Settings"}
						{activeTab === "indexing" && "Data Indexing & Search"}
					</h1>
					<p className="text-muted-foreground">
						{activeTab === "company" && "Update your company's basic information"}
						{activeTab === "system" && "Configure system-wide settings and preferences"}
						{activeTab === "media" && "Configure media upload settings, file type restrictions, and storage provider"}
						{activeTab === "payment" && "Select a payment provider and configure its default currency"}
						{activeTab === "email" && "Send test emails to verify your email configuration"}
						{activeTab === "rag" && "Enable or disable RAG (semantic search and LLM capabilities)"}
						{activeTab === "indexing" && "Manage data indexing for semantic search and AI features"}
					</p>
				</div>
				<div className="flex gap-3">
					{activeTab !== "email" && activeTab !== "rag" && (
						<Button
							type="button"
							onClick={handleHeaderSubmit}
							disabled={isLoading}>
							{isLoading && (
								<Loader
									size="sm"
									className="mr-2"
								/>
							)}
							{!isLoading && <Save className="mr-2 h-4 w-4" />}
							Save Changes
						</Button>
					)}
				</div>
			</div>

			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="flex flex-row items-start gap-6">
				{/* Vertical Tabs List - Left Sidebar */}
				<TabsList className="sticky top-0 flex h-auto min-w-48 basis-auto flex-col gap-2 bg-transparent p-0">
					<TabsTrigger
						value="company"
						className="data-[state=active]:bg-muted w-full justify-start text-base">
						<Building2 className="mr-2 h-5 w-5" />
						Company Info
					</TabsTrigger>
					<TabsTrigger
						value="system"
						className="data-[state=active]:bg-muted w-full justify-start text-base">
						<SettingsIcon className="mr-2 h-5 w-5" />
						System Settings
					</TabsTrigger>
					<TabsTrigger
						value="media"
						className="data-[state=active]:bg-muted w-full justify-start text-base">
						<Image
							className="mr-2 h-5 w-5"
							aria-label="Media Settings"
						/>
						Media Settings
					</TabsTrigger>
					<TabsTrigger
						value="payment"
						className="data-[state=active]:bg-muted w-full justify-start text-base">
						<CreditCard className="mr-2 h-5 w-5" />
						Payment
					</TabsTrigger>
					<TabsTrigger
						value="email"
						className="data-[state=active]:bg-muted w-full justify-start text-base">
						<Mail className="mr-2 h-5 w-5" />
						Email Test
					</TabsTrigger>
					<TabsTrigger
						value="rag"
						className="data-[state=active]:bg-muted w-full justify-start text-base">
						<Zap className="mr-2 h-5 w-5" />
						RAG Settings
					</TabsTrigger>
					<TabsTrigger
						value="indexing"
						className="data-[state=active]:bg-muted w-full justify-start text-base">
						<Database className="mr-2 h-5 w-5" />
						Data Indexing
					</TabsTrigger>
				</TabsList>{" "}
				{/* Tabs Content - Right Panel */}
				<div className="flex-1">
					{/* Company Info Tab */}
					<TabsContent
						value="company"
						className="mt-0 space-y-4">
						<SettingsForm
							settingsObj={settingsObj}
							onSuccess={onSuccess}
							onLoadingChange={setIsLoading}
							hideButtons
						/>
					</TabsContent>

					{/* System Settings Tab */}
					<TabsContent
						value="system"
						className="mt-0 space-y-4">
						<SystemSettingsForm
							settingsObj={settingsObj}
							onSuccess={onSuccess}
							onLoadingChange={setIsLoading}
							hideButtons
						/>
					</TabsContent>

					{/* Media Settings Tab */}
					<TabsContent
						value="media"
						className="mt-0 space-y-4">
						<MediaSettingsForm
							settingsObj={settingsObj}
							onSuccess={onSuccess}
							onLoadingChange={setIsLoading}
							hideButtons
						/>
					</TabsContent>

					{/* Payment Settings Tab */}
					<TabsContent
						value="payment"
						className="mt-0 space-y-4">
						<PaymentSettingsForm
							settingsObj={settingsObj}
							onSuccess={onSuccess}
							onLoadingChange={setIsLoading}
							hideButtons
						/>
					</TabsContent>

					{/* Email Test Tab */}
					<TabsContent
						value="email"
						className="mt-0 space-y-4">
						<EmailTestForm
							onLoadingChange={setIsLoading}
							hideButtons
						/>
					</TabsContent>

					{/* RAG Settings Tab */}
					<TabsContent
						value="rag"
						className="mt-0 space-y-4">
						<RAGSettingsForm
							onSuccess={undefined}
							hideButtons={false}
						/>
					</TabsContent>

					{/* Data Indexing Tab */}
					<TabsContent
						value="indexing"
						className="mt-0 space-y-4">
						<IndexingSettingsForm
							onSuccess={undefined}
							hideButtons={false}
						/>
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}
