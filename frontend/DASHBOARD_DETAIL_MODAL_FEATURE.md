# Dashboard Detail Modal Feature

## Overview
Menambahkan modal detail untuk card statistik di dashboard yang dapat diklik untuk melihat informasi lebih detail.

## Features Added

### 1. **Clickable StatCard Component**
- Update komponen `StatCard` untuk mendukung onClick handler
- Menambahkan props `clickable` dan `onClick`
- Visual feedback dengan hover effect dan scale animation
- Card berubah menjadi button ketika clickable

### 2. **DashboardDetailModal Component**
- Modal untuk menampilkan detail dari setiap card statistik
- Support untuk 3 tipe modal:
  - **Low Stock Items**: Menampilkan daftar barang dengan stok rendah
  - **Stock In Today**: Menampilkan transaksi masuk hari ini
  - **Stock Out Today**: Menampilkan transaksi keluar hari ini

### 3. **Modal Content Features**

#### Low Stock Items Modal
- Menampilkan daftar barang dengan stok di bawah minimum
- Informasi yang ditampilkan:
  - Nama barang
  - SKU dan kategori
  - Stok saat ini dengan badge merah
  - Minimum stok yang dibutuhkan
  - Icon warning untuk setiap item

#### Stock Movement Modals (In/Out)
- Menampilkan daftar transaksi masuk/keluar hari ini
- Informasi yang ditampilkan:
  - Nama barang
  - Jumlah dengan tanda +/- dan warna sesuai tipe
  - Catatan transaksi
  - Nama user yang melakukan transaksi
  - Waktu transaksi (HH:mm)
  - Icon sesuai tipe transaksi

### 4. **UI/UX Improvements**
- Loading skeleton saat memuat data
- Empty state dengan icon dan pesan yang sesuai
- Responsive design untuk mobile
- Smooth animations dan transitions
- Color coding untuk berbagai tipe data

## Technical Implementation

### Components Created/Modified
1. **StatCard.tsx** - Added clickable functionality
2. **DashboardDetailModal.tsx** - New modal component
3. **ui/skeleton.tsx** - New skeleton component for loading states
4. **Dashboard.tsx** - Integrated modal functionality

### API Integration
- Menggunakan existing API endpoints:
  - `itemsApi.getAll({ low_stock: true })` untuk barang stok rendah
  - `dashboardApi.getActivities()` untuk transaksi hari ini
- Filter data berdasarkan tipe transaksi (in/out)

### State Management
- Modal state management di Dashboard component
- Dynamic modal title dan type berdasarkan card yang diklik
- Loading states untuk setiap modal

## Usage

### For Users
1. **Lihat Detail Stok Rendah**:
   - Klik card "Stok Rendah" (hanya jika ada barang stok rendah)
   - Modal akan menampilkan daftar barang yang perlu direstock

2. **Lihat Detail Transaksi Masuk**:
   - Klik card "Masuk Hari Ini" (hanya jika ada transaksi)
   - Modal akan menampilkan semua transaksi masuk hari ini

3. **Lihat Detail Transaksi Keluar**:
   - Klik card "Keluar Hari Ini" (hanya jika ada transaksi)
   - Modal akan menampilkan semua transaksi keluar hari ini

### Visual Indicators
- Card hanya clickable jika ada data (value > 0)
- Hover effect dan cursor pointer untuk card yang clickable
- Active scale animation saat card diklik
- Color coding: hijau untuk masuk, kuning untuk keluar, merah untuk stok rendah

## Benefits
1. **Better User Experience**: User dapat melihat detail langsung dari dashboard
2. **Quick Access**: Tidak perlu navigasi ke halaman lain untuk melihat detail
3. **Contextual Information**: Modal menampilkan informasi yang relevan dengan card yang diklik
4. **Mobile Friendly**: Modal responsive dan mudah digunakan di mobile
5. **Performance**: Data dimuat on-demand saat modal dibuka

## Future Enhancements
1. Export data dari modal ke CSV/Excel
2. Filter dan sorting dalam modal
3. Pagination untuk data yang banyak
4. Quick actions dari modal (restock, edit transaksi, dll)
5. Real-time updates dengan WebSocket