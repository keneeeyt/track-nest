import * as XLSX from "xlsx";

export const exportToExcel = (data: any[], fileName: string) => { // eslint-disable-line
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Convert the data to a worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Get the current date
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(today.getDate()).padStart(2, '0');

  // Format the date as MM-DD-YYYY
  const formattedDate = `${month}-${day}-${year}`;

  // Generate the Excel file and trigger a download
  XLSX.writeFile(workbook, `${fileName}-${formattedDate}.xlsx`);
};