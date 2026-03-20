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
var IS_SURPRISE_SPIN = true;
var BACKGROUND_PRESET = 9;
var TIME = 2000;
var REMAINING = 0;
var IS_SPINNING = false;
var WINNER = [];
var STORAGE_KEY = 'roll_winners';
var IS_IDLE = false;
var CONFETTI_TIMEOUT = [];
var BASE_HEADER_FONTSIZE = null;
var BASE_PRIZE_FONTSIZE = null;
var IS_FULLSCREEN = null;
var NUM_FUNCTIONS = new Array(NUM_SLOTS).fill(reanimate);
var IS_FINISHED = true; 

var ribbonShape = confetti.shapeFromPath({
  path: 'M0 0 L4 0 L4 20 L0 20 Z',
  matrix: [1, 0, 0, 1, -2, -10]
});

var mShape = confetti.shapeFromPath({
  path: 'm -86.902848,115.22298 h 22.446994 l -37.554806,-85.495445 -18.85546,8.728592 13.11684,29.766737 -6.08996,13.83892 -23.50104,-53.714412 -19.05066,8.318275 15.30299,34.317541 -0.0781,0.149206 c -9.44728,21.672269 -21.00261,27.603238 -22.13471,28.013555 -2.69364,1.044451 -5.58247,1.641281 -8.62745,1.641281 -0.93693,0 -1.83481,-0.0373 -2.73268,-0.14921 l -9.21304,18.87465 c 3.04499,1.67858 6.48035,2.64842 10.11091,2.64842 4.60652,0 8.82265,-1.52937 12.33609,-4.06588 l -0.0391,0.0746 c 0,0 8.70553,-4.21509 18.03567,-27.304824 0,-0.0373 3.43537,-7.385732 5.27018,-12.085744 l 0.19519,-0.522223 16.39605,37.003261 h 22.407962 l -11.555302,-26.036569 6.12899,-13.83892 z',
   matrix: [0.09,0,0,0.09,11.34,-10.08]
});

var LINEAR_SPEED = TOTAL_HEIGHT / TIME;
$.easing.easeOutSine = function(x, t, b, c, d) {
  return c * Math.sin(t / d * (Math.PI / 2)) + b;
};

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
 
//IDLE ANI
function idleAnimate(slot) {
  if (!IS_IDLE) return;
  var sel       = "#num" + slot;
  var s         = slot;
  var time      = TIME * 5; //increase multiplier to slow
  var topscroll = String(-TOTAL_HEIGHT) + "px";
  $('#numbers3').hide();
 
  $(sel).css({ backgroundPosition: "0px 0px" });
  $(sel).animate(
    { backgroundPosition: "(0px " + topscroll + ")" },
    time,
    'linear',
    function () { idleAnimate(s); }
  );
}
 
function startIdle() {
  IS_IDLE = true;
  $('#numbers3').hide();
  for (var i = NUM_SLOTS - 1; i >= 0; i--) {
    idleAnimate(i);
  }
}
 
function stopIdle() {
  IS_IDLE = false;
  reset();
}

//CONFETTI ANI
function launchConfetti() {
  stopConfetti();

  var rect = document.getElementById('numbers2').getBoundingClientRect();
  var originX = (rect.left + rect.width / 2) / window.innerWidth;
  var originY = (rect.top + rect.height / 2) / window.innerHeight;
  var origin = { x: originX, y: originY };

  var colors = ['#F5DB79', '#f7b93c', '#44aaff'];

  var shared = {
    spread        : 55,
    startVelocity : 24,
    decay         : 0.94,
    gravity       : 0.5,
    ticks         : 600,
    colors        : colors,
    zIndex        : 10
  };

  var ribbonShared = Object.assign({}, shared, {
    scalar : 1.2,
    shapes : [ribbonShape],
    colors : ['#F5DB79', '#f7b93c']
  });

  var mShared = Object.assign({}, shared, {
    scalar  : 2.8,
    shapes  : [mShape],
    colors  : ['#000000', '#ffffff'],
    gravity : 0.43
  });

  var delays = [0, 600];

  delays.forEach(function (delay) {
    var t = setTimeout(function () {

      confetti(Object.assign({}, shared, { particleCount: 80, angle: 60, origin: origin }));
      confetti(Object.assign({}, shared, { particleCount: 40, angle: 120, origin: origin }));

      confetti(Object.assign({}, mShared, { particleCount: 10, angle: 60, origin: origin }));
      confetti(Object.assign({}, mShared, { particleCount: 10, angle: 120, origin: origin }));

      confetti(Object.assign({}, ribbonShared, { particleCount: 20, angle: 60, origin: origin }));
      confetti(Object.assign({}, ribbonShared, { particleCount: 20, angle: 120, origin: origin }));

    }, delay);

    CONFETTI_TIMEOUT.push(t);
  });
}

