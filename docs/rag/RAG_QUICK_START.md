# RAG Activation - Quick Reference Card

## ✅ Tình Trạng Hiện Tại

| Component | Status | Details |
|-----------|--------|---------|
| **Database** | ✅ Ready | 5 models, migration applied |
| **LLM Config** | ✅ Ready | OpenAI, Gemini, Claude |
| **Embeddings** | ✅ Ready | 3 premium providers |
| **Feature Flag** | ✅ Ready | Settings.rag_enabled |
| **API Keys** | ⚠️ Required | Set OPENAI_API_KEY or equivalent |
| **RAG Enabled?** | ❓ Check | Use command below |

---

## 🚀 Bước 1: Chọn & Set API Key

```bash
# OpenAI (Recommended)
export OPENAI_API_KEY="sk-proj-..."

# OR Google Gemini
export GOOGLE_GEMINI_API_KEY="AIzaSy..."

# OR Anthropic Claude
export ANTHROPIC_API_KEY="sk-ant-..."
```

**Lấy key ở:**
- OpenAI: https://platform.openai.com/api-keys
- Gemini: https://makersuite.google.com/app/apikey
- Claude: https://console.anthropic.com/

---

## 🎚️ Bước 2: Enable RAG

### **Option A: Via Settings Server Action (Recommended)** ⭐
```typescript
// In a server action or component
import { toggleRAGAction } from "@/lib/features/settings/actions/settings-actions";

const result = await toggleRAGAction(true);
if (result.success) {
  console.log(result.message); // "RAG enabled successfully"
}
```

### **Option B: Via Database**
```sql
UPDATE "Settings" SET value = 'true' WHERE key = 'rag_enabled';

-- Verify
SELECT * FROM "Settings" WHERE key = 'rag_enabled';
```

### **Option C: Via Direct Code**
```typescript
import { enableRAG } from "@/lib/ai";
await enableRAG();
```

---

## 🔍 Bước 3: Verify Enabled

### **Via Settings Server Action (Recommended)**
```typescript
import { getRAGStatusAction } from "@/lib/features/settings/actions/settings-actions";

const result = await getRAGStatusAction();
console.log(result.data.enabled ? "✅ ENABLED" : "❌ DISABLED");
```

### **Via Direct Code**
```typescript
import { isRagEnabled } from "@/lib/ai";

const enabled = await isRagEnabled();
console.log(enabled ? "✅ ENABLED" : "❌ DISABLED");
```

**Expected output:** `true` (if successful)

---

## 🎯 Usage Example

```typescript
// Now you can use RAG features:
import { getLLMConfig, getEmbeddingConfig, isRagEnabled } from "@/lib/ai";

if (await isRagEnabled()) {
  const llm = getLLMConfig();
  const embedding = getEmbeddingConfig();
  
  console.log("LLM:", llm.model);              // "gpt-4-turbo"
  console.log("Embeddings:", embedding.model);  // "text-embedding-3-large"
  
  // Ready to implement RAG services!
  // See: lib/features/vector-search/services/
}
```

---

## 🛑 Tắt RAG (Disable)

### **Via Settings Server Action (Recommended)**
```typescript
import { toggleRAGAction } from "@/lib/features/settings/actions/settings-actions";

const result = await toggleRAGAction(false);
if (result.success) {
  console.log(result.message); // "RAG disabled successfully"
}
```

### **Via Database**
```sql
UPDATE "Settings" SET value = 'false' WHERE key = 'rag_enabled';
```

### **Via Direct Code**
```typescript
import { disableRAG } from "@/lib/ai";
await disableRAG();
```

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| **Settings table not found** | `npx prisma migrate deploy` |
| **API key error** | Set env var: `export OPENAI_API_KEY="sk-..."` |
| **isRagEnabled() returns false** | Run: `UPDATE "Settings" SET value='true' WHERE key='rag_enabled'` |
| **Changes not taking effect** | Clear cache: `clearRagCache()` or restart app |

---

## 📚 Integration Points

| Location | Purpose | Status |
|----------|---------|--------|
| `lib/features/settings/actions/settings-actions.ts` | RAG toggle server actions | ✅ New actions added |
| `lib/ai/rag-feature-flag.ts` | RAG feature flag system | ✅ Already exists |
| `lib/features/settings/services/` | Settings service layer | ✅ Ready for use |
| `lib/features/vector-search/` | RAG pipeline (future) | 🚧 Ready for implementation |
| `components/admin/rag-toggle.tsx` | UI component for dashboard |

---

## ⏱️ Timeline

```
Time | Action                    | Status
-----|---------------------------|--------
0:00 | Set API key               | ⏳ Do this
2:00 | Enable RAG (pick method)  | ⏳ Do this  
3:00 | Verify with isRagEnabled()| ✅ Confirm
5:00 | RAG ACTIVE ✅             | Done!
```

---

## 🎯 Summary

```
RAG sẵn sàng?           ✅ YES (100%)
Cần làm gì?             3 bước duy nhất
Mất bao lâu?            5 phút
Có risky không?         ❌ NO (feature-flagged)
Có thể tắt lại không?   ✅ YES (anytime)
```

---

**Ready to activate? Choose your method above!** 🚀
