Type Safety & Ràng Buộc Action: Chuẩn hóa ActionResult và Zod schema cho tất cả server actions; thêm test contract cho actions quan trọng (contacts, knowledge, events). Tăng bảo vệ input và lỗi nghiệp vụ để giảm bug runtime.
Permission Coverage: Dò toàn bộ lib/features/**/actions để đảm bảo mọi mutation có requirePermission() ở đầu; thêm unit test “deny/allow” theo từng module (customers, events, knowledge, users).
Cache & Revalidate: Áp dụng nhất quán chiến lược từ docs CACHING_STRATEGY: mọi action gọi revalidatePath() đúng phạm vi; bổ sung helper revalidateModule(moduleName) để tránh thiếu sót.
Error Boundaries UI: Xác nhận mọi trang quan trọng có wrapper react-error-boundary; thống nhất Sonner toast cho thông báo thành công/thất bại của actions.
Security Headers: Rà next.config.ts để thêm Content-Security-Policy, X-Frame-Options, Referrer-Policy, Permissions-Policy; cấu hình CORS trong cors.ts dùng allowlist domain từ env.
Secrets & Env Guard: Tạo env.mjs (zod) để validate biến môi trường bắt buộc (DATABASE_URL, NEXTAUTH_SECRET, PUSHER, SMTP...); fail-fast khi thiếu.

#####

Prisma Optimization: Audit repositories/:
Thêm select/include tối ưu, tránh n+1.
Index hóa các FK được query nhiều (customerId, contactId, engagementId).
Dùng unstable_cache cho list pages có pagination lớn, với key gồm filters.
Pagination & Filters: Chuẩn hóa site.ts cho page size; thêm server-side filters (search, sort) nhất quán trên CRM list pages để giảm tải client.
Pusher Backoff: Bọc getPusher().trigger bằng retry/backoff nhỏ và silent-fail để tránh lỗi nhẹ làm fail action.

#####

NextAuth v5 Hardening: Kiểm tra JWT enrichment, bảo vệ chống privilege escalation; thêm rotation cho NEXTAUTH_SECRET; session max-age và idle timeout rõ ràng.
RBAC Auditing: Ghi lại createdBy/updatedBy nhất quán trong mọi action; log audit ở realtime/utils cho các thay đổi nhạy cảm (users, roles, permissions).
Rate Limiting: Thêm middleware rate-limit cho các API nhạy cảm (auth, uploads) dựa trên IP/user.

#####

Quan Trọng Trung Hạn (tăng giá trị sản phẩm)

Profile Builder hoàn chỉnh: Kết xuất động module fields từ ModuleType (system='profile'); thêm preview, versioning nhẹ cho profile schema.
Knowledge Forms nâng cao: Chèn dynamic fields dưới Lexical theo system='knowledge'; hỗ trợ references đến CRM entities (Customers/Contacts).
Testing Vertical (🚧): Triển khai UI theo Events pattern:
List/CRUD: TestOrder, Sample, TestSuite, Test, TestReport.
Liên kết Media cho sample files.
Tự động tạo Interaction khi tạo/đổi trạng thái TestOrder.
Backup/Restore: Hoàn thiện initialize-backup.ts để chạy backup snapshot theo lịch; UI để tải snapshot; kiểm thử restore trên SQLite dev.
Observability: Thêm light telemetry (performance marks, action latency); page-level PageLoading + Suspense fallback chuẩn hóa.
RAG Foundation (khi cần, không phá vỡ hiện trạng)

Flag-driven Activation: Triển khai enableRAG() và guards isRagEnabled() trong các actions mới.
Local Embeddings (Xenova) + Groq: Tạo 2 service đơn giản:
embeddingService.ts: chunk + embed.
vectorSearchService.ts: cosine similarity trên KnowledgeVector.
ragService.ts: orchestrate query → embed → search → LLM answer với citations.
Server Actions: searchKnowledgeAction, generateAnswerAction với permission knowledge:read.
UI Hooks: Dùng use-rag-status.ts để bật/tắt control trên search bar của Knowledge.

