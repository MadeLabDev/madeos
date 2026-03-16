import { render } from '@testing-library/react';
import { describe, expect,it } from 'vitest';

import { LexicalContentRenderer } from '@/components/knowledge/lexical-content-renderer';

describe('LexicalContentRenderer', () => {
  describe('Text Formatting', () => {
    it('should render bold text', () => {
      const content = {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'bold text',
                  format: 1, // Bold
                },
              ],
            },
          ],
          direction: null,
          format: '',
          indent: 0,
        },
      };

      const { container } = render(<LexicalContentRenderer content={content} />);
      expect(container.innerHTML).toContain('<strong>bold text</strong>');
    });

    it('should render italic text', () => {
      const content = {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'italic text',
                  format: 2, // Italic
                },
              ],
            },
          ],
          direction: null,
          format: '',
          indent: 0,
        },
      };

      const { container } = render(<LexicalContentRenderer content={content} />);
      expect(container.innerHTML).toContain('<em>italic text</em>');
    });

    it('should render code text with styling', () => {
      const content = {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'inline code',
                  format: 16, // Inline code
                },
              ],
            },
          ],
          direction: null,
          format: '',
          indent: 0,
        },
      };

      const { container } = render(<LexicalContentRenderer content={content} />);
      expect(container.innerHTML).toContain('inline code');
      expect(container.innerHTML).toContain('<code');
      expect(container.innerHTML).toContain('background-color: #f0f0f0');
      expect(container.innerHTML).toContain('font-family: monospace');
    });
  });

  describe('Block Elements', () => {
    it('should render headings', () => {
      const content = {
        root: {
          children: [
            {
              type: 'heading',
              tag: 'h1',
              children: [
                {
                  type: 'text',
                  text: 'Main Title',
                },
              ],
            },
          ],
          direction: null,
          format: '',
          indent: 0,
        },
      };

      const { container } = render(<LexicalContentRenderer content={content} />);
      expect(container.innerHTML).toContain('<h1>Main Title</h1>');
    });

    it('should render blockquote', () => {
      const content = {
        root: {
          children: [
            {
              type: 'quote',
              children: [
                {
                  type: 'text',
                  text: 'Important quote',
                },
              ],
            },
          ],
          direction: null,
          format: '',
          indent: 0,
        },
      };

      const { container } = render(<LexicalContentRenderer content={content} />);
      expect(container.innerHTML).toContain('<blockquote>Important quote</blockquote>');
    });

    it('should render code block with language', () => {
      const content = {
        root: {
          children: [
            {
              type: 'code',
              language: 'javascript',
              children: [
                {
                  type: 'text',
                  text: 'const x = 10;',
                },
              ],
            },
          ],
          direction: null,
          format: '',
          indent: 0,
        },
      };

      const { container } = render(<LexicalContentRenderer content={content} />);
      expect(container.innerHTML).toContain('language-javascript');
      expect(container.innerHTML).toContain('const x = 10;');
    });
  });

  describe('Lists', () => {
    it('should render bullet list', () => {
      const content = {
        root: {
          children: [
            {
              type: 'list',
              listType: 'bullet',
              children: [
                {
                  type: 'listitem',
                  children: [
                    {
                      type: 'text',
                      text: 'Item 1',
                    },
                  ],
                },
                {
                  type: 'listitem',
                  children: [
                    {
                      type: 'text',
                      text: 'Item 2',
                    },
                  ],
                },
              ],
            },
          ],
          direction: null,
          format: '',
          indent: 0,
        },
      };

      const { container } = render(<LexicalContentRenderer content={content} />);
      expect(container.innerHTML).toContain('<ul>');
      expect(container.innerHTML).toContain('<li>Item 1</li>');
      expect(container.innerHTML).toContain('<li>Item 2</li>');
    });
  });

  describe('Media Elements', () => {
    it('should render image with attributes', () => {
      const content = {
        root: {
          children: [
            {
              type: 'image',
              src: 'https://example.com/image.jpg',
              altText: 'Test image',
              width: 600,
              height: 400,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
        },
      };

      const { container } = render(<LexicalContentRenderer content={content} />);
      expect(container.innerHTML).toContain('src="https://example.com/image.jpg"');
      expect(container.innerHTML).toContain('alt="Test image"');
      expect(container.innerHTML).toContain('width="600"');
      expect(container.innerHTML).toContain('height="400"');
    });

    it('should render link with proper attributes', () => {
      const content = {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'link',
                  url: 'https://example.com',
                  title: 'Click here',
                  target: '_blank',
                  children: [
                    {
                      type: 'text',
                      text: 'Example Link',
                    },
                  ],
                },
              ],
            },
          ],
          direction: null,
          format: '',
          indent: 0,
        },
      };

      const { container } = render(<LexicalContentRenderer content={content} />);
      expect(container.innerHTML).toContain('href="https://example.com"');
      expect(container.innerHTML).toContain('Example Link');
      expect(container.innerHTML).toContain('target="_blank"');
      expect(container.innerHTML).toContain('rel="noopener noreferrer"');
    });

    it('should render YouTube video from standard URL', () => {
      const content = {
        root: {
          children: [
            {
              type: 'youtube',
              url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            },
          ],
          direction: null,
          format: '',
          indent: 0,
        },
      };

      const { container } = render(<LexicalContentRenderer content={content} />);
      expect(container.innerHTML).toContain('dQw4w9WgXcQ');
      expect(container.innerHTML).toContain('youtube.com/embed');
      expect(container.innerHTML).toContain('youtube-embed');
    });

    it('should extract YouTube ID from youtu.be URL', () => {
      const content = {
        root: {
          children: [
            {
              type: 'youtube',
              url: 'https://youtu.be/dQw4w9WgXcQ',
            },
          ],
          direction: null,
          format: '',
          indent: 0,
        },
      };

      const { container } = render(<LexicalContentRenderer content={content} />);
      expect(container.innerHTML).toContain('dQw4w9WgXcQ');
      expect(container.innerHTML).toContain('iframe');
    });
  });

  describe('Special Elements', () => {
    it('should render horizontal rule', () => {
      const content = {
        root: {
          children: [
            {
              type: 'horizontalrule',
            },
          ],
          direction: null,
          format: '',
          indent: 0,
        },
      };

      const { container } = render(<LexicalContentRenderer content={content} />);
      expect(container.innerHTML).toContain('<hr');
    });

    it('should render table with headers and data', () => {
      const content = {
        root: {
          children: [
            {
              type: 'table',
              children: [
                {
                  type: 'tablerow',
                  children: [
                    {
                      type: 'tablecell_header',
                      children: [
                        {
                          type: 'text',
                          text: 'Header 1',
                        },
                      ],
                    },
                    {
                      type: 'tablecell_header',
                      children: [
                        {
                          type: 'text',
                          text: 'Header 2',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'tablerow',
                  children: [
                    {
                      type: 'tablecell',
                      children: [
                        {
                          type: 'text',
                          text: 'Data 1',
                        },
                      ],
                    },
                    {
                      type: 'tablecell',
                      children: [
                        {
                          type: 'text',
                          text: 'Data 2',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
          direction: null,
          format: '',
          indent: 0,
        },
      };

      const { container } = render(<LexicalContentRenderer content={content} />);
      expect(container.innerHTML).toContain('<table');
      expect(container.innerHTML).toContain('<th>Header 1</th>');
      expect(container.innerHTML).toContain('<td>Data 1</td>');
      expect(container.innerHTML).toContain('border-collapse');
    });
  });

  describe('Edge Cases & Security', () => {
    it('should handle null content gracefully', () => {
      const { container } = render(<LexicalContentRenderer content={null} />);
      expect(container.innerHTML).toContain('No content');
    });

    it('should handle undefined content gracefully', () => {
      const { container } = render(<LexicalContentRenderer content={undefined} />);
      expect(container.innerHTML).toContain('No content');
    });

    it('should handle invalid JSON string', () => {
      const { container } = render(<LexicalContentRenderer content="invalid json" />);
      expect(container.innerHTML).toContain('invalid json');
    });

    it('should escape HTML special characters for XSS prevention', () => {
      const content = {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: '<script>alert("xss")</script>',
                },
              ],
            },
          ],
          direction: null,
          format: '',
          indent: 0,
        },
      };

      const { container } = render(<LexicalContentRenderer content={content} />);
      expect(container.innerHTML).toContain('&lt;script&gt;');
      expect(container.innerHTML).not.toContain('<script>');
    });

    it('should properly escape URLs in attributes', () => {
      const content = {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'link',
                  url: 'javascript:alert("xss")',
                  children: [
                    {
                      type: 'text',
                      text: 'Click me',
                    },
                  ],
                },
              ],
            },
          ],
          direction: null,
          format: '',
          indent: 0,
        },
      };

      const { container } = render(<LexicalContentRenderer content={content} />);
      expect(container.innerHTML).toContain('javascript:alert(&quot;xss&quot;)');
    });
  });

  describe('Complex Content Scenarios', () => {
    it('should render mixed content with multiple element types', () => {
      const content = {
        root: {
          children: [
            {
              type: 'heading',
              tag: 'h2',
              children: [
                {
                  type: 'text',
                  text: 'Guide',
                },
              ],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Learn how to ',
                },
                {
                  type: 'text',
                  text: 'build',
                  format: 1,
                },
                {
                  type: 'text',
                  text: ' amazing things.',
                },
              ],
            },
            {
              type: 'image',
              src: 'https://example.com/demo.jpg',
              altText: 'Demo image',
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'link',
                  url: 'https://example.com/docs',
                  children: [
                    {
                      type: 'text',
                      text: 'Read documentation',
                    },
                  ],
                },
              ],
            },
          ],
          direction: null,
          format: '',
          indent: 0,
        },
      };

      const { container } = render(<LexicalContentRenderer content={content} />);
      expect(container.innerHTML).toContain('<h2>Guide</h2>');
      expect(container.innerHTML).toContain('<strong>build</strong>');
      expect(container.innerHTML).toContain('<img');
      expect(container.innerHTML).toContain('Read documentation</a>');
    });
  });
});
