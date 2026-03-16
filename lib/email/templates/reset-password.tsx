import { EmailBox, EmailButton, EmailHeading, EmailLayout, EmailText } from "./base";

interface ResetPasswordEmailProps {
	userName: string;
	resetLink: string;
	expiresIn?: string;
}

export function ResetPasswordEmail({ userName, resetLink, expiresIn = "1 hour" }: ResetPasswordEmailProps) {
	return (
		<EmailLayout previewText="Reset your MADE Laboratory password">
			<EmailHeading>Reset Your Password</EmailHeading>

			<EmailText>Hi {userName},</EmailText>

			<EmailText>We received a request to reset your password for your MADE Laboratory account. Click the button below to create a new password.</EmailText>

			<EmailButton href={resetLink}>Reset Password</EmailButton>

			<EmailBox>
				<p style={{ fontSize: "14px", color: "#666666", margin: 0 }}>
					<strong>Note:</strong> This link will expire in {expiresIn}. If you didn't request a password reset, you can safely ignore this email.
				</p>
			</EmailBox>

			<EmailText style={{ fontSize: "14px", color: "#666666" }}>If the button doesn't work, copy and paste this link into your browser:</EmailText>

			<EmailBox>
				<a
					href={resetLink}
					style={{ fontSize: "14px", color: "#1a1a1a", wordBreak: "break-all" }}>
					{resetLink}
				</a>
			</EmailBox>

			<EmailText style={{ fontSize: "14px", color: "#999999", marginTop: "32px" }}>If you have any questions or concerns, please contact our support team.</EmailText>
		</EmailLayout>
	);
}
