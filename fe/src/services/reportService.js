import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const THIN_BORDER = {
  style: "thin",
  color: { argb: "FFE2E8F0" },
};

const toDateDisplay = (dateKey) => {
  if (!dateKey) {
    return "Không giới hạn";
  }
  const [year, month, day] = String(dateKey).split("-");
  if (!year || !month || !day) {
    return "Không giới hạn";
  }
  return `${day}/${month}/${year}`;
};


const sanitizeText = (value) => {
  if (value === undefined || value === null) {
    return "";
  }
  return String(value).replace(/\s+/g, " ").trim();
};

const stripDiacritics = (value) => {
  return sanitizeText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
};

const buildFileName = (prefix, universityName, filters, extension) => {
  const safeUniversity = stripDiacritics(universityName || "tat_ca");
  const safeStart = filters?.startDate ? String(filters.startDate).replace(/-/g, "") : "00000000";
  const safeEnd = filters?.endDate ? String(filters.endDate).replace(/-/g, "") : "00000000";
  return `${prefix}_${safeUniversity}_${safeStart}_${safeEnd}.${extension}`;
};

const applyRowStyle = (row, { bold = false, fill } = {}) => {
  row.font = { name: "Calibri", size: 11, bold };
  row.alignment = { vertical: "middle", wrapText: true };
  row.eachCell((cell) => {
    cell.border = {
      top: THIN_BORDER,
      bottom: THIN_BORDER,
      left: THIN_BORDER,
      right: THIN_BORDER,
    };
    if (fill) {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: fill },
      };
    }
  });
};

const autoFitColumns = (worksheet) => {
  worksheet.columns?.forEach((column) => {
    let maxLength = 12;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const cellValue = sanitizeText(cell.value);
      maxLength = Math.max(maxLength, cellValue.length + 2);
    });
    column.width = Math.min(maxLength, 60);
  });
};

const buildSummaryRows = (analytics) => [
  ["Tổng số lượt check-in", analytics.totalCheckIns ?? 0],
  ["Số sinh viên đã check-in (unique)", analytics.uniqueStudents ?? 0],
  ["Tổng số sự kiện", analytics.uniqueEvents ?? 0],
];

const buildMethodRows = (methodBreakdown) => [
  ["QR Code", methodBreakdown.qr ?? 0],
  ["Thủ công", methodBreakdown.manual ?? 0],
];

const mapEventSummaryRows = (eventSummaries) => {
  return eventSummaries.map((event) => [
    sanitizeText(event.title),
    toDateDisplay(event.startDate),
    toDateDisplay(event.endDate),
    event.totalCheckIns ?? 0,
    event.uniqueStudents ?? 0,
    event.qrCount ?? 0,
    event.manualCount ?? 0,
  ]);
};

export const exportExcel = async (context) => {
  const {
    filters,
    universityName,
    eventName,
    analytics,
    methodBreakdown,
    eventSummaries = [],
    detailRows = [],
    generatedAt = new Date(),
    noteWhenEmpty = "Không có dữ liệu phù hợp với bộ lọc hiện tại.",
    includeEventSummary = false,
  } = context || {};

  if (!filters || !universityName || !analytics || !methodBreakdown) {
    throw new Error("Thiếu dữ liệu hoặc bộ lọc để xuất Excel.");
  }

  const workbook = new ExcelJS.Workbook();
  workbook.created = generatedAt;
  workbook.modified = generatedAt;
  workbook.creator = "Student Attendance System";

  const overviewSheet = workbook.addWorksheet("Tong quan", {
    properties: { tabColor: { argb: "FF7C3AED" } },
  });

  const headerLines = [
    `Thời gian: từ ${toDateDisplay(filters.startDate)} đến ${toDateDisplay(filters.endDate)}`,
    `Trường đại học: ${sanitizeText(universityName)}`,
    `Sự kiện: ${sanitizeText(eventName || "Tất cả sự kiện của trường")}`,
  ];

  headerLines.forEach((line) => {
    const row = overviewSheet.addRow([line]);
    applyRowStyle(row, { bold: true });
  });

  overviewSheet.addRow([]);

  const summaryHeader = overviewSheet.addRow(["Chỉ số", "Giá trị"]);
  applyRowStyle(summaryHeader, { bold: true, fill: "FFEDE9FE" });
  buildSummaryRows(analytics).forEach((summary) => {
    const row = overviewSheet.addRow(summary);
    applyRowStyle(row);
  });

  overviewSheet.addRow([]);

  const methodHeader = overviewSheet.addRow(["Phương thức", "Số lượt"]);
  applyRowStyle(methodHeader, { bold: true, fill: "FFEDE9FE" });
  buildMethodRows(methodBreakdown).forEach((methodRow) => {
    const row = overviewSheet.addRow(methodRow);
    applyRowStyle(row);
  });

  if (includeEventSummary) {
    overviewSheet.addRow([]);
    const eventHeader = overviewSheet.addRow([
      "Sự kiện",
      "Bắt đầu",
      "Kết thúc",
      "Tổng check-in",
      "Sinh viên",
      "QR",
      "Thủ công",
    ]);
    applyRowStyle(eventHeader, { bold: true, fill: "FFEDE9FE" });

    const eventRows = mapEventSummaryRows(eventSummaries);
    if (!eventRows.length) {
      const row = overviewSheet.addRow([noteWhenEmpty]);
      applyRowStyle(row);
      overviewSheet.mergeCells(row.number, 1, row.number, 7);
    } else {
      eventRows.forEach((eventRow) => {
        const row = overviewSheet.addRow(eventRow);
        applyRowStyle(row);
      });
    }
  }

  autoFitColumns(overviewSheet);

  const detailSheet = workbook.addWorksheet("Chi tiet check-in");
  const detailColumns = [
    { header: "Sự kiện", key: "eventName", width: 32 },
    { header: "Sinh viên", key: "studentName", width: 28 },
    { header: "Mã sinh viên", key: "studentCode", width: 18 },
    { header: "Thời gian", key: "checkedAt", width: 24 },
    { header: "Phương thức", key: "method", width: 16 },
    { header: "Trạng thái", key: "status", width: 16 },
  ];

  detailSheet.columns = detailColumns;

  applyRowStyle(detailSheet.getRow(1), {
    bold: true,
    fill: "FFEDE9FE",
  });

  if (!detailRows.length) {
    const row = detailSheet.addRow([noteWhenEmpty]);
    applyRowStyle(row);
    detailSheet.mergeCells(row.number, 1, row.number, detailColumns.length);
    row.getCell(1).alignment = {
      horizontal: "left",
      vertical: "middle",
      wrapText: true,
    };
  } else {
    detailRows.forEach((detail) => {
      const row = detailSheet.addRow([
        sanitizeText(detail.eventName),
        sanitizeText(detail.studentName),
        sanitizeText(detail.studentCode),
        sanitizeText(detail.checkedAt),
        sanitizeText(detail.method),
        sanitizeText(detail.status),
      ]);
      applyRowStyle(row);
    });
  }

  detailSheet.views = [{ state: "frozen", ySplit: 1 }];
  autoFitColumns(detailSheet);

  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = buildFileName(
    "Report",
    universityName,
    filters,
    "xlsx"
  );
  saveAs(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    fileName
  );
  return fileName;
};
