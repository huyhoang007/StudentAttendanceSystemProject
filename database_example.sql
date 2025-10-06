-- VÍ DỤ DỮ LIỆU THỰC TẾ

-- Bảng University
INSERT INTO "University" (university_id, name) VALUES 
('uuid-bk', 'Đại học Bách khoa Hà Nội'),
('uuid-kt', 'Đại học Kinh tế Quốc dân'),
('uuid-y', 'Đại học Y Hà Nội');

-- Bảng Student (có university_id tham chiếu)
INSERT INTO "Student" (student_id, name, student_code, university_id) VALUES 
('std-1', 'Nguyễn Văn A', 'BK001', 'uuid-bk'),  -- Sinh viên Bách khoa
('std-2', 'Trần Thị B', 'KT001', 'uuid-kt'),     -- Sinh viên Kinh tế  
('std-3', 'Lê Văn C', 'Y001', 'uuid-y');         -- Sinh viên Y

-- Bảng Event (có thể có organizer_id từ trường cụ thể)
INSERT INTO "Event" (event_id, title, organizer_id) VALUES 
('evt-1', 'Hội thảo AI', 'org-bk'),           -- Sự kiện của Bách khoa
('evt-2', 'Workshop Kinh doanh', 'org-kt'),   -- Sự kiện của Kinh tế
('evt-3', 'Hội nghị Y học', 'org-y');         -- Sự kiện của Y

-- KẾT QUẢ: Mỗi sinh viên chỉ thấy sự kiện của trường mình
-- Nguyễn Văn A (Bách khoa) → Chỉ thấy "Hội thảo AI"
-- Trần Thị B (Kinh tế) → Chỉ thấy "Workshop Kinh doanh"  
-- Lê Văn C (Y) → Chỉ thấy "Hội nghị Y học"