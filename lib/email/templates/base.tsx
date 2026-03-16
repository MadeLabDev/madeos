import * as React from "react";

interface EmailLayoutProps {
	children: React.ReactNode;
	previewText?: string;
}

export function EmailLayout({ children, previewText }: EmailLayoutProps) {
	return (
		<html>
			<head>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1.0"
				/>
				<meta name="x-apple-disable-message-reformatting" />
				<title>MADE Laboratory</title>
				<style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f5f5f5;
          }
          .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
          }
          .email-header {
            background-color: #1a1a1a;
            padding: 32px 24px;
            text-align: center;
          }
          .email-logo {
            font-size: 28px;
            font-weight: bold;
            color: #ffffff !important;
            margin: 0;
            letter-spacing: -0.5px;
          }
          .email-tagline {
            color: #a0a0a0 !important;
            font-size: 14px;
            margin-top: 8px;
          }
          .email-body {
            padding: 40px 24px;
          }
          .email-footer {
            background-color: #f9f9f9;
            padding: 24px;
            text-align: center;
            border-top: 1px solid #e5e5e5;
          }
          .email-footer p {
            color: #666666;
            font-size: 14px;
            margin: 8px 0;
          }
          .email-footer a {
            color: #1a1a1a;
            text-decoration: none;
            font-weight: 500;
          }
          .social-links {
            margin-top: 16px;
          }
          .social-links a {
            display: inline-block;
            margin: 0 8px;
            color: #666666;
            text-decoration: none;
            font-size: 13px;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background-color: #1a1a1a;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            transition: background-color 0.2s;
          }
          .button:hover {
            background-color: #333333;
          }
          .divider {
            height: 1px;
            background-color: #e5e5e5;
            margin: 32px 0;
          }

          /* Dark mode support */
          @media (prefers-color-scheme: dark) {
            body {
              background-color: #1a1a1a;
              color: #ffffff;
            }
            .email-wrapper {
              background-color: #2a2a2a;
            }
            .email-header {
              background-color: #2a2a2a;
            }
            .email-logo {
              color: #ffffff !important;
            }
            .email-tagline {
              color: #ffffff !important;
            }
            .email-body {
              color: #ffffff;
            }
            .email-footer {
              background-color: #2a2a2a;
              border-top: 1px solid #404040;
            }
            .email-footer p {
              color: #ffffff;
            }
            .email-footer a {
              color: #ffffff;
            }
            .button {
              background-color: #4a4a4a;
              color: #ffffff !important;
            }
            .button:hover {
              background-color: #5a5a5a;
            }
            .divider {
              background-color: #404040;
            }
          }
        `}</style>
			</head>
			<body>
				{previewText && <div style={{ display: "none", maxHeight: 0, overflow: "hidden" }}>{previewText}</div>}
				<table
					width="100%"
					cellPadding="0"
					cellSpacing="0"
					role="presentation"
					style={{ backgroundColor: "#f5f5f5", padding: "40px 20px" }}>
					<tr>
						<td align="center">
							<div className="email-wrapper">
								{/* Header */}
								<div className="email-header">
									<h1 className="email-logo">MADE Laboratory</h1>
									{/* <p className="email-tagline">madelab.io</p> */}
								</div>

								{/* Body */}
								<div className="email-body">{children}</div>

								{/* Footer */}
								<div className="email-footer">
									<p>
										<strong>MADE Laboratory</strong>
									</p>
									<p>MADE Laboratory Platform</p>
									<p style={{ marginTop: "16px" }}>
										Need help? Contact us at <a href="mailto:support@madelab.io">support@madelab.io</a>
									</p>
									{/* <div className="social-links">
                    <a href="#">Privacy Policy</a>
                    <span style={{ color: "#e5e5e5" }}>•</span>
                    <a href="#">Terms of Service</a>
                    <span style={{ color: "#e5e5e5" }}>•</span>
                    <a href="#">Unsubscribe</a>
                  </div> */}
									<p style={{ marginTop: "16px", fontSize: "12px", color: "#999999" }}>© {new Date().getFullYear()} MADE Laboratory. All rights reserved.</p>
								</div>
							</div>
						</td>
					</tr>
				</table>
			</body>
		</html>
	);
}

// Helper components for email content
export function EmailHeading({ children }: { children: React.ReactNode }) {
	return <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#1a1a1a", marginBottom: "16px", lineHeight: "1.3" }}>{children}</h2>;
}

export function EmailText({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
	return <p style={{ fontSize: "16px", color: "#333333", marginBottom: "16px", lineHeight: "1.6", ...style }}>{children}</p>;
}

export function EmailButton({ href, children }: { href: string; children: React.ReactNode }) {
	return (
		<div style={{ textAlign: "center", margin: "32px 0" }}>
			<a
				href={href}
				className="button"
				style={{ display: "inline-block", padding: "14px 32px", backgroundColor: "#1a1a1a", color: "#ffffff", textDecoration: "none", borderRadius: "6px", fontWeight: "600", fontSize: "16px" }}>
				{children}
			</a>
		</div>
	);
}

export function EmailDivider() {
	return (
		<div
			className="divider"
			style={{ height: "1px", backgroundColor: "#e5e5e5", margin: "32px 0" }}
		/>
	);
}

export function EmailBox({ children }: { children: React.ReactNode }) {
	return <div style={{ backgroundColor: "#f9f9f9", border: "1px solid #e5e5e5", borderRadius: "8px", padding: "20px", margin: "24px 0" }}>{children}</div>;
}
