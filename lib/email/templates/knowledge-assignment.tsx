import { EmailButton, EmailHeading, EmailLayout, EmailText } from "./base";

interface KnowledgeAssignmentEmailProps {
	userName: string;
	articleTitle: string;
	articleLink: string;
}

export function KnowledgeAssignmentEmail({ userName, articleTitle, articleLink }: KnowledgeAssignmentEmailProps) {
	return (
		<EmailLayout previewText={`New article available: ${articleTitle}`}>
			<EmailHeading>New Article Available</EmailHeading>

			<EmailText>Hi {userName},</EmailText>

			<EmailText>
				A new article has been made available for you: <strong>{articleTitle}</strong>
			</EmailText>

			<EmailText>Click the button below to read the article:</EmailText>

			<EmailButton href={articleLink}>Read Article</EmailButton>

			<EmailText>If you have any questions about this article, please don't hesitate to reach out.</EmailText>
		</EmailLayout>
	);
}
