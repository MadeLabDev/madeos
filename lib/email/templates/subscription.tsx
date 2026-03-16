import { EmailHeading, EmailLayout, EmailText } from "./base";

interface SubscriptionEmailProps {
	firstName: string;
	lastName: string;
}

export function SubscriptionEmail({ firstName, lastName }: SubscriptionEmailProps) {
	return (
		<EmailLayout previewText="Thanks for connecting with us!">
			<EmailHeading>Thanks for connecting with us!</EmailHeading>

			<EmailText>
				Hi {firstName} {lastName},
			</EmailText>

			<EmailText>Thanks for connecting with us! Our team will review your request and get back to you typically within 24 hours. If you have any more information you'd like to relay, simply respond to this email.</EmailText>

			<EmailText>
				Best regards,
				<br />
				MADE Laboratory Team
			</EmailText>
		</EmailLayout>
	);
}

interface AdminSubscriptionNotificationProps {
	firstName: string;
	lastName: string;
	email: string;
}

export function AdminSubscriptionNotification({ firstName, lastName, email }: AdminSubscriptionNotificationProps) {
	return (
		<EmailLayout previewText={`New contact request from ${firstName} ${lastName}`}>
			<EmailHeading>
				New contact request from {firstName} {lastName}
			</EmailHeading>

			<EmailText>Hi Admin,</EmailText>

			<EmailText>
				You have a new contact request from {firstName} {lastName}. Here are the details:
			</EmailText>

			<div style={{ backgroundColor: "#f9f9f9", border: "1px solid #e5e5e5", borderRadius: "8px", padding: "20px", margin: "24px 0" }}>
				<p style={{ margin: "8px 0", fontSize: "16px" }}>
					<strong>Email:</strong> {email}
				</p>
			</div>

			<EmailText style={{ fontSize: "14px", color: "#666666" }}>Please review this request and follow up as needed.</EmailText>
		</EmailLayout>
	);
}
