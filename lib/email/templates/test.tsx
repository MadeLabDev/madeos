import { EmailHeading, EmailLayout, EmailText } from "./base";

interface TestEmailProps {
	testMessage?: string;
}

export function TestEmail({ testMessage = "This is a test email from MADE Laboratory." }: TestEmailProps) {
	return (
		<EmailLayout previewText="Email Service Test">
			<EmailHeading>Email Service Test</EmailHeading>

			<EmailText>{testMessage}</EmailText>

			<EmailText>If you received this, your email configuration is working correctly! 🎉</EmailText>

			<EmailText style={{ color: "#666", fontSize: "14px" }}>Sent at: {new Date().toLocaleString()}</EmailText>
		</EmailLayout>
	);
}
