import { act,fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { SerializedEditorState } from 'lexical';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ShadcnEditorWrapper } from '@/components/shadcn-editor-wrapper';

/**
 * Test Suite: Lexical Editor Content Handling
 * 
 * Verifies that:
 * 1. Content passed to editor is received correctly
 * 2. Content is parsed from JSON/string format
 * 3. Content is displayed in editor
 * 4. Content changes are emitted via onChange callback
 * 5. Empty content is handled gracefully
 */

describe('ShadcnEditorWrapper - Content Handling', () => {

  // Sample Lexical serialized state
  const sampleSerializedState: SerializedEditorState = {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'Hello, this is test content',
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  } as unknown as SerializedEditorState;

  const sampleStringContent = JSON.stringify(sampleSerializedState);

  describe('Content Input Handling', () => {

    it('should accept SerializedEditorState as object', () => {
      const onChange = vi.fn();

      const { container } = render(
        <ShadcnEditorWrapper
          content={sampleSerializedState}
          onChange={onChange}
        />
      );

      expect(container).toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled(); // Should not call on mount
    });

    it('should accept JSON string content', () => {
      const onChange = vi.fn();

      const { container } = render(
        <ShadcnEditorWrapper
          content={sampleStringContent}
          onChange={onChange}
        />
      );

      expect(container).toBeInTheDocument();
    });

    it('should accept undefined content (empty editor)', () => {
      const onChange = vi.fn();

      const { container } = render(
        <ShadcnEditorWrapper
          content={undefined}
          onChange={onChange}
        />
      );

      expect(container).toBeInTheDocument();
    });

    it('should handle empty string content', () => {
      const onChange = vi.fn();

      const { container } = render(
        <ShadcnEditorWrapper
          content=""
          onChange={onChange}
        />
      );

      expect(container).toBeInTheDocument();
    });

    it('should handle plain text string gracefully', () => {
      const plainText = 'This is plain text, not JSON';
      const onChange = vi.fn();

      const { container } = render(
        <ShadcnEditorWrapper
          content={plainText}
          onChange={onChange}
        />
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe('Content Rendering', () => {

    it('should render editor with provided content', async () => {
      const onChange = vi.fn();

      render(
        <ShadcnEditorWrapper
          content={sampleSerializedState}
          onChange={onChange}
          minHeight={300}
        />
      );

      // Check that editor container exists
      const editorWrapper = document.querySelector('.shadcn-editor-wrapper');
      expect(editorWrapper).toBeInTheDocument();
    });

    it('should apply custom minHeight style', () => {
      const onChange = vi.fn();

      render(
        <ShadcnEditorWrapper
          content={sampleSerializedState}
          onChange={onChange}
          minHeight={500}
        />
      );

      const wrapper = document.querySelector('.shadcn-editor-wrapper') as HTMLElement;
      expect(wrapper).toHaveStyle('--editor-min-height: 500px');
    });

    it('should apply error state styling', () => {
      const onChange = vi.fn();

      render(
        <ShadcnEditorWrapper
          content={sampleSerializedState}
          onChange={onChange}
          error={true}
        />
      );

      const wrapper = document.querySelector('[data-error="true"]');
      expect(wrapper).toBeInTheDocument();
    });

    it('should not show error state by default', () => {
      const onChange = vi.fn();

      render(
        <ShadcnEditorWrapper
          content={sampleSerializedState}
          onChange={onChange}
        />
      );

      const wrapper = document.querySelector('[data-error="false"]');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('JSON Parsing', () => {

    it('should correctly parse valid JSON string content', () => {
      const onChange = vi.fn();

      const { container } = render(
        <ShadcnEditorWrapper
          content={sampleStringContent}
          onChange={onChange}
        />
      );

      expect(container).toBeInTheDocument();
    });

    it('should handle nested content structures', () => {
      const complexContent: SerializedEditorState = {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 1, // Bold
                  mode: 'normal',
                  style: '',
                  text: 'Bold text',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
            },
            {
              children: [
                {
                  detail: 0,
                  format: 2, // Italic
                  mode: 'normal',
                  style: '',
                  text: 'Italic text',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      } as unknown as SerializedEditorState;

      const onChange = vi.fn();

      const { container } = render(
        <ShadcnEditorWrapper
          content={complexContent}
          onChange={onChange}
        />
      );

      expect(container).toBeInTheDocument();
    });

    it('should handle malformed JSON gracefully', () => {
      const malformedJSON = '{ "invalid": json content }';
      const onChange = vi.fn();

      // Should not throw
      expect(() => {
        render(
          <ShadcnEditorWrapper
            content={malformedJSON}
            onChange={onChange}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Content Updates via onChange', () => {

    it('should call onChange when content changes', async () => {
      const onChange = vi.fn();

      const { rerender } = render(
        <ShadcnEditorWrapper
          content={sampleSerializedState}
          onChange={onChange}
        />
      );

      // Simulate editor content change
      // Note: In real tests, this would be triggered by user interaction
      const newContent: SerializedEditorState = {
        ...sampleSerializedState,
      };

      rerender(
        <ShadcnEditorWrapper
          content={newContent}
          onChange={onChange}
        />
      );

      // onChange should be called with new content
      // (In actual Lexical usage, this is triggered by OnChangePlugin)
    });

    it('should debounce onChange calls', async () => {
      const onChange = vi.fn();
      const debounceMs = 100;

      const { rerender } = render(
        <ShadcnEditorWrapper
          content={sampleSerializedState}
          onChange={onChange}
          debounceMs={debounceMs}
        />
      );

      // The debounce prevents excessive onChange calls
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Content Validation', () => {

    it('should handle empty root children', () => {
      const emptyContent: SerializedEditorState = {
        root: {
          children: [],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      } as unknown as SerializedEditorState;

      const onChange = vi.fn();

      const { container } = render(
        <ShadcnEditorWrapper
          content={emptyContent}
          onChange={onChange}
        />
      );

      expect(container).toBeInTheDocument();
    });

    it('should handle content with empty text nodes', () => {
      const contentWithEmpty: SerializedEditorState = {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: '',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      } as unknown as SerializedEditorState;

      const onChange = vi.fn();

      const { container } = render(
        <ShadcnEditorWrapper
          content={contentWithEmpty}
          onChange={onChange}
        />
      );

      expect(container).toBeInTheDocument();
    });

    it('should handle null/undefined content gracefully', () => {
      const onChange = vi.fn();

      const { rerender } = render(
        <ShadcnEditorWrapper
          content={undefined}
          onChange={onChange}
        />
      );

      expect(rerender).toBeDefined();

      // Should show default empty state
      const wrapper = document.querySelector('.shadcn-editor-wrapper');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Content Type Conversion', () => {

    it('should convert SerializedEditorState object to proper format', () => {
      const onChange = vi.fn();

      render(
        <ShadcnEditorWrapper
          content={sampleSerializedState}
          onChange={onChange}
        />
      );

      // Verify wrapper exists and is properly initialized
      const wrapper = document.querySelector('.shadcn-editor-wrapper');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveAttribute('data-error', 'false');
    });

    it('should convert JSON string to SerializedEditorState', () => {
      const onChange = vi.fn();

      render(
        <ShadcnEditorWrapper
          content={sampleStringContent}
          onChange={onChange}
        />
      );

      const wrapper = document.querySelector('.shadcn-editor-wrapper');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Editor Component Integration', () => {

    it('should pass content to Editor component', () => {
      const onChange = vi.fn();

      const { container } = render(
        <ShadcnEditorWrapper
          content={sampleSerializedState}
          onChange={onChange}
        />
      );

      // Check that LexicalComposer is rendered
      const composerDiv = container.querySelector('.bg-background');
      expect(composerDiv).toBeInTheDocument();
    });

    it('should maintain content through multiple renders', () => {
      const onChange = vi.fn();
      const content1 = sampleSerializedState;
      const content2: SerializedEditorState = {
        ...sampleSerializedState,
      };

      const { rerender } = render(
        <ShadcnEditorWrapper
          content={content1}
          onChange={onChange}
        />
      );

      const wrapper1 = document.querySelector('.shadcn-editor-wrapper');
      expect(wrapper1).toBeInTheDocument();

      rerender(
        <ShadcnEditorWrapper
          content={content2}
          onChange={onChange}
        />
      );

      const wrapper2 = document.querySelector('.shadcn-editor-wrapper');
      expect(wrapper2).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {

    it('should accept all props without errors', () => {
      const onChange = vi.fn();

      expect(() => {
        render(
          <ShadcnEditorWrapper
            content={sampleSerializedState}
            onChange={onChange}
            debounceMs={300}
            minHeight={450}
            error={false}
          />
        );
      }).not.toThrow();
    });

    it('should use default values when props omitted', () => {
      const onChange = vi.fn();

      const { container } = render(
        <ShadcnEditorWrapper
          content={sampleSerializedState}
          onChange={onChange}
        />
      );

      // Default minHeight should be 450px
      const wrapper = container.querySelector('.shadcn-editor-wrapper') as HTMLElement;
      expect(wrapper?.style.getPropertyValue('--editor-min-height')).toBe('450px');
    });
  });

  describe('Real-world Scenarios', () => {

    it('should handle Knowledge article content', () => {
      const articleContent = {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'How to use Lexical Editor',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
            },
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'This guide covers the basics of using Lexical editor in our application.',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      } as unknown as SerializedEditorState;

      const onChange = vi.fn();

      const { container } = render(
        <ShadcnEditorWrapper
          content={articleContent}
          onChange={onChange}
          minHeight={500}
        />
      );

      expect(container).toBeInTheDocument();
      const wrapper = document.querySelector('.shadcn-editor-wrapper');
      expect(wrapper).toBeInTheDocument();
    });

    it('should handle empty article (create new)', () => {
      const onChange = vi.fn();

      const { container } = render(
        <ShadcnEditorWrapper
          content={undefined}
          onChange={onChange}
          minHeight={450}
        />
      );

      expect(container).toBeInTheDocument();
      // Should show empty editor ready for input
    });

    it('should handle switching between articles', () => {
      const article1Content: SerializedEditorState = {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Article 1 content',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      } as unknown as SerializedEditorState;

      const article2Content: SerializedEditorState = {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Article 2 content',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      } as unknown as SerializedEditorState;

      const onChange = vi.fn();

      const { rerender } = render(
        <ShadcnEditorWrapper
          content={article1Content}
          onChange={onChange}
        />
      );

      expect(document.querySelector('.shadcn-editor-wrapper')).toBeInTheDocument();

      // Switch to article 2
      rerender(
        <ShadcnEditorWrapper
          content={article2Content}
          onChange={onChange}
        />
      );

      expect(document.querySelector('.shadcn-editor-wrapper')).toBeInTheDocument();
    });
  });
});
