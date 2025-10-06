# 🎯 QR Check-in Workflow Guide

## 📋 Tổng quan

Hệ thống điểm danh QR cho phép student tự động check-in bằng cách quét mã QR mà organizer tạo ra cho từng phiên học.

## 🔄 Workflow hoàn chỉnh

### 👨‍🏫 Organizer (Người tạo QR)

1. **Đăng nhập** với tài khoản organizer
2. **Vào EventSessions** → Chọn sự kiện → Xem danh sách phiên
3. **Tạo QR** cho phiên cần điểm danh:
   - Nhấn nút "Generate QR" ở phiên cần điểm danh
   - QR code sẽ chứa URL với thông tin phiên
4. **Hiển thị QR** cho students quét (có thể in hoặc hiển thị trên màn hình)

### 👨‍🎓 Student (Người quét QR)

1. **Đăng nhập** với tài khoản sinh viên trước khi quét QR
   - ⚠️ **QUAN TRỌNG**: Phải đăng nhập trước để hệ thống biết ai đang check-in
2. **Quét QR Code**:
   - Mở app/website trên điện thoại
   - Nhấn "Mở máy quét QR" hoặc quét trực tiếp
3. **Tự động check-in**:
   - Sau khi quét QR, hệ thống tự động chuyển đến trang check-in
   - Thông tin phiên được điền sẵn từ QR
   - Hệ thống tự động thực hiện check-in cho student đã đăng nhập

## 🔧 Chi tiết kỹ thuật

### QR Code chứa gì?

```
URL: http://192.168.137.1:5173/checkin?
- sessionId=123
- eventId=456
- sessionTitle=Buổi học sáng
- eventTitle=Lập trình React
- startTime=2025-10-06T08:00:00
- endTime=2025-10-06T10:00:00
- location=Phòng A101
- autoTrigger=true
```

### Quá trình xử lý tự động:

1. Student quét QR → Mở URL
2. CheckIn.jsx đọc URL parameters
3. Kiểm tra `autoTrigger=true` → Tự động xử lý
4. Lấy thông tin student từ `useAuth()` (đã đăng nhập)
5. Gọi API check-in với:
   - `SessionId` từ QR
   - `StudentId` từ user đã đăng nhập
   - `CheckInTime` hiện tại

## 🔒 Bảo mật & Xác thực

### Tại sao phải đăng nhập?

- **QR code chỉ chứa thông tin phiên**, không chứa thông tin student
- **Student phải đăng nhập** để hệ thống biết ai đang check-in
- **Ngăn chặn gian lận**: Không thể check-in thay người khác

### Validation được thực hiện:

1. ✅ Kiểm tra user đã đăng nhập
2. ✅ Kiểm tra role = "student"
3. ✅ Kiểm tra studentId tồn tại
4. ✅ Lấy studentCode từ API Student
5. ✅ Thực hiện check-in với thông tin chính xác

## 📱 Mobile Setup (Cho test)

### Để test trên điện thoại:

1. **Setup Windows Mobile Hotspot**:
   - Settings → Mobile hotspot → Turn on
2. **Kết nối điện thoại** với hotspot
3. **Truy cập**: `http://192.168.137.1:5173`
4. **Đăng nhập** với tài khoản student
5. **Quét QR** từ organizer

## 🎯 Ví dụ thực tế

```
Tình huống: Buổi học React lúc 8h sáng

1. Organizer:
   - Vào EventSessions → "Khóa học React"
   - Chọn phiên "Buổi 1 - Giới thiệu React"
   - Nhấn "Generate QR"
   - Hiển thị QR trên màn hình lớp

2. Student (Nguyễn Văn A):
   - Mở http://192.168.137.1:5173 trên điện thoại
   - Đăng nhập với tài khoản sinh viên
   - Quét QR từ màn hình
   - Hệ thống tự động check-in cho Nguyễn Văn A vào "Buổi 1"

3. Kết quả:
   - Database ghi nhận: StudentId=A, SessionId=Buoi1, CheckInTime=8:05AM
   - Student nhận thông báo "Điểm danh thành công!"
```

## ⚠️ Lưu ý quan trọng

1. **Student PHẢI đăng nhập trước** khi quét QR
2. **Organizer tạo QR cho từng phiên riêng biệt**
3. **Mỗi QR chỉ dành cho 1 phiên cụ thể**
4. **Network**: Đảm bảo mobile có thể truy cập server (hotspot/ngrok)
5. **Time validation**: Có thể có giới hạn thời gian check-in

## 🚀 Next Steps

- [ ] Test workflow hoàn chỉnh với mobile
- [ ] Thêm time validation cho check-in
- [ ] Hiển thị danh sách students đã check-in
- [ ] Add QR expiration time
- [ ] Support offline QR scanning
