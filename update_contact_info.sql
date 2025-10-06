-- Script để cập nhật thông tin liên hệ cho các trường đại học
-- Chạy script này trong PostgreSQL để thêm thông tin liên hệ thực tế

UPDATE "University" 
SET contact_info = 'Tel: 024-3854-0054 | Email: hlu@hlu.edu.vn | Website: www.hlu.edu.vn'
WHERE name LIKE '%Luật Hà Nội%';

UPDATE "University" 
SET contact_info = 'Tel: 028-3865-4161 | Email: hcmut@hcmut.edu.vn | Website: www.hcmut.edu.vn'
WHERE name LIKE '%Bách khoa TP.HCM%' OR name LIKE '%Bách Khoa TP.HCM%';

UPDATE "University" 
SET contact_info = 'Tel: 024-3754-7000 | Email: dhqghn@vnu.edu.vn | Website: www.vnu.edu.vn'
WHERE name LIKE '%Quốc gia Hà Nội%';

UPDATE "University" 
SET contact_info = 'Tel: 024-3974-4143 | Email: neu@neu.edu.vn | Website: www.neu.edu.vn'
WHERE name LIKE '%Kinh tế Quốc dân%';

-- Cập nhật thông tin chung cho các trường chưa có thông tin cụ thể
UPDATE "University" 
SET contact_info = CASE 
    WHEN address LIKE '%Hà Nội%' THEN 'Tel: 024-xxxx-xxxx | Email: info@university.edu.vn'
    WHEN address LIKE '%TP.HCM%' OR address LIKE '%Sài Gòn%' THEN 'Tel: 028-xxxx-xxxx | Email: info@university.edu.vn'
    WHEN address LIKE '%Đà Nẵng%' THEN 'Tel: 0236-xxxx-xxxx | Email: info@university.edu.vn'
    ELSE 'Tel: xxxx-xxxx-xxxx | Email: info@university.edu.vn'
END
WHERE contact_info IS NULL;

-- Kiểm tra kết quả
SELECT name, address, contact_info 
FROM "University" 
ORDER BY name;