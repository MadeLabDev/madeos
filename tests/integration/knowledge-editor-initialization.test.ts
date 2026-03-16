import { describe, expect,it } from 'vitest';

/**
 * Test để kiểm tra:
 * 1. Content từ DB có vấn đề gì?
 * 2. Như thế nào để normalize cho Lexical?
 * 3. Solution là gì?
 */

describe('Lexical Editor Content Initialization - DB Issue Analysis', () => {
  // JSON thực tế từ DB - CÓ VẤN ĐỀ
  const problemContent: any = {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: '22222222',
              type: 'text',
              version: 1,
            },
          ],
          direction: null, // ❌ PROBLEM: null direction (should be "ltr" or "rtl")
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
          textFormat: 0, // ❌ PROBLEM: Extra field that Lexical doesn't expect
          textStyle: '', // ❌ PROBLEM: Extra field that Lexical doesn't expect
        },
      ],
      direction: null, // ❌ PROBLEM: null direction
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  };

  describe('Problem Analysis', () => {
    it('should detect null direction values in root', () => {
      expect(problemContent.root.direction).toBe(null);
    });

    it('should detect null direction in paragraph', () => {
      expect(problemContent.root.children[0].direction).toBe(null);
    });

    it('should detect extra fields in paragraph', () => {
      const para = problemContent.root.children[0] as any;
      expect(para.textFormat).toBe(0);
      expect(para.textStyle).toBe('');
    });

    it('should preserve text content', () => {
      const text = problemContent.root.children[0].children[0] as any;
      expect(text.text).toBe('22222222');
    });
  });

  describe('Normalization Solution', () => {
    /**
     * Helper to normalize content from DB for Lexical
     * - Fix null directions to "ltr"
     * - Remove extra fields (textFormat, textStyle)
     */
    function normalizeContentForLexical(state: any): any {
      if (!state) return state;

      const normalize = (obj: any): any => {
        if (obj === null || obj === undefined) return obj;
        if (Array.isArray(obj)) return obj.map(normalize);
        if (typeof obj !== 'object') return obj;

        const normalized: any = {};

        for (const [key, value] of Object.entries(obj)) {
          // Skip unwanted fields
          if (key === 'textFormat' || key === 'textStyle') {
            continue;
          }

          // Fix null directions
          if (key === 'direction' && value === null) {
            normalized[key] = 'ltr';
            continue;
          }

          // Recursively normalize
          normalized[key] = normalize(value);
        }

        return normalized;
      };

      return normalize(state);
    }

    it('should fix null directions', () => {
      const fixed = normalizeContentForLexical(problemContent);
      expect(fixed.root.direction).toBe('ltr');
      expect(fixed.root.children[0].direction).toBe('ltr');
    });

    it('should remove extra fields', () => {
      const fixed = normalizeContentForLexical(problemContent);
      const para = fixed.root.children[0];
      expect(para.textFormat).toBeUndefined();
      expect(para.textStyle).toBeUndefined();
    });

    it('should preserve text content', () => {
      const fixed = normalizeContentForLexical(problemContent);
      const text = fixed.root.children[0].children[0];
      expect(text.text).toBe('22222222');
    });

    it('should handle JSON string input', () => {
      const jsonString =
        '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"22222222","type":"text","version":1}],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

      const parsed = JSON.parse(jsonString);
      const fixed = normalizeContentForLexical(parsed);

      expect(fixed.root.direction).toBe('ltr');
      expect(fixed.root.children[0].direction).toBe('ltr');
      expect(fixed.root.children[0].textFormat).toBeUndefined();
    });
  });
});
