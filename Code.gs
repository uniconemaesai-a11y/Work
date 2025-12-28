
/**
 * Global Configuration
 * กรุณาเปลี่ยน ID ให้เป็นของท่านเอง
 */
const CONFIG = {
  FOLDER_ID: '1RFo4R9L4MmhuKLINTxU_MjnGm32IPTvS', // ID โฟลเดอร์ Google Drive สำหรับเก็บวิดีโอ
  SHEET_ID: '1Q8H3WkidkIfW_e5Voinf1Xro07fU3GPmGCJla4aq9tw' // ID Google Sheets สำหรับเก็บข้อมูล
};

/**
 * ฟังก์ชันหลักสำหรับรับคำขอจาก Web App (React Frontend)
 */
function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;
    const data = params.data;
    let result;

    switch(action) {
      case 'upload': 
        result = processSubmission(data); 
        break;
      case 'list': 
        result = getSubmissionsWithReviews(); 
        break;
      case 'grade': 
        result = saveRubricReview(data); 
        break;
      case 'login': 
        result = checkTeacherLogin(data.username, data.pin); 
        break;
      case 'get_rubric': 
        result = getRubricCriteria(); 
        break;
      case 'setup': // ฟังก์ชันพิเศษสำหรับเตรียมชีตเริ่มต้น
        result = setupInitialSheets();
        break;
      default: 
        result = { success: false, message: 'ไม่พบคำสั่งที่ระบุ' };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดที่ Server: ' + err.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * ฟังก์ชันจัดการชีต (Helper)
 */
function getSheet(sheetName) {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    initSheetHeaders(sheet, sheetName);
  }
  return sheet;
}

/**
 * ฟังก์ชันตั้งค่าหัวตาราง (Headers)
 */
function initSheetHeaders(sheet, sheetName) {
  let headers = [];
  if (sheetName === 'Submissions') headers = ['ID', 'Timestamp', 'Name', 'Student Number', 'Grade', 'Room', 'File URL'];
  else if (sheetName === 'Reviews') headers = ['Submission ID', 'Content Accuracy', 'Participation', 'Presentation', 'Discipline', 'Total Score', 'Percentage', 'Comment', 'Graded At'];
  else if (sheetName === 'Teachers') headers = ['Username', 'PIN', 'Name'];
  else if (sheetName === 'Rubric') headers = ['Criterion', 'Max Points', 'Icon'];

  if (headers.length > 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
         .setFontWeight('bold')
         .setBackground('#4F46E5')
         .setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }
}

/**
 * ฟังก์ชันตรวจสอบการล็อกอินของคุณครู
 */
function checkTeacherLogin(username, pin) {
  const sheet = getSheet('Teachers');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    // data[i][0] = Username, data[i][1] = PIN, data[i][2] = Name
    if (data[i][0].toString() === username.toString() && data[i][1].toString() === pin.toString()) {
      return { success: true, teacherName: data[i][2] };
    }
  }
  return { success: false, message: "ชื่อผู้ใช้หรือรหัส PIN ไม่ถูกต้อง" };
}

/**
 * ฟังก์ชันดึงรายการที่ส่งทั้งหมดพร้อมผลการตรวจ
 */
function getSubmissionsWithReviews() {
  const subSheet = getSheet('Submissions');
  const revSheet = getSheet('Reviews');
  
  const subData = subSheet.getDataRange().getValues();
  const revData = revSheet.getDataRange().getValues();
  
  // สร้าง Map สำหรับรีวิวเพื่อความรวดเร็วในการค้นหา
  const reviewMap = {};
  for (let i = 1; i < revData.length; i++) {
    reviewMap[revData[i][0]] = {
      contentAccuracy: revData[i][1],
      participation: revData[i][2],
      presentation: revData[i][3],
      discipline: revData[i][4],
      totalScore: revData[i][5],
      percentage: revData[i][6],
      comment: revData[i][7],
      gradedAt: revData[i][8],
      status: 'Graded'
    };
  }

  // รวมข้อมูลการส่งและรีวิว
  const results = subData.slice(1).map(row => ({
    rowId: row[0],
    timestamp: row[1],
    name: row[2],
    studentNumber: row[3].toString(),
    grade: row[4],
    room: row[5],
    fileUrl: row[6],
    review: reviewMap[row[0]] || null
  }));
  
  return { success: true, data: results.reverse() }; // ส่งกลับแบบล่าสุดขึ้นก่อน
}

