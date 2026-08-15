# Business Requirements Document (BRD)
**Nama Proyek:** Sistem Pelacakan Tugas Internal (DevTaskMan)  
**Tanggal Dokumen:** 15 Agustus 2026  
**Versi:** 0.1  
**Pemilik Proyek (Project Owner):** Tim IT Internal (Dev & QA)  

---

## Lembar Kendali Dokumen (Document Control)

### Riwayat Perubahan (Change History)
| Versi | Tanggal | Penulis | Deskripsi Perubahan | Status |
| :--- | :--- | :--- | :--- | :--- |
| 0.1 | 15 Agustus 2026 | Antigravity AI | Draf Awal (Fase Discovery & Cakupan Proyek) | Dalam Tinjauan |

### Daftar Distribusi (Distribution List)
| Nama | Peran | Divisi / Departemen |
| :--- | :--- | :--- |
| Tim Developer | Pelaksana Teknis | Divisi Engineering |
| Tim QA (Quality Assurance) | Penguji Aplikasi | Divisi Quality Assurance |
| Project Manager | Pengawas Proyek | Manajemen Proyek |

---

## 1. Ringkasan Eksekutif (Executive Summary)
DevTaskMan adalah platform manajemen dan pelacakan tugas internal yang dirancang khusus untuk memfasilitasi kolaborasi antara tim Developer dan QA. Saat ini, belum ada sistem tracking tugas formal di perusahaan, sehingga menyulitkan pemantauan status pekerjaan, pendelegasian tugas, dan koordinasi pengujian.

Dengan DevTaskMan, seluruh tugas pembangunan perangkat lunak dapat didokumentasikan, ditugaskan, dan dipantau statusnya secara real-time. Sistem ini juga dilengkapi dengan notifikasi otomatis untuk mempercepat hand-over tugas dari Developer ke QA guna meminimalkan hambatan komunikasi.

---

## 2. Pendahuluan & Tujuan Proyek (Introduction & Project Objectives)

### 2.1 Latar Belakang (Background)
Ketidakberadaan sistem pelacakan tugas yang terpusat menyebabkan kebingungan mengenai siapa yang mengerjakan apa, tugas mana yang siap diuji oleh QA, dan kapan tenggat waktu suatu fitur. Koordinasi manual via chat sering kali tidak terdokumentasi dan rawan luput dari perhatian. Proyek ini diinisiasi untuk mengakhiri masalah pelacakan manual tersebut.

### 2.2 Tujuan Bisnis (Business Objectives)
- **Tujuan 1 (SMART):** Menyediakan satu platform terpusat yang mencatat 100% tugas tim Developer dan QA dalam waktu 1 bulan pasca peluncuran.
- **Tujuan 2 (SMART):** Mengurangi waktu delay transfer tugas dari fase "selesai koding" oleh developer ke fase "mulai testing" oleh QA hingga di bawah 15 menit melalui notifikasi instan.
- **Tujuan 3 (SMART):** Meningkatkan efisiensi pelacakan bug (bug tracking) sehingga tidak ada isu kritis (critical issues) yang terlewat sebelum rilis aplikasi.

---

## 3. Cakupan Proyek (Project Scope)

### 3.1 Dalam Cakupan (In-Scope)
1. **Manajemen Pengguna & Peran (Role-Based Access Control - RBAC):** Pembagian hak akses khusus untuk peran: Admin, Project Manager (PM), Dev Leader / QA Leader, Developer, dan QA Engineer.
2. **Manajemen Tugas (Task Management):** Pembuatan tugas baru, pengeditan, penghapusan, penetapan tenggat waktu (due date), dan pemberian prioritas (High, Medium, Low).
3. **Pendelegasian Tugas (Assignment):**
   - Project Manager dan Dev/QA Leader dapat membagikan tugas ke anggota tim.
   - Developer dan QA Engineer dapat ditunjuk sebagai penanggung jawab tugas (Assignee).
4. **Workflow Status Tugas:** Alur perpindahan status tugas yang mencakup:
   - *Backlog* (Daftar rencana tugas)
   - *To Do* (Siap dikerjakan)
   - *In Progress* (Sedang dikerjakan Dev)
   - *Ready for QA* (Selesai didevelop, menunggu antrean QA)
   - *Testing* (Sedang diuji oleh QA)
   - *Done* (Selesai/Lolos uji)
5. **Sistem Notifikasi & Integrasi:** Notifikasi otomatis melalui Slack ketika status tugas berubah (terutama dari *In Progress* ke *Ready for QA* untuk memberi tahu QA Leader/QA Engineer, atau kembali ke *To Do* / *In Progress* jika ada bug/rework).
6. **Dasbor Laporan (Dashboard & Reporting):** Dasbor khusus bagi PM dan Leader untuk memantau produktivitas dan status tugas yang sedang berjalan.

