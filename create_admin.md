# Tạo tài khoản Admin đầu tiên

## Bước 1: Tạo User trước

```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@nvhsv.edu.vn",
  "password": "Admin@123456",
  "role": "admin"
}
```

## Bước 2: Lấy UserId từ response của bước 1, sau đó tạo Admin

```bash
POST http://localhost:5000/api/admins
Content-Type: application/json
Authorization: Bearer <your_token>

{
  "userId": "<user_id_from_step_1>",
  "adminName": "Admin Trung tâm NVH SV",
  "department": "Trung tâm Nuôi dưỡng Học sinh - Sinh viên ĐHQG",
  "phone": "0123456789"
}
```

## Thông tin đăng nhập Admin:

- **Email:** admin@nvhsv.edu.vn (SỬ DỤNG EMAIL ĐỂ ĐĂNG NHẬP)
- **Password:** Admin@123456
- **Role:** admin

## Test API với Postman/Thunder Client:

1. Register user với role="admin"
2. Login bằng EMAIL và password để lấy token
3. Tạo admin profile với UserId
