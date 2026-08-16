# System Integration Testing — DevTaskMan

## Document Control

| Versi | Tanggal | Sumber Kebenaran |
| :--- | :--- | :--- |
| 1.0 | 2026-08-16 | `openspec/specs/*/spec.md` — setiap baris skenario di dokumen ini WAJIB melacak balik ke satu `#### Scenario:` di sana. Jangan menambah skenario yang tidak ada padanannya di openspec. |

Dokumen ini adalah acuan tunggal untuk: (1) tim QA melakukan pengujian manual, dan (2) penulis test Playwright di `e2e/` memutuskan skenario mana yang perlu diotomasi berikutnya.

**Skema Test ID**: `SIT-<ABBR>-<NN>`, per kapabilitas openspec:

| Abbr | Kapabilitas |
| :--- | :--- |
| BRA | backend-rest-api |
| BSO | backend-security-owasp |
| BSA | backend-statistics-api |
| ELT | e2e-login-tests |
| FEM | frontend-mock |
| JWT | jwt-user-authentication |
| KLC | kanban-layout-controls |
| NOT | notification-registry |
| PDI | postgresql-database-integration |
| TCA | task-comments-api |
| TLV | timeline-view |
| UCI | user-csv-import |
| UPM | user-profile-management |

## Test Environment

- **Backend**: `http://localhost:5000` (`cd backend && npm run dev`). Fallback otomatis ke in-memory store jika PostgreSQL tidak terjangkau — response `GET /health` menunjukkan status tapi tidak membedakan storage aktif; cek log server (`[Database] Connected to PostgreSQL successfully!` vs `Falling back to in-memory database store`) untuk memastikan storage mana yang sedang diuji. Uji kedua storage jika waktu memungkinkan — keduanya pernah punya bug yang berbeda-beda (lihat `openspec/changes/archive/2026-08-16-backend-inmemory-comments-history-fix/`).
- **Frontend**: `http://localhost:5173` (`cd frontend && npm run dev`).
- **API Docs**: `http://localhost:5000/api-docs` (Swagger UI).
- **Akun seed** (password sama untuk semua: `password123`):

  | Email | Role |
  | :--- | :--- |
  | alice@company.com | Admin |
  | bob@company.com | PM |
  | charlie@company.com | DevLeader |
  | diana@company.com | QALeader |
  | eric@company.com, frank@company.com | Developer |
  | grace@company.com, helen@company.com | QA |

- **E2E**: `cd e2e && npm test` (headless) atau `npm run test:headed`. Suite mereset seed data (`POST /api/v1/reset`) sebelum berjalan.

## Coverage Summary

| Capability | Scenarios | Automated | Manual |
| :--- | :--- | :--- | :--- |
| backend-rest-api | 5 | 0 | 5 |
| backend-security-owasp | 4 | 0 | 4 |
| backend-statistics-api | 6 | 0 | 6 |
| e2e-login-tests | 6 | 6 | 0 |
| frontend-mock | 11 | 0 | 11 |
| jwt-user-authentication | 3 | 0 | 3 |
| kanban-layout-controls | 5 | 0 | 5 |
| notification-registry | 3 | 0 | 3 |
| postgresql-database-integration | 1 | 0 | 1 |
| task-comments-api | 1 | 0 | 1 |
| timeline-view | 3 | 0 | 3 |
| user-csv-import | 1 | 0 | 1 |
| user-profile-management | 3 | 0 | 3 |
| **Total** | **52** | **6** | **46** |

Hanya login flow yang punya otomasi Playwright saat ini. Semua kapabilitas lain 100% manual — kandidat kuat untuk perluasan `e2e/tests/` berikutnya adalah **backend-rest-api** dan **jwt-user-authentication** (fondasi API inti) sebelum **frontend-mock** (UI, butuh lebih banyak selector).

## Test Scenarios by Capability

### backend-rest-api (`openspec/specs/backend-rest-api/spec.md`)