function stopConfetti() {
  if (CONFETTI_TIMEOUT) {
    CONFETTI_TIMEOUT.forEach(function (t) { clearTimeout(t); });
  }
  CONFETTI_TIMEOUT = [];
  confetti.reset();
}

function doIt() {
  REMAINING = NUM_SLOTS;
  $('#numbers3').hide();

  for (var i = NUM_SLOTS; i >= 0; i--) {
    $('#num'+i).stop().css('border','0px solid black');
    NUM_FUNCTIONS[i] = reanimate;
    animate(i,-r(TOTAL_HEIGHT));
  }
}

function quickStop() {
  stop(NUM_SLOTS);
}

function stop(num) {
  if(num == NUM_SLOTS) {
    IS_SURPRISE_SPIN = false;
    for (var i = NUM_SLOTS -1; i >= 0; i--) {
      if(NUM_FUNCTIONS[i]!=null)
        NUM_FUNCTIONS[i] = doStop;
    }
    return;
  }
  IS_SURPRISE_SPIN = true;
  NUM_FUNCTIONS[num] = doStop;
}

function doStop(slot) {
  var sel = "#num" + slot;
  var offset = -result(slot) * NUM_OFFSET;
  var time = TIME * (-offset) / TOTAL_HEIGHT;
  var offsetPx = String(offset) + "px";
  var s = slot;
  REMAINING--;

  if (REMAINING == 0 && IS_SURPRISE_SPIN) {
    var virtualOffset = offset + (1.4 *TOTAL_HEIGHT);
    var virtualOffsetPx = String(virtualOffset) + "px";
    var duration = (1.4 * TOTAL_HEIGHT) * (Math.PI / 2) / LINEAR_SPEED;

    $(sel).css({ backgroundPosition: "0px " + virtualOffsetPx });
    $(sel).animate(
      { backgroundPosition: "(0px " + offsetPx + ")" },
      duration, 
      'easeOutSine',
      function() { slotStopped(s) }
    );
  }
  else {
  //Quick stop
    $(sel).css({backgroundPosition: "0px 0px"});
    $(sel).animate(
      { backgroundPosition: "(0px " + offsetPx + ")" }, 
      time, 
      'linear', 
      function() { slotStopped(s) }
    );
  }

  return 1;
}

function slotStopped(slot) {
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
    launchConfetti();
    saveWinners();
    $('#numbers3').show();
    setTimeout(function() {
      IS_SPINNING = false;
      $("#prizes_table [contenteditable]").attr("contenteditable", "true");
    }, 1000);

    if (PRIZES.length > 0 && PRIZE_INDEX >= 0 && PRIZE_INDEX < PRIZES.length) {
      SPIN_LEFT--;
      PRIZES[PRIZE_INDEX].qty--;
      updatePrizeTitle();
      refreshPanel();
 
      if (SPIN_LEFT === 0) {
        PRIZES[PRIZE_INDEX].qty=0;
        moveToNextPrize();
      }
    }
  }
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

//SPIN LOGIC ETC
function moveToNextPrize() {
  if (PRIZE_INDEX + 1 < PRIZES.length) {
    PRIZE_INDEX++;
    SPIN_LEFT = PRIZES[PRIZE_INDEX].qty;
    updatePrizeTitle();
  } else {
    PRIZE_INDEX = -1;
    updatePrizeTitle();
    console.log("No more prizes.");
  }
}

function refreshPanel() {
  var wBody = $("#winners_table tbody");
  wBody.empty();
  for (var i = WINNER.length - 1; i >= 0; i--) {
    var w = WINNER[i];
    wBody.append(
      "<tr data-index='" + i + "'>" +
        "<td>" + w["Họ và tên"] + "</td>" +
        "<td contenteditable='true' class='edit-prize'>" + w.prize + "</td>" +
      "</tr>"
    );
  }
  $("#badge_winners").text(WINNER.length);
  $("#badge_prizes").text(PRIZES.length);

  var pBody = $("#prizes_table tbody");
  pBody.empty();
  for (var j = 0; j < PRIZES.length; j++) {
    var p = PRIZES[j];
    pBody.append(
      "<tr data-index='" + j + "'>" +
        "<td contenteditable='true' class='edit-name'>" + p.tenGiai + "</td>" +
        "<td contenteditable='true' class='edit-qty'>" + p.qty + "</td>" +
      "</tr>"
    );
  }
}