### 3.2 Luar Cakupan (Out-of-Scope)
1. **Pelacakan Waktu Kerja (Time Tracking):** Fitur untuk menghitung jam kerja aktif (clock-in / clock-out) karyawan tidak akan diimplementasikan pada versi awal.
2. **Manajemen Keuangan / Budgeting:** Sistem tidak mencatat biaya atau anggaran proyek.

---

## 4. Pemangku Kepentingan & Persona Pengguna (Stakeholders & User Personas)

### 4.1 Pemangku Kepentingan Utama (Key Stakeholders)
| No | Nama / Peran | Perwakilan Divisi | Kontribusi dalam Proyek |
| :-- | :--- | :--- | :--- |
| 1 | Lead Developer | Divisi Engineering | Menentukan standarisasi workflow koding & integrasi git |
| 2 | Lead QA | Divisi Quality Assurance | Menentukan standar pengujian & dokumentasi bug |
| 3 | Project Manager | Divisi Product Management | Mengarahkan roadmap fitur dan koordinasi tugas tim |

### 4.2 Persona Pengguna (User Personas)
- **Persona 1: Admin (System Administrator)**
  - **Karakteristik:** Bertanggung jawab atas pengelolaan sistem secara keseluruhan.
  - **Kebutuhan Utama:** Menu administrasi untuk menambah/menghapus pengguna dan mengatur pembagian peran (roles).
- **Persona 2: Project Manager (PM)**
  - **Karakteristik:** Fokus pada pencapaian tenggat waktu proyek dan keselarasan produk.
  - **Kebutuhan Utama:** Membuat tiket tugas, menetapkan prioritas, menetapkan tenggat waktu, dan melihat visualisasi grafik progres tugas secara keseluruhan.
- **Persona 3: Dev/QA Leader**
  - **Karakteristik:** Memimpin tim teknis (Developer atau QA), bertanggung jawab atas pembagian beban kerja anggotanya.
  - **Kebutuhan Utama:** Kemudahan melihat antrean tugas dan mengalokasikan tugas (*assign*) kepada developer atau QA tertentu di bawah timnya.
- **Persona 4: Dev (Software Engineer / Developer)**
  - **Karakteristik:** Fokus menulis kode program, ingin alur kerja yang cepat dan sederhana.
  - **Kebutuhan Utama:** Mengubah status tugas dari *To Do* ke *In Progress*, lalu memindahkan ke *Ready for QA* saat selesai koding.
- **Persona 5: QA (Quality Assurance Engineer)**
  - **Karakteristik:** Fokus menguji fitur dan mencari bug secara detail.
  - **Kebutuhan Utama:** Melihat antrean tugas berstatus *Ready for QA*, menguji fungsionalitas, serta mengembalikan tugas ke tim Dev jika ditemukan bug/rework.

---

## 5. Persyaratan Bisnis (Business Requirements)

### 5.1 Persyaratan Fungsional (Functional Requirements)

| ID | Deskripsi Persyaratan (Requirement Description) | Peran Akses | Prioritas | Kriteria Penerimaan (Acceptance Criteria) |
| :--- | :--- | :--- | :--- | :--- |
| **FR-001** | Pengguna harus dapat masuk (login) ke dalam sistem dan Admin dapat menetapkan peran (role) kepada setiap pengguna. | Admin | High | 1. Login menggunakan akun email internal.<br>2. Halaman admin menampilkan daftar pengguna dengan dropdown Peran (Admin, PM, Leader Dev/QA, Developer, QA).<br>3. Hak akses menu berubah secara real-time berdasarkan peran yang disimpan. |
| **FR-002** | Membuat, mengubah, dan menghapus tugas baru lengkap dengan judul, deskripsi, prioritas (H/M/L), dan tanggal tenggat. | PM, Dev/QA Leader | High | 1. Formulir tugas memuat input teks judul & deskripsi, dropdown prioritas, dan pemilih tanggal.<br>2. Tugas tersimpan dengan status awal "Backlog" atau "To Do". |
| **FR-003** | Mengalokasikan (assign) tugas kepada anggota tim Developer atau QA Engineer. | PM, Dev/QA Leader | High | 1. Terdapat dropdown "Assignee" pada detail tugas yang memuat daftar nama anggota tim.<br>2. Anggota tim yang ditunjuk menerima notifikasi email / sistem. |
| **FR-004** | Mengubah status tugas secara manual di papan tugas (Kanban/List) sesuai dengan alur pengerjaan. | Developer, QA Engineer | High | 1. Drag-and-drop atau dropdown status tugas (To Do $\rightarrow$ In Progress $\rightarrow$ Ready for QA $\rightarrow$ Testing $\rightarrow$ Done).<br>2. Developer hanya bisa memindahkan tugas hingga status "Ready for QA".<br>3. QA Engineer memindahkan dari "Testing" ke "Done" atau mengembalikan ke "In Progress" (rework). |
| **FR-005** | Sistem mengirimkan notifikasi otomatis ke saluran (channel) Slack tim ketika terjadi perpindahan status tertentu. | Sistem (Otomatis) | Medium | 1. Jika status berubah menjadi "Ready for QA", kirim pesan ke Slack: `Tugas [ID] - [Judul] siap diuji oleh tim QA.`<br>2. Jika status kembali ke "In Progress" (ada bug), kirim pesan ke Slack: `Tugas [ID] - [Judul] gagal uji. Mohon periksa kembali.` |
| **FR-006** | Menampilkan dasbor visualisasi grafik progres tugas (diagram lingkaran/batang) berdasarkan status dan kinerja tim. | PM, Dev/QA Leader, Admin | Medium | 1. Grafik menampilkan persentase tugas per status.<br>2. Menampilkan jumlah tugas selesai vs sisa waktu rilis proyek. |

