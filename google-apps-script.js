// ============================================================
// GOOGLE APPS SCRIPT — Business Analytics Assessment Backend
// ============================================================
//
// SETUP INSTRUCTIONS:
// ===================
// 1. Go to https://script.google.com and create a new project
// 2. Delete the default code and paste this entire file
// 3. Click "Deploy" > "New deployment"
// 4. Select type: "Web app"
// 5. Set "Execute as": "Me" (your account)
// 6. Set "Who has access": "Anyone"
// 7. Click "Deploy" and authorize when prompted
// 8. Copy the Web App URL (looks like: https://script.google.com/macros/s/XXXX/exec)
// 9. Paste that URL into your web app's settings (in assessment.js, GOOGLE_SCRIPT_URL variable)
//
// The script automatically creates a Google Sheet called
// "Business Analytics Assessments" in your Google Drive.
// All student submissions will appear there.
// ============================================================

var SPREADSHEET_NAME = 'Business Analytics Assessments';

function getOrCreateSpreadsheet() {
  var files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  var ss;

  if (files.hasNext()) {
    ss = SpreadsheetApp.open(files.next());
  } else {
    ss = SpreadsheetApp.create(SPREADSHEET_NAME);
    // Create the main submissions sheet with headers
    var sheet = ss.getActiveSheet();
    sheet.setName('All Submissions');
    sheet.getRange(1, 1, 1, 12).setValues([[
      'Timestamp',
      'Name',
      'Email',
      'Roll Number',
      'Section',
      'Topic',
      'MCQ Score',
      'MCQ Total',
      'MCQ Answers (JSON)',
      'Code Submissions (JSON)',
      'Interpretation Answers (JSON)',
      'Submission ID'
    ]]);
    // Bold and freeze header row
    sheet.getRange(1, 1, 1, 12).setFontWeight('bold');
    sheet.setFrozenRows(1);
    // Auto-resize columns
    for (var i = 1; i <= 12; i++) {
      sheet.autoResizeColumn(i);
    }
  }
  return ss;
}

function getOrCreateTopicSheet(ss, topicName) {
  var sheet = ss.getSheetByName(topicName);
  if (!sheet) {
    sheet = ss.insertSheet(topicName);
    sheet.getRange(1, 1, 1, 12).setValues([[
      'Timestamp',
      'Name',
      'Email',
      'Roll Number',
      'Section',
      'MCQ Score',
      'MCQ Total',
      'MCQ Answers (JSON)',
      'Code Submissions (JSON)',
      'Interpretation Answers (JSON)',
      'Submission ID',
      'MCQ Percentage'
    ]]);
    sheet.getRange(1, 1, 1, 12).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var ss = getOrCreateSpreadsheet();

    // Write to "All Submissions" sheet
    var mainSheet = ss.getSheetByName('All Submissions');
    var submissionId = Utilities.getUuid().substring(0, 8).toUpperCase();
    var timestamp = new Date().toISOString();

    var row = [
      timestamp,
      data.name || '',
      data.email || '',
      data.rollNumber || '',
      data.section || '',
      data.topic || '',
      data.mcqScore || 0,
      data.mcqTotal || 0,
      JSON.stringify(data.mcqAnswers || {}),
      JSON.stringify(data.codeSubmissions || {}),
      JSON.stringify(data.interpretationAnswers || {}),
      submissionId
    ];

    mainSheet.appendRow(row);

    // Also write to topic-specific sheet
    if (data.topic) {
      var topicSheet = getOrCreateTopicSheet(ss, data.topic);
      var mcqPct = data.mcqTotal > 0 ? Math.round((data.mcqScore / data.mcqTotal) * 100) + '%' : 'N/A';
      var topicRow = [
        timestamp,
        data.name || '',
        data.email || '',
        data.rollNumber || '',
        data.section || '',
        data.mcqScore || 0,
        data.mcqTotal || 0,
        JSON.stringify(data.mcqAnswers || {}),
        JSON.stringify(data.codeSubmissions || {}),
        JSON.stringify(data.interpretationAnswers || {}),
        submissionId,
        mcqPct
      ];
      topicSheet.appendRow(topicRow);
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        submissionId: submissionId,
        message: 'Assessment submitted successfully!'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Submission failed: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Handle GET requests (for testing)
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'active',
      message: 'Business Analytics Assessment API is running.',
      instructions: 'Send POST requests with student assessment data.'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Test function — run this manually to verify setup
function testSetup() {
  var ss = getOrCreateSpreadsheet();
  Logger.log('Spreadsheet created/found: ' + ss.getUrl());
  Logger.log('Setup successful! Share this URL with students for the web app.');
}
