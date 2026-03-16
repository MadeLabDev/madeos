"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

import type { SerializedEditorState } from "lexical";

import { Editor } from "@/components/blocks/editor-x/editor";

/**
 * Shadcn Editor Wrapper Component
 *
 * Provides a simplified interface for using Shadcn Editor with the same API
 * as SimpleEditorWrapper to replace Tiptap Editor seamlessly.
 *
 * @example
 * ```tsx
 * const [content, setContent] = useState<SerializedEditorState>();
 *
 * return (
 *   <ShadcnEditorWrapper
 *     content={content}
 *     onChange={setContent}
 *     minHeight={450}
 *   />
 * );
 * ```
 */

interface ShadcnEditorWrapperProps {
	/**
	 * Initial content as SerializedEditorState or JSON string
	 * If string, it will be parsed as JSON
	 */
	content?: SerializedEditorState | string;

	/**
	 * Callback when content changes
	 * Emits SerializedEditorState format (Lexical document structure)
	 * This callback will be debounced to prevent excessive updates
	 */
	onChange?: (content: SerializedEditorState) => void;

	/**
	 * Debounce delay in ms for onChange callback
	 * @default 300
	 */
	debounceMs?: number;

	/**
	 * Minimum height of editor (in pixels)
	 */
	minHeight?: number;

	/**
	 * Whether to show error state
	 */
	error?: boolean;
}

/**
 * Debounce utility function
 */
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout | null = null;

	return function debounced(...args: Parameters<T>) {
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(() => {
			func(...args);
		}, wait);
	};
}

export function ShadcnEditorWrapper({ content: initialContent, onChange, debounceMs = 300, minHeight = 450, error = false }: ShadcnEditorWrapperProps) {
	const onChangeRef = useRef(onChange);

	// Update the ref whenever onChange changes
	useEffect(() => {
		onChangeRef.current = onChange;
	}, [onChange]);

	/**
	 * Parse initial content - handles both JSON and SerializedEditorState
	 */
	const parseInitialContent = useCallback((content: SerializedEditorState | string | undefined): SerializedEditorState => {
		// Default empty content structure
		const defaultContent = {
			root: {
				children: [
					{
						children: [],
						direction: "ltr",
						format: "",
						indent: 0,
						type: "paragraph",
						version: 1,
					},
				],
				direction: "ltr",
				format: "",
				indent: 0,
				type: "root",
				version: 1,
			},
		} as unknown as SerializedEditorState;

		if (!content) {
			return defaultContent;
		}

		// If it's already an object, validate it has content
		if (typeof content === "object" && content !== null) {
			// Ensure it has at least one child to prevent Lexical empty state error
			if (content.root?.children && content.root.children.length > 0) {
				return content;
			}
			// If empty, use default content
			return defaultContent;
		}

		// If it's a string, try to parse as JSON
		if (typeof content === "string") {
			try {
				const parsed = JSON.parse(content);
				return parsed;
			} catch {
				// If parsing fails, treat as plain text
				return {
					root: {
						children: [
							{
								children: [
									{
										detail: 0,
										format: 0,
										mode: "normal",
										style: "",
										text: content,
										type: "text",
										version: 1,
									},
								],
								direction: "ltr",
								format: "",
								indent: 0,
								type: "paragraph",
								version: 1,
							},
						],
						direction: "ltr",
						format: "",
						indent: 0,
						type: "root",
						version: 1,
					},
				} as unknown as SerializedEditorState;
			}
		}

		return defaultContent;
	}, []);

	/**
	 * Create debounced onChange callback
	 */
	const debouncedOnChange = useCallback(
		(content: SerializedEditorState) => {
			debounce(() => {
				onChangeRef.current?.(content);
			}, debounceMs)();
		},
		[debounceMs],
	);

	const editorSerializedState = useMemo(() => parseInitialContent(initialContent), [initialContent, parseInitialContent]);

	/**
	 * Wrapper styles to match SimpleEditor appearance
	 */
	const wrapperStyle = useMemo(
		() =>
			({
				"--editor-min-height": `${minHeight}px`,
				"--editor-error": error ? "1" : "0",
			}) as React.CSSProperties & Record<string, any>,
		[minHeight, error],
	);

	return (
		<div
			className="shadcn-editor-wrapper"
			style={wrapperStyle}
			data-error={error}>
			<style>{`
        .shadcn-editor-wrapper {
          --editor-min-height: ${minHeight}px;
          --editor-error: ${error ? "1" : "0"};
        }
        
        .shadcn-editor-wrapper .bg-background {
          ${error ? "border-color: rgb(239, 68, 68);" : ""}
        }
      `}</style>

			<Editor
				editorSerializedState={editorSerializedState}
				onSerializedChange={(serialized) => {
					debouncedOnChange(serialized);
				}}
			/>
		</div>
	);
}
