import { EmailHeading, EmailLayout, EmailText } from "./base";

interface ContactConfirmationEmailProps {
	firstName: string;
	lastName: string;
}

export function ContactConfirmationEmail({ firstName, lastName }: ContactConfirmationEmailProps) {
	return (
		<EmailLayout previewText="Thank you for contacting us!">
			<EmailHeading>Thank you for contacting us!</EmailHeading>

			<EmailText>
				Hi {firstName} {lastName},
			</EmailText>

			<EmailText>Thank you for reaching out to us! We've received your message and our team will review it and get back to you typically within 24 hours. If you have any additional information you'd like to provide, simply respond to this email.</EmailText>

			<EmailText>
				Best regards,
				<br />
				MADE Laboratory Team
			</EmailText>
		</EmailLayout>
	);
}

interface AdminContactNotificationProps {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	company?: string;
	subject: string;
	message: string;
}

export function AdminContactNotification({ firstName, lastName, email, phone, company, subject, message }: AdminContactNotificationProps) {
	return (
		<EmailLayout previewText={`New contact form submission from ${firstName} ${lastName}`}>
			<EmailHeading>
				New contact form submission from {firstName} {lastName}
			</EmailHeading>

			<EmailText>Hi Admin,</EmailText>

			<EmailText>You have a new contact form submission. Here are the details:</EmailText>

			<div style={{ backgroundColor: "#f9f9f9", border: "1px solid #e5e5e5", borderRadius: "8px", padding: "20px", margin: "24px 0" }}>
				<p style={{ margin: "8px 0", fontSize: "16px" }}>
					<strong>Name:</strong> {firstName} {lastName}
				</p>
				<p style={{ margin: "8px 0", fontSize: "16px" }}>
					<strong>Email:</strong> {email}
				</p>
				<p style={{ margin: "8px 0", fontSize: "16px" }}>
					<strong>Phone:</strong> {phone}
				</p>
				{company && (
					<p style={{ margin: "8px 0", fontSize: "16px" }}>
						<strong>Company:</strong> {company}
					</p>
				)}
				<p style={{ margin: "8px 0", fontSize: "16px" }}>
					<strong>Subject:</strong> {subject}
				</p>
				<p style={{ margin: "8px 0", fontSize: "16px" }}>
					<strong>Message:</strong>
				</p>
				<div style={{ backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "4px", padding: "12px", margin: "8px 0", fontSize: "14px", whiteSpace: "pre-wrap" }}>{message}</div>
			</div>

			<EmailText style={{ fontSize: "14px", color: "#666666" }}>Please review this contact request and follow up as needed.</EmailText>
		</EmailLayout>
	);
}