/**
 * ฟังก์ชันอัปโหลดไฟล์วิดีโอและบันทึกลงชีต
 */
function processSubmission(data) {
  try {
    const folder = DriveApp.getFolderById(CONFIG.FOLDER_ID);
    const decodedFile = Utilities.base64Decode(data.fileData);
    const blob = Utilities.newBlob(decodedFile, data.mimeType || 'video/mp4', data.fileName);
    
    // สร้างไฟล์ใน Drive
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    const sheet = getSheet('Submissions');
    const id = sheet.getLastRow(); // ใช้เลขบรรทัดเป็น ID อย่างง่าย
    
    // บันทึกข้อมูลนักเรียน
    sheet.appendRow([
      id, 
      new Date(), 
      data.name, 
      data.studentNumber, 
      data.grade, 
      data.room, 
      file.getUrl()
    ]);
    
    return { success: true, fileUrl: file.getUrl() };
  } catch (e) {
    return { success: false, message: 'อัปโหลดไม่สำเร็จ: ' + e.toString() };
  }
}

/**
 * ฟังก์ชันบันทึกการตรวจให้คะแนน (Rubric)
 */
function saveRubricReview(data) {
  try {
    const sheet = getSheet('Reviews');
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;
    
    // ค้นหาว่าเคยมีการให้คะแนน ID นี้ไปหรือยัง
    for (let i = 1; i < values.length; i++) {
      if (values[i][0].toString() === data.rowId.toString()) { 
        rowIndex = i + 1; 
        break; 
      }
    }
    
    const rowData = [
      data.rowId, 
      data.contentAccuracy, 
      data.participation, 
      data.presentation, 
      data.discipline, 
      data.totalScore, 
      data.percentage, 
      data.comment, 
      new Date()
    ];
    
    if (rowIndex > 0) {
      // กรณีเคยตรวจแล้ว ให้เขียนทับ (Update)
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      // กรณีตรวจครั้งแรก (Append)
      sheet.appendRow(rowData);
    }
    
    return { success: true };
  } catch (e) {
    return { success: false, message: 'บันทึกคะแนนไม่สำเร็จ: ' + e.toString() };
  }
}

/**
 * ฟังก์ชันดึงเกณฑ์การให้คะแนน (Rubric Criteria)
 */
function getRubricCriteria() {
  try {
    const sheet = getSheet('Rubric');
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      // หากยังไม่มีข้อมูลเกณฑ์ ให้ส่งค่า Default กลับไป
      return { 
        success: true, 
        data: [
          { name: 'ความถูกต้อง', icon: '✅' },
          { name: 'การมีส่วนร่วม', icon: '🤝' },
          { name: 'การนำเสนอ', icon: '🎤' },
          { name: 'ความมีวินัย', icon: '📏' }
        ] 
      };
    }
    return { success: true, data: data.slice(1).map(r => ({ name: r[0], icon: r[2] })) };
  } catch (e) {
    return { success: false, message: 'ดึงเกณฑ์การตรวจไม่สำเร็จ' };
  }
}

/**
 * ฟังก์ชัน Setup ครั้งแรก (สำหรับผู้ดูแลระบบ)
 * เรียกใช้จากเมนูหรือรันครั้งเดียวเพื่อเตรียมข้อมูลเบื้องต้น
 */
function setupInitialSheets() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  
  // 1. เตรียมชีตคุณครู (ตัวอย่าง)
  const teacherSheet = getSheet('Teachers');
  if (teacherSheet.getLastRow() === 1) {
    teacherSheet.appendRow(['admin', '1234', 'ครูใจดี มีความสุข']);
    teacherSheet.appendRow(['teacher1', '0000', 'ครูสมชาย สายสปอร์ต']);
  }
  
  // 2. เตรียมชีตเกณฑ์การตรวจ
  const rubricSheet = getSheet('Rubric');
  if (rubricSheet.getLastRow() === 1) {
    rubricSheet.appendRow(['เนื้อหาและความถูกต้อง', '5', '✅']);
    rubricSheet.appendRow(['การมีส่วนร่วมในกิจกรรม', '5', '🤝']);
    rubricSheet.appendRow(['เทคนิคการนำเสนอ', '5', '🎤']);
    rubricSheet.appendRow(['วินัยและการส่งงาน', '5', '📏']);
  }
  
  return { success: true, message: 'ตั้งค่าพื้นฐานเสร็จเรียบร้อยแล้ว' };
}
