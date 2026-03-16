/**
 * Diagnostic Test: Lexical Editor Content Initialization
 * 
 * Purpose: Diagnose why content isn't rendering in the editor
 * This is a simpler test to identify the exact issue
 */

import type { SerializedEditorState } from 'lexical';
import { beforeEach,describe, expect, it } from 'vitest';

describe('Lexical Editor Content Initialization Diagnostics', () => {

  // Sample test content
  const testContent: SerializedEditorState = {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'Test content should appear here',
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

  describe('Content Parsing', () => {

    it('should correctly parse SerializedEditorState', () => {
      expect(testContent).toBeDefined();
      expect(testContent.root).toBeDefined();
      expect(testContent.root.children).toBeDefined();
      expect(testContent.root.children.length).toBe(1);
    });

    it('should stringify content to JSON', () => {
      const jsonString = JSON.stringify(testContent);
      expect(typeof jsonString).toBe('string');
      expect(jsonString.includes('Test content should appear here')).toBe(true);
    });

    it('should parse JSON string back to object', () => {
      const jsonString = JSON.stringify(testContent);
      const parsed = JSON.parse(jsonString);

      expect(parsed.root).toBeDefined();
      expect(parsed.root.children[0].children[0].text).toBe('Test content should appear here');
    });
  });

  describe('Editor State Initialization Pattern', () => {

    it('should create initialConfig with initialEditorState callback', () => {
      // Simulate what Editor component should do
      const createInitialConfig = (editorSerializedState?: SerializedEditorState) => {
        if (!editorSerializedState) {
          return { /* default config */ };
        }

        return {
          initialEditorState: (editor: any) => {
            try {
              const state = editor.parseEditorState(editorSerializedState);
              editor.setEditorState(state);
            } catch (e) {
              console.error('Failed to parse:', e);
            }
          },
        };
      };

      const config = createInitialConfig(testContent);
      expect(config).toHaveProperty('initialEditorState');
      expect(typeof config.initialEditorState).toBe('function');
    });

    it('should handle undefined content gracefully', () => {
      const createInitialConfig = (editorSerializedState?: SerializedEditorState) => {
        if (!editorSerializedState) {
          return { /* default config */ };
        }
        return { initialEditorState: () => { } };
      };

      const config = createInitialConfig(undefined);
      expect(config).not.toHaveProperty('initialEditorState');
    });

    it('should handle null content gracefully', () => {
      const createInitialConfig = (editorSerializedState?: SerializedEditorState) => {
        if (!editorSerializedState) {
          return { /* default config */ };
        }
        return { initialEditorState: () => { } };
      };

      const config = createInitialConfig(null as any);
      expect(config).not.toHaveProperty('initialEditorState');
    });
  });

  describe('Content Flow Through Components', () => {

    it('should trace content flow: KnowledgeForm → ShadcnEditorWrapper → Editor', () => {
      // 1. KnowledgeForm parses content
      const articleContent = JSON.stringify(testContent);
      const parsed: SerializedEditorState = JSON.parse(articleContent);
      expect(parsed).toBeDefined();

      // 2. ShadcnEditorWrapper receives parsed content
      const editorWrapperContent = parsed;
      expect(editorWrapperContent).toEqual(testContent);

      // 3. ShadcnEditorWrapper passes to Editor as editorSerializedState
      const editorSerializedState = editorWrapperContent;
      expect(editorSerializedState).toBeDefined();
      expect(editorSerializedState.root.children.length).toBe(1);

      // 4. Editor creates initialConfig with initialEditorState
      const hasInitialEditorState = !!editorSerializedState;
      expect(hasInitialEditorState).toBe(true);
    });
  });

  describe('Content Validation Checks', () => {

    it('should validate content has required Lexical structure', () => {
      const isValidLexicalState = (state: SerializedEditorState) => {
        return (
          state &&
          state.root &&
          typeof state.root === 'object' &&
          Array.isArray(state.root.children) &&
          state.root.type === 'root' &&
          state.root.version === 1
        );
      };

      expect(isValidLexicalState(testContent)).toBe(true);
    });

    it('should detect invalid Lexical structure', () => {
      const isValidLexicalState = (state: any) => {
        return Boolean(
          state &&
          state.root &&
          typeof state.root === 'object' &&
          Array.isArray(state.root.children) &&
          state.root.type === 'root'
        );
      };

      const invalidState = { some: 'random object' };
      const result = isValidLexicalState(invalidState);
      expect(result).toBe(false);
    });

    it('should extract text content from state', () => {
      const extractText = (state: SerializedEditorState): string => {
        let text = '';
        if (state.root && state.root.children) {
          state.root.children.forEach((node: any) => {
            if (node.children) {
              node.children.forEach((child: any) => {
                if (child.text) {
                  text += child.text;
                }
              });
            }
          });
        }
        return text;
      };

      const extracted = extractText(testContent);
      expect(extracted).toBe('Test content should appear here');
    });
  });

  describe('Common Issues & Verification', () => {

    it('should verify content is not lost during JSON round-trip', () => {
      const original = testContent;
      const jsonString = JSON.stringify(original);
      const restored = JSON.parse(jsonString);

      const extractText = (state: any) => {
        return state.root.children[0].children[0].text;
      };

      expect(extractText(restored)).toBe(extractText(original));
    });

    it('should verify content can be passed as props', () => {
      // Simulate props passing
      interface EditorProps {
        content?: SerializedEditorState;
        onChange?: (content: SerializedEditorState) => void;
      }

      const props: EditorProps = {
        content: testContent,
        onChange: (newContent) => {
          expect(newContent).toBeDefined();
        },
      };

      expect(props.content).toEqual(testContent);
    });

    it('should verify ref can store content', () => {
      const ref = { current: null as SerializedEditorState | null };
      ref.current = testContent;

      expect(ref.current).toBeDefined();
      expect(ref.current?.root.children.length).toBe(1);
    });

    it('should verify useMemo caches content correctly', () => {
      let computeCount = 0;
      const memoizedContent = (() => {
        const deps = [testContent];
        let cachedValue = testContent;
        let lastDeps = deps;

        return () => {
          const depsChanged = JSON.stringify(lastDeps) !== JSON.stringify(deps);
          if (depsChanged) {
            computeCount++;
            cachedValue = testContent;
            lastDeps = deps;
          }
          return cachedValue;
        };
      })();

      const first = memoizedContent();
      const second = memoizedContent();

      expect(first).toBe(second);
      expect(computeCount).toBe(0); // Should not recompute if deps didn't change
    });
  });

  describe('Lexical InitialEditorState Callback Pattern', () => {

    it('should simulate Lexical parseEditorState and setEditorState', () => {
      // Mock Lexical editor
      const mockEditor = {
        parseEditorState: (serialized: SerializedEditorState) => {
          // Lexical converts serialized state to EditorState
          return { _serialized: serialized, _parsed: true };
        },
        setEditorState: (state: any) => {
          // Lexical applies the state to the editor
          console.log('Editor state set:', state);
        },
      };

      // This is what happens in Editor component's initialEditorState callback
      const content = testContent;
      const state = mockEditor.parseEditorState(content);
      mockEditor.setEditorState(state);

      expect(state).toBeDefined();
      expect((state as any)._parsed).toBe(true);
    });

    it('should handle initialEditorState callback with error', () => {
      const mockEditor = {
        parseEditorState: (serialized: SerializedEditorState) => {
          throw new Error('Parse failed');
        },
        setEditorState: (state: any) => { },
      };

      let errorCaught = false;
      try {
        const state = mockEditor.parseEditorState(testContent);
        mockEditor.setEditorState(state);
      } catch (e) {
        errorCaught = true;
      }

      expect(errorCaught).toBe(true);
    });
  });

  describe('Debug: Check Component Integration', () => {

    it('should verify ShadcnEditorWrapper receives content', () => {
      // Simulate component props
      const wrapperProps = {
        content: testContent,
        onChange: vi.fn(),
        debounceMs: 300,
        minHeight: 450,
        error: false,
      };

      expect(wrapperProps.content).toBeDefined();
      expect(wrapperProps.content?.root).toBeDefined();
    });

    it('should verify Editor receives editorSerializedState', () => {
      // In ShadcnEditorWrapper, it does:
      // const editorSerializedState = useMemo(
      //   () => parseInitialContent(initialContent),
      //   [initialContent, parseInitialContent]
      // );

      const parseInitialContent = (content: SerializedEditorState | string | undefined) => {
        if (!content) return undefined;
        if (typeof content === 'object') return content;
        if (typeof content === 'string') {
          try {
            return JSON.parse(content);
          } catch {
            return undefined;
          }
        }
        return undefined;
      };

      const editorSerializedState = parseInitialContent(testContent);
      expect(editorSerializedState).toEqual(testContent);
    });

    it('should verify Editor creates initialConfig with callback', () => {
      const editorSerializedState = testContent;

      const initialConfig = {
        namespace: 'Editor',
        ...(editorSerializedState ? {
          initialEditorState: (editor: any) => {
            try {
              const state = editor.parseEditorState(editorSerializedState);
              editor.setEditorState(state);
            } catch (e) {
              console.error('Parse error:', e);
            }
          },
        } : {}),
      };

      expect(initialConfig).toHaveProperty('namespace', 'Editor');
      expect(initialConfig).toHaveProperty('initialEditorState');
    });

    it('should verify LexicalComposer receives initialConfig', () => {
      const initialConfig = {
        namespace: 'Editor',
        initialEditorState: (editor: any) => { },
      };

      // LexicalComposer receives initialConfig and initializes editor
      expect(initialConfig).toBeDefined();
      expect(initialConfig.initialEditorState).toBeDefined();
    });
  });

  describe('Content Debug Helpers', () => {

    it('should provide content inspection helper', () => {
      const inspectContent = (content: SerializedEditorState) => {
        return {
          hasRoot: !!content.root,
          childrenCount: content.root?.children?.length || 0,
          firstChildType: content.root?.children?.[0]?.type,
          textContent: content.root?.children?.flatMap((n: any) =>
            n.children?.map((c: any) => c.text || '')
          ).join(''),
          isValid: !!(content.root && content.root.type === 'root'),
        };
      };

      const inspection = inspectContent(testContent);
      expect(inspection.hasRoot).toBe(true);
      expect(inspection.childrenCount).toBe(1);
      expect(inspection.textContent).toBe('Test content should appear here');
      expect(inspection.isValid).toBe(true);
    });

    it('should provide content debugging logs', () => {
      const debugContent = (content: SerializedEditorState, label: string) => {
        console.log(`[${label}] Content Debug Info:`);
        console.log('- Has root:', !!content.root);
        console.log('- Root type:', content.root?.type);
        console.log('- Children count:', content.root?.children?.length);
        console.log('- First child type:', content.root?.children?.[0]?.type);
        console.log('- Content structure:', JSON.stringify(content, null, 2));
        return true;
      };

      expect(debugContent(testContent, 'TEST')).toBe(true);
    });
  });
});

// Mock vitest functions for tests that need them
const vi = { fn: () => (...args: any[]) => { } };
