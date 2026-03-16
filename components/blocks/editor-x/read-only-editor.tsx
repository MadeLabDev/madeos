"use client";

import { InitialConfigType, LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { SerializedEditorState } from "lexical";

import { editorTheme } from "@/components/editor/themes/editor-theme";

import { nodes } from "./nodes";

const editorConfig: InitialConfigType = {
	namespace: "ReadOnlyEditor",
	theme: editorTheme,
	nodes,
	onError: (error: Error) => {
		console.error(error);
	},
};

/**
 * Clean up empty paragraphs and paragraphs containing only <br> tags
 */
function cleanEmptyParagraphs(editorState: SerializedEditorState): SerializedEditorState {
	const cleanNode = (node: any): any => {
		// If it's a paragraph node
		if (node.type === "paragraph") {
			// Check if paragraph has no children or only empty/whitespace text
			if (!node.children || node.children.length === 0) {
				return null; // Remove empty paragraph
			}

			// Check if paragraph contains only line breaks or empty text nodes
			const hasOnlyEmptyContent = node.children.every((child: any) => {
				if (child.type === "linebreak") {
					return true; // <br> tag
				}
				if (child.type === "text") {
					return !child.text || child.text.trim() === ""; // Empty or whitespace-only text
				}
				return false; // Other node types are not considered empty
			});

			if (hasOnlyEmptyContent) {
				return null; // Remove paragraph with only <br> or empty text
			}
		}

		// Recursively clean children
		if (node.children && Array.isArray(node.children)) {
			node.children = node.children.map(cleanNode).filter((child: any) => child !== null);
		}

		return node;
	};

	const cleanedState = { ...editorState };

	if (cleanedState.root && cleanedState.root.children) {
		cleanedState.root.children = cleanedState.root.children.map(cleanNode).filter((child: any) => child !== null);
	}

	return cleanedState;
}

export function ReadOnlyEditor({ editorSerializedState }: { editorSerializedState?: SerializedEditorState | string | null }) {
	// Convert SerializedEditorState to string for initialConfig
	let initialEditorState: string | undefined;
	let parsedState: SerializedEditorState | undefined;

	if (editorSerializedState) {
		if (typeof editorSerializedState === "object") {
			parsedState = editorSerializedState;
		} else {
			try {
				parsedState = JSON.parse(editorSerializedState);
			} catch {
				// If parsing fails, use as-is
				initialEditorState = editorSerializedState;
			}
		}

		if (parsedState) {
			// Clean up empty paragraphs before rendering
			const cleanedState = cleanEmptyParagraphs(parsedState);
			initialEditorState = JSON.stringify(cleanedState);
		}
	}

	return (
		<div>
			<LexicalComposer
				initialConfig={{
					...editorConfig,
					...(initialEditorState ? { editorState: initialEditorState } : {}),
					// Disable edit mode
					editable: false,
				}}>
				<RichTextPlugin
					contentEditable={
						<ContentEditable
							className="overflow-auto px-0 py-0 text-base outline-none"
							style={{
								userSelect: "text",
								WebkitUserSelect: "text",
							}}
						/>
					}
					placeholder={<div className="text-muted-foreground pointer-events-none">No content</div>}
					ErrorBoundary={LexicalErrorBoundary}
				/>
			</LexicalComposer>
		</div>
	);
}
