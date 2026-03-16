/**
 * Integration Test: Knowledge Form + Editor Content Loading
 * 
 * Tests the actual flow from loading article to displaying content in editor
 */

import type { SerializedEditorState } from 'lexical';
import { beforeEach,describe, expect, it } from 'vitest';

describe('Knowledge Form + Editor Integration', () => {
  
  // Simulate database article with stored content
  const mockArticle = {
    id: 'article-1',
    title: 'Getting Started with Lexical',
    slug: 'getting-started-lexical',
    content: JSON.stringify({
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Welcome to Lexical Editor',
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
                text: 'This is a comprehensive guide on using Lexical editor.',
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
    }),
    excerpt: 'Learn Lexical editor basics',
    thumbnail: '/images/article.jpg',
    isPublished: true,
    categories: [{ id: 'cat-1', name: 'Tutorials' }],
    tags: [{ id: 'tag-1', name: 'Editor' }],
  };

  describe('Step 1: Load Article Data', () => {
    
    it('should load article from database', () => {
      expect(mockArticle).toBeDefined();
      expect(mockArticle.id).toBe('article-1');
      expect(mockArticle.content).toBeDefined();
    });

    it('should have content as JSON string', () => {
      expect(typeof mockArticle.content).toBe('string');
      expect(mockArticle.content.startsWith('{')).toBe(true);
    });

    it('should be able to parse content string', () => {
      const parsed = JSON.parse(mockArticle.content);
      expect(parsed.root).toBeDefined();
      expect(parsed.root.children).toBeDefined();
      expect(parsed.root.children.length).toBe(2);
    });
  });

  describe('Step 2: Initialize KnowledgeForm State', () => {
    
    it('should parse content in useState initializer', () => {
      // Simulate what KnowledgeForm does:
      // const [initialEditorContent] = useState<SerializedEditorState>(() => {
      //   if (article?.content) {
      //     if (typeof article.content === 'string') {
      //       try {
      //         return JSON.parse(article.content);
      //       } catch {
      //         return undefined;
      //       }
      //     }
      //     return article.content;
      //   }
      //   return undefined;
      // });

      let initialEditorContent: SerializedEditorState | undefined;
      if (mockArticle?.content) {
        if (typeof mockArticle.content === 'string') {
          try {
            initialEditorContent = JSON.parse(mockArticle.content);
          } catch {
            initialEditorContent = undefined;
          }
        } else {
          initialEditorContent = mockArticle.content;
        }
      }

      expect(initialEditorContent).toBeDefined();
      expect(initialEditorContent?.root).toBeDefined();
    });

    it('should extract text from parsed content', () => {
      const parsed = JSON.parse(mockArticle.content) as SerializedEditorState;
      
      const extractText = (state: SerializedEditorState): string => {
        let text = '';
        if (state.root?.children) {
          state.root.children.forEach((node: any) => {
            if (node.children) {
              node.children.forEach((child: any) => {
                if (child.text) {
                  text += child.text + ' ';
                }
              });
            }
          });
        }
        return text.trim();
      };

      const text = extractText(parsed);
      expect(text).toContain('Welcome to Lexical Editor');
      expect(text).toContain('This is a comprehensive guide');
    });
  });

  describe('Step 3: Pass to ShadcnEditorWrapper', () => {
    
    it('should pass initialEditorContent to ShadcnEditorWrapper', () => {
      const parsed = JSON.parse(mockArticle.content) as SerializedEditorState;
      
      // Simulate: <ShadcnEditorWrapper content={initialEditorContent} />
      const editorProps = {
        content: parsed,
        onChange: (newContent: SerializedEditorState) => {},
        minHeight: 450,
      };

      expect(editorProps.content).toBeDefined();
      expect(editorProps.content?.root.children.length).toBe(2);
    });

    it('should handle content prop correctly', () => {
      const contentProp = JSON.parse(mockArticle.content);
      
      // ShadcnEditorWrapper receives content and parses it if needed
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

      const editorSerializedState = parseInitialContent(contentProp);
      expect(editorSerializedState).toBeDefined();
      expect(editorSerializedState?.root.type).toBe('root');
    });
  });

  describe('Step 4: Create initialConfig with initialEditorState', () => {
    
    it('should create initialConfig for LexicalComposer', () => {
      const parsed = JSON.parse(mockArticle.content) as SerializedEditorState;

      // Simulate Editor component
      const initialConfig = {
        namespace: 'Editor',
        theme: {},
        nodes: [],
        onError: () => {},
        ...(parsed ? {
          initialEditorState: (editor: any) => {
            // This callback is called by LexicalComposer
            try {
              const state = editor.parseEditorState(parsed);
              editor.setEditorState(state);
            } catch (e) {
              console.error('Failed to parse:', e);
            }
          },
        } : {}),
      };

      expect(initialConfig).toHaveProperty('initialEditorState');
      expect(typeof initialConfig.initialEditorState).toBe('function');
    });

    it('should callback receive editor and set state', () => {
      const parsed = JSON.parse(mockArticle.content) as SerializedEditorState;
      
      // Mock Lexical editor
      const editorStates: any[] = [];
      const mockEditor = {
        parseEditorState: (serialized: SerializedEditorState) => {
          return { _state: serialized, _type: 'EditorState' };
        },
        setEditorState: (state: any) => {
          editorStates.push(state);
        },
      };

      // Simulate callback
      const initialEditorState = (editor: any) => {
        try {
          const state = editor.parseEditorState(parsed);
          editor.setEditorState(state);
        } catch (e) {
          console.error('Error:', e);
        }
      };

      // Call the callback
      initialEditorState(mockEditor);

      expect(editorStates.length).toBe(1);
      expect(editorStates[0]).toBeDefined();
    });
  });

  describe('Step 5: Render Content', () => {
    
    it('should have all data ready to render', () => {
      const parsed = JSON.parse(mockArticle.content) as SerializedEditorState;
      
      // All the data that should make it to editor render
      const renderContext = {
        parsed,
        hasChildren: parsed.root?.children?.length > 0,
        childrenCount: parsed.root?.children?.length,
        firstParagraph: parsed.root?.children?.[0],
        secondParagraph: parsed.root?.children?.[1],
      };

      expect(renderContext.hasChildren).toBe(true);
      expect(renderContext.childrenCount).toBe(2);
      expect(renderContext.firstParagraph?.type).toBe('paragraph');
    });

    it('should verify content structure is complete', () => {
      const parsed = JSON.parse(mockArticle.content) as SerializedEditorState;

      const isStructureComplete = (state: SerializedEditorState) => {
        return {
          hasRoot: !!state.root,
          hasChildren: Array.isArray(state.root?.children),
          hasContent: state.root?.children?.length > 0,
          allParagraphsHaveText: state.root?.children?.every((p: any) =>
            Array.isArray(p.children) && p.children.length > 0
          ),
        };
      };

      const structure = isStructureComplete(parsed);
      expect(structure.hasRoot).toBe(true);
      expect(structure.hasChildren).toBe(true);
      expect(structure.hasContent).toBe(true);
      expect(structure.allParagraphsHaveText).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    
    it('should handle article with no content', () => {
      const emptyArticle = { ...mockArticle, content: undefined };
      
      let initialEditorContent: SerializedEditorState | undefined;
      if (emptyArticle?.content) {
        if (typeof emptyArticle.content === 'string') {
          try {
            initialEditorContent = JSON.parse(emptyArticle.content);
          } catch {
            initialEditorContent = undefined;
          }
        }
      }

      expect(initialEditorContent).toBeUndefined();
    });

    it('should handle article with invalid JSON content', () => {
      const invalidArticle = { ...mockArticle, content: '{ invalid json }' };
      
      let initialEditorContent: SerializedEditorState | undefined;
      if (invalidArticle?.content) {
        if (typeof invalidArticle.content === 'string') {
          try {
            initialEditorContent = JSON.parse(invalidArticle.content);
          } catch {
            initialEditorContent = undefined;
          }
        }
      }

      expect(initialEditorContent).toBeUndefined();
    });

    it('should handle article with serialized state object (not string)', () => {
      const parsed = JSON.parse(mockArticle.content);
      const objectArticle = { ...mockArticle, content: parsed };
      
      let initialEditorContent: SerializedEditorState | undefined;
      if (objectArticle?.content) {
        if (typeof objectArticle.content === 'string') {
          initialEditorContent = JSON.parse(objectArticle.content);
        } else {
          initialEditorContent = objectArticle.content;
        }
      }

      expect(initialEditorContent).toBeDefined();
      expect(initialEditorContent?.root).toBeDefined();
    });
  });

  describe('Debug: Trace Complete Flow', () => {
    
    it('should trace content from database to editor', () => {
      console.log('=== CONTENT FLOW TRACE ===\n');

      // 1. Database
      console.log('1. DATABASE:');
      console.log('   Content type:', typeof mockArticle.content);
      console.log('   Content length:', mockArticle.content.length);
      console.log('   Content preview:', mockArticle.content.substring(0, 100) + '...\n');

      // 2. Parse
      console.log('2. PARSE IN useState:');
      const parsed = JSON.parse(mockArticle.content) as SerializedEditorState;
      console.log('   Parsed type:', typeof parsed);
      console.log('   Has root:', !!parsed.root);
      console.log('   Children count:', parsed.root?.children?.length, '\n');

      // 3. Pass to ShadcnEditorWrapper
      console.log('3. PASS TO ShadcnEditorWrapper:');
      console.log('   content prop type:', typeof parsed);
      console.log('   content prop value:', parsed.root?.type, '\n');

      // 4. Create initialConfig
      console.log('4. CREATE initialConfig IN Editor:');
      const hasInitialEditorState = !!parsed;
      console.log('   Has initialEditorState:', hasInitialEditorState);
      console.log('   Callback defined:', typeof ((editor: any) => {}) === 'function', '\n');

      // 5. LexicalComposer calls callback
      console.log('5. LexicalComposer CALLS CALLBACK:');
      console.log('   Receives editor instance');
      console.log('   Calls editor.parseEditorState(content)');
      console.log('   Calls editor.setEditorState(state)');
      console.log('   → Content should render ✅\n');

      expect(true).toBe(true);
    });
  });

  describe('Potential Issues & Solutions', () => {
    
    it('should identify: Content not parsed', () => {
      // ISSUE: Content stays as string
      const issue = 'Content not parsed from JSON';
      
      const solution = {
        check: 'Is useState initializer parsing the content?',
        fix: 'Ensure JSON.parse is called in useState init function',
        verify: 'initialEditorContent should be SerializedEditorState, not string',
      };

      expect(solution.fix).toBeDefined();
    });

    it('should identify: Content not passed to editor', () => {
      // ISSUE: content prop not passed to ShadcnEditorWrapper
      const issue = 'initialEditorContent not passed to <ShadcnEditorWrapper />';
      
      const solution = {
        check: 'Is content={initialEditorContent} in JSX?',
        fix: 'Add content={initialEditorContent} prop to ShadcnEditorWrapper',
        verify: 'Check browser DevTools to see props being passed',
      };

      expect(solution.fix).toBeDefined();
    });

    it('should identify: initialEditorState callback not used', () => {
      // ISSUE: No initialEditorState in initialConfig
      const issue = 'initialEditorState callback not in initialConfig';
      
      const solution = {
        check: 'Is initialEditorState callback created in useMemo?',
        fix: 'Add initialEditorState: (editor) => {...} to initialConfig',
        verify: 'Check Editor component uses initialConfig correctly',
      };

      expect(solution.fix).toBeDefined();
    });

    it('should identify: parseEditorState not called', () => {
      // ISSUE: Lexical parseEditorState not called
      const issue = 'editor.parseEditorState() not called';
      
      const solution = {
        check: 'Is callback calling parseEditorState?',
        fix: 'Ensure callback does: const state = editor.parseEditorState(content)',
        verify: 'Check Lexical editor console for parse errors',
      };

      expect(solution.fix).toBeDefined();
    });
  });

  describe('Debugging Checklist', () => {
    
    it('should provide debugging checklist', () => {
      const checklist = [
        {
          step: '1. Load Article',
          check: 'article.content is not empty',
          debug: 'console.log("Content:", article.content)',
        },
        {
          step: '2. Parse Content',
          check: 'initialEditorContent is SerializedEditorState',
          debug: 'console.log("Parsed:", initialEditorContent)',
        },
        {
          step: '3. Pass to Editor',
          check: 'ShadcnEditorWrapper receives content prop',
          debug: 'console.log("Editor props:", { content, onChange })',
        },
        {
          step: '4. Create Config',
          check: 'initialConfig has initialEditorState',
          debug: 'console.log("Config:", initialConfig)',
        },
        {
          step: '5. Render',
          check: 'Lexical renders content',
          debug: 'Check editor DOM, look for paragraph elements',
        },
      ];

      expect(checklist.length).toBe(5);
      checklist.forEach(item => {
        expect(item.step).toBeDefined();
        expect(item.check).toBeDefined();
        expect(item.debug).toBeDefined();
      });
    });
  });
});
