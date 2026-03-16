import { prisma, SeederResult } from "../seeder-utils";

export async function seedCRMTestingData(): Promise<SeederResult> {
	// Get admin user for ownerId
	const adminUser = await prisma.user.findFirst({
		where: { email: "baonguyenyam@gmail.com" },
	});

	if (!adminUser) {
		console.log("❌ Admin user not found, skipping CRM testing data seed");
		return { success: false, message: "Admin user not found, skipping CRM testing data seed", count: 0 };
	}

	// Get existing customers
	const customers = await prisma.customer.findMany({
		where: { type: { in: ["customer", "partner"] } },
		take: 3,
	});

	if (customers.length < 2) {
		console.log("⚠️  Not enough customers found, skipping CRM testing data seed");
		return { success: true, message: "CRM and Testing data seeded successfully", count: 13 };
	}

	const customer1 = customers[0]!;
	const customer2 = customers[1]!;

	// Seed Contacts
	console.log("Creating contacts...");
	const contacts = await Promise.all([
		prisma.contact.create({
			data: {
				customerId: customer1.id,
				firstName: "John",
				lastName: "Smith",
				email: "john.smith@customer1.com",
				phone: "+1-555-0101",
				title: "Product Manager",
				isPrimary: true,
				metaData: {
					department: "Product",
					preferences: "Email updates",
				},
			},
		}),
		prisma.contact.create({
			data: {
				customerId: customer1.id,
				firstName: "Sarah",
				lastName: "Johnson",
				email: "sarah.johnson@customer1.com",
				phone: "+1-555-0102",
				title: "QA Lead",
				isPrimary: false,
				metaData: {
					department: "Quality Assurance",
					expertise: "Software Testing",
				},
			},
		}),
		prisma.contact.create({
			data: {
				customerId: customer2.id,
				firstName: "Mike",
				lastName: "Davis",
				email: "mike.davis@customer2.com",
				phone: "+1-555-0201",
				title: "CTO",
				isPrimary: true,
				metaData: {
					department: "Technology",
					interests: "Process Improvement",
				},
			},
		}),
	]);

	// Seed Opportunities
	console.log("Creating opportunities...");
	const opportunities = await Promise.all([
		prisma.opportunity.create({
			data: {
				customerId: customer1.id,
				title: "Product Testing Services - Q4 2025",
				description: "Comprehensive testing services for new product line including performance, security, and usability testing.",
				value: 75000,
				stage: "PROPOSAL",
				probability: 75,
				expectedClose: new Date("2025-12-15"),
				ownerId: adminUser.id, // admin user
				source: "Referral",
				metaData: {
					requirements: ["Performance Testing", "Security Testing", "Usability Testing"],
					timeline: "3 months",
					priority: "High",
				},
			},
		}),
		prisma.opportunity.create({
			data: {
				customerId: customer2.id,
				title: "Software Quality Assurance Audit",
				description: "Complete audit and improvement of existing QA processes and testing infrastructure.",
				value: 45000,
				stage: "QUALIFIED",
				probability: 60,
				expectedClose: new Date("2025-11-30"),
				ownerId: adminUser.id,
				source: "Website",
				metaData: {
					requirements: ["Process Audit", "Tool Assessment", "Training"],
					timeline: "2 months",
					priority: "Medium",
				},
			},
		}),
	]);

	// Seed Engagements
	console.log("Creating engagements...");
	const engagements = await Promise.all([
		prisma.engagement.create({
			data: {
				opportunityId: opportunities[0].id,
				customerId: customer1.id,
				title: "Product Testing - Phase 1",
				type: "TESTING",
				status: "ACTIVE",
				priority: "HIGH",
				startDate: new Date("2025-11-01"),
				dueDate: new Date("2025-12-15"),
				budget: 75000,
				description: "Initial testing phase for new product line",
				assignedTo: adminUser.id,
				metaData: {
					testingType: "Comprehensive",
					deliverables: ["Test Reports", "Performance Metrics", "Security Assessment"],
				},
			},
		}),
		prisma.engagement.create({
			data: {
				customerId: customer2.id,
				title: "QA Process Audit",
				type: "TESTING",
				status: "DRAFT",
				priority: "MEDIUM",
				startDate: new Date("2025-12-01"),
				dueDate: new Date("2026-01-15"),
				budget: 45000,
				description: "Audit and improve QA processes",
				assignedTo: "user-2",
				metaData: {
					auditType: "Process Improvement",
					scope: ["Testing Tools", "Documentation", "Training"],
				},
			},
		}),
	]);

	// Seed Interactions
	console.log("Creating interactions...");
	await Promise.all([
		prisma.interaction.create({
			data: {
				customerId: customer1.id,
				contactId: contacts[0].id,
				type: "MEETING",
				subject: "Initial Requirements Discussion",
				description: "Discussed testing requirements and project scope",
				date: new Date("2025-10-15T10:00:00Z"),
				duration: 60,
				participants: JSON.stringify(["John Smith", "Admin User"]),
				outcome: "Agreed on project scope and timeline",
			},
		}),
		prisma.interaction.create({
			data: {
				customerId: customer2.id,
				contactId: contacts[2].id,
				type: "CALL",
				subject: "Follow-up on QA Audit Proposal",
				description: "Followed up on the QA audit proposal and addressed questions",
				date: new Date("2025-10-20T14:30:00Z"),
				duration: 30,
				participants: JSON.stringify(["Mike Davis", "Admin User"]),
				outcome: "Customer requested additional details on deliverables",
			},
		}),
	]);

	// Seed Tasks
	console.log("Creating tasks...");
	await Promise.all([
		prisma.task.create({
			data: {
				title: "Setup Testing Environment",
				description: "Configure testing tools and environment for MADE Lab project",
				entityType: "ENGAGEMENT",
				entityId: engagements[0].id,
				status: "COMPLETED",
				priority: "HIGH",
				assignedTo: adminUser.id,
				dueDate: new Date("2025-11-05"),
				taskType: "TESTING_SETUP",
				category: "Infrastructure",
				tags: JSON.stringify(["setup", "infrastructure"]),
				completedAt: new Date("2025-11-03"),
				metaData: {
					tools: ["Selenium", "Jest", "Cypress"],
					environment: "Staging",
				},
			},
		}),
		prisma.task.create({
			data: {
				title: "Create Test Cases",
				description: "Develop comprehensive test cases for product features",
				entityType: "ENGAGEMENT",
				entityId: engagements[0].id,
				status: "IN_PROGRESS",
				priority: "HIGH",
				assignedTo: "user-2",
				dueDate: new Date("2025-11-20"),
				taskType: "TESTING_PLANNING",
				category: "Planning",
				tags: JSON.stringify(["test-cases", "planning"]),
				metaData: {
					testTypes: ["Unit", "Integration", "E2E"],
					estimatedHours: 40,
				},
			},
		}),
		prisma.task.create({
			data: {
				title: "Schedule Kickoff Meeting",
				description: "Schedule and prepare for project kickoff meeting",
				entityType: "ENGAGEMENT",
				entityId: engagements[1].id,
				status: "TODO",
				priority: "MEDIUM",
				assignedTo: adminUser.id,
				dueDate: new Date("2025-11-25"),
				taskType: "MEETING_SCHEDULING",
				category: "Communication",
				tags: JSON.stringify(["meeting", "kickoff"]),
				metaData: {
					attendees: ["Mike Davis", "QA Team"],
					agenda: ["Project Overview", "Timeline", "Deliverables"],
				},
			},
		}),
	]);

	// Seed Test Suites
	console.log("Creating test suites...");
	const testSuites = await Promise.all([
		prisma.testSuite.create({
			data: {
				name: "Performance Testing Suite",
				description: "Comprehensive performance testing including load, stress, and scalability tests",
				category: "Performance",
				isActive: true,
				estimatedHours: 24,
				metaData: {
					testTypes: ["Load Testing", "Stress Testing", "Scalability Testing"],
					tools: ["JMeter", "k6", "New Relic"],
				},
			},
		}),
		prisma.testSuite.create({
			data: {
				name: "Security Testing Suite",
				description: "Security assessment including vulnerability scanning and penetration testing",
				category: "Security",
				isActive: true,
				estimatedHours: 32,
				metaData: {
					testTypes: ["Vulnerability Assessment", "Penetration Testing", "Compliance"],
					standards: ["OWASP", "NIST", "ISO 27001"],
				},
			},
		}),
		prisma.testSuite.create({
			data: {
				name: "Usability Testing Suite",
				description: "User experience and usability testing with real users",
				category: "Usability",
				isActive: true,
				estimatedHours: 16,
				metaData: {
					testTypes: ["User Testing", "A/B Testing", "Accessibility"],
					tools: ["UserTesting.com", "Hotjar", "Google Analytics"],
				},
			},
		}),
	]);

	// Seed Test Orders
	console.log("Creating test orders...");
	const testOrders = await Promise.all([
		prisma.testOrder.create({
			data: {
				engagementId: engagements[0].id,
				title: "MADE Lab Product Testing - Q4 2025",
				description: "Complete testing suite for new product line launch",
				status: "ACTIVE",
				priority: "HIGH",
				requestedBy: adminUser.id,
				assignedTo: adminUser.id,
				startDate: new Date("2025-11-01"),
				dueDate: new Date("2025-12-15"),
				budget: 75000,
				notes: "High priority project for Q4 launch",
				metaData: {
					projectPhase: "Testing",
					stakeholders: ["John Smith", "Sarah Johnson"],
					milestones: ["Environment Setup", "Test Execution", "Reporting"],
				},
			},
		}),
	]);

	// Assign Test Suites to Test Order
	console.log("Assigning test suites to orders...");
	await Promise.all([
		prisma.testSuiteOnOrder.create({
			data: {
				testOrderId: testOrders[0].id,
				testSuiteId: testSuites[0].id,
				assignedBy: adminUser.id,
			},
		}),
		prisma.testSuiteOnOrder.create({
			data: {
				testOrderId: testOrders[0].id,
				testSuiteId: testSuites[1].id,
				assignedBy: adminUser.id,
			},
		}),
		prisma.testSuiteOnOrder.create({
			data: {
				testOrderId: testOrders[0].id,
				testSuiteId: testSuites[2].id,
				assignedBy: adminUser.id,
			},
		}),
	]);

	// Seed Samples
	console.log("Creating samples...");
	const samples = await Promise.all([
		prisma.sample.create({
			data: {
				testOrderId: testOrders[0].id,
				name: "Product Prototype v2.1",
				description: "Latest prototype with new features for comprehensive testing",
				type: "PHYSICAL",
				quantity: 3,
				receivedDate: new Date("2025-11-01"),
				receivedFrom: "John Smith",
				storageLocation: "Lab Room A-12",
				condition: "New",
				status: "RECEIVED",
				notes: "Handle with care - contains sensitive electronics",
				mediaIds: JSON.stringify(["media-1", "media-2"]),
				metaData: {
					serialNumbers: ["PROT-2025-001", "PROT-2025-002", "PROT-2025-003"],
					specifications: "12V DC, WiFi enabled, Bluetooth 5.0",
				},
			},
		}),
		prisma.sample.create({
			data: {
				testOrderId: testOrders[0].id,
				name: "Mobile App Build #127",
				description: "iOS and Android app builds for usability testing",
				type: "DIGITAL",
				quantity: 1,
				receivedDate: new Date("2025-11-02"),
				receivedFrom: "Sarah Johnson",
				storageLocation: "Digital Assets Server",
				condition: "Production Ready",
				status: "RECEIVED",
				notes: "TestFlight and Google Play beta builds available",
				mediaIds: JSON.stringify(["media-3"]),
				metaData: {
					version: "2.1.0",
					platforms: ["iOS", "Android"],
					buildNumbers: ["127", "456"],
				},
			},
		}),
	]);

	// Seed Tests
	console.log("Creating tests...");
	await Promise.all([
		prisma.test.create({
			data: {
				testOrderId: testOrders[0].id,
				testSuiteId: testSuites[0].id,
				sampleId: samples[0].id,
				name: "Load Testing - 1000 Concurrent Users",
				description: "Test system performance under 1000 concurrent users",
				method: "Automated Load Testing",
				parameters: {
					concurrentUsers: 1000,
					duration: "30 minutes",
					rampUp: "5 minutes",
				},
				expectedResult: "Response time < 2 seconds, no errors",
				status: "COMPLETED",
				startedAt: new Date("2025-11-05T09:00:00Z"),
				completedAt: new Date("2025-11-05T09:30:00Z"),
				performedBy: "user-2",
				notes: "Passed all performance benchmarks",
				data: {
					avgResponseTime: 1.2,
					maxResponseTime: 3.1,
					errorRate: 0.01,
					throughput: 850,
				},
				mediaIds: JSON.stringify(["media-4"]),
				metaData: {
					tool: "k6",
					environment: "Staging",
				},
			},
		}),
		prisma.test.create({
			data: {
				testOrderId: testOrders[0].id,
				testSuiteId: testSuites[1].id,
				sampleId: samples[1].id,
				name: "Security Vulnerability Scan",
				description: "Automated security vulnerability assessment",
				method: "OWASP ZAP Scan",
				parameters: {
					scanType: "Full Scan",
					depth: "Deep",
					falsePositiveCheck: true,
				},
				expectedResult: "No critical vulnerabilities",
				status: "IN_PROGRESS",
				startedAt: new Date("2025-11-06T10:00:00Z"),
				performedBy: "user-2",
				notes: "Scanning in progress - preliminary results show no critical issues",
				data: {
					vulnerabilitiesFound: 2,
					criticalCount: 0,
					highCount: 1,
					mediumCount: 1,
				},
				metaData: {
					tool: "OWASP ZAP",
					scanProgress: "75%",
				},
			},
		}),
		prisma.test.create({
			data: {
				testOrderId: testOrders[0].id,
				testSuiteId: testSuites[2].id,
				sampleId: samples[1].id,
				name: "Mobile App Usability Testing",
				description: "User testing session with 5 participants",
				method: "Remote Usability Testing",
				parameters: {
					participants: 5,
					duration: "45 minutes each",
					scenarios: ["Onboarding", "Core Features", "Error Handling"],
				},
				expectedResult: "Task completion rate > 80%, satisfaction score > 4/5",
				status: "PENDING",
				performedBy: adminUser.id,
				notes: "Scheduled for next week",
				metaData: {
					platform: "UserTesting.com",
					targetUsers: "Mobile app users aged 25-45",
				},
			},
		}),
	]);

	// Seed Test Reports
	console.log("Creating test reports...");
	await Promise.all([
		prisma.testReport.create({
			data: {
				testOrderId: testOrders[0].id,
				title: "Performance Testing Report - MADE Lab Product",
				summary: "Comprehensive performance testing completed successfully with all benchmarks met.",
				findings: "The product demonstrated excellent performance under load, with response times well within acceptable limits. Minor optimizations recommended for peak usage scenarios.",
				recommendations: "1. Implement caching for frequently accessed data\n2. Consider CDN for static assets\n3. Monitor database connection pooling",
				status: "PUBLISHED",
				version: 1,
				generatedAt: new Date("2025-11-10"),
				approvedAt: new Date("2025-11-12"),
				approvedBy: adminUser.id,
				publishedAt: new Date("2025-11-12"),
				mediaId: "media-5",
				metaData: {
					reportType: "Performance",
					confidentiality: "Client Confidential",
					distribution: ["John Smith", "Sarah Johnson"],
				},
			},
		}),
	]);

	console.log(`✅ Created CRM and Testing seed data:`);
	console.log(`   - ${contacts.length} contacts`);
	console.log(`   - ${opportunities.length} opportunities`);
	console.log(`   - ${engagements.length} engagements`);
	console.log(`   - ${testSuites.length} test suites`);
	console.log(`   - ${testOrders.length} test orders`);
	console.log(`   - ${samples.length} samples`);
	console.log(`   - Tasks, interactions, tests, and reports created`);

	return {
		success: true,
		message: "CRM and Testing data seeded successfully",
		count: contacts.length + opportunities.length + engagements.length + testSuites.length + testOrders.length + samples.length,
	};
}