| Test ID | Requirement | Scenario | Role | Given/When | Then (Expected) | Automated |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| SIT-BRA-01 | Fetch Tasks Endpoint | Retrieve Task Registry List | Any authenticated | GET `/api/v1/tasks` | 200, JSON array semua task | 🔲 Manual |
| SIT-BRA-02 | Create and Update Tasks Endpoints | Creating a New Task Record | Admin/PM/DevLeader/QALeader | POST `/api/v1/tasks` dengan payload valid | 201, task tersimpan + history log ditambahkan | 🔲 Manual |
| SIT-BRA-03 | Create and Update Tasks Endpoints | Rejecting Task Creation From Non-Privileged Roles | Developer/QA | POST `/api/v1/tasks` | 403, task TIDAK dibuat | 🔲 Manual |
| SIT-BRA-04 | Create and Update Tasks Endpoints | Updating Existing Task Details | Any authenticated | PUT `/api/v1/tasks/TSK-103` dengan field parsial | 200, atribut ter-update + history log ditambahkan | 🔲 Manual |
| SIT-BRA-05 | Reset Seed Data Endpoint | Triggering Seed Reset | Any | POST `/api/v1/reset` | 200, data task kembali ke seed default | 🔲 Manual |

### backend-security-owasp (`openspec/specs/backend-security-owasp/spec.md`)

| Test ID | Requirement | Scenario | Role | Given/When | Then (Expected) | Automated |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| SIT-BSO-01 | CORS Constraints | Blocking Unauthorized Origin Requests | N/A | Request dari origin asing (mis. `http://attacker.com`) | CORS ditolak | 🔲 Manual |
| SIT-BSO-02 | API Rate Limiting | Triggering Rate Limiter Block | Any | >100 request ke `/api/` dalam 15 menit dari 1 IP | 429 untuk request berikutnya | 🔲 Manual |
| SIT-BSO-03 | Input Schema Validation & Sanitization | Rejecting Injection & Malformed Payloads | Any | POST berisi tag `<script>` atau melanggar skema | 400 | 🔲 Manual |
| SIT-BSO-04 | Role-Based Authorization Guards | Blocking Unauthorized Deletion | Developer | DELETE ke endpoint task | 403 | 🔲 Manual |

> QA Note: skenario BSO-04 di spec masih menyebut path lama `/api/tasks/TSK-103` (pre-`/api/v1` drift) — DELETE task sesungguhnya berjalan di `/api/v1/tasks/:id`; verifikasi terhadap path aktual, bukan teks literal di spec.

### backend-statistics-api (`openspec/specs/backend-statistics-api/spec.md`)

| Test ID | Requirement | Scenario | Role | Given/When | Then (Expected) | Automated |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| SIT-BSA-01 | Fetch Task Status and Priority Distribution | Retrieve Status and Priority Counts | Admin/PM/DevLeader/QALeader | GET `/api/v1/statistics` | 200, `statusCounts` + `priorityCounts` | 🔲 Manual |
| SIT-BSA-02 | Fetch Per-Assignee Completion Breakdown | Retrieve Assignee Productivity | Admin/PM/DevLeader/QALeader | GET `/api/v1/statistics` | `assigneeBreakdown[]` berisi `userId`, `userName`, `completed`, `total` | 🔲 Manual |
| SIT-BSA-03 | Fetch Upcoming Deadline Count | Retrieve Due-Soon Count With Default Window | Admin/PM/DevLeader/QALeader | GET `/api/v1/statistics` tanpa `dueSoonDays` | `dueSoonCount` dihitung dengan window 3 hari | 🔲 Manual |
| SIT-BSA-04 | Fetch Upcoming Deadline Count | Retrieve Due-Soon Count With Custom Window | Admin/PM/DevLeader/QALeader | GET `/api/v1/statistics?dueSoonDays=7` | `dueSoonCount` dihitung dengan window 7 hari | 🔲 Manual |
| SIT-BSA-05 | Restrict Access By Role | Reject Non-Reporting Roles | Developer/QA | GET `/api/v1/statistics` | 403, tanpa data statistik | 🔲 Manual |
| SIT-BSA-06 | Restrict Access By Role | Reject Unauthenticated Requests | Tanpa token | GET `/api/v1/statistics` tanpa JWT | 401 | 🔲 Manual |

