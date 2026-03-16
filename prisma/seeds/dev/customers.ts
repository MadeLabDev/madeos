import { prisma, SeederResult } from "../seeder-utils";

/**
 * Seed customer data
 * Creates parent customers with multiple locations/branches
 */
export async function seedCustomers(): Promise<SeederResult> {
	// Parent Customer A - Multi-location business
	const parentA = await prisma.customer.create({
		data: {
			companyName: "Tech Solutions Inc.",
			email: "info@techsolutions.com",
			phone: "212-555-0100",
			website: "www.techsolutions.com",
			address: "100 Tech Park Blvd",
			city: "New York",
			state: "NY",
			zipCode: "10001",
			country: "USA",
			contactName: "John Smith",
			contactTitle: "CEO",
			contactEmail: "john.smith@techsolutions.com",
			contactPhone: "212-555-0101",
			type: "customer",
			taxId: "12-3456789",
			discountPercent: 10,
			paymentTermsDays: 45,
			creditLimit: 100000,
			notes: "Major client - Multi-location enterprise",
		},
	});

	// Child locations of Parent A
	const locationA1 = await prisma.customer.create({
		data: {
			companyName: "Tech Solutions - NY Office",
			email: "ny@techsolutions.com",
			phone: "212-555-0102",
			address: "100 Tech Park Blvd, Suite 500",
			city: "New York",
			state: "NY",
			zipCode: "10001",
			country: "USA",
			contactName: "Sarah Johnson",
			contactTitle: "Regional Manager",
			contactEmail: "sarah.johnson@techsolutions.com",
			contactPhone: "212-555-0103",
			type: "customer",
			parentId: parentA.id,
			discountPercent: 10,
			paymentTermsDays: 45,
			creditLimit: 50000,
			notes: "NY Branch - Headquarters",
		},
	});

	const locationA2 = await prisma.customer.create({
		data: {
			companyName: "Tech Solutions - LA Office",
			email: "la@techsolutions.com",
			phone: "310-555-0104",
			address: "2000 Sunset Blvd, Suite 300",
			city: "Los Angeles",
			state: "CA",
			zipCode: "90001",
			country: "USA",
			contactName: "Michael Chen",
			contactTitle: "West Coast Manager",
			contactEmail: "michael.chen@techsolutions.com",
			contactPhone: "310-555-0105",
			type: "customer",
			parentId: parentA.id,
			discountPercent: 10,
			paymentTermsDays: 45,
			creditLimit: 50000,
			notes: "LA Branch - West Coast operations",
		},
	});

	const locationA3 = await prisma.customer.create({
		data: {
			companyName: "Tech Solutions - Chicago Office",
			email: "chicago@techsolutions.com",
			phone: "312-555-0106",
			address: "300 North Michigan Ave, Suite 400",
			city: "Chicago",
			state: "IL",
			zipCode: "60601",
			country: "USA",
			contactName: "Emily Rodriguez",
			contactTitle: "Midwest Manager",
			contactEmail: "emily.rodriguez@techsolutions.com",
			contactPhone: "312-555-0107",
			type: "customer",
			parentId: parentA.id,
			discountPercent: 10,
			paymentTermsDays: 45,
			creditLimit: 50000,
			notes: "Chicago Branch - Midwest hub",
		},
	});

	// Parent Customer B - Wholesale distributor
	const parentB = await prisma.customer.create({
		data: {
			companyName: "Global Trade Co.",
			email: "contact@globaltrade.com",
			phone: "713-555-0108",
			address: "5000 Business Park Dr",
			city: "Houston",
			state: "TX",
			zipCode: "77002",
			country: "USA",
			contactName: "David Martinez",
			contactTitle: "Owner",
			contactEmail: "david@globaltrade.com",
			contactPhone: "713-555-0109",
			type: "partner",
			taxId: "98-7654321",
			discountPercent: 15,
			paymentTermsDays: 60,
			creditLimit: 200000,
			notes: "Wholesale partner - Multiple distribution centers",
		},
	});

	// Child locations of Parent B
	const locationB1 = await prisma.customer.create({
		data: {
			companyName: "Global Trade - Houston DC",
			email: "houston@globaltrade.com",
			phone: "713-555-0110",
			address: "5000 Business Park Dr, Building A",
			city: "Houston",
			state: "TX",
			zipCode: "77002",
			country: "USA",
			contactName: "Robert Williams",
			contactTitle: "Warehouse Manager",
			contactEmail: "robert@globaltrade.com",
			contactPhone: "713-555-0111",
			type: "partner",
			parentId: parentB.id,
			discountPercent: 15,
			paymentTermsDays: 60,
			creditLimit: 100000,
			notes: "Houston Distribution Center",
		},
	});

	const locationB2 = await prisma.customer.create({
		data: {
			companyName: "Global Trade - Dallas DC",
			email: "dallas@globaltrade.com",
			phone: "214-555-0112",
			address: "1000 Commerce St, Suite 200",
			city: "Dallas",
			state: "TX",
			zipCode: "75201",
			country: "USA",
			contactName: "Jennifer Lee",
			contactTitle: "Operations Lead",
			contactEmail: "jennifer@globaltrade.com",
			contactPhone: "214-555-0113",
			type: "partner",
			parentId: parentB.id,
			discountPercent: 15,
			paymentTermsDays: 60,
			creditLimit: 100000,
			notes: "Dallas Distribution Center",
		},
	});

	// Standard single location customers
	const standalone1 = await prisma.customer.create({
		data: {
			companyName: "Local Retail Shop",
			email: "owner@localretail.com",
			phone: "305-555-0114",
			address: "150 Collins Ave",
			city: "Miami",
			state: "FL",
			zipCode: "33139",
			country: "USA",
			contactName: "James Thompson",
			contactTitle: "Owner",
			contactEmail: "james@localretail.com",
			contactPhone: "305-555-0115",
			type: "customer",
			discountPercent: 5,
			paymentTermsDays: 30,
			notes: "Single location retail store",
		},
	});

	const standalone2 = await prisma.customer.create({
		data: {
			companyName: "Fashion Boutique LLC",
			email: "info@fashionboutique.com",
			phone: "206-555-0116",
			address: "500 Pike Place Market",
			city: "Seattle",
			state: "WA",
			zipCode: "98101",
			country: "USA",
			contactName: "Amanda White",
			contactTitle: "Manager",
			contactEmail: "amanda@fashionboutique.com",
			contactPhone: "206-555-0117",
			type: "customer",
			discountPercent: 0,
			paymentTermsDays: 30,
			notes: "Fashion retail",
		},
	});

	// Vendor example
	const vendor1 = await prisma.customer.create({
		data: {
			companyName: "Premium Fabric Suppliers",
			email: "sales@premiumfabrics.com",
			phone: "404-555-0118",
			address: "800 Industrial Blvd",
			city: "Atlanta",
			state: "GA",
			zipCode: "30301",
			country: "USA",
			contactName: "Lisa Park",
			contactTitle: "Sales Director",
			contactEmail: "lisa@premiumfabrics.com",
			contactPhone: "404-555-0119",
			type: "vendor",
			discountPercent: 0,
			paymentTermsDays: 15,
			notes: "Primary fabric supplier",
		},
	});

	console.log("✅ Customers seeded successfully");
	console.log(`   - Parent A: ${parentA.companyName} with 3 locations`);
	console.log(`   - Parent B: ${parentB.companyName} with 2 locations`);
	console.log(`   - Standalone 1: ${standalone1.companyName}`);
	console.log(`   - Standalone 2: ${standalone2.companyName}`);
	console.log(`   - Vendor 1: ${vendor1.companyName}`);

	return {
		success: true,
		message: "Customers seeded successfully",
		count: 9, // 2 parents + 5 locations + 2 standalone
		data: {
			parentA,
			locationA1,
			locationA2,
			locationA3,
			parentB,
			locationB1,
			locationB2,
			standalone1,
			standalone2,
			vendor1,
		},
	};
}
