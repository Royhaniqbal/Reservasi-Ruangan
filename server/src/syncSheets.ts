// backend/syncSheets.ts
import { google } from "googleapis";
import fs from "fs";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const CREDENTIALS = JSON.parse(
  fs.readFileSync("google-credentials.json", "utf-8")
);

const auth = new google.auth.GoogleAuth({
  credentials: CREDENTIALS,
  scopes: SCOPES,
});

const sheets = google.sheets({ version: "v4", auth });

const SPREADSHEET_ID =
  "13H_XvOYjwDskZbh7e-6TQGHw4MWltkHWnJ9bKRCL9Dw"; // ID spreadsheet

// 🔹 Mapping nama ruangan -> nama sheet
const SHEET_MAP: Record<string, string> = {
  "Ruang Rapat Dirjen": "Ruang Rapat Dirjen",
  "Ruang Rapat Sesditjen": "Ruang Rapat Sesditjen",
  "Command Center": "Command Center",
  "Ruang Rapat Lt2": "Ruang Rapat Lt2",
  "Ballroom": "Ballroom",
};

// Helper untuk dapatkan nama sheet berdasarkan room
function getSheetName(room: string): string {
  // return SHEET_MAP[room] || "Sheet1"; // fallback ke Sheet1 kalau tidak cocok
  return SHEET_MAP[room];
}

// ✅ Tambahkan booking ke Google Sheets
export async function appendBookingToSheet(bookingData: {
  room: string;
  date: string;
  startTime: string;
  endTime: string;
  pic: string;
}) {
  const sheetName = getSheetName(bookingData.room);
  const range = `${sheetName}!A:E`;

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          bookingData.room,
          bookingData.date,
          bookingData.startTime,
          bookingData.endTime,
          bookingData.pic,
        ],
      ],
    },
  });

  console.log(`✅ Data booking masuk ke sheet "${sheetName}"`);
}

// ✅ Hapus booking dari Google Sheets
export async function deleteBookingFromSheet(bookingData: {
  room: string;
  date: string;
  startTime: string;
  endTime: string;
  pic: string;
}) {
  const sheetName = getSheetName(bookingData.room);
  const range = `${sheetName}!A:E`;

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range,
  });

  const rows = response.data.values || [];

  const normalize = (val: string | undefined) => (val || "").toString().trim();

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
    console.log(
      `⚠️ Data booking tidak ditemukan di sheet "${sheetName}":`,
      bookingData
    );
    return;
  }

  // 🔹 Cari sheetId berdasarkan nama sheet
  const sheetInfo = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });

  const sheetMeta = sheetInfo.data.sheets?.find(
    (s) => s.properties?.title === sheetName
  );

  if (!sheetMeta?.properties?.sheetId) {
    console.error(`❌ Sheet "${sheetName}" tidak ditemukan`);
    return;
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetMeta.properties.sheetId,
              dimension: "ROWS",
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    },
  });

  console.log(`🗑️ Data booking dihapus dari sheet "${sheetName}"`);
}
