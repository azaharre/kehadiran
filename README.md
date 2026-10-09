# e-Kehadiran SK Pasir Gudang 3 — prototaip awal

## Apa yang tersedia
- Website responsif (HTML/CSS/JavaScript)
- Pilihan kelas dan tarikh
- Carian nama
- Status Hadir, Tidak hadir, Lewat, Bersebab
- Butang Semua hadir dan Kosongkan tanda
- Ringkasan bilangan status automatik
- Eksport CSV
- `sql/schema.sql`: skema permulaan Supabase dengan RLS

## Amaran penting
Frontend ini ialah prototaip. Ia menggunakan nama murid contoh dan `localStorage` untuk demonstrasi sahaja. Rekod tidak dikongsi antara guru/peranti. **Jangan masukkan data sebenar murid atau gunakan untuk operasi sekolah lagi.** Supabase belum disambungkan dan polisi SQL perlu diuji dalam projek Supabase sebenar sebelum digunakan.

## Cara jalankan di komputer
1. Ekstrak folder.
2. Buka `index.html` dalam Chrome/Edge.
3. Cuba tukar kelas/tarikh, tandakan status, cari nama dan eksport CSV.

Untuk pengalaman pembangunan yang lebih stabil, buka folder dengan VS Code dan gunakan extension Live Server.

## Langkah seterusnya
1. Cipta projek Supabase baharu.
2. Semak dan jalankan `sql/schema.sql` di SQL Editor.
3. Sediakan akaun pentadbir dan profil dengan role yang betul.
4. Uji polisi RLS menggunakan dua akaun guru berbeza.
5. Gantikan data contoh dengan query Supabase dan sambungkan login.
6. Import data murid sebenar hanya selepas ujian keselamatan dan backup.

## Struktur
```
index.html
css/style.css
js/app.js
sql/schema.sql
README.md
```