### e2e-login-tests (`openspec/specs/e2e-login-tests/spec.md`)

| Test ID | Requirement | Scenario | Role | Given/When | Then (Expected) | Automated |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| SIT-ELT-01 | Automated Login Success Coverage | Login via credential form | Admin (alice) | Isi email+password form, klik "Masuk" | Navigasi ke `/dashboard`, nama tampil di sidebar | ✅ `e2e/tests/login.spec.ts:14` |
| SIT-ELT-02 | Automated Login Success Coverage | Login via quick-pick demo account | Admin (alice) | Klik kartu quick sign-in | Navigasi ke `/dashboard`, role badge tampil di navbar | ✅ `e2e/tests/login.spec.ts:25` |
| SIT-ELT-03 | Automated Login Failure Coverage | Wrong password | Admin (alice) | Submit password salah | Tetap di `/login`, pesan error tampil | ✅ `e2e/tests/login.spec.ts:33` |
| SIT-ELT-04 | Automated Session Persistence Coverage | Reload after login | Admin (alice) | Reload halaman setelah login | Tetap di `/dashboard`, tidak redirect | ✅ `e2e/tests/login.spec.ts:43` |
| SIT-ELT-05 | Automated Logout Coverage | Logout redirects and blocks re-entry | Admin (alice) | Klik "Keluar (Logout)", lalu navigasi langsung ke `/dashboard` | Kedua aksi redirect ke `/login` | ✅ `e2e/tests/login.spec.ts:54` |
| SIT-ELT-06 | Deterministic Seed Data For Test Runs | Pre-suite reset | N/A | Suite E2E dijalankan | `POST /api/v1/reset` dipanggil sekali sebelum test pertama | ✅ `e2e/global-setup.ts` (bukan test individual — bagian dari setup) |

> Skenario ini hanya diverifikasi untuk role **Admin**. Role lain (PM, DevLeader, QALeader, Developer, QA) belum punya E2E login coverage — kandidat perluasan `e2e/tests/login.spec.ts`.

### frontend-mock (`openspec/specs/frontend-mock/spec.md`)

| Test ID | Requirement | Scenario | Role | Given/When | Then (Expected) | Automated |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| SIT-FEM-01 | Role Selection and Dashboard Views | Logging in as a role | Any seeded | Submit kredensial valid di login | JWT tersimpan, menu & dashboard sesuai role | 🔲 Manual |
| SIT-FEM-02 | Role Selection and Dashboard Views | Switching User Roles | Any seeded | Pilih akun lain dari panel "Simulasikan Peran" | Re-auth via login, menu & dashboard update | 🔲 Manual |
| SIT-FEM-03 | Role Selection and Dashboard Views | PM Dashboard Overview | PM | Login sebagai PM | Chart status/prioritas/kinerja tim tampil dari data `GET /api/v1/tasks` | 🔲 Manual |
| SIT-FEM-04 | Kanban Board and Role-Based Transitions | Developer moving task to Ready for QA | Developer | Pindahkan task dari "In Progress" ke "Ready for QA" | Perpindahan diizinkan, task tampil di kolom baru | 🔲 Manual |
| SIT-FEM-05 | Kanban Board and Role-Based Transitions | Developer blocked from moving task beyond Ready for QA | Developer | Coba pindahkan task ke "Testing"/"Done" | Ditolak, alert error, posisi kartu kembali | 🔲 Manual |
| SIT-FEM-06 | Kanban Board and Role-Based Transitions | QA moving task to In Progress on failure | QA | Pindahkan task dari "Testing" ke "In Progress" (rework) | Diizinkan, diminta deskripsi bug, status ter-update | 🔲 Manual |
| SIT-FEM-07 | Task Administration | PM creates a new task | PM | Isi form task lengkap, klik "Buat" | Task terkirim via POST, tampil di Kanban dengan status "To Do" | 🔲 Manual |
| SIT-FEM-08 | Slack Notification Simulation | Notify QA when task is Ready for QA | Any | Status task berubah In Progress → Ready for QA | Notifikasi SSE/`GET /notifications` muncul: "...siap diuji oleh tim QA" | 🔲 Manual |
| SIT-FEM-09 | Slack Notification Simulation | Notify Dev when task fails QA | QA | Status task berubah Testing → In Progress | Notifikasi: "...gagal uji. Mohon periksa kembali" | 🔲 Manual |
| SIT-FEM-10 | Admin Settings and Access Control | Admin assigns role to a user | Admin | Ubah role via dropdown di Admin Panel | PUT `/api/v1/users/:id` terkirim, role tersimpan setelah server konfirmasi | 🔲 Manual |
| SIT-FEM-11 | Import Users via CSV Template | Admin downloads template and uploads CSV | Admin | Unduh template, upload CSV nama+role | CSV di-parse client-side, POST `/api/v1/users/import`, daftar user ter-update dari response server | 🔲 Manual |

