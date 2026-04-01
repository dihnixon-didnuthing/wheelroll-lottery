function handleFile(e) {
  console.log("handleFile");
  var files = e.target.files;
  for (var i = 0; i < files.length; i++) {
    (function (file) {
      var ext = file.name.split('.').pop().toLowerCase();
      if (ext !== 'xlsx' && ext !== 'xls') {
        showNotification('Sai định dạng file. Vui lòng dùng file Excel (.xlsx)', 'error');
        return;
      }
      var reader = new FileReader();
      reader.onload = function (e) {
        var workbook = XLSX.read(e.target.result, { type: 'binary' });
        handleWorkbook(workbook);
      };
      reader.readAsBinaryString(file);
    })(files[i]);
  }
  e.target.value = '';
}

function handlePrizeFile(e) {
  IS_EXPORTED = false;
  console.log("handlePrizeFile");
  WINNER = [];
  var files = e.target.files;
  for (var i = 0; i < files.length; i++) {
    (function (file) {
      var ext = file.name.split('.').pop().toLowerCase();
      if (ext !== 'xlsx' && ext !== 'xls') {
        showNotification('Sai định dạng file. Vui lòng dùng file Excel (.xlsx)', 'error');
        return;
      }
      var reader = new FileReader();
      reader.onload = function (e) {
        var workbook = XLSX.read(e.target.result, { type: 'binary' });
        handlePrizeWorkbook(workbook);
      };
      reader.readAsBinaryString(file);
    })(files[i]);
  }
}

function handleWorkbook(workbook) {
  console.log("handleWorkbook");
  var parsed = {};
  workbook.SheetNames.forEach(function (sheetName) {
    parsed[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  });
  
  if (!parsed.Sheet1 || !parsed.Sheet1[0] || !parsed.Sheet1[0]["Mã NV"] || !parsed.Sheet1[0]["Họ và tên"]) {
    showNotification('Không đọc được data. Kiểm tra tên cột: "Mã NV", "Họ và tên"', 'error');
    return;
  }
  
  DATA = parsed;
 
  console.log("Participants loaded:", DATA.Sheet1 ? DATA.Sheet1.length : 0);
  if (DATA.Sheet1 && DATA.Sheet1[0]) {
    console.log("First entry Mã NV:", DATA.Sheet1[0]["Mã NV"]);
  }
  
  var eligible = (DATA.Sheet1 ? DATA.Sheet1.length : 0) - WINNER.length;
  document.getElementById('total_employees').innerText = DATA.Sheet1 ? DATA.Sheet1.length : 0;
  document.getElementById('total_eligible').innerText = eligible < 0 ? 0 : eligible;
  IS_FILE_LOADED = true;
  runEvent();
}
 
function handlePrizeWorkbook(workbook) {
  console.log("handlePrizeWorkbook");
  var sheetName = workbook.SheetNames[0];
  var rows      = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  
  if (!rows[0] || !rows[0]["Tên Giải"] || !rows[0]["QTY"]) {
    showNotification('Không đọc được data. Kiểm tra tên cột: "Tên Giải", "QTY"', 'error');
    return;
  }

  PRIZES = rows
    .map(function (row) {
      return {
        tenGiai: row["Tên Giải"],
        qty: parseInt(row["QTY"], 10)
      };
    })
    .filter(function (p) { return p.tenGiai && p.qty > 0; });
 
  //populatePrizeDropdown();
  console.log("Prizes loaded:", PRIZES);
 
  PRIZE_INDEX = 0;
  SPIN_LEFT   = PRIZES[0].qty;
  updatePrizeTitle(true);
  refreshPanel();
  runEvent();
}

function downloadTemplates() {
  // Employee template
  var empWb = XLSX.utils.book_new();
  var empWs = XLSX.utils.aoa_to_sheet([["Mã NV", "Họ và tên", "Lĩnh vực chuyên môn"]]);
  XLSX.utils.book_append_sheet(empWb, empWs, "Sheet1");
  XLSX.writeFile(empWb, "template_ds_nhan_vien.xlsx");

  // Prize template
  var prizeWb = XLSX.utils.book_new();
  var prizeWs = XLSX.utils.aoa_to_sheet([["Tên Giải", "QTY"]]);
  XLSX.utils.book_append_sheet(prizeWb, prizeWs, "Sheet1");
  XLSX.writeFile(prizeWb, "template_ds_giai_thuong.xlsx");

  showNotification("Đã tải 2 file mẫu.", "success");
}

function loadNamesFromTextarea() {
  var raw = document.getElementById("name_input").value;
  var lines = raw.split("\n")
    .map(function(l) { return l.trim(); })
    .filter(function(l) { return l.length > 0; });
  if (!lines.length) return false;
  DATA = {
    Sheet1: lines.map(function(name, i) {
      return { "Mã NV": i + 1, "Họ và tên": name, "Lĩnh vực chuyên môn": "" };
    })
  };
  refreshPanel();
  return true;
}

function runEvent() {
  console.log("runEvent");
  $("#name_input_box").empty();
  $("#name_input_box").hide();
  if (PRIZES.length === 0 || DATA == null || DATA.Sheet1 == null) {
    return;
  }
  showNotification("Import: " + (DATA.Sheet1 ? DATA.Sheet1.length : 0) + " nhân viên, " + PRIZES.length + " giải thưởng.", "success");
  $('#configtime').hide();
  $('#numbers3').hide();
  $('#prizeselect').show();
  $('#showtime').show();
  mergeWinners();
}