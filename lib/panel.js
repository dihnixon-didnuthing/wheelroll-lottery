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