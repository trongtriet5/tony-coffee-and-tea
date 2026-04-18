# iPOS Multi-Branch & BOM Implementation Summary

Hệ thống iPOS đã được nâng cấp toàn diện sang kiến trúc Đa chi nhánh (Multi-branch) và tích hợp công cụ quản lý giá vốn (COGS) dựa trên định mức nguyên liệu (BOM).

## 1. Công nghệ & Kiến trúc
- **Database**: Refactor Schema Prisma để hỗ trợ `Branch` làm thực thể gốc. Mọi dữ liệu (`Order`, `Table`, `Material`, `Employee`) đều được liên kết với `branch_id`.
- **BOM Engine**: Triển khai logic tự động khấu trừ kho dựa trên `ProductRecipe` (theo size sản phẩm) và `ToppingRecipe`.
- **Prisma 7**: Cấu hình chuẩn hóa để tương thích với phiên bản Prisma mới nhất, tối ưu hóa kết nối Database.

## 2. Các tính năng cốt lõi đã hoàn thiện
### Quản lý Đơn hàng & POS
- **Chọn Size (S/M/L)**: Giao diện POS mới cho phép chọn kích cỡ ly trước khi chọn Topping. Giá tiền được cập nhật động theo từng biến thể.
- **Giao diện Đa chi nhánh**: Thêm bộ chọn Chi nhánh (Branch Selector) tại tiêu đề trang POS. Đơn hàng sẽ được tự động gán cho chi nhánh đã chọn.
- **Gọi thêm món**: Khôi phục và tối ưu tính năng thêm món vào bàn đang sử dụng (Dine-in), đảm bảo trừ kho BOM chính xác cho các mục gọi thêm.

### Quản lý Kho & Nguyên vật liệu
- **Cập nhật tồn kho thủ công**: Sửa lỗi đồng bộ dữ liệu. Khi cập nhật `stock_current` thủ công, hệ thống tự động tạo giao dịch `ADJUST` để kiểm soát lịch sử biến động.
- **Tính toán COGS**: Cung cấp hàm tính giá vốn ly nước dựa trên đơn giá và khối lượng nguyên liệu sử dụng (ví dụ: 50g cafe từ gói 1kg).
- **Import/Export Menu**: Bổ sung API cho phép xuất/nhập danh sách sản phẩm và topping hàng loạt qua định dạng JSON.

### Dọn dẹp hệ thống
- **Xóa module Voucher**: Loại bỏ hoàn toàn mã nguồn liên quan đến E-Voucher ở cả Backend và Frontend để tối giản hệ thống theo yêu cầu.
- **Xóa Staff-Portal**: Gỡ bỏ các giao diện và Service không còn sử dụng.

## 3. Hướng dẫn kiểm tra nhanh
1. **Kiểm tra kho**: Vào mục Materials, cập nhật số lượng tồn kho. Kiểm tra tab "Transactions" để thấy loại `ADJUST`.
2. **Kiểm tra Order**: Tạo đơn hàng tại POS (chọn size và topping). Vào Backend DB hoặc log để xác nhận nguyên liệu đã được trừ theo loại `USED`.
3. **Kiểm tra Multi-branch**: Đăng nhập hoặc chọn chi nhánh khác nhau trên POS và kiểm tra tính biệt lập của danh sách Bàn & Đơn hàng.

> [!IMPORTANT]
> Mọi thay đổi về Database đã được đồng bộ bằng `npx prisma db push`. Vui lòng chạy `npm run dev` để khởi động lại hệ thống với các cập nhật mới nhất.
