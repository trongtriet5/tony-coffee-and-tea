# TTVH POS GOLD - Hệ Thống Quản Lý Thịnh Thế Vinh Hoa

Đây là hệ thống quản lý bán hàng (POS) chuyên dụng cho chuỗi cửa hàng **Thịnh Thế Vinh Hoa**. Hệ thống được xây dựng trên kiến trúc hiện đại, đảm bảo tốc độ phản hồi tức thì và khả năng phân tích dữ liệu tài chính chính xác.

## 🚀 Công Nghệ Sử Dụng

### Backend (NestJS + Prisma)
- **Framework:** NestJS (Node.js)
- **Database:** PostgreSQL (Supabase/Postgres)
- **ORM:** Prisma v7
- **Báo cáo:** Tích hợp logic xử lý doanh thu thực tế và Top Trending.

### Frontend (Next.js)
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS + Vanilla CSS (Aesthetics Gold)
- **State Management:** React Hooks & Zustand
- **Icons:** React-Icons (Hi, Bi, Md)

---

## 🛠️ Hướng Dẫn Cài Đặt (Local)

### 1. Chuẩn bị Môi trường
- Cài đặt **Node.js** (v18+)
- Cài đặt **PostgreSQL** hoặc sử dụng **Supabase URL**.

### 2. Cài đặt Backend
```bash
cd backend
npm install
```
Tạo tệp `.env` trong thư mục `backend` với nội dung:
```env
DATABASE_URL="postgresql://user:pass@host:port/dbname?pgbouncer=true"
DIRECT_URL="postgresql://user:pass@host:port/dbname"
```
Đồng bộ Database và Seeding dữ liệu mẫu:
```bash
npx prisma generate
npm run seed  # Tạo 200+ đơn hàng mẫu cho Dashboard
```
Khởi chạy Backend:
```bash
npm run start:dev
```

### 3. Cài đặt Frontend
```bash
cd frontend
npm install
npm run dev
```
Hệ thống sẽ chạy tại địa chỉ: `http://localhost:3000`

---

## 📖 Sơ đồ Tính năng Chính

1.  **POS (`/pos`):** 
    - Đặt hàng món nước, đồ ăn và Topping lẻ.
    - Điều chỉnh số lượng Topping linh hoạt (Double/Triple Topping).
    - Áp mã Voucher ưu đãi nội bộ.
2.  **Dashboard (`/dashboard`):**
    - Theo dõi Doanh thu Gross, Chiết khấu, và Doanh thu Net (Thực thu).
    - Biểu đồ "Revenue Flow" và "Top Trending" sản phẩm theo ngày.
3.  **Lịch sử Đơn hàng (`/orders`):**
    - Xem chi tiết từng món hàng, topping và phương thức thanh toán.
4.  **E-Voucher (`/vouchers`):**
    - Tạo và kiểm tra mã giảm giá nhân viên.

---

## ☁️ Hướng Dẫn Triển Khai (Production)

### Backend (Deploy lên Render/DigitalOcean/Railway):
- Tạo Application mới và kết nối với Git Repository.
- Cấu hình Environment Variables (DATABASE_URL).
- Build Command: `npm run build`
- Start Command: `npm run start:prod`

### Frontend (Deploy lên Vercel/Netlify):
- Đảm bảo biến `NEXT_PUBLIC_API_URL` trỏ về địa chỉ Backend Production.
- Build Command: `npm run build`
- Start Command: `next start`

---
**Dự án được bàn giao bởi Antigravity AI.**
