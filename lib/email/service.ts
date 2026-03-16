import { render } from "@react-email/render";
import nodemailer from "nodemailer";

import { ActivateAccountEmail } from "./templates/activate-account";
import { AdminContactNotification, ContactConfirmationEmail } from "./templates/contact";
import { KnowledgeAssignmentEmail } from "./templates/knowledge-assignment";
import { ResetPasswordEmail } from "./templates/reset-password";
import { AdminSubscriptionNotification, SubscriptionEmail } from "./templates/subscription";
import { TestEmail } from "./templates/test";
import { WelcomeEmail } from "./templates/welcome";

// Email transporter configuration
const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_HOST || "smtp.gmail.com",
	port: parseInt(process.env.EMAIL_PORT || "587"),
	secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASSWORD,
	},
});

interface SendEmailOptions {
	to: string;
	subject: string;
	html: string;
	text?: string;
	from?: string;
}

async function sendEmail({ to, subject, html, text, from }: SendEmailOptions) {
	try {
		// Ensure html is a string
		const htmlString = typeof html === "string" ? html : String(html);
		const textContent = text || htmlString.replace(/<[^>]*>/g, ""); // Strip HTML for text version

		const info = await transporter.sendMail({
			from: from || `"MADE Laboratory" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
			to,
			subject,
			html: htmlString,
			text: textContent,
		});

		console.log("Email sent successfully:", info.messageId);
		return { success: true, messageId: info.messageId };
	} catch (error) {
		console.error("Email sending failed:", error);
		return { success: false, error };
	}
}

// Email service functions
export const emailService = {
	async sendResetPasswordEmail(email: string, userName: string, resetToken: string) {
		const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

		const html = await render(
			ResetPasswordEmail({
				userName,
				resetLink,
				expiresIn: "1 hour",
			}),
		);

		return sendEmail({
			to: email,
			subject: "Reset Your Password - MADE Laboratory",
			html,
		});
	},

	async sendWelcomeEmail(email: string, userName: string, isActivation = false) {
		const loginLink = `${process.env.NEXTAUTH_URL}/auth/signin`;

		const html = await render(
			WelcomeEmail({
				userName,
				loginLink,
				isActivation,
			}),
		);

		return sendEmail({
			to: email,
			subject: isActivation ? "Account Activated - MADE Laboratory" : "Welcome to MADE Laboratory",
			html,
		});
	},

	async sendTestEmail(email: string, testMessage?: string) {
		const html = await render(
			TestEmail({
				testMessage,
			}),
		);

		return sendEmail({
			to: email,
			subject: "Test Email - MADE Laboratory",
			html,
		});
	},

	async sendActivationEmail(email: string, userName: string, activationToken: string) {
		const activationLink = `${process.env.NEXTAUTH_URL}/auth/activate?token=${activationToken}`;

		const html = await render(
			ActivateAccountEmail({
				userName,
				activationLink,
				expiresIn: "24 hours",
			}),
		);

		return sendEmail({
			to: email,
			subject: "Activate Your Account - MADE Laboratory",
			html,
		});
	},

	async sendPasswordChangedEmail(email: string, userName: string) {
		const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Password Changed Successfully</h2>
            <p>Hi ${userName},</p>
            <p>Your password has been changed successfully. If you did not make this change, please contact support immediately.</p>
            <p>Best regards,<br>MADE Laboratory Team</p>
          </div>
        </body>
      </html>
    `;

		return sendEmail({
			to: email,
			subject: "Password Changed - MADE Laboratory",
			html,
		});
	},

	// Generic email sender for custom content
	async send(to: string, subject: string, htmlContent: string) {
		return sendEmail({
			to,
			subject,
			html: htmlContent,
		});
	},

	async sendKnowledgeAssignmentEmail(to: string, userName: string, articleTitle: string, articleLink: string) {
		const html = await render(
			KnowledgeAssignmentEmail({
				userName,
				articleTitle,
				articleLink,
			}),
		);

		return sendEmail({
			to,
			subject: `New article available: ${articleTitle} - MADE Laboratory`,
			html,
			from: process.env.NODE_ENV === "production" ? '"MADE Laboratory" <hello@madelab.io>' : undefined,
		});
	},

	async sendSubscriptionEmail(to: string, firstName: string, lastName: string) {
		const html = await render(
			SubscriptionEmail({
				firstName,
				lastName,
			}),
		);

		return sendEmail({
			to,
			subject: "Thanks for connecting with us!",
			html,
		});
	},

	async sendAdminSubscriptionNotification(adminEmail: string, firstName: string, lastName: string, userEmail: string) {
		const html = await render(
			AdminSubscriptionNotification({
				firstName,
				lastName,
				email: userEmail,
			}),
		);

		return sendEmail({
			to: adminEmail,
			subject: `New subscription from ${firstName} ${lastName}`,
			html,
		});
	},

	async sendContactConfirmationEmail(to: string, firstName: string, lastName: string) {
		const html = await render(
			ContactConfirmationEmail({
				firstName,
				lastName,
			}),
		);

		return sendEmail({
			to,
			subject: "Thank you for contacting us! - MADE Laboratory",
			html,
		});
	},

	async sendAdminContactNotification(adminEmail: string, firstName: string, lastName: string, email: string, phone: string, company: string | undefined, subject: string, message: string) {
		const html = await render(
			AdminContactNotification({
				firstName,
				lastName,
				email,
				phone,
				company,
				subject,
				message,
			}),
		);

		return sendEmail({
			to: adminEmail,
			subject: `New contact form submission: ${subject}`,
			html,
		});
	},
};

// Verify email configuration
export async function verifyEmailConfig() {
	try {
		await transporter.verify();
		console.log("✅ Email server is ready to send emails");
		return true;
	} catch (error) {
		console.error("❌ Email server connection failed:", error);
		return false;
	}
}
