// Paste this into a Google Sheet's Extensions -> Apps Script editor, then
// deploy it as a Web App (Deploy -> New deployment -> type "Web app",
// execute as "Me", access "Anyone"). Set the resulting URL as
// OVID_LOG_WEBHOOK_URL in this project's env vars (see .env.example).
//
// Row 1 of the sheet should have these headers before you deploy:
//   Timestamp | Conversation ID | Turn | Type | User Message | Reply
//
// This is plain Google Apps Script, not part of the portfolio's own build —
// it only ever runs inside Google's own sandbox, never in this repo.
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
  var data = JSON.parse(e.postData.contents)

  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.conversationId || '',
    data.turn || '',
    data.type || '',
    data.userMessage || '',
    data.reply || '',
  ])

  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON)
}
