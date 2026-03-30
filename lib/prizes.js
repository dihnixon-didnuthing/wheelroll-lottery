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
    requestFullscreen();
    handleFullscreenChange();
    stopConfetti();
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
      var name = PRIZES[capturedIndex].tenGiai;
      el.innerHTML = 'Giải <span class="prize_name_highlight">' + name + '</span> - Còn ' + capturedLeft + ' lượt';
      if (isTruncated(el)) {
        var shortName = name.length > 20 ? name.substring(0, 20) + '...' : name;
        el.innerHTML = 'Giải <span class="prize_name_highlight">' + shortName + '</span><br>Còn ' + capturedLeft + ' lượt';
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