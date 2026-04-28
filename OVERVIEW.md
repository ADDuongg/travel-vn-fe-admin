# Tổng quan dự án

## Mục đích

Đây là ứng dụng quản trị dành cho nền tảng du lịch Việt Nam: nơi đội ngũ nội bộ xem, chỉnh sửa và vận hành toàn bộ dữ liệu hiển thị cho khách hàng — từ sản phẩm bán (tour, lưu trú) đến nội dung điểm đến, con người, và chất lượng trải nghiệm qua đánh giá. Mỗi màn hình hướng tới việc ra quyết định nhanh, giảm sai sót khi cập nhật, và giữ tính nhất quán giữa nhiều loại dữ liệu liên quan nhau.

## Phạm vi nghiệp vụ (theo từng mảng)

- **Bảng điều khiển & mục yêu thích:** tổng quan công việc và lối tắt tới những nội dung thường dùng.
- **Tour:** quản lý hành trình, chương trình, trạng thái/kiểm kho liên quan, và theo dõi phản hồi từ khách (đánh giá tour).
- **Đặt tour:** xem và xử lý yêu cầu đặt tour theo từng hồ sơ.
- **Tỉnh thành (điểm đến):** dữ liệu địa lý, nội dung giới thiệu, hình ảnh, điểm nổi bật — thường gắn với cách công ty “kể chuyện” từng vùng.
- **Hướng dẫn viên:** hồ sơ, phân công liên quan tới sản phẩm, duy trì chuẩn dịch vụ.
- **Khách sạn & phòng:** thông tin cơ sở lưu trú, loại phòng, tiện nghi, và mối liên hệ với lịch/đơn hàng nếu có.
- **Đặt chỗ (tổng hợp):** cái nhìn thống nhất về giao dịch đặt chỗ (khi tách khỏi tour hoặc theo mô hình tổng hợp).
- **Đánh giá & kiểm duyệt:** lọc, duyệt, hoặc phản hồi đánh giá ở cấp trung tâm và theo từng thực thể (ví dụ tour).
- **Tài khoản người dùng hệ thống:** cấu hình cá nhân và quyền truy cập cơ bản.
- **Vai trò & quyền:** thiết lập ai được vào mục nào, tách bạch công việc giữa các bộ phận.
- **Hệ thống (ngôn ngữ, nhật ký thao tác):** dữ liệu đa ngôn ngữ nếu có, và dấu vết thay đổi phục vụ kiểm soát/điều tra nội bộ.

Mỗi mảng có thể phát triển theo từng giai đoạn; tài liệu này mô tả bản chất công việc và trải nghiệm, không phải bảng kê tính năng chi tiết từng màn hình.

## Đối tượng sử dụng

- Quản lý sản phẩm, vận hành, chăm sóc khách, và cấu hình nội bộ cần một giao diện thống nhất, ưu tiên quy trình hơn “trang trình bày”.
- Các bộ phận khác nhau vẫn cùng làm việc trên một sự thật dữ liệu: cập nhật ở tour hoặc tỉnh thành cần phản ánh kịp trên cách công ty bán hàng.

## Phong cách giao diện & cảm giác sử dụng

- **Nền tảng cảm xúc: ấm, “giấy ngà”, gần với sách báo in hơn là trắng lạnh kiểu bệnh viện.** Màu nền nghiêng về kem ngà, chữ tối nhưng không thuần đen, tạo cảm giác tỉ mỉ và dễ nhìn lâu.
- **Điểm nhấn thương hiệu:** vệt cam-đỏ nổi bật cho hành động chính và liên kết, kèm màu phụ (vàng đồng, xanh lá trầm) cho trạng thái “thành công” hoặc cảnh báo tự nhiên, không lạnh băng.
- **Chữ:** tiêu đề rõ ràng, gọn; phần mô tả dài ưu tiên dễ đọc, khoảng cách dòng hợp lý, tránh tình trạng “dồn chữ” trên bảng lớn.
- **Bố cục:** bảng biểu, form, thẻ (card) có viền rất nhạt, góc bo vừa phải; ưu tiên ánh sáng “nâu ấm” thay vì bóng đen cứng.
- **Tương tác:** hover thường gợi sự sống bằng thay đổi tông màu chữ hướng tới sắc đỏ hồng ấm, thay vì xanh dương sáng kiểu mặc định. Trạng thái lỗi cũng mang sắc hồng-đỏ thân thiện hơn “cờ đỏ cảnh báo”.
- **Mục tiêu tổng thể:** vừa trông chuyên nghiệp, vừa gần gũi — phù hợp ngành du lịch (cảm xúc, câu chuyện) nhưng vẫn là công cụ công sức nội bộ, không cần quá màu mè.

## Vị thế trong hệ sinh thái sản phẩm

Ứng dụng này **không** hướng tới du khách cuối; nó nối với hệ thống phía sau (tích hợp dịch vụ, lưu trữ) để đồng bộ nội dung lên ứng dụng/website mà khách dùng. Tóm lại, đây là “phòng điều khiển” nội dung và nghiệp vụ, giữ chất lượng thông tin thống nhất trước khi công bố.

## Tóm tắt một dòng

**Trung tâm quản lý dữ liệu và vận hành cho một nền tảng du lịch Việt Nam — giao diện theo hướng tối giản ấm, rõ, và chịu trách nhiệm với từng cập nhật tới trải nghiệm khách.**