function updatePrizeTitle() {
  var el = document.querySelector("#prize_title");
  if (PRIZE_INDEX >= 0 && PRIZE_INDEX < PRIZES.length) {
    el.innerText = 'Giải ' + PRIZES[PRIZE_INDEX].tenGiai + ' - ' + ' Còn ' + SPIN_LEFT + ' lượt';
  } else {
    el.innerText = "Hết giải!";
    exportWinners();
  }
}

function spinPrize() {
  if (PRIZES.length == 0) {
    $("#configtime").addClass("flash");
    $("#configtime").one("animationend", function() {
      $(this).removeClass("flash");
    });
    return;
  }
  if (IS_IDLE) stopIdle();
  if (SPIN_LEFT <= 0) {
    moveToNextPrize();
    return;
  }
  if (!IS_SPINNING) {
    stopConfetti();
    chooseNew();
    setTimeout(doIt(), 1500);
    IS_SPINNING = true;
    $("#prizes_table [contenteditable]").attr("contenteditable", "false");
  }
  return;
}

function clearPrizeDropdown() {
  const select = document.getElementById('prizepick');
  while (select.firstChild) {
    select.removeChild(select.firstChild);
  }
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

function chooseNew() {
  if (DATA == null || DATA.Sheet1 == null || DATA.Sheet1.length === 0) {
    CHOSEN = 1;
    $('#numbers3').hide();
    return;
  }
 
  var max    = DATA.Sheet1.length;
  var isRepick = true;
  var count  = 0;
 
  //keeps running till isRepick is false meaning unique pick LMAOOOO 
  while (isRepick) {
    isRepick = false;
    PERSON = DATA.Sheet1[r(max)];
 
    if (WINNER.some(function (w) { return w["Mã NV"] === PERSON["Mã NV"]; })) {
      console.log("Duplicate, repicking:", PERSON["Mã NV"]);
      isRepick = true;
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
  IS_FINISHED = false;
  $('#numbers3').hide();
}

function handleFile(e) {
  console.log("handleFile");
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
 
function handlePrizeFile(e) {
  console.log("handlePrizeFile");
  WINNER = [];
  var files = e.target.files;
  for (var i = 0; i < files.length; i++) {
    (function (file) {
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
 
  DATA = parsed;
 
  console.log("Participants loaded:", DATA.Sheet1 ? DATA.Sheet1.length : 0);
  if (DATA.Sheet1 && DATA.Sheet1[0]) {
    console.log("First entry Mã NV:", DATA.Sheet1[0]["Mã NV"]);
  }
  
  runEvent();
}
 
function handlePrizeWorkbook(workbook) {
  console.log("handlePrizeWorkbook");
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
  updatePrizeTitle();
  refreshPanel();
  runEvent();
}

function saveWinners() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(WINNER));
    console.log("Winners saved to localStorage:", WINNER.length);
  } catch (e) {
    console.warn("Could not save winners to localStorage:", e);
  }
}
 
function loadWinners() {
  var stored;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    console.warn("Could not read localStorage:", e);
    return;
  }
 
  if (!stored) return;
 
  var parsed;
  try {
    parsed = JSON.parse(stored);
  } catch (e) {
    console.warn("Stored winner data was corrupt, discarding.");
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
 
  if (!Array.isArray(parsed) || parsed.length === 0) return;
 
  function dismissBanner() {
    banner.style.transform = 'translateY(-100%)';
    banner.addEventListener('transitionend', function() {
      document.body.removeChild(banner);
    });
  }

  var banner = document.createElement('div');
  banner.id = 'restore_banner';
  banner.style.cssText = [
    'position:fixed', 'top:0', 'left:0', 'right:0',
    'background:#f7b93c', 'color:#980000',
    'font-family:Arial,sans-serif', 'font-weight:bold',
    'font-size:16px', 'text-align:center',
    'padding:12px 20px', 'z-index:9999',
    'display:flex', 'align-items:center', 'justify-content:center', 'gap:16px',
    'transform:translateY(-100%)',
    'transition:transform 0.4s ease-out'
  ].join(';');
  document.body.appendChild(banner);
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      banner.style.transform = 'translateY(0)';
    });
  });

  var msg = document.createElement('span');
  msg.innerText = 'Tìm thấy ' + parsed.length + ' người thắng từ session trước. Khôi phục?';
 
  var btnRestore = document.createElement('button');
  btnRestore.innerText = 'Khôi phục';
  btnRestore.style.cssText = 'padding:4px 14px;cursor:pointer;font-weight:bold;';
  btnRestore.addEventListener('click', function () {
    WINNER = parsed;
    refreshPanel();
    console.log("Winners restored:", WINNER.length);
    dismissBanner();
  });
 
  var btnDiscard = document.createElement('button');
  btnDiscard.innerText = 'Bỏ qua';
  btnDiscard.style.cssText = 'padding:4px 14px;cursor:pointer;';
  btnDiscard.addEventListener('click', function () {
    localStorage.removeItem(STORAGE_KEY);
    console.log("Stored winners discarded.");
    dismissBanner();
  });
 
  banner.appendChild(msg);
  banner.appendChild(btnRestore);
  banner.appendChild(btnDiscard);
  document.body.appendChild(banner);
}

