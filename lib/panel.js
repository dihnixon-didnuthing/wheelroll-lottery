function refreshPanel() {
  if (!IS_FILE_LOADED) {
  $("#name_input_box").show();
  $("#winners_table").hide();
  } else {
    $("#name_input_box").hide();
    $("#winners_table").show();
  }
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
  var eligible = IS_ALLOW_REPICK
    ? (DATA && DATA.Sheet1 ? DATA.Sheet1.length : 0)
    : (DATA && DATA.Sheet1 ? DATA.Sheet1.length : 0) - WINNER.length;
  document.getElementById('total_eligible').innerText = eligible < 0 ? 0 : eligible;
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
  var addRow = document.createElement("tr");
  addRow.id = "add_prize_row";
  addRow.innerHTML = "<td colspan='3'>＋</td>";
  pBody.append(addRow);
}

$("#add_prize_row").live("click", function() {
  if (document.querySelector(".new-prize-row")) return;
  var pb = document.querySelector("#prizes_table tbody");
  var addRow = document.getElementById("add_prize_row");

  var tr = document.createElement("tr");
  tr.className = "new-prize-row";
  tr.innerHTML =
    "<td></td>" +
    "<td contenteditable='true' data-ph='Tên giải...'></td>" +
    "<td contenteditable='true' data-ph='Số lượng...'></td>";
  pb.insertBefore(tr, addRow);

  var nameCell = tr.children[1];
  var qtyCell  = tr.children[2];
  nameCell.focus();

  var committed = false;
  function tryCommit() {
    if (committed) return;
    var name = nameCell.textContent.trim();
    var qty  = parseInt(qtyCell.textContent.trim());
    if (!name || isNaN(qty) || qty <= 0) return;
    committed = true;
    PRIZES.push({ tenGiai: name, qty: qty });
    if (PRIZES.length === 1) { PRIZE_INDEX = 0; SPIN_LEFT = qty; updatePrizeTitle(true); }
    document.getElementById("badge_prizes").innerText = PRIZES.length;
    refreshPanel();
  }

  [nameCell, qtyCell].forEach(function(cell) {
    cell.addEventListener("keydown", function(e) {
      if (cell === qtyCell) {
        var allowed = ["Backspace","Delete","ArrowLeft","ArrowRight","Tab","Enter"];
        if (allowed.indexOf(e.key) === -1 && !/^\d$/.test(e.key)) {
          e.preventDefault();
          if (e.key.length === 1) {
            showNotification("Số lượng chỉ nhận số nguyên dương", "error");
          }
          return;
        }
      }
      if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); tryCommit(); }
      if (e.key === "Tab")   { e.preventDefault(); (cell === nameCell ? qtyCell : nameCell).focus(); }
    });
    cell.addEventListener("focusout", function() {
      setTimeout(function() {
        if (!tr.contains(document.activeElement)) tryCommit();
      }, 120);
    });
  });
}
);

$("#side_notch").click(function() {
  $(this).toggleClass("open");
  $("#side_panel").toggleClass("open");
  $("body").toggleClass("shifted");
  $("#header h1").toggleClass("shifted");
  $("#prize_title").toggleClass("shifted");
  $(this).html($("#side_panel").hasClass("open") ? "&#9654;" : "&#9664;");
  setTimeout(function() {
    if (PRIZES.length > 0 && PRIZE_INDEX >= 0) updatePrizeTitle(false);
  }, 420);
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
  if (e.keyCode === 13 && !e.altKey) {
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
      //populatePrizeDropdown();
    }
  }
});

$("#prizes_table .edit-name").live("focusout", function() {
  if (IS_SPINNING) return;
  var index = parseInt($(this).closest("tr").attr("data-index"));
  var newName = $(this).html().replace(/<br\s*\/?>/gi, "\n").trim();
  var nameChanged = index === PRIZE_INDEX && newName !== PRIZES[index].tenGiai;
  PRIZES[index].tenGiai = newName;
  updatePrizeTitle(nameChanged);
  clearPrizeDropdown();
  //populatePrizeDropdown();
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

document.addEventListener("keydown", function(e) {
  if (!e.target.classList.contains("edit-name")) return;
  if (e.key === "Enter" && e.altKey) {
    e.preventDefault();
    console.log("Alt+Enter detected, inserting line break");
    var sel = window.getSelection();
    if (!sel.rangeCount) return;
    var range = sel.getRangeAt(0);
    range.deleteContents();
    var br = document.createElement("br");
    range.insertNode(br);
    range.setStartAfter(br);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }
});