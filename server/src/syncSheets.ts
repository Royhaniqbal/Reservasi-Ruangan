// backend/syncSheets.ts
import { google } from "googleapis";
import fs from "fs";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const CREDENTIALS = JSON.parse(fs.readFileSync("google-credentials.json", "utf-8"));

const auth = new google.auth.GoogleAuth({
  credentials: CREDENTIALS,
  scopes: SCOPES,
});

const sheets = google.sheets({ version: "v4", auth });

const SPREADSHEET_ID = "13H_XvOYjwDskZbh7e-6TQGHw4MWltkHWnJ9bKRCL9Dw"; // 👉 ID Spreadsheet
const SHEET_NAME = "Sheet1"; // nama sheet

// ✅ Tambahkan booking ke Google Sheets
export async function appendBookingToSheet(bookingData: {
  room: string;
  date: string;
  startTime: string;
  endTime: string;
  pic: string;
}) {
  const range = `${SHEET_NAME}!A:E`;

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        bookingData.room,
        bookingData.date,
        bookingData.startTime,
        bookingData.endTime,
        bookingData.pic,
      ]],
    },
  });

  console.log("✅ Data booking berhasil disinkron ke Google Sheets");
}

// ✅ Hapus booking dari Google Sheets
export async function deleteBookingFromSheet(bookingData: {
  room: string;
  date: string;
  startTime: string;
  endTime: string;
  pic: string;
}) {
  const range = `${SHEET_NAME}!A:E`;

  // Ambil semua data dari sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range,
  });

  const rows = response.data.values || [];

  // Normalisasi helper
  const normalize = (val: string | undefined) =>
    (val || "").toString().trim();

  const rowIndex = rows.findIndex((row) => {
    const [room, date, startTime, endTime, pic] = row.map((cell) =>
      normalize(cell)
    );

    return (
      room === normalize(bookingData.room) &&
      date === normalize(bookingData.date) &&
      (startTime === normalize(bookingData.startTime) ||
        startTime === `${normalize(bookingData.startTime)}:00` ||
        startTime === normalize(bookingData.startTime).replace(/^0/, "")) &&
      (endTime === normalize(bookingData.endTime) ||
        endTime === `${normalize(bookingData.endTime)}:00` ||
        endTime === normalize(bookingData.endTime).replace(/^0/, "")) &&
      pic === normalize(bookingData.pic)
    );
  });

  if (rowIndex === -1) {
    console.log("⚠️ Data booking tidak ditemukan di Google Sheets:", bookingData);
    return;
  }

  // Hapus baris di Sheets
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: 0, // biasanya sheet pertama = ID 0
              dimension: "ROWS",
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    },
  });

  console.log("🗑️ Data booking berhasil dihapus dari Google Sheets");
}