function mergeWinners() {
  var stored;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    console.warn("Could not read localStorage:", e);
    return;
  }
 
  var parsed;
  try {
    parsed = JSON.parse(stored);
  } catch (e) {
    alert("Dữ liệu phiên trước bị lỗi, không thể gộp.");
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
 
  var currentIds = WINNER.map(function (w) { return w["Mã NV"]; });
  var merged     = 0;
  var skipped    = 0;
 
  parsed.forEach(function (storedWinner) {
    if (currentIds.indexOf(storedWinner["Mã NV"]) === -1) {
      WINNER.push(storedWinner);
      currentIds.push(storedWinner["Mã NV"]);
      merged++;
    } else {
      skipped++;
      console.log("Duplicate skipped during merge:", storedWinner["Mã NV"]);
    }
  });
 
  parsed.forEach(function (storedWinner) {
    var prizeName = storedWinner.prize;
    for (var i = 0; i < PRIZES.length; i++) {
      if (PRIZES[i].tenGiai === prizeName) {
        PRIZES[i].qty--;
        break;
      }
    }
  });
 
  PRIZES = PRIZES.filter(function (p) { return p.qty > 0; });
 
  if (PRIZES.length > 0) {
    PRIZE_INDEX = 0;
    SPIN_LEFT   = PRIZES[0].qty;
  } else {
    PRIZE_INDEX = -1;
    SPIN_LEFT   = 0;
    updatePrizeTitle();
  }
 
  updatePrizeTitle();
  refreshPanel();
  clearPrizeDropdown();
  populatePrizeDropdown();
  saveWinners();
 
  console.log("Merge complete. Merged:", merged, "Skipped duplicates:", skipped);
  alert(
    "Đã gộp " + merged + " người thắng từ phiên trước." +
    (skipped > 0 ? "\nBỏ qua " + skipped + " trùng lặp." : "") +
    "\nGiải còn lại: " + PRIZES.length
  );
}

