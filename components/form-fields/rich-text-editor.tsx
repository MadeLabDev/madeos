"use client";

import type { SerializedEditorState } from "lexical";

import { ShadcnEditorWrapper } from "@/components/shadcn-editor-wrapper";

interface SimpleTextEditorProps {
	/**
	 * Initial content - JSON string or object
	 */
	value?: string | Record<string, any>;
	/**
	 * Callback when content changes - emits JSON string
	 */
	onChange: (value: string) => void;
	/**
	 * Placeholder text
	 */
	placeholder?: string;
	/**
	 * Minimum height of editor
	 */
	minHeight?: string;
	/**
	 * Whether editor is disabled
	 */
	disabled?: boolean;
	/**
	 * Show error state
	 */
	error?: boolean;
}

/**
 * SimpleTextEditor - Tiptap-based rich text editor
 * Drop-in replacement for RichTextEditor (Lexical)
 *
 * Usage:
 * <SimpleTextEditor
 *   value={value}
 *   onChange={onChange}
 *   minHeight="300px"
 * />
 */
export function RichTextEditor({
	value = "",
	onChange,
	// placeholder = 'Enter rich text...',
	minHeight = "300px",
	// disabled = false,
	error = false,
}: SimpleTextEditorProps) {
	const handleContentChange = (serialized: SerializedEditorState) => {
		// Emit as JSON string (compatible with RichTextEditor interface)
		onChange(JSON.stringify(serialized));
	};

	return (
		<ShadcnEditorWrapper
			content={value as string | SerializedEditorState | undefined}
			onChange={handleContentChange}
			minHeight={parseInt(minHeight.replace("px", ""))}
			error={error}
		/>
	);
}
