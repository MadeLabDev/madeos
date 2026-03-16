"use client";

import { useMemo } from "react";

import type { SerializedEditorState } from "lexical";

interface LexicalContentRendererProps {
	content: string | SerializedEditorState | null | undefined;
}

/**
 * Extracts YouTube video ID from various URL formats
 */
function extractYoutubeId(url: string): string | null {
	const patterns = [/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/, /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/, /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match && match[1]) return match[1];
	}
	return null;
}

/**
 * Renders Lexical SerializedEditorState as HTML
 * Supports: text, headings, lists, quotes, code, images, links, YouTube videos, and more
 */
export function LexicalContentRenderer({ content }: LexicalContentRendererProps) {
	const html = useMemo(() => {
		if (!content) return "<p>No content</p>";

		let editorState: SerializedEditorState | null = null;

		// Parse if string
		if (typeof content === "string") {
			try {
				editorState = JSON.parse(content);
			} catch (error) {
				console.error("Failed to parse Lexical content:", error);
				return `<p>${content}</p>`;
			}
		} else {
			editorState = content;
		}

		if (!editorState?.root?.children) {
			return "<p>No content</p>";
		}

		// Convert Lexical nodes to HTML
		const convertNodesToHtml = (nodes: any[]): string => {
			return nodes
				.map((node) => {
					// Paragraph node
					if (node.type === "paragraph") {
						const textContent = convertNodesToHtml(node.children || []);
						return `<p>${textContent}</p>`;
					}

					// Heading nodes
					if (node.type === "heading") {
						const level = node.tag || "h1";
						const textContent = convertNodesToHtml(node.children || []);
						return `<${level}>${textContent}</${level}>`;
					}

					// List nodes
					if (node.type === "list") {
						const listType = node.listType === "bullet" ? "ul" : "ol";
						const items = (node.children || [])
							.map((item: any) => {
								const itemContent = convertNodesToHtml(item.children || []);
								return `<li>${itemContent}</li>`;
							})
							.join("");
						return `<${listType}>${items}</${listType}>`;
					}

					// Quote/Blockquote
					if (node.type === "quote") {
						const textContent = convertNodesToHtml(node.children || []);
						return `<blockquote>${textContent}</blockquote>`;
					}

					// Code block
					if (node.type === "code") {
						const textContent = convertNodesToHtml(node.children || []);
						const language = node.language || "text";
						return `<pre><code class="language-${language}">${escapeHtml(textContent)}</code></pre>`;
					}

					// Image node
					if (node.type === "image") {
						const src = node.src || "";
						const alt = node.altText || "Image";
						const width = node.width ? ` width="${node.width}"` : "";
						const height = node.height ? ` height="${node.height}"` : "";
						return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${width}${height} />`;
					}

					// Link node
					if (node.type === "link") {
						const url = node.url || "#";
						const title = node.title || "";
						const target = node.target || "_self";
						const textContent = convertNodesToHtml(node.children || []);
						const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
						return `<a href="${escapeHtml(url)}" target="${target}" rel="noopener noreferrer"${titleAttr}>${textContent}</a>`;
					}

					// Auto-link node (similar to link)
					if (node.type === "autolink") {
						const url = node.url || "#";
						const textContent = convertNodesToHtml(node.children || []);
						return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${textContent}</a>`;
					}

					// YouTube embed node
					if (node.type === "youtube") {
						const url = node.url || "";
						const videoId = extractYoutubeId(url);
						if (videoId) {
							return `<div class="youtube-embed">
                <iframe
                  src="https://www.youtube.com/embed/${videoId}"
                  title="YouTube video"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
              </div>`;
						}
						return "";
					}

					// Horizontal rule / divider
					if (node.type === "horizontalrule") {
						return "<hr />";
					}

					// Table node
					if (node.type === "table") {
						const rows = (node.children || [])
							.map((row: any) => {
								const cells = (row.children || [])
									.map((cell: any) => {
										const cellContent = convertNodesToHtml(cell.children || []);
										const tag = cell.type === "tablecell_header" ? "th" : "td";
										return `<${tag}>${cellContent}</${tag}>`;
									})
									.join("");
								return `<tr>${cells}</tr>`;
							})
							.join("");
						return `<table class="border-collapse border">${rows}</table>`;
					}

					// Columns layout node
					if (node.type === "columnslayout") {
						const columns = (node.children || [])
							.map((column: any) => {
								const columnContent = convertNodesToHtml(column.children || []);
								return `<div style="flex: 1; padding: 0 0.75rem; min-width: 0;">${columnContent}</div>`;
							})
							.join("");
						return `<div style="display: flex; gap: 1.5rem; margin: 1.5rem 0;">${columns}</div>`;
					}

					// Check list node
					if (node.type === "listitem" && node.checked !== undefined) {
						const itemContent = convertNodesToHtml(node.children || []);
						const checked = node.checked ? "checked" : "";
						return `<li style="list-style: none; margin-left: 0;"><input type="checkbox" ${checked} disabled style="margin-right: 0.5rem;" /> <span>${itemContent}</span></li>`;
					}

					// Text node
					if (node.type === "text") {
						let text = node.text || "";
						text = escapeHtml(text);

						// Apply formatting - format is a bitmask
						if (node.format) {
							if (node.format & 1) text = `<strong>${text}</strong>`; // Bold
							if (node.format & 2) text = `<em>${text}</em>`; // Italic
							if (node.format & 4) text = `<u>${text}</u>`; // Underline
							if (node.format & 8) text = `<s>${text}</s>`; // Strikethrough
							if (node.format & 16) text = `<code style="background-color: #f0f0f0; padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace;">${text}</code>`; // Inline code
						}

						// Apply text color (detail.color or node.color)
						const textColor = node.detail?.color || node.color;
						if (textColor) {
							text = `<span style="color: ${textColor};">${text}</span>`;
						}

						// Apply background color (detail.bgColor or node.bgColor)
						const bgColor = node.detail?.bgColor || node.bgColor;
						if (bgColor) {
							text = `<span style="background-color: ${bgColor}; padding: 0.2em 0.4em; border-radius: 3px;">${text}</span>`;
						}

						return text;
					}

					// Line break
					if (node.type === "linebreak") {
						return "<br />";
					}

					// Fallback for unknown nodes
					return "";
				})
				.join("");
		};

		try {
			const htmlContent = convertNodesToHtml(editorState.root.children);
			return htmlContent || "<p>No content</p>";
		} catch (error) {
			console.error("Error rendering Lexical content:", error);
			return "<p>Error rendering content</p>";
		}
	}, [content]);

	return (
		<div>
			<div dangerouslySetInnerHTML={{ __html: html }} />
		</div>
	);
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
	const map: Record<string, string> = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#039;",
	};
	return text.replace(/[&<>"']/g, (char) => map[char] || char);
}
