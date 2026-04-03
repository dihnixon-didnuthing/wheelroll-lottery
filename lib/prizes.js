function spinPrize() {
  if (PRIZES.length == 0) {
    $("#configtime").addClass("flash");
    $("#configtime").one("animationend", function() {
      $(this).removeClass("flash");
    });
    return;
  }
  if (!IS_FILE_LOADED) {
    document.getElementById('configtime').style.opacity = '0.2';
  }
  if (IS_IDLE) stopIdle();
  if (SPIN_LEFT <= 0) {
    moveToNextPrize();
    return;
  }
  if (!IS_SPINNING) {
    requestFullscreen();
    handleFullscreenChange();
    stopConfetti();
    $('#numbers2').removeClass('winning');
    chooseNew();
    setTimeout(doIt(), 1500);
    IS_SPINNING = true;
    $("#prizes_table [contenteditable]").attr("contenteditable", "false");
  }
  return;
}

function moveToNextPrize() {
  for (var i = PRIZE_INDEX + 1; i < PRIZES.length; i++) {
    if (PRIZES[i].qty > 0) {
      PRIZE_INDEX = i;
      SPIN_LEFT = PRIZES[i].qty;
      updatePrizeTitle(true);
      return;
    }
  }
  for (var i = 0; i < PRIZES.length; i++) {
    if (PRIZES[i].qty > 0) {
      PRIZE_INDEX = i;
      SPIN_LEFT = PRIZES[i].qty;
      updatePrizeTitle(true);
      return;
    }
  }
  PRIZE_INDEX = -1;
  var el = document.querySelector("#prize_title");
  el.innerText = "Hết giải!";
  exportWinners();
}

function updatePrizeTitle(nameChanged) {
  var el = document.querySelector("#prize_title");
  var capturedIndex = PRIZE_INDEX;
  var capturedLeft = SPIN_LEFT;

  if (nameChanged) {
    el.classList.remove("sweep");
    void el.offsetWidth;
    el.classList.add("sweep");
  }

  setTimeout(function() {
  if (capturedIndex >= 0 && capturedIndex < PRIZES.length) {
    var name   = PRIZES[capturedIndex].tenGiai;
    var suffix = ' - Còn ' + capturedLeft + ' lượt';

    if (name.indexOf("\n") !== -1) {
  // Manual break — respect it exactly, no truncation
      var parts = name.split("\n");
      el.innerHTML = 'Giải <span class="prize_name_highlight">' + parts[0] + '<br>' + parts[1] + '</span><br>Còn ' + capturedLeft + ' lượt';
    } else {
      // Auto-fit logic
      var fittedSingle = fitName(el, name, 'Giải ', suffix);
      if (fittedSingle === name) {
        el.innerHTML = 'Giải <span class="prize_name_highlight">' + name + '</span>' + suffix;
      } else {
        var fittedBroke = fitName(el, name, 'Giải ', '');
        el.innerHTML = 'Giải <span class="prize_name_highlight">' + fittedBroke + '</span><br>Còn ' + capturedLeft + ' lượt';
      }
    }

    // Try single line first
    var fittedSingle = fitName(el, name, 'Giải ', suffix);
    if (fittedSingle === name) {
      // Fits — single line
      el.innerHTML = 'Giải <span class="prize_name_highlight">' + name + '</span>' + suffix;
    } else {
      // Doesn't fit — break into two lines, fit name on first line alone
      var fittedBroke = fitName(el, name, 'Giải ', '');
      el.innerHTML = 'Giải <span class="prize_name_highlight">' + fittedBroke + '</span><br>Còn ' + capturedLeft + ' lượt';
    }

    $("input[name='prize_select']").removeAttr('checked');
    $("input[name='prize_select'][value='" + capturedIndex + "']").attr('checked', 'checked');
  } else {
    el.innerText = "Hết giải!";
  }
}, nameChanged ? 300 : 0);
}


function clearPrizeDropdown() {
  return;
  const select = document.getElementById('prizepick');
  while (select.firstChild) {
    select.removeChild(select.firstChild);
  }
}

//function populatePrizeDropdown() {
  // const select = document.getElementById('prizepick');
  // PRIZES.forEach(function (prize, index) {
  //   const option = document.createElement('option');
  //   option.value = index;
  //   option.textContent = prize.tenGiai;
  //   select.appendChild(option);
  // });
//}