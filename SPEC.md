# ĐẶC TẢ PHẦN MỀM - iPOS (Tony Coffee & Tea POS System)

---

## 1. TỔNG QUAN DỰ ÁN

| Thông tin | Chi tiết |
|-----------|-----------|
| **Tên phần mềm** | iPOS - Hệ thống quản lý bán hàng Tony Coffee & Tea |
| **Phiên bản** | 1.0.0 |
| **Loại phần mềm** | SaaS Web Application (POS + Quản lý) |
| **Ngành nghề** | F&B - Cà phê & Trà |
| **Quy mô** | Đa chi nhánh (Multi-branch) |

---

## 2. MÔ TẢ CHỨC NĂNG

### 2.1. Module Bán hàng (POS)
- Giao diện bán hàng trực quan, dễ sử dụng
- Quản lý sản phẩm theo danh mục (Cà phê, Trà, Sinh tố, Topping...)
- Chọn size (M, L, XL) và thêm topping
- Quản lý bàn (Tạo bàn, đặt bàn, kết thúc bàn)
- Thanh toán tiền mặt và chuyển khoản
- In hóa đơn 80mm
- Tính năng giảm giá

### 2.2. Module Quản lý đơn hàng
- Danh sách đơn hàng theo thời gian
- Tìm kiếm đơn hàng
- Xem chi tiết đơn hàng
- In lại hóa đơn

### 2.3. Module Báo cáo & Thống kê (Dashboard)
- Doanh thu theo ngày/tuần/tháng
- Top sản phẩm bán chạy
- Biểu đồ lưu lượng bán theo giờ
- So sánh với kỳ trước
- Tùy chọn khoảng thời gian linh hoạt

### 2.4. Module Quản lý sản phẩm
- Thêm/sửa/xóa sản phẩm
- Quản lý danh mục
- Quản lý biến thể (size) và giá
- Quản lý topping

### 2.5. Module Quản lý nguyên liệu (Materials)
- Thêm/sửa/xóa nguyên liệu
- Tồn kho hiện tại
- Tồn kho an toàn (Safety Stock) - Đề xuất đặt hàng
- Biến động kho (Nhập/Xuất/Điều chỉnh)
- Báo cáo tồn kho chi tiết

### 2.6. Module Quản lý công thức (Recipes)
- Định lượng nguyên liệu cho từng sản phẩm
- Tự động trừ nguyên liệu khi bán hàng (BOM)
- Quản lý công thức topping

### 2.7. Module Quản lý bàn
- Tạo bàn đơn hoặc hàng loạt
- Đặt bàn, mở bàn, kết thúc bàn
- Chuyển bàn

### 2.8. Module Quản lý chi nhánh
- Thêm/sửa/xóa chi nhánh
- Thông tin chi nhánh (địa chỉ, điện thoại)

### 2.9. Module Quản lý tài khoản
- Phân quyền: Admin, Manager, Staff
- Quản lý tài khoản nhân viên

---

## 3. THÔNG SỐ KỸ THUẬT

### 3.1. Công nghệ sử dụng

| Thành phần | Công nghệ |
|------------|-----------|
| **Frontend** | Next.js 14 (React), TypeScript |
| **Backend** | NestJS (Node.js), TypeScript |
| **Database** | PostgreSQL (Supabase) |
| **Authentication** | JWT |
| **UI Components** | React Icons, Chart.js |
| **Deployment** | Vercel |

### 3.2. Kiến trúc hệ thống
- RESTful API
- Serverless Functions (Vercel)
- Single Page Application (SPA)
- Prisma ORM

---

## 4. PHÂN BỔ CHI PHÍ PHÁT TRIỂN

### Tổng chi phí: **6.000.000 VNĐ**