### jwt-user-authentication (`openspec/specs/jwt-user-authentication/spec.md`)

| Test ID | Requirement | Scenario | Role | Given/When | Then (Expected) | Automated |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| SIT-JWT-01 | Secure Password Hashing | Verify Hashed Storage Format | N/A | Registrasi user baru dengan plaintext password | Password di-hash bcrypt sebelum disimpan (cek kolom `password_hash` di DB, bukan plaintext) | 🔲 Manual |
| SIT-JWT-02 | Authentication Session Issuance | Successful Login | Any seeded | POST kredensial cocok ke `/api/v1/auth/login` | 200, JWT valid 24 jam dikembalikan | 🔲 Manual (tercakup implisit oleh SIT-ELT-01/02 di level UI) |
| SIT-JWT-03 | Protected Task Middleware Guard | Deny Unauthenticated Request | Tanpa token | Panggil endpoint task tanpa `Authorization: Bearer` | 401 | 🔲 Manual |

### kanban-layout-controls (`openspec/specs/kanban-layout-controls/spec.md`)

| Test ID | Requirement | Scenario | Role | Given/When | Then (Expected) | Automated |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| SIT-KLC-01 | Collapsible Sidebar Control | Toggling Sidebar to Collapsed | Any | Klik tombol toggle sidebar | Sidebar menyempit, padding konten utama berkurang | 🔲 Manual |
| SIT-KLC-02 | Collapsible Sidebar Control | Toggling Sidebar to Expanded | Any | Klik toggle saat sidebar collapsed | Sidebar melebar kembali, padding konten pulih | 🔲 Manual |
| SIT-KLC-03 | Fullscreen View Mode | Toggling Fullscreen Mode | Any | Klik tombol fullscreen di navbar | Browser masuk mode fullscreen | 🔲 Manual |
| SIT-KLC-04 | Collapsible Kanban Column Lanes | Collapsing Column Lane | Any | Klik ikon collapse di header kolom Kanban | Kolom menyempit vertikal, judul tampil vertikal, kartu tersembunyi | 🔲 Manual |
| SIT-KLC-05 | Collapsible Kanban Column Lanes | Expanding Column Lane | Any | Klik ikon expand di kolom yang collapsed | Kolom kembali ke ukuran default, kartu tampil | 🔲 Manual |

### notification-registry (`openspec/specs/notification-registry/spec.md`)

| Test ID | Requirement | Scenario | Role | Given/When | Then (Expected) | Automated |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| SIT-NOT-01 | Fetch Notification Listing | Retrieve All Alerts | Any authenticated | GET `/api/v1/notifications` | 200, array notifikasi sistem+Slack | 🔲 Manual |
| SIT-NOT-02 | Mark Alerts As Read | Clear Unread Status | Any authenticated | POST `/api/v1/notifications/read` | 200, semua notifikasi `read = true` | 🔲 Manual |
| SIT-NOT-03 | Frontend Control For Marking Notifications Read | User marks all notifications read | Any | Klik tombol "Tandai Semua Dibaca" di drawer Slack/System | `POST /notifications/read` terpanggil, badge unread hilang | 🔲 Manual |

