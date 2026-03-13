//GLOBAL variables: TWO_WORDS
//LOCAL variables: twoWords 
var NUM_SLOTS =4;
var TOTAL_HEIGHT = 1000.0; // Total height of sprite 
var NUM_OFFSET = TOTAL_HEIGHT / 10;
var CHOSEN = 0;
var DEPARTMENT = "";
var DATA = {};
var PERSON = {};
var CURRENT_WINNER = null;
var PRIZES = [];
var PRIZE_INDEX = 0;
var SPIN_LEFT = 0;
var IS_SURPRISE_SPIN = false;
var BACKGROUND_PRESET = 9;
var TIME = 2000;
var REMAINING = 0;
var SPINNING = false;
var WINNER = [];

var NUM_FUNCTIONS = new Array(NUM_SLOTS).fill(reanimate);

function reanimate(slot) {
  animate(slot,0);
}

function animate(slot, offset) {
  var time      = TIME * (TOTAL_HEIGHT - offset) / TOTAL_HEIGHT;
  var offsetPx  = String(-offset) + "px";
  var s         = slot;
  var sel       = "#num" + slot;
  var topscroll = String(-TOTAL_HEIGHT) + "px";
 
  $(sel).css({ backgroundPosition: "0px " + offsetPx });
  $(sel).animate(
    { backgroundPosition: "(0px " + topscroll + ")" },
    time,
    'linear',
    function () { var f = NUM_FUNCTIONS[s]; if (f) f(s, 0); }
  );
}

function doit() {
  REMAINING = NUM_SLOTS;
  $('#numbers2').removeClass('zoomin');
  $('#numbers3').removeClass('zoomin');

  for (var i = NUM_SLOTS; i >= 0; i--) {
    $('#num'+i).stop().css('border','0px solid black');
    NUM_FUNCTIONS[i] = reanimate;
    animate(i,-r(TOTAL_HEIGHT));
  }
}

function quickstop() {
  stop(NUM_SLOTS);
}

function stop(num) {
  if(num == NUM_SLOTS) {
    IS_SURPRISE_SPIN = false;
    for (var i = NUM_SLOTS -1; i >= 0; i--) {
      if(NUM_FUNCTIONS[i]!=null)
        NUM_FUNCTIONS[i] = dostop;
    }
    return;
  }

  IS_SURPRISE_SPIN = true;
  NUM_FUNCTIONS[num] = dostop;
}

function dostop(slot) {
  if(slot >= NUM_SLOTS) return;

  var sel = "#num" + slot;
  var offset = -result(slot) * NUM_OFFSET;
  var time = TIME * (-offset) / TOTAL_HEIGHT;
  var offsetPx = String(offset) + "px";
  var s = slot;
  REMAINING--;

  if (REMAINING == 0 && IS_SURPRISE_SPIN) {
    var virtualOffset = -result(slot) * NUM_OFFSET + NUM_OFFSET * 5;
    virtualOffset = String(virtualOffset) + "px";
    $(sel).css({backgroundPosition: "0px " + virtualOffset});
    $(sel).animate(
      { backgroundPosition: "(0px " + offsetPx + ")" }, 
      9000, 
      'linear', 
      function() { slotstopped(s) }
    );
  }
  else {
    $(sel).css({backgroundPosition: "0px 0px"});
    $(sel).animate(
      { backgroundPosition: "(0px " + offset + ")" }, 
      time, 
      'linear', 
      function() { slotstopped(s) }
    );
  }

  return 1;
}