| STT | Mục chi phí | Mô tả | Chi phí (VNĐ) |
|-----|-------------|-------|---------------|
| **1** | **Thiết kế UI/UX** | Giao diện POS, Dashboard, Admin | **800.000** |
| | - Thiết kế layout & component | | 400.000 |
| | - Color scheme & branding | | 200.000 |
| | - UX flow cho POS bán hàng | | 200.000 |
| **2** | **Backend Development** | API, Database, Business Logic | **1.500.000** |
| | - Thiết kế database schema | | 300.000 |
| | - Authentication & Authorization | | 250.000 |
| | - CRUD API (Products, Orders, Materials...) | | 400.000 |
| | - BOM - Tự động trừ nguyên liệu | | 300.000 |
| | - Dashboard stats & reporting | | 250.000 |
| **3** | **Frontend Development** | POS, Admin Dashboard, Pages | **1.400.000** |
| | - POS bán hàng (main page) | | 400.000 |
| | - Dashboard & Charts | | 300.000 |
| | - Quản lý sản phẩm/nguyên liệu | | 250.000 |
| | - Quản lý bàn/đơn hàng/chi nhánh | | 250.000 |
| | - Auth pages (Login) | | 100.000 |
| | - Responsive design | | 100.000 |
| **4** | **Tích hợp & Testing** | Tích hợp API, Unit tests | **600.000** |
| | - Tích hợp frontend-backend | | 200.000 |
| | - Testing & bug fixing | | 250.000 |
| | - Mobile responsive testing | | 150.000 |
| **5** | **Triển khai & Cấu hình** | Deployment, CI/CD | **400.000** |
| | - Vercel deployment setup | | 150.000 |
| | - Database setup (Supabase) | | 100.000 |
| | - Environment config | | 100.000 |
| | - CI/CD pipeline | | 50.000 |
| **6** | **Tài liệu & Training** | Docs, User guide | **400.000** |
| | - API Documentation (Swagger) | | 100.000 |
| | - User manual | | 150.000 |
| | - Admin guide | | 100.000 |
| | - Training video script | | 50.000 |
| **7** | **Bug fixing & Bảo trì** | 3 tháng bảo trì miễn phí | **400.000** |
| | - Fix bugs reported | | 200.000 |
| | - Performance optimization | | 100.000 |
| | - Security updates | | 100.000 |
| **8** | **Quản lý dự án** | PM, Communication | **500.000** |
| | - Project planning | | 150.000 |
| | - Progress tracking | | 150.000 |
| | - Client communication | | 200.000 |
| | **TỔNG CỘNG** | | **6.000.000** |

---

## 5. CHI PHÍ NGOÀI (KHÔNG BAO GỒM)

| Mục | Chi phí ước tính | Ghi chú |
|-----|-----------------|---------|
| **Domain** | ~300.000 VNĐ/năm | tonycoffee.vn |
| **Hosting (Vercel)** | Miễn phí - $25/tháng | Tùy lượng truy cập |
| **Database (Supabase)** | Miễn phí - $25/tháng | Tùy dung lượng |
| **SSL Certificate** | Miễn phí | qua Vercel |

---

## 6. THỜI GIAN PHÁT TRIỂN

| Giai đoạn | Thời gian | Mô tả |
|-----------|-----------|-------|
| Planning | 1 tuần | Requirements, specs |
| Backend | 2-3 tuần | API, Database |
| Frontend | 2-3 tuần | UI, Integration |
| Testing | 1 tuần | QA, Bug fixes |
| Deploy | 1 tuần | Production setup |
| **Tổng** | **7-9 tuần** | |

---

## 7. BẢO HÀNH & HỖ TRỢ

- **Bảo hành**: 3 tháng miễn phí (bao gồm bug fixes)
- **Hỗ trợ kỹ thuật**: Qua Zalo/SĐT trong giờ hành chính
- **Cập nhật**: Miễn phí trong thời gian bảo hành

---

## 8. CAM KẾT

- ✓ Code sạch, có comment
- ✓ API đầy đủ documentation (Swagger)
- ✓ Responsive trên mọi thiết bị
- ✓ Bảo mật JWT
- ✓ Backup data định kỳ

---

**Ngày lập**: Tháng 4/2026  
**Người lập**: Development Team  
**Giá trị hợp đồng**: 6.000.000 VNĐ