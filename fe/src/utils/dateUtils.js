// Date utility functions for handling timezone issues

/**
 * Format date string for datetime-local input field
 * Removes timezone info to treat as local time
 */
export const formatDateTimeLocal = (dateStr) => {
  if (!dateStr) return "";
  try {
    // If dateStr is already in ISO format (YYYY-MM-DDTHH:MM:SS), extract local part
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
      // Remove timezone info and take only local part
      const localPart = dateStr.split('+')[0].split('Z')[0];
      // Return YYYY-MM-DDTHH:MM format for datetime-local input
      return localPart.substring(0, 16); // Takes YYYY-MM-DDTHH:MM
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";

    // Format to YYYY-MM-DDTHH:MM for datetime-local input (using local time)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

/**
 * Format date for display on UI
 * Handles timezone properly by converting from UTC to local time
 */
export const formatDateTimeDisplay = (dateStr) => {
  if (!dateStr) return "Chưa xác định";
  
  try {
    // Parse the datetime string directly (it should include timezone info)
    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) return "Chưa xác định";
    
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Ho_Chi_Minh" // Explicit timezone conversion
    });
  } catch (error) {
    console.error("Error formatting date for display:", error);
    return "Chưa xác định";
  }
};

/**
 * Format datetime for backend submission
 * Adds seconds if not present
 */
export const formatDateTimeForBackend = (dateTimeLocal) => {
  if (!dateTimeLocal) return null;
  // Add seconds to match backend expectation: "2025-10-01T10:43" -> "2025-10-01T10:43:00"
  return dateTimeLocal.includes(":00")
    ? dateTimeLocal
    : dateTimeLocal + ":00";
};