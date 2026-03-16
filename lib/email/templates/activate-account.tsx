import { EmailButton, EmailHeading, EmailLayout, EmailText } from "./base";

interface ActivateAccountEmailProps {
	userName: string;
	activationLink: string;
	expiresIn?: string;
}

export function ActivateAccountEmail({ userName, activationLink, expiresIn = "24 hours" }: ActivateAccountEmailProps) {
	return (
		<EmailLayout previewText="Activate your MADE Laboratory account">
			<EmailHeading>Activate Your Account</EmailHeading>

			<EmailText>Hi {userName},</EmailText>

			<EmailText>Your account has been created by an administrator. To get started, please activate your account and set your password by clicking the button below.</EmailText>

			<EmailButton href={activationLink}>Activate Account & Set Password</EmailButton>

			<EmailText>This activation link will expire in {expiresIn}. If you did not request this account, you can safely ignore this email.</EmailText>

			<EmailText>
				<span style={{ fontSize: "14px", color: "#666" }}>
					If the button doesn't work, copy and paste this link into your browser:
					<br />
					<a
						href={activationLink}
						style={{ color: "#667eea", wordBreak: "break-all" }}>
						{activationLink}
					</a>
				</span>
			</EmailText>

			<EmailText>Need help? Contact us at support@madelab.io</EmailText>
		</EmailLayout>
	);
}