function slotstopped(slot) {
  $('#num' + slot).css('border', '0px solid transparent');
  NUM_FUNCTIONS[slot] = null;
 
  // Check all slots via loop — stays correct if NUM_SLOTS changes
  var allStopped = true;
  for (var i = 0; i < NUM_SLOTS; i++) {
    if (NUM_FUNCTIONS[i] != null) { allStopped = false; break; }
  }
 
  if (allStopped) {
    document.querySelector("#report").innerText =
      PERSON["Họ và tên"] + " - " + DEPARTMENT;
    WINNER.push({ ...PERSON, prize: PRIZES[PRIZE_INDEX].tenGiai });
    $('#numbers3').show();
 
    if (PRIZES.length > 0 && PRIZE_INDEX >= 0 && PRIZE_INDEX < PRIZES.length) {
      SPIN_LEFT--;
      updateprizeTitle();
 
      if (SPIN_LEFT === 0) {
        moveToNextPrize();
      }
    }
  }
 
  SPINNING = false;
}

// ANIMATION DONE

function r(max) {
  return Math.floor(Math.random() * max);
}

//Example: result(4) with chosen being 4931 
//append 0s to chosen > 0004953
//result(2) being third number, 0 
//NEW: padStart to append '0' to CHOSEN to the length of NUM_SLOTS
function result(index) {
  var padded = String(CHOSEN).padStart(NUM_SLOTS, '0');
  return parseInt(padded[index]);
}

function moveToNextPrize() {
  if (PRIZE_INDEX + 1 < PRIZES.length) {
    PRIZE_INDEX++;
    SPIN_LEFT = PRIZES[PRIZE_INDEX].qty;
    updateprizeTitle();
  } else {
    PRIZE_INDEX = -1;
    SPIN_LEFT = 0;
    updateprizeTitle();
    console.log("No more prizes.");
  }
}

function updateprizeTitle() {
  var el = document.querySelector("#prize_title");
  if (PRIZE_INDEX >= 0 && PRIZE_INDEX < PRIZES.length) {
    el.innerText = 'Giải: ' + PRIZES[PRIZE_INDEX].tenGiai + ' - Còn ' + SPIN_LEFT + ' lượt';
  } else {
    el.innerText = "Hết giải!";
  }
}

function spinprize() {
  if (PRIZES.length === 0 || PRIZE_INDEX < 0 || PRIZE_INDEX >= PRIZES.length) {
    alert("Không có giải nào để quay.");
    return;
  }
 
  if (SPIN_LEFT <= 0) {
    moveToNextPrize();
    return;
  }
 
  choosenew();
  doit();
}

function populatePrizeDropdown() {
  const select = document.getElementById('prizepick');
  PRIZES.forEach(function (prize, index) {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = prize.tenGiai;
    select.appendChild(option);
  });
}


function choosenew() {
  if (DATA == null || DATA.Sheet1 == null || DATA.Sheet1.length === 0) {
    CHOSEN = 1;
    $('#numbers3').hide();
    return;
  }
 
  var max    = DATA.Sheet1.length;
  var repick = true;
  var count  = 0;
 
  while (repick) {
    repick = false;
    PERSON = DATA.Sheet1[r(max)];
 
    if (WINNER.some(function (w) { return w["Mã NV"] === PERSON["Mã NV"]; })) {
      console.log("Duplicate, repicking:", PERSON["Mã NV"]);
      repick = true;
    }
 
    count++;
    if (count > 10000) {
      console.log("Exceeded repick limit:", count);
      location.reload();
      return;
    }
  }
 
  CURRENT_WINNER = PERSON;
  CHOSEN         = parseInt(PERSON["Mã NV"]);
  DEPARTMENT     = PERSON["Lĩnh vực chuyên môn"] || "";
  console.log("Chosen:", CHOSEN, "Department:", DEPARTMENT);
 
  $('#numbers3').hide();
}