#####

Hãy xem dự án có đảm bảo destructing chưa?

# fdgfdg 

Hãy xem ký cấu trúc dự án xem có cần cải thiện gì ko để:

- Mọi thứ nhất quán
- Dễ bảo trì
- Mọi thứ tuân thủ qui tắc chung
- Dễ hiểu hơn khi đọc dự án
- Lợi ích cho dự án
- ...

Hay đưa ra lời khuyên trước khi thực hiện

1. Nhất quán về cấu trúc thư mục & đặt tên
Áp dụng triệt để mô hình feature-based (như lib/features/[feature]/actions|services|repositories|types).
Đặt tên thư mục, file, biến, type theo quy tắc đã nêu trong copilot-instructions.md (kebab-case cho thư mục, camelCase cho file, PascalCase cho type).
Đảm bảo các page trong (dashboard) tuân thủ template mẫu (tham khảo knowledge).
2. Tối ưu hóa import & sử dụng barrel exports
Chỉ dùng import tuyệt đối (@/lib/...), tránh import tương đối.
Sử dụng barrel exports (index.ts) cho các module để dễ quản lý và import.
3. Tối đa hóa dùng lại component & service
Tạo các component dùng chung ở ui hoặc form-fields.
Tránh lặp lại logic, ưu tiên tách ra service hoặc hook dùng lại.
4. Tuân thủ quy tắc về types & interface
Không khai báo interface/type trong file component/page, mà đưa vào lib/features/[feature]/types/.
Đảm bảo các type được dùng nhất quán giữa các module.
5. Kiểm tra & chuẩn hóa các pattern quan trọng
Server actions phải có permission check, error handling, cache revalidation, Pusher notification.
Phân biệt rõ server/client component, không trộn lẫn logic.
Pagination, loading, error boundary phải nhất quán trên toàn bộ các trang.
6. Đảm bảo các tính năng quan trọng hoạt động đồng nhất
Real-time (Pusher) phải hoạt động tốt ở mọi module, không chỉ ở Users.
CASE_INSENSITIVE_SEARCH phải được dùng đúng nơi, không fix cứng.
7. Tài liệu hóa & kiểm tra lại các phần AI/RAG
Đảm bảo các phần về Vector Database, RAG foundation đã hoàn thiện hoặc có lộ trình rõ ràng.
Tài liệu hóa cách kích hoạt, sử dụng, và kiểm tra tính tương thích với hệ thống hiện tại.
8. Quy trình khi thêm mới/chỉnh sửa
Luôn tham khảo cấu trúc, cách import, cách chia type/component của các phần đã có.
Kiểm tra kỹ sau khi thay đổi để tránh lỗi, đặc biệt với các phần liên quan đến permission, metadata, pagination.

# APP 

Multer, Sharp, React Big Calendar, jsPDF, Stripe.js, QuickBooks API

Các bảng EventMicrosite, CampaignTemplate, EventMicrosite, SponsorMaterial... có được sử dụng chưa? trong components nào, hãy kiểm tra tất cả các bảng xem cái nào chưa được sử dụng hoặc chưa được tạo trogn UI thì phải có kế hoạc để thực hiện cho hoàn chỉnh. Quy trình khi thêm mới/chỉnh sửa: Luôn tham khảo cấu trúc, cách import, cách chia type/component của các phần đã có. Kiểm tra kỹ sau khi thay đổi để tránh lỗi, đặc biệt với các phần liên quan đến permission, metadata, pagination.

Vector Database (Cơ sở dữ liệu Vector) đang trở nên quan trọng vì chúng là nền tảng cho các ứng dụng Trí tuệ Nhân tạo (AI) hiện đại, đặc biệt là các ứng dụng sử dụng Mô hình Ngôn ngữ Lớn (LLM) như ChatGPT hay Gemini. Như vậy hệ thống này có thể khai triển nó không? hãy tư vấn (RAG)

