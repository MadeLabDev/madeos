import jsPDF from "jspdf";

import type { Invoice } from "@/lib/features/pricing/types";

export class ClientPDFGenerator {
	static generateInvoicePDF(invoice: Invoice): void {
		const doc = new jsPDF();

		// Set font
		doc.setFont("helvetica");

		// Header
		doc.setFontSize(24);
		doc.setTextColor(37, 99, 235); // Blue color
		doc.text("MADE Lab", 20, 30);

		doc.setFontSize(16);
		doc.setTextColor(0, 0, 0);
		doc.text("INVOICE", 150, 30);

		// Invoice number
		doc.setFontSize(12);
		doc.text(`Invoice #: ${invoice.invoiceNumber}`, 150, 45);

		// Company info
		doc.setFontSize(10);
		doc.text("123 Business Street", 20, 45);
		doc.text("Business City, BC 12345", 20, 50);
		doc.text("contact@madeapp.com", 20, 55);

		// Invoice details
		doc.setFontSize(12);
		doc.setTextColor(37, 99, 235);
		doc.text("Invoice Details", 20, 75);

		doc.setTextColor(0, 0, 0);
		doc.setFontSize(10);

		const formatDate = (date: Date) => {
			return new Intl.DateTimeFormat("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			}).format(new Date(date));
		};

		doc.text(`Invoice Date: ${formatDate(invoice.issuedAt)}`, 20, 85);
		doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, 20, 92);
		doc.text(`Billing Period: ${formatDate(invoice.billingPeriodStart)} - ${formatDate(invoice.billingPeriodEnd)}`, 20, 99);

		// Status
		let statusColor: [number, number, number] = [0, 0, 0]; // Default black
		if (invoice.status === "PAID")
			statusColor = [22, 101, 52]; // Green
		else if (invoice.status === "PENDING")
			statusColor = [245, 158, 11]; // Yellow
		else if (invoice.status === "OVERDUE") statusColor = [220, 38, 38]; // Red

		doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
		doc.text(`Status: ${invoice.status}`, 20, 106);
		doc.setTextColor(0, 0, 0);

		// Description
		doc.setFontSize(12);
		doc.setTextColor(37, 99, 235);
		doc.text("Description", 20, 125);
		doc.setTextColor(0, 0, 0);
		doc.setFontSize(10);
		doc.text(invoice.description || "Subscription payment", 20, 135);

		// Amount section
		doc.setFillColor(248, 250, 252); // Light gray background
		doc.rect(120, 150, 70, 30, "F");

		doc.setFontSize(14);
		doc.setTextColor(37, 99, 235);
		doc.text("Total Amount", 125, 165);

		doc.setFontSize(16);
		doc.setTextColor(37, 99, 235);
		const amount = `$${invoice.amount.toFixed(2)} ${invoice.currency.toUpperCase()}`;
		doc.text(amount, 125, 175);

		// Footer
		doc.setFontSize(8);
		doc.setTextColor(100, 100, 100);
		doc.text("Thank you for your business!", 20, 200);
		doc.text("For questions about this invoice, please contact support@madeapp.com", 20, 205);

		// Notes if any
		if (invoice.notes) {
			doc.setFontSize(10);
			doc.setTextColor(37, 99, 235);
			doc.text("Notes:", 20, 220);
			doc.setTextColor(0, 0, 0);
			doc.setFontSize(8);
			const splitNotes = doc.splitTextToSize(invoice.notes, 170);
			doc.text(splitNotes, 20, 225);
		}

		// Download the PDF
		doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
	}
}
