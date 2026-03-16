import { EmailButton, EmailHeading, EmailLayout, EmailText } from "./base";

interface WelcomeEmailProps {
	userName: string;
	loginLink: string;
	isActivation?: boolean; // Flag to show if this is post-activation
}

export function WelcomeEmail({ userName, loginLink, isActivation = false }: WelcomeEmailProps) {
	return (
		<EmailLayout previewText={isActivation ? "Account Activated - Welcome!" : "Welcome to MADE Laboratory"}>
			<EmailHeading>{isActivation ? "Account Activated!" : "Welcome to MADE Laboratory!"}</EmailHeading>

			<EmailText>Hi {userName},</EmailText>

			{isActivation ? (
				<>
					<EmailText>Your account has been successfully activated and your password has been set. You're all set to start using MADE Laboratory!</EmailText>

					<EmailText>You can now sign in with your email and the password you just created.</EmailText>
				</>
			) : (
				<>
					<EmailText>Your account has been successfully created. We're excited to have you on board!</EmailText>

					<EmailText>MADE Laboratory helps you manage your business operations efficiently.</EmailText>
				</>
			)}

			<EmailButton href={loginLink}>{isActivation ? "Sign In Now" : "Get Started"}</EmailButton>

			<EmailText>If you have any questions, our support team is here to help at support@madelab.io</EmailText>
		</EmailLayout>
	);
}
