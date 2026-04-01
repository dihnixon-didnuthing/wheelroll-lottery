var NUM_FUNCTIONS = new Array(NUM_SLOTS).fill(reanimate);

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
    if (!IS_FILE_LOADED && !IS_ALLOW_REPICK) {
      var ta = document.getElementById("name_input");
      var lines = ta.value.split("\n").map(function(l){ return l.trim(); }).filter(function(l){ return l.length > 0; });
      lines = lines.filter(function(l){ return l !== PERSON["Họ và tên"]; });
      ta.value = lines.join("\n");
      loadNamesFromTextarea();
      refreshPanel();
    }
    launchConfetti();
    var winClass = WINNER.length % 2 === 0 ? "win1" : "win2";
    $("#numbers2").addClass(winClass);
    saveWinners();
    $('#numbers3').show();
    setTimeout(function() {
      IS_SPINNING = false;
      $("#prizes_table [contenteditable]").attr("contenteditable", "true");
    }, 1000);

    if (PRIZES.length > 0 && PRIZE_INDEX >= 0 && PRIZE_INDEX < PRIZES.length) {
      SPIN_LEFT--;
      PRIZES[PRIZE_INDEX].qty--;
      updatePrizeTitle(false);
      refreshPanel();
 
      if (SPIN_LEFT === 0) {
        PRIZES[PRIZE_INDEX].qty=0;
        moveToNextPrize();
      }
    }

    document.querySelector("#report").innerText = IS_FILE_LOADED
    ? PERSON["Họ và tên"] + (DEPARTMENT ? " - " + DEPARTMENT : "")
    : "WINNER: " + PERSON["Họ và tên"];

    $("#winners_table").show();
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
function reset() {
  console.log("reset");
  for (var i = 0; i < NUM_SLOTS; i++) {
    $("#num" + i).stop().css({ backgroundPosition: "0px 0px" });
  }
  $('#numbers3').hide();
}