### postgresql-database-integration (`openspec/specs/postgresql-database-integration/spec.md`)

| Test ID | Requirement | Scenario | Role | Given/When | Then (Expected) | Automated |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| SIT-PDI-01 | Relational Table Schema | Seed Initial Database Schema | N/A | Backend connect ke database Postgres kosong saat startup | Schema users/tasks/comments/logs dibuat, seed data default terisi | 🔲 Manual |

> QA Note: uji juga jalur fallback in-memory (matikan/putuskan Postgres sebelum start backend) — perilaku CRUD harus identik di kedua storage; beberapa bug in-memory-parser pernah ditemukan dan diperbaiki (lihat `openspec/changes/archive/2026-08-16-backend-inmemory-comments-history-fix/`), regresi di sini mudah lolos tanpa disadari karena tidak ada error yang muncul (silent no-op).

### task-comments-api (`openspec/specs/task-comments-api/spec.md`)

| Test ID | Requirement | Scenario | Role | Given/When | Then (Expected) | Automated |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| SIT-TCA-01 | Post Comment To Task | Successfully Post Card Comment | Any authenticated | POST komentar valid ke `/api/v1/tasks/TSK-103/comments` | 201, komentar tersimpan + history log ditambahkan | 🔲 Manual |

### timeline-view (`openspec/specs/timeline-view/spec.md`)

| Test ID | Requirement | Scenario | Role | Given/When | Then (Expected) | Automated |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| SIT-TLV-01 | Timeline View Menu Navigation | Clicking Timeline Navigation Link | Any | Klik menu "Timeline" di Sidebar | Routing ke halaman timeline, grid penjadwalan tampil | 🔲 Manual |
| SIT-TLV-02 | Chronological Gantt Grid | Rendering Gantt Duration Bars | Any | Task dimuat di halaman timeline | Setiap task tampil sebagai bar horizontal dari `startDate` ke `dueDate`, warna sesuai status | 🔲 Manual |
| SIT-TLV-03 | Schedule Filtering | Filtering Timeline by Assignee | Any | Pilih anggota tim dari dropdown filter assignee | Grid timeline hanya menampilkan task milik anggota terpilih | 🔲 Manual |

### user-csv-import (`openspec/specs/user-csv-import/spec.md`)

| Test ID | Requirement | Scenario | Role | Given/When | Then (Expected) | Automated |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| SIT-UCI-01 | Bulk Users Registration | Batch Register Profiles | Admin | POST array user (name, email, role, password) ke `/api/v1/users/import` | 201, semua profil valid ter-insert + notifikasi sistem tercatat | 🔲 Manual |

### user-profile-management (`openspec/specs/user-profile-management/spec.md`)

| Test ID | Requirement | Scenario | Role | Given/When | Then (Expected) | Automated |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| SIT-UPM-01 | Fetch Users Listing | Retrieve All Registered Accounts | Any authenticated | GET daftar user | 200, array semua profil user | 🔲 Manual |
| SIT-UPM-02 | Administrative User Account Mutations | Admin Deletes User Profile | Admin | DELETE user tertentu | 200, user terhapus dari database | 🔲 Manual |
| SIT-UPM-03 | Administrative User Account Mutations | Non-Admin Blocked from User Deletion | Developer | DELETE user tertentu | 403, ditolak | 🔲 Manual |

> QA Note: skenario UPM-01/02/03 di spec masih menyebut path lama `/api/users` (pre-`/api/v1` drift, belum dikoreksi seperti `backend-rest-api`/`jwt-user-authentication`). Verifikasi terhadap path aktual `/api/v1/users`, bukan teks literal di spec — pertimbangkan mengajukan openspec change kecil untuk mengoreksi ini seperti yang sudah dilakukan pada dua spec lain.

## Changelog

| Date | Change |
| :--- | :--- |
| 2026-08-16 | Dokumen awal dibuat, mencakup 13 kapabilitas / 52 skenario dari `openspec/specs/`. 6 skenario (login flow, role Admin) sudah teotomasi via `e2e/tests/login.spec.ts` + `e2e/global-setup.ts`. |