function handleFile(e) {
  console.log("handleFile");
  WINNER = [];
  var files = e.target.files;
  for (var i = 0; i < files.length; i++) {
    (function (file) {
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
 
function handleprizeFile(e) {
  console.log("handleprizeFile");
  WINNER = [];
  var files = e.target.files;
  for (var i = 0; i < files.length; i++) {
    (function (file) {
      var reader = new FileReader();
      reader.onload = function (e) {
        var workbook = XLSX.read(e.target.result, { type: 'binary' });
        handleprizeWorkbook(workbook);
      };
      reader.readAsBinaryString(file);
    })(files[i]);
  }
}
 
function handleWorkbook(workbook) {
  console.log("handleWorkbook");
  // `parsed` is local; result is assigned to global DATA
  var parsed = {};
  workbook.SheetNames.forEach(function (sheetName) {
    parsed[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  });
 
  DATA = parsed;
 
  console.log("Participants loaded:", DATA.Sheet1 ? DATA.Sheet1.length : 0);
  if (DATA.Sheet1 && DATA.Sheet1[0]) {
    console.log("First entry Mã NV:", DATA.Sheet1[0]["Mã NV"]);
  }
 
  runevent();
}
 
function handleprizeWorkbook(workbook) {
  console.log("handleprizeWorkbook");
  var sheetName = workbook.SheetNames[0];
  var rows      = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
 
  PRIZES = rows
    .map(function (row) {
      return {
        tenGiai: row["Tên Giải"],
        qty: parseInt(row["QTY"], 10)
      };
    })
    .filter(function (p) { return p.tenGiai && p.qty > 0; });
 
  populatePrizeDropdown();
  console.log("Prizes loaded:", PRIZES);
 
  PRIZE_INDEX = 0;
  SPIN_LEFT   = PRIZES[0].qty;
  updateprizeTitle();
  runevent();
}

function exportwinners() {
    if (!WINNER || WINNER.length === 0) {
        alert("No winners to export");
        return;
    }

    var exportData = winner.map(function(person, index) {
        return {
            "STT": index + 1,
            "Mã NV": person["Mã NV"],
            "Họ và tên": person["Họ và tên"],
            "Lĩnh vực chuyên môn": person["Lĩnh vực chuyên môn"],
            "Giải: ": person.prize,
        };
    });

    var ws = XLSX.utils.json_to_sheet(exportData);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Winners");
    XLSX.writeFile(wb, "danh_sach_trung_thuong.xlsx");
}

function reset() {
  console.log("reset");
  for (var i = 0; i < NUM_SLOTS; i++) {
    $("#num" + i).stop().css({ backgroundPosition: "0px 0px" });
  }
  $('#numbers3').hide();
}
 
function runevent() {
  console.log("runevent");
  if (PRIZES.length === 0 || DATA == null || DATA.Sheet1 == null) {
    return;
  }
  $('#configtime').hide();
  $('#numbers3').hide();
  $('#prizeselect').show();
  $('#showtime').show();
}
 
function loadprize(num) {
  BACKGROUND_PRESET = num;
  $('body').css('background-image', 'url(./backdrop/' + num + '.jpg)');
  choosenew();
  doit();
}

//LISTENERS

document.querySelector("#file").addEventListener('change', handleFile, false);
document.querySelector("#file2").addEventListener('change', handleprizeFile, false);
 
document.addEventListener('keydown', function (e) {
  if (e.code === 'Space' || e.code === 'Enter') {
    e.preventDefault();
    if (!SPINNING) {
      choosenew();
      doit();
    } else {
      stop(NUM_SLOTS);
    }
  }
});
 
window.addEventListener('beforeunload', function (e) {
  if (WINNER.length > 0) {
    e.preventDefault();
  }
});
 
document.getElementById('prizesubmit').addEventListener('click', function () {
  const select        = document.getElementById('prizepick');
  const selectedIndex = select.value;
  if (selectedIndex === '') {
    alert('Chưa chọn giải?');
    return;
  }
  const index = parseInt(selectedIndex, 10);
  if (index >= 0 && index < PRIZES.length) {
    PRIZE_INDEX = index;
    SPIN_LEFT   = PRIZES[PRIZE_INDEX].qty;
    updateprizeTitle();
  }
});


$(function () {
  choosenew();
});