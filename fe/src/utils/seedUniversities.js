// Utility để tạo Universities mặc định
// Chạy function này trong browser console hoặc thêm vào component để seed data

export const seedUniversities = async () => {
  const universities = [
    {
      name: "Đại học Quốc gia Hà Nội",
      address: "144 Xuân Thủy, Cầu Giấy, Hà Nội",
      contact_info: "Tel: 024-3754-7000 | Email: dhqghn@vnu.edu.vn",
    },
    {
      name: "Đại học Bách khoa Hà Nội",
      address: "1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
      contact_info: "Tel: 024-3868-3008 | Email: dhbk@hust.edu.vn",
    },
    {
      name: "Đại học Kinh tế Quốc dân",
      address: "207 Giải Phóng, Đồng Tâm, Hai Bà Trưng, Hà Nội",
      contact_info: "Tel: 024-3974-4143 | Email: neu@neu.edu.vn",
    },
    {
      name: "Đại học Ngoại thương",
      address: "91 Chùa Láng, Đống Đa, Hà Nội",
      contact_info: "Tel: 024-3834-2288 | Email: ftu@ftu.edu.vn",
    },
    {
      name: "Đại học Y Hà Nội",
      address: "1 Tôn Thất Tùng, Đống Đa, Hà Nội",
      contact_info: "Tel: 024-3852-3798 | Email: dhyhn@hmu.edu.vn",
    },
    {
      name: "Đại học Sư phạm Hà Nội",
      address: "136 Xuân Thủy, Cầu Giấy, Hà Nội",
      contact_info: "Tel: 024-3754-4334 | Email: hnue@hnue.edu.vn",
    },
    {
      name: "Đại học Luật Hà Nội",
      address: "Km 9 Nguyễn Trãi, Thanh Xuân, Hà Nội",
      contact_info: "Tel: 024-3854-0054 | Email: hlu@hlu.edu.vn",
    },
    {
      name: "Đại học Khoa học Tự nhiên",
      address: "334 Nguyễn Trãi, Thanh Xuân, Hà Nội",
      contact_info: "Tel: 024-3553-8167 | Email: hus@vnu.edu.vn",
    },
    {
      name: "Đại học Xây dựng",
      address: "55 Giải Phóng, Hai Bà Trưng, Hà Nội",
      contact_info: "Tel: 024-3869-4270 | Email: nuce@nuce.edu.vn",
    },
    {
      name: "Đại học Thương mại",
      address: "79 Hồ Tùng Mậu, Mai Dịch, Cầu Giấy, Hà Nội",
      contact_info: "Tel: 024-3755-2004 | Email: tmu@tmu.edu.vn",
    },
    {
      name: "Đại học Quốc gia TP.HCM",
      address: "Khu phố 6, Linh Trung, Thủ Đức, TP.HCM",
      contact_info: "Tel: 028-3725-4242 | Email: vnuhcm@vnuhcm.edu.vn",
    },
    {
      name: "Đại học Bách khoa TP.HCM",
      address: "268 Lý Thường Kiệt, Quận 10, TP.HCM",
      contact_info: "Tel: 028-3865-4161 | Email: hcmut@hcmut.edu.vn",
    },
    {
      name: "Đại học Kinh tế TP.HCM",
      address: "59C Nguyễn Đình Chiểu, Quận 3, TP.HCM",
      contact_info: "Tel: 028-3930-0307 | Email: ueh@ueh.edu.vn",
    },
    {
      name: "Đại học Y Dược TP.HCM",
      address: "217 Hồng Bàng, Quận 5, TP.HCM",
      contact_info: "Tel: 028-3855-4269 | Email: ump@ump.edu.vn",
    },
    {
      name: "Đại học Sư phạm TP.HCM",
      address: "280 An Dương Vương, Quận 5, TP.HCM",
      contact_info: "Tel: 028-3835-1271 | Email: hcmue@hcmue.edu.vn",
    },
  ];

  try {
    let successCount = 0;
    let errors = [];

    for (const university of universities) {
      try {
        const response = await fetch("/api/university", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(university),
        });

        if (response.ok) {
          successCount++;
          console.log(`✅ Đã tạo: ${university.name}`);
        } else {
          const error = await response.text();
          errors.push(`❌ Lỗi tạo ${university.name}: ${error}`);
        }
      } catch (error) {
        errors.push(`❌ Lỗi tạo ${university.name}: ${error.message}`);
      }
    }

    console.log(
      `\n🎉 Hoàn thành! Đã tạo ${successCount}/${universities.length} trường`
    );
    if (errors.length > 0) {
      console.log("\n❌ Lỗi:");
      errors.forEach((error) => console.log(error));
    }

    return { successCount, errors };
  } catch (error) {
    console.error("Lỗi seed universities:", error);
    return { successCount: 0, errors: [error.message] };
  }
};
