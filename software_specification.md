# TÀI LIỆU ĐẶC TẢ CHI TIẾT CHỨC NĂNG (SOFTWARE SPECIFICATION)
**Dự án: Hệ thống quản lý bán hàng Tony Coffee & Tea iPOS**

---

## 1. TỔNG QUAN HỆ THỐNG
Hệ thống iPOS được thiết kế để quản lý chuỗi cửa hàng cà phê và trà, hỗ trợ vận hành từ khâu bán hàng (POS) đến quản lý kho (Materials), công thức (Recipes), tài chính (Dashboard) và nhân sự (Employees). Hệ thống phân quyền chặt chẽ giữa 3 nhóm: **ADMIN**, **MANAGER**, và **STAFF**.

---

## 2. PHÂN HỆ QUẢN TRỊ VIÊN (ADMIN)
Admin có quyền cao nhất, quản lý toàn bộ hệ thống và tất cả các chi nhánh.

### 2.1. Quản lý Chi nhánh (Branches)
*   **Mô tả**: Thiết lập và cấu hình các điểm bán hàng trong chuỗi.
*   **Chức năng chi tiết**:
    *   Xem danh sách tất cả chi nhánh.
    *   Thêm mới chi nhánh (Tên, địa chỉ, số điện thoại).
    *   Chỉnh sửa thông tin chi nhánh hiện có.
    *   Xóa chi nhánh (chỉ khi không còn dữ liệu ràng buộc).

### 2.2. Quản lý Tài khoản (Accounts/Employees)
*   **Mô tả**: Quản lý định danh và quyền truy cập của nhân viên trên toàn hệ thống.
*   **Chức năng chi tiết**:
    *   Tạo tài khoản mới: Chỉ định Tên, Username, Mật khẩu, Chức vụ, Vai trò (ADMIN, MANAGER, STAFF) và Chi nhánh trực thuộc.
    *   Cập nhật thông tin: Đổi mật khẩu, thay đổi vai trò hoặc chuyển chi nhánh cho nhân viên.
    *   Xóa tài khoản nhân viên.

### 2.3. Báo cáo Thống kê Tổng thể (Stats/Dashboard)
*   **Mô tả**: Theo dõi hiệu quả kinh doanh của toàn bộ chuỗi hoặc từng chi nhánh cụ thể.
*   **Chức năng chi tiết**:
    *   **Bộ lọc**: Lọc dữ liệu theo Chi nhánh và Khoảng thời gian (Ngày, Tuần, Tháng, Tùy chỉnh).
    *   **Chỉ số chính**: Tổng đơn hàng, Tổng doanh thu, Tổng giảm giá, Doanh thu thuần.
    *   **Biểu đồ Doanh thu**: Trực quan hóa doanh thu theo ngày trong khoảng thời gian chọn.
    *   **Biểu đồ Sản phẩm Bán chạy**: Top 5 sản phẩm có số lượng bán ra cao nhất.
    *   **Phân tích Giờ cao điểm**: Biểu đồ số lượng sản phẩm và topping bán ra theo từng khung giờ trong ngày (00:00 - 23:00).

### 2.4. Quản lý Hệ thống (System CMS)
*   **Mô tả**: Admin không trực tiếp bán hàng trên giao diện POS mà sử dụng giao diện CMS để giám sát.
*   **Chức năng**: Chặn quyền đặt đơn của Admin trên giao diện POS, điều hướng Admin về trang Dashboard Quản trị.

---

## 3. PHÂN HỆ QUẢN LÝ CHI NHÁNH (MANAGER)
Manager có quyền quản lý mọi hoạt động trong phạm vi chi nhánh được chỉ định.

### 3.1. Quản lý Sản phẩm & Menu (Products)
*   **Mô tả**: Cấu hình danh mục sản phẩm kinh doanh tại cửa hàng.
*   **Chức năng chi tiết**:
    *   Tạo sản phẩm: Tên (Vi/En), Danh mục, Giá cơ bản.
    *   Quản lý Size (Variants): Thiết lập các kích cỡ khác nhau (S, M, L) với giá tương ứng.
    *   Quản lý Topping: Tạo danh sách topping đi kèm sản phẩm.
    *   Bật/Tắt trạng thái kinh doanh: Tự động hoặc thủ công ẩn sản phẩm khi hết hàng.

