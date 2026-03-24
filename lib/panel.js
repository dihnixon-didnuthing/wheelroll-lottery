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
  var eligible = (DATA.Sheet1 ? DATA.Sheet1.length : 0) - WINNER.length;
  document.getElementById('total_eligible').innerText = eligible < 0 ? 0 : eligible;
  $("#badge_winners").text(WINNER.length);
  $("#badge_prizes").text(PRIZES.length);

  var pBody = $("#prizes_table tbody");
  pBody.empty();
  for (var j = 0; j < PRIZES.length; j++) {
    var p = PRIZES[j];
    var checked = j === PRIZE_INDEX ? "checked" : "";
    pBody.append(
      "<tr data-index='" + j + "'>" +
      "<td><input type='radio' name='prize_select' value='" + j + "' " + checked + "></td>" +
        "<td contenteditable='true' class='edit-name'>" + p.tenGiai + "</td>" +
        "<td contenteditable='true' class='edit-qty'>" + p.qty + "</td>" +
      "</tr>"
    );
  }
}

$("#side_notch").click(function() {
  $(this).toggleClass("open");
  $("#side_panel").toggleClass("open");
  $("body").toggleClass("shifted");
  $("#header h1").toggleClass("shifted");
  $("#prize_title").toggleClass("shifted");
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

$("#prizes_table").live("change", function(e) {
  if (IS_SPINNING) {
    refreshPanel(); // revert the radio back to current PRIZE_INDEX
    return;
  }
  var target = $(e.target);
  if (target.attr("type") === "radio") {
    var index = parseInt(target.val());
    if (index >= 0 && index < PRIZES.length) {
      PRIZES[PRIZE_INDEX].qty = SPIN_LEFT;
      PRIZE_INDEX = index;
      SPIN_LEFT = PRIZES[PRIZE_INDEX].qty;
      updatePrizeTitle(true);
      clearPrizeDropdown();
      //populatePrizeDropdown();
    }
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

$("#prizes_table").live("change", function(e) {
  if (IS_SPINNING) return;
  var target = $(e.target);
  if (target.attr("type") === "radio") {
    var index = parseInt(target.val());
    if (index >= 0 && index < PRIZES.length) {
      PRIZES[PRIZE_INDEX].qty = SPIN_LEFT;
      PRIZE_INDEX = index;
      SPIN_LEFT = PRIZES[PRIZE_INDEX].qty;
      updatePrizeTitle(true);
      clearPrizeDropdown();
      populatePrizeDropdown();
    }
  }
});

$("#prizes_table .edit-name").live("focusout", function() {
  if (IS_SPINNING) return;
  var index = parseInt($(this).closest("tr").attr("data-index"));
  var newName = $(this).text().trim();
  var nameChanged = index === PRIZE_INDEX && newName !== PRIZES[index].tenGiai;
  PRIZES[index].tenGiai = newName;
  updatePrizeTitle(nameChanged);
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
      updatePrizeTitle(false);
    }
  } else {
    $(this).text(PRIZES[index].qty);
  }
});