function exportWinners() {
  if (!WINNER || WINNER.length === 0) {
    alert("Không có người trúng giải để xuất");
    return;
  }

  var exportData = WINNER.map(function(person, index) {
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
  localStorage.removeItem(STORAGE_KEY);
  XLSX.writeFile(wb, "danh_sach_trung_thuong.xlsx");
}

function reset() {
  console.log("reset");
  for (var i = 0; i < NUM_SLOTS; i++) {
    $("#num" + i).stop().css({ backgroundPosition: "0px 0px" });
  }
  $('#numbers3').hide();
}
 
function runEvent() {
  console.log("runEvent");
  if (PRIZES.length === 0 || DATA == null || DATA.Sheet1 == null) {
    return;
  }
  $('#configtime').hide();
  $('#numbers3').hide();
  $('#prizeselect').show();
  $('#showtime').show();
  mergeWinners();
}
 
function loadBackground(num) {
  BACKGROUND_PRESET = num;
  $('body').css('background-image', 'url(./backdrop/' + num + '.jpg)');
  chooseNew();
  doIt();
}

//LISTENERS
$("#side_notch").click(function() {
  $(this).toggleClass("open");
  $("#side_panel").toggleClass("open");
  $("body").toggleClass("shifted");
  $(this).html($("#side_panel").hasClass("open") ? "&#9654;" : "&#9664;");
});

$(".panel_tab").click(function() {
  var tab = $(this).attr("data-tab");
  $(".panel_tab").removeClass("active");
  $(".panel_content").removeClass("active");
  $(this).addClass("active");
  $("#tab_" + tab).addClass("active");
});

$("#winners_table .edit-prize").live("focusout", function() {
  if (IS_SPINNING) return;
  var index = $(this).closest("tr").attr("data-index");
  WINNER[index].prize = $(this).text().trim();
  saveWinners();
});

$("#winners_table .edit-prize").live("keydown", function(e) {
  if (e.keyCode === 13) {
    e.preventDefault();
    document.activeElement.blur();
  }
});

$("#winners_table [contenteditable]").live("focus", function() {
  if (IS_SPINNING) {
    document.activeElement.blur();
  }
});

$("#prizes_table [contenteditable]").live("keydown", function(e) {
  if (e.keyCode === 13) {
    e.preventDefault();
    document.activeElement.blur();
  }
});

$("#prizes_table [contenteditable]").live("focus", function() {
  if (IS_SPINNING) {
    document.activeElement.blur();
  }
});

$("#prizes_table .edit-name").live("focusout", function() {
  if (IS_SPINNING) return;
  var index = $(this).closest("tr").attr("data-index");
  PRIZES[index].tenGiai = $(this).text().trim();
  updatePrizeTitle();
  clearPrizeDropdown();
  populatePrizeDropdown();
});

$("#prizes_table .edit-qty").live("focusout", function() {
  if (IS_SPINNING) return;
  var index = $(this).closest("tr").attr("data-index");
  var val = parseInt($(this).text().trim());
  if (!isNaN(val) && val >= 0) {
    PRIZES[index].qty = val;
    if (parseInt(index) === PRIZE_INDEX) {
      SPIN_LEFT = val;
      updatePrizeTitle();
    }
  } else {
    $(this).text(PRIZES[index].qty);
  }
});

document.querySelector("#file").addEventListener('change', handleFile, false);
document.querySelector("#file2").addEventListener('change', handlePrizeFile, false);

document.addEventListener('keydown', function (e) {
  if (document.activeElement && document.activeElement.contentEditable === 'true') return;
  if (e.code === 'Space') {
    e.preventDefault();
    requestFullscreen();
    if (!IS_SPINNING) {
      console.log("not spinning now spin");
      spinPrize();
    } else {
      quickStop();
    }
  }
});
 
window.addEventListener('beforeunload', function (e) {
  if (WINNER.length > 0) {
    e.preventDefault();
  }
});
 
document.getElementById('prizesubmit').addEventListener('click', function () {
  if (IS_SPINNING) return;
  var select        = document.getElementById('prizepick');
  var selectedIndex = select.value;
  if (selectedIndex === '') {
    alert('Chưa chọn giải?');
    return;
  }
  var index = parseInt(selectedIndex, 10); 
  if (index >= 0 && index < PRIZES.length) {
    PRIZES[PRIZE_INDEX].qty = SPIN_LEFT;
    PRIZE_INDEX = index;
    SPIN_LEFT   = PRIZES[PRIZE_INDEX].qty;
    updatePrizeTitle();
  }
});

window.addEventListener('resize', () => {
  if (window.innerHeight == screen.height) {
    console.log('Fullscreen active');
    IS_FULLSCREEN = true; 
    handleFullscreenChange();
  } else {
    console.log('Normal screen');
    IS_FULLSCREEN = false; 
    handleFullscreenChange();
  }
});

function requestFullscreen() {
  var elem = document.documentElement; 
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE/Edge */
    elem = window.top.document.body;
    elem.msRequestFullscreen();
  }
}

function handleFullscreenChange() {
  //fullscreenElement is not a boolean. It will be null or not null based on the fsn status of the 
  //browser. !() checks the value of var if null false not null true. Second ! negates that. 
  var headerEl     = document.querySelector('#header h1');
  var prizeTitleEl = document.querySelector('#prize_title');
  var clearEl      = document.getElementById('clr');
  var numberEl     = document.querySelector('#numbers2');
  var nameEl       = document.querySelector('#numbers3');
  
  if (IS_FULLSCREEN) {
    if (BASE_HEADER_FONTSIZE === null) {
      BASE_HEADER_FONTSIZE  = parseFloat(getComputedStyle(headerEl).fontSize);
      BASE_PRIZE_FONTSIZE   = parseFloat(getComputedStyle(prizeTitleEl).fontSize);
    }

    headerEl.style.fontSize     = (BASE_HEADER_FONTSIZE  * 1.05) + 'px';
    prizeTitleEl.style.fontSize = (BASE_PRIZE_FONTSIZE   * 1.1) + 'px';

    if (clearEl) clearEl.removeAttribute('hidden');
    numberEl.classList.add("zoomin");
    nameEl.classList.add("zoomin");
  } else {
    headerEl.style.fontSize     = '';
    prizeTitleEl.style.fontSize = '';
    numberEl.classList.remove("zoomin");
    nameEl.classList.remove("zoomin");

    if (clearEl) clearEl.setAttribute('hidden', '');

    BASE_HEADER_FONTSIZE = null;
    BASE_PRIZE_FONTSIZE  = null;
  }
}

$(function () {
  loadWinners();
  startIdle();
});