Hãy đọc lại toàn bộ Vector Database + RAG xem đã hoàn thiện chưa? nếu chưa thì phải tiếp tục hoàn thiện 

===

Hệ thống đang chạy real time rất ổn ở User (list) sử dụng Pusher hãy đảm bảo nó chạy tương tự và tốt ở các trang khác

## Thần chú 

Khi tạo các file mới phải tham khảo cấu trúc của các components còn lại như: cách import, cách cấu trúc thư mục cũng như ko có interface trong các file ở phần app/* mà phải đưa nó đến nới tương ứng như các components khác đã làm

====

Cấu trúc /Users/nguyenpham/Source Code/madeapp/app/(dashboard)/**/* (kể cả các cấp con) phải nhất quán với nhau, có vài cái chưa giống với số đông. Phải rà soát thật kỹ đảm bảo tính nhất quán chung cho mọi thứ. Tối đa thư viện dùng chung, tránh tình trạng lặp code ko cần thiết. Đảm bảo dự án ko bị lỗi sau khi thay đổi

Hãy scan kỹ thư mục này /Users/nguyenpham/SourceCode/print-shop/lib/features (kể cả các cấp con) hãy đảm bảo tính đồng nhất giữa các thành phần, nghĩa là cú pháp, bố cục, cấu trúc... nên giống nhau. Đừng có file này khai báo kiểu này file tương ứng kia lại khai báo kiểu khác.... Tránh dự án lỗi khi thay đổi

======

các page.tsx phải chạy ở server, phần nào chạy client phải tạo file mới và import. ngoài ra phải xem lại mọi thứ trong này sao cho mọi thứ phải tuân thủ template của hệ thống đã có (tham khảo /Users/nguyenpham/Source Code/madeapp/app/(dashboard)/knowledge) như cách phân trang, loading, import,... nói chung tất cả nên nhất quán để tiện bảo trì trong tương lai 

=======
1/ Có nhiều const session = await auth(); trong /Users/nguyenpham/Source Code/print-shop/lib/features có cần thiết ko?
====

Phải rà soát lại toàn bộ /Users/nguyenpham/Source Code/print-shop/app/(dashboard)/**/* sao cho mọi thứ nhất quán. Ví dụ như chúng ta đnag sử dụng generateCrudMetadata nhưng lại có nơi sử dụng import { Metadata } from 'next'. Phải rà soát mọi thứ từ import, bố cục cho đến thư viện dùng chung phải nhất quán mọi thứ

====

Trong /Users/nguyenpham/Source Code/madeapp/lib/features/**/* Phải đảm bảo CASE_INSENSITIVE_SEARCH được sử dụng ở những nơi cần thiết (tham khảo /Users/nguyenpham/Source Code/madeapp/lib/features/customers/repositories/customer-repository.ts) nghĩa là ko fixx cứng mode

=== 

Hãy xem kỹ lại cách phân trang moi thứ trong /Users/nguyenpham/SourceCode/print-shop/app/(dashboard) vì hiệnt ôi thấy có trang thì có thông báo "Showing 1 to 1 of 1 *" nhưng có trang lại ko. Phải đảm bảo tính nhất quán của mọi trang 

### 

Vẫm chưa hoàn thiện các trang http://localhost:3000/marketing/sponsors/new, http://localhost:3000/marketing/microsites/new

Các khối nút phải nằm trên các Page header, phải nhấp được và phải có áction đầy đủ.
Trong form content không cần các khối nút này
Các khối nút trong form content phải tuân thủ theo cấu trúc và template đã có trên hệ thống.
Phải xem xét kỹ giá trị trên Breadcrumb để đảm bảo nó chính xác giá trị và đẫn đúng trang (không hiển thị ID trên Breadcrumb).
Tuân thủ bó cục layout với các components tương ứng