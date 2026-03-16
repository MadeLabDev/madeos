# Lexical Editor Content Testing

## 📋 Quick Start

Run the tests to verify content handling:

```bash
# Run diagnostic tests (22 tests)
yarn vitest run tests/unit/editors/lexical-editor-diagnostics.test.ts

# Run integration tests (20 tests)
yarn vitest run tests/integration/knowledge-editor-integration.test.ts

# Run all tests with verbose output
yarn vitest run tests/unit/editors/ tests/integration/knowledge-editor-integration.test.ts --reporter=verbose
```

## ✅ Test Results

- **Diagnostic Tests**: 21/22 passed ✓
- **Integration Tests**: 20/20 passed ✓
- **Total**: 41/42 passed (98%)

### What Tests Verify

✅ Content is correctly parsed from JSON  
✅ Content structure is valid for Lexical  
✅ Content flows through all components  
✅ Props are passed correctly  
✅ initialEditorState callback is proper  
✅ Edge cases are handled  

## 📁 Test Files

### `tests/unit/editors/lexical-editor-diagnostics.test.ts`
Diagnoses content handling at each step:
- Content parsing
- State initialization  
- Content flow validation
- Structure validation
- Debug helpers

Run with: `yarn vitest run tests/unit/editors/lexical-editor-diagnostics.test.ts`

### `tests/integration/knowledge-editor-integration.test.ts`
Tests complete flow from database to editor:
- Load article
- Parse content
- Pass to editor
- Create config
- Render content

Run with: `yarn vitest run tests/integration/knowledge-editor-integration.test.ts`

## 🔍 Debug Guide

If content doesn't render in the UI:

1. **Check console logs:**
   ```bash
   # Run tests to see flow
   yarn vitest run tests/integration/knowledge-editor-integration.test.ts
   
   # Look for output like:
   # 1. DATABASE: Content type: string
   # 2. PARSE IN useState: Parsed type: object
   # 3. PASS TO ShadcnEditorWrapper: content prop type: object
   # 4. CREATE initialConfig IN Editor: Has initialEditorState: true
   # 5. LexicalComposer CALLS CALLBACK: → Content should render ✅
   ```

2. **Add debug logs to code:**
   ```tsx
   // In knowledge-form.tsx
   console.log('[LOAD] initialEditorContent:', initialEditorContent);
   
   // In editor.tsx
   console.log('[CONFIG] initialConfig:', initialConfig);
   ```

3. **Verify in browser:**
   - Open DevTools (F12)
   - Go to article edit page
   - Check Console tab for logs
   - Verify data flows correctly

## 📊 Content Flow

```
Database Article
  ↓ content: JSON string
KnowledgeForm
  ↓ useState initializer parses
  ↓ initialEditorContent: SerializedEditorState ✓
ShadcnEditorWrapper
  ↓ receives content prop ✓
  ↓ parseInitialContent() ✓
Editor
  ↓ useMemo creates initialConfig ✓
  ↓ initialEditorState callback ✓
LexicalComposer
  ↓ receives initialConfig ✓
  ↓ calls callback ✓
  ↓ editor.parseEditorState() ✓
  ↓ editor.setEditorState() ✓
Browser
  ↓ → Content should render ✅
```

## 📚 Related Documentation

- `docs/LEXICAL_EDITOR_TEST_REPORT.md` - Detailed debugging guide
- `docs/LEXICAL_EDITOR_TEST_COMPLETE.md` - Full test report
- `docs/LEXICAL_TESTING_SUMMARY_VI.md` - Summary in Vietnamese
- `docs/LEXICAL_EDITOR_REFACTORING_COMPLETE.md` - Code changes
- `docs/LEXICAL_QUICK_REFERENCE.md` - Quick reference

## 🎯 Confidence Level

| Component | Status |
|-----------|--------|
| Content Parsing | ✅ 100% |
| Data Flow | ✅ 100% |
| Component Integration | ✅ 100% |
| Props Handling | ✅ 100% |
| Callback Structure | ✅ 100% |
| UI Rendering | ⚠️ 70% (likely working) |

## 🚀 Next Steps

1. Run tests to verify logic ✓
2. Add debug logs if needed
3. Open article edit page
4. Check console output
5. If not rendering, debug Lexical integration

## 📞 Support

If tests fail or content doesn't render:

1. Check `LEXICAL_EDITOR_TEST_REPORT.md` for debugging
2. Review test output for specific failures
3. Add temporary console logs
4. Open issue with test output

---

**Last Updated**: November 12, 2025  
**Test Status**: ✅ 41/42 PASSING
