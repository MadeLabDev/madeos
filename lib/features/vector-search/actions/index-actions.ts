"use server";

import { indexEntity } from "@/lib/features/vector-search/services";
import { prisma } from "@/lib/prisma";
import { getLogger } from "@/lib/utils/logger";

const log = getLogger("vector-search-actions");

/**
 * Server Actions for Vector Search Integration
 * These are called from feature actions (Knowledge, Contacts, etc.)
 * to automatically index new/updated entities
 */

// ===== KNOWLEDGE MODULE =====

export async function indexKnowledgeArticle(articleId: string, title: string, content: string) {
	try {
		// Index title
		await indexEntity("knowledge", articleId, title ?? "", "title");

		// Index content
		if (content) {
			// Split into chunks if too long
			const chunks = chunkText(content, 1000);
			for (let i = 0; i < chunks.length; i++) {
				const chunk = chunks[i];
				if (chunk) {
					await indexEntity("knowledge", articleId, chunk, "content", i);
				}
			}
		}

		log.info("Knowledge article indexed", { articleId });
	} catch (error) {
		log.error("Failed to index knowledge article", {
			articleId,
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
}

// ===== CONTACTS MODULE =====

export async function indexContact(contactId: string, firstName: string, lastName: string, email: string, phone?: string, title?: string) {
	try {
		const parts = [`${firstName} ${lastName}`, email, ...(phone ? [phone] : []), ...(title ? [title] : [])].filter(Boolean).join(" | ");

		await indexEntity("contacts", contactId, parts, "profile");
		log.info("Contact indexed", { contactId });
	} catch (error) {
		log.error("Failed to index contact", {
			contactId,
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
}

// ===== OPPORTUNITIES MODULE =====

export async function indexOpportunity(opportunityId: string, title: string, description?: string, stage?: string, value?: number) {
	try {
		const parts = [title, ...(description ? [description] : []), ...(stage ? [`Stage: ${stage}`] : []), ...(value ? [`Value: ${value}`] : [])].filter(Boolean).join(" | ");

		await indexEntity("opportunities", opportunityId, parts, "details");
		log.info("Opportunity indexed", { opportunityId });
	} catch (error) {
		log.error("Failed to index opportunity", {
			opportunityId,
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
}

// ===== EVENTS MODULE =====

export async function indexEvent(eventId: string, title: string, description?: string, startDate?: Date, location?: string) {
	try {
		const parts = [title, ...(description ? [description] : []), ...(startDate ? [`Date: ${startDate.toLocaleDateString()}`] : []), ...(location ? [`Location: ${location}`] : [])].filter(Boolean).join(" | ");

		await indexEntity("events", eventId, parts, "details");
		log.info("Event indexed", { eventId });
	} catch (error) {
		log.error("Failed to index event", {
			eventId,
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
}

// ===== INTERACTIONS MODULE =====

export async function indexInteraction(interactionId: string, type: string, subject: string, notes?: string, contactName?: string) {
	try {
		const parts = [`${type}: ${subject}`, ...(notes ? [notes] : []), ...(contactName ? [`With: ${contactName}`] : [])].filter(Boolean).join(" | ");

		await indexEntity("interactions", interactionId, parts, "record");
		log.info("Interaction indexed", { interactionId });
	} catch (error) {
		log.error("Failed to index interaction", {
			interactionId,
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
}

// ===== TASKS MODULE =====

export async function indexTask(taskId: string, title: string, description?: string, status?: string, priority?: string, assigneeName?: string) {
	try {
		const parts = [title, ...(description ? [description] : []), ...(status ? [`Status: ${status}`] : []), ...(priority ? [`Priority: ${priority}`] : []), ...(assigneeName ? [`Assigned to: ${assigneeName}`] : [])].filter(Boolean).join(" | ");

		await indexEntity("tasks", taskId, parts, "details");
		log.info("Task indexed", { taskId });
	} catch (error) {
		log.error("Failed to index task", {
			taskId,
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
}

// ===== TRAINING MODULE =====

export async function indexTraining(trainingId: string, title: string, description?: string, instructorName?: string, startDate?: Date, duration?: number) {
	try {
		const parts = [title, ...(description ? [description] : []), ...(instructorName ? [`Instructor: ${instructorName}`] : []), ...(startDate ? [`Start: ${startDate.toLocaleDateString()}`] : []), ...(duration ? [`Duration: ${duration} hours`] : [])].filter(Boolean).join(" | ");

		await indexEntity("training", trainingId, parts, "details");
		log.info("Training indexed", { trainingId });
	} catch (error) {
		log.error("Failed to index training", {
			trainingId,
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
}

// ===== TEST REPORTS MODULE =====

export async function indexTestReport(reportId: string, title: string, summary?: string, status?: string, testSuiteName?: string, sampleId?: string) {
	try {
		const parts = [title, ...(summary ? [summary] : []), ...(status ? [`Status: ${status}`] : []), ...(testSuiteName ? [`Test Suite: ${testSuiteName}`] : []), ...(sampleId ? [`Sample: ${sampleId}`] : [])].filter(Boolean).join(" | ");

		await indexEntity("test-reports", reportId, parts, "details");
		log.info("Test report indexed", { reportId });
	} catch (error) {
		log.error("Failed to index test report", {
			reportId,
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
}

// ===== DESIGN PROJECTS MODULE =====

export async function indexDesignProject(projectId: string, name: string, description?: string, status?: string, clientName?: string, deadline?: Date) {
	try {
		const parts = [name, ...(description ? [description] : []), ...(status ? [`Status: ${status}`] : []), ...(clientName ? [`Client: ${clientName}`] : []), ...(deadline ? [`Deadline: ${deadline.toLocaleDateString()}`] : [])].filter(Boolean).join(" | ");

		await indexEntity("design-projects", projectId, parts, "details");
		log.info("Design project indexed", { projectId });
	} catch (error) {
		log.error("Failed to index design project", {
			projectId,
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
}

// ===== MARKETING CAMPAIGNS MODULE =====

export async function indexMarketingCampaign(campaignId: string, name: string, description?: string, status?: string, budget?: number, startDate?: Date, endDate?: Date) {
	try {
		const parts = [name, ...(description ? [description] : []), ...(status ? [`Status: ${status}`] : []), ...(budget ? [`Budget: $${budget}`] : []), ...(startDate ? [`Start: ${startDate.toLocaleDateString()}`] : []), ...(endDate ? [`End: ${endDate.toLocaleDateString()}`] : [])].filter(Boolean).join(" | ");

		await indexEntity("marketing-campaigns", campaignId, parts, "details");
		log.info("Marketing campaign indexed", { campaignId });
	} catch (error) {
		log.error("Failed to index marketing campaign", {
			campaignId,
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
}

// ===== UTILITY FUNCTIONS =====

/**
 * Split text into chunks of max length
 * Tries to split on sentence boundaries when possible
 */
function chunkText(text: string, maxLength: number = 1000): string[] {
	if (text.length <= maxLength) return [text];

	const chunks: string[] = [];
	let currentChunk = "";

	// Split by sentences
	const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

	for (const sentence of sentences) {
		if ((currentChunk + sentence).length <= maxLength) {
			currentChunk += sentence;
		} else {
			if (currentChunk) {
				chunks.push(currentChunk.trim());
			}
			currentChunk = sentence;
		}
	}

	if (currentChunk) {
		chunks.push(currentChunk.trim());
	}

	return chunks.filter((c) => c.length > 0);
}

/**
 * Delete vectors for a deleted entity
 */
export async function deleteEntityVectors(sourceModule: string, sourceId: string) {
	try {
		const { deleteVectorsByEntity } = await import("@/lib/features/vector-search/services");
		const count = await deleteVectorsByEntity(sourceModule, sourceId);
		log.info("Entity vectors deleted", {
			sourceModule,
			sourceId,
			count,
		});
	} catch (error) {
		log.error("Failed to delete entity vectors", {
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
}

/**
 * Batch index existing entities (for initial setup)
 */
export async function batchIndexKnowledgeArticles() {
	try {
		const { batchIndexEntities } = await import("@/lib/features/vector-search/services");

		const articles = await prisma.knowledge.findMany({
			select: {
				id: true,
				title: true,
				content: true,
			},
		});

		const indexingParams = articles.flatMap((article) => {
			const chunks = chunkText(article.content, 1000);
			return [
				{
					sourceModule: "knowledge",
					sourceId: article.id,
					content: article.title,
					sourceType: "title",
					chunkIndex: 0,
				},
				...chunks.map((chunk, index) => ({
					sourceModule: "knowledge",
					sourceId: article.id,
					content: chunk,
					sourceType: "content",
					chunkIndex: index + 1,
				})),
			];
		});

		const results = await batchIndexEntities(indexingParams);
		const successCount = results.filter((r) => r.success).length;

		log.info("Batch indexing completed", {
			total: results.length,
			success: successCount,
		});

		return { total: results.length, success: successCount };
	} catch (error) {
		log.error("Batch indexing failed", {
			error: error instanceof Error ? error.message : "Unknown error",
		});
		return { total: 0, success: 0 };
	}
}

/**
 * Batch index existing tasks
 */
export async function batchIndexTasks() {
	try {
		const { batchIndexEntities } = await import("@/lib/features/vector-search/services");

		const tasks = await prisma.task.findMany({
			select: {
				id: true,
				title: true,
				description: true,
				status: true,
				priority: true,
				entityType: true,
				taskType: true,
				category: true,
				tags: true,
			},
		});

		const indexingParams = tasks.map((task) => ({
			sourceModule: "tasks",
			sourceId: task.id,
			content: [task.title, task.description, task.status ? `Status: ${task.status}` : "", task.priority ? `Priority: ${task.priority}` : "", task.entityType ? `Entity Type: ${task.entityType}` : "", task.taskType ? `Task Type: ${task.taskType}` : "", task.category ? `Category: ${task.category}` : "", task.tags ? `Tags: ${task.tags}` : ""].filter(Boolean).join(" | "),
			sourceType: "details",
			chunkIndex: 0,
		}));

		const results = await batchIndexEntities(indexingParams);
		const successCount = results.filter((r) => r.success).length;

		log.info("Batch indexing tasks completed", {
			total: results.length,
			success: successCount,
		});

		return { total: results.length, success: successCount };
	} catch (error) {
		log.error("Batch indexing tasks failed", {
			error: error instanceof Error ? error.message : "Unknown error",
		});
		return { total: 0, success: 0 };
	}
}

/**
 * Batch index existing training sessions
 */
export async function batchIndexTraining() {
	try {
		const { batchIndexEntities } = await import("@/lib/features/vector-search/services");

		const trainings = await prisma.trainingEngagement.findMany({
			select: {
				id: true,
				title: true,
				description: true,
				instructor: {
					select: { name: true },
				},
				startDate: true,
				totalDurationHours: true,
				status: true,
				trainingType: true,
			},
		});

		const indexingParams = trainings.map((training) => ({
			sourceModule: "training",
			sourceId: training.id,
			content: [training.title, training.description, training.instructor?.name ? `Instructor: ${training.instructor.name}` : "", training.startDate ? `Start: ${training.startDate.toLocaleDateString()}` : "", training.totalDurationHours ? `Duration: ${training.totalDurationHours} hours` : "", training.status ? `Status: ${training.status}` : "", training.trainingType ? `Type: ${training.trainingType}` : ""].filter(Boolean).join(" | "),
			sourceType: "details",
			chunkIndex: 0,
		}));

		const results = await batchIndexEntities(indexingParams);
		const successCount = results.filter((r) => r.success).length;

		log.info("Batch indexing training completed", {
			total: results.length,
			success: successCount,
		});

		return { total: results.length, success: successCount };
	} catch (error) {
		log.error("Batch indexing training failed", {
			error: error instanceof Error ? error.message : "Unknown error",
		});
		return { total: 0, success: 0 };
	}
}

/**
 * Batch index existing test reports
 */
export async function batchIndexTestReports() {
	try {
		const { batchIndexEntities } = await import("@/lib/features/vector-search/services");

		const reports = await prisma.testReport.findMany({
			select: {
				id: true,
				title: true,
				summary: true,
				findings: true,
				recommendations: true,
				status: true,
				testOrder: {
					select: { id: true },
				},
			},
		});

		const indexingParams = reports.map((report) => ({
			sourceModule: "test-reports",
			sourceId: report.id,
			content: [report.title, report.summary, report.findings, report.recommendations, report.status ? `Status: ${report.status}` : "", report.testOrder?.id ? `Test Order: ${report.testOrder.id}` : ""].filter(Boolean).join(" | "),
			sourceType: "details",
			chunkIndex: 0,
		}));

		const results = await batchIndexEntities(indexingParams);
		const successCount = results.filter((r) => r.success).length;

		log.info("Batch indexing test reports completed", {
			total: results.length,
			success: successCount,
		});

		return { total: results.length, success: successCount };
	} catch (error) {
		log.error("Batch indexing test reports failed", {
			error: error instanceof Error ? error.message : "Unknown error",
		});
		return { total: 0, success: 0 };
	}
}

/**
 * Batch index existing design projects
 */
export async function batchIndexDesignProjects() {
	try {
		const { batchIndexEntities } = await import("@/lib/features/vector-search/services");

		const projects = await prisma.designProject.findMany({
			select: {
				id: true,
				title: true,
				description: true,
				status: true,
				customer: {
					select: { companyName: true },
				},
				dueDate: true,
				priority: true,
			},
		});

		const indexingParams = projects.map((project) => ({
			sourceModule: "design-projects",
			sourceId: project.id,
			content: [project.title, project.description, project.status ? `Status: ${project.status}` : "", project.customer?.companyName ? `Client: ${project.customer.companyName}` : "", project.dueDate ? `Due Date: ${project.dueDate.toLocaleDateString()}` : "", project.priority ? `Priority: ${project.priority}` : ""].filter(Boolean).join(" | "),
			sourceType: "details",
			chunkIndex: 0,
		}));

		const results = await batchIndexEntities(indexingParams);
		const successCount = results.filter((r) => r.success).length;

		log.info("Batch indexing design projects completed", {
			total: results.length,
			success: successCount,
		});

		return { total: results.length, success: successCount };
	} catch (error) {
		log.error("Batch indexing design projects failed", {
			error: error instanceof Error ? error.message : "Unknown error",
		});
		return { total: 0, success: 0 };
	}
}

/**
 * Batch index existing marketing campaigns
 */
export async function batchIndexMarketingCampaigns() {
	try {
		const { batchIndexEntities } = await import("@/lib/features/vector-search/services");

		const campaigns = await prisma.marketingCampaign.findMany({
			select: {
				id: true,
				title: true,
				description: true,
				status: true,
				type: true,
				targetAudience: true,
				scheduledAt: true,
			},
		});

		const indexingParams = campaigns.map((campaign) => ({
			sourceModule: "marketing-campaigns",
			sourceId: campaign.id,
			content: [campaign.title, campaign.description, campaign.status ? `Status: ${campaign.status}` : "", campaign.type ? `Type: ${campaign.type}` : "", campaign.targetAudience ? `Target Audience: ${campaign.targetAudience}` : "", campaign.scheduledAt ? `Scheduled: ${campaign.scheduledAt.toLocaleDateString()}` : ""].filter(Boolean).join(" | "),
			sourceType: "details",
			chunkIndex: 0,
		}));

		const results = await batchIndexEntities(indexingParams);
		const successCount = results.filter((r) => r.success).length;

		log.info("Batch indexing marketing campaigns completed", {
			total: results.length,
			success: successCount,
		});

		return { total: results.length, success: successCount };
	} catch (error) {
		log.error("Batch indexing marketing campaigns failed", {
			error: error instanceof Error ? error.message : "Unknown error",
		});
		return { total: 0, success: 0 };
	}
}
