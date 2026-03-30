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
 
   if (!stored) return;

  var parsed;
  try {
    parsed = JSON.parse(stored);
  } catch (e) {
    alert("Dữ liệu phiên trước bị lỗi, không thể gộp.");
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  if (!Array.isArray(parsed) || parsed.length === 0) return;
 
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
    updatePrizeTitle(true);
  }
 
  updatePrizeTitle(true);
  refreshPanel();
  clearPrizeDropdown();
  populatePrizeDropdown();
  saveWinners();
 
  console.log("Merge complete. Merged:", merged, "Skipped duplicates:", skipped);
  // replace the alert() at the bottom of mergeWinners with:
  var msg = "Đã gộp " + merged + " người thắng từ phiên trước.";
  if (skipped > 0) msg += " Bỏ qua " + skipped + " trùng lặp.";
  showNotification(msg, 'success');
}

function exportWinners() {
  if (IS_EXPORTED) {
    showNotification("Đã xuất danh sách trúng thưởng.", "");
    return;
  }
  if (!WINNER || WINNER.length === 0) {
    showNotification("Không có người trúng giải để xuất", "error");
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
  XLSX.writeFile(wb, "DS_Trung_Thuong_" + new Date().toISOString().slice(0, 10) + ".xlsx");
  IS_EXPORTED = true;
}

function toggleRepick() {
  IS_ALLOW_REPICK = !IS_ALLOW_REPICK;
  var btn = document.getElementById("repick_toggle");
  btn.textContent = "Repick: " + (IS_ALLOW_REPICK ? "ON" : "OFF");
  btn.classList.toggle("on", IS_ALLOW_REPICK);
}

function chooseNew() {
  if (!DATA || !DATA.Sheet1 || DATA.Sheet1.length === 0) {
    if (!loadNamesFromTextarea()) {
      showNotification("Chưa có danh sách tên.", "error");
      return;
    }
  }
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
 
    if (!IS_ALLOW_REPICK && WINNER.some(function (w) { return w["Mã NV"] === PERSON["Mã NV"]; })) {
      console.log("Duplicate, repicking:", PERSON["Mã NV"]);
      showNotification("Trùng người thắng. Đang chọn lại...", "");
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