### 3.2. Quản lý Nguyên vật liệu (Materials)
*   **Mô tả**: Quản lý kho nguyên liệu thô phục vụ chế biến.
*   **Chức năng chi tiết**:
    *   Danh mục nguyên liệu: Tên, Đơn vị tính (kg, ml, túi...), Đơn giá nhập.
    *   Nhập/Xuất kho: Cập nhật số lượng tồn kho thực tế.
    *   Báo cáo tồn kho: Xem lượng tồn kho hiện tại và giá trị kho.
    *   Nhập liệu hàng loạt: Hỗ trợ Import/Export dữ liệu qua file Excel.

### 3.3. Định mức Công thức (Recipes/BOM)
*   **Mô tả**: Kết nối Sản phẩm với Nguyên vật liệu thông qua định mức tiêu hao.
*   **Chức năng chi tiết**:
    *   Thiết lập công thức sản phẩm: 1 ly Cà phê sữa (Size M) tốn bao nhiêu gram bột cà phê, bao nhiêu ml sữa đặc.
    *   Thiết lập công thức topping: 1 phần Trân châu tốn bao nhiêu bột năng.
    *   **Tự động trừ kho**: Khi hoàn tất đơn hàng, hệ thống tự động trừ tồn kho nguyên liệu dựa trên định mức đã cấu hình.

### 3.4. Quản lý Sơ đồ Bàn (Tables)
*   **Mô tả**: Quản lý không gian phục vụ tại chỗ.
*   **Chức năng chi tiết**:
    *   Thiết lập bàn: Thêm mới bàn, đánh số bàn theo khu vực.
    *   Trạng thái bàn: Theo dõi thời gian thực bàn nào đang Trống (Available) hoặc đang có khách (Occupied).
    *   Mở bàn/Thanh toán: Tương tác trực tiếp để kích hoạt quy trình gọi món cho khách tại bàn.

### 3.5. Lịch sử Đơn hàng (Order History)
*   **Mô tả**: Truy xuất và kiểm tra dữ liệu bán hàng của chi nhánh.
*   **Chức năng chi tiết**:
    *   Tìm kiếm đơn hàng: Theo mã đơn, thời gian hoặc phương thức thanh toán.
    *   Xem chi tiết đơn: Thông tin món, topping, giảm giá và người thực hiện.
    *   **In lại hóa đơn (Reprint)**: Hỗ trợ in lại bill khi khách có yêu cầu (Hệ thống tự động tăng biến `print_count` để quản lý gian lận).
    *   Cấu hình hiển thị: Manager có thể ẩn/hiện các cột thông tin trong bảng lịch sử để tối ưu tầm nhìn.

---

## 4. MA TRẬN PHÂN QUYỀN (ACCESS CONTROL MATRIX)

| Tính năng | Admin | Manager | Staff |
| :--- | :---: | :---: | :---: |
| Báo cáo (Tất cả chi nhánh) | V | X | X |
| Báo cáo (Chi nhánh mình) | V | V | X |
| Quản lý Chi nhánh | V | X | X |
| Quản lý Tài khoản | V | X | X |
| Quản lý Sản phẩm | V | V | X |
| Quản lý Nguyên vật liệu | V | V | X |
| Quản lý Công thức | V | V | X |
| Quản lý Bàn | V | V | V |
| Bán hàng (POS) | X | V | V |
| Lịch sử đơn hàng | V | V | V |
| In lại hóa đơn | V | V | V |

---

## 5. ĐẶC ĐIỂM KỸ THUẬT NỔI BẬT
1.  **Giao diện Mobile-Responsive**: Tối ưu hóa hoàn toàn cho thiết bị di động với menu điều hướng thông minh.
2.  **Thời gian thực (Real-time)**: Trạng thái bàn và món ăn được cập nhật tức thì.
3.  **Hệ thống trừ kho tự động**: Chính xác đến từng gram nguyên liệu thông qua định mức BOM.
4.  **In hóa đơn linh hoạt**: Hỗ trợ template in nhiệt 80mm với mã VietQR tự động theo số tiền đơn hàng.