### 5.2 Persyaratan Non-Fungsional (Non-Functional Requirements)
- **Keamanan (Security):**
  - Transmisi data harus dienkripsi menggunakan protokol HTTPS (TLS 1.3).
  - Mekanisme autentikasi menggunakan enkripsi token JWT yang aman dengan masa kedaluwarsa 24 jam.
- **Kinerja (Performance):**
  - Pembaruan status tugas pada papan Kanban harus ter-render dalam waktu kurang dari 1 detik bagi semua pengguna yang melihat papan yang sama (menggunakan WebSocket/Pooling).
- **Ketersediaan (Availability):**
  - Target ketersediaan sistem (uptime) adalah 99.0% di jam kerja operasional (08:00 - 18:00 WIB).

---

## 6. Persyaratan Integrasi & Data (Integration & Data Requirements)

### 6.1 Persyaratan Integrasi (Integration Requirements)
- **Integrasi Slack API:** Menggunakan webhook masuk (Incoming Webhooks) untuk mengirimkan notifikasi perubahan status tugas secara otomatis ke channel Slack developer dan QA yang telah ditentukan.

### 6.2 Persyaratan Data & Migrasi (Data & Migration Requirements)
- Menyediakan templat file CSV untuk mempermudah Admin mengimpor daftar nama karyawan beserta perannya secara massal ke database sistem baru pada fase inisiasi.

---

## 7. Batasan, Asumsi, & Risiko (Constraints, Assumptions, & Risks)

### 7.1 Batasan (Constraints)
- Aplikasi harus dibangun berbasis Web menggunakan kerangka kerja yang ringan agar dapat diakses melalui laptop standar kantor tanpa beban memori tinggi.

### 7.2 Asumsi (Assumptions)
- Setiap anggota tim Developer dan QA sudah memiliki akun Slack kantor yang aktif untuk menerima integrasi notifikasi.

### 7.3 Risiko & Mitigasi (Risks & Mitigations)
| No | Deskripsi Risiko | Tingkat Dampak | Rencana Mitigasi (Mitigation Plan) |
| :-- | :--- | :--- | :--- |
| 1 | Tim tidak memperbarui status tugas secara real-time (data menjadi tidak akurat). | Tinggi | QA Leader akan menginstruksikan bahwa pengujian hanya akan dilakukan jika tiket tugas sudah berada di kolom "Ready for QA". |

---

## 8. Glosarium (Glossary)
- **Kanban Board:** Papan visualisasi alur kerja menggunakan kartu-kartu tugas yang dipindahkan antar kolom status.
- **SSO / JWT:** JSON Web Token, metode transmisi informasi yang aman berupa objek JSON.
- **RBAC:** Role-Based Access Control (Akses berdasarkan peran pengguna).
- **Rework:** Proses pengerjaan ulang tugas oleh developer setelah ditemukan ketidaksesuaian/bug oleh QA.

---

## 9. Persetujuan (Approvals)
*Dokumen BRD DevTaskMan ini disetujui untuk masuk ke fase desain & pengembangan teknis:*

| Peran | Nama Perwakilan | Tanda Tangan | Tanggal Persetujuan |
| :--- | :--- | :--- | :--- |
| **Sponsor / PM Lead** | ____________________ | ____________________ | [DD/MM/YYYY] |
| **Lead Developer** | ____________________ | ____________________ | [DD/MM/YYYY] |
| **Lead QA** | ____________________ | ____________________ | [DD/MM/YYYY] |
