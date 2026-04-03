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

var SCALES = { header: 1, showtime: 1, prize_title: 1 };

function makeResizable(el, key) {
  el.addEventListener("dblclick", function(e) {
    // if h1 is being edited, don't trigger resize
    if (e.target.contentEditable === "true") return;

    // remove any existing active
    document.querySelectorAll(".resizable-active").forEach(function(x) {
      x.classList.remove("resizable-active");
      var h = x.querySelector(".resize-handle");
      if (h) h.remove();
    });

    el.classList.add("resizable-active");

    var handle = document.createElement("div");
    handle.className = "resize-handle";
    el.appendChild(handle);

    var startX, startY, startScale;

    handle.addEventListener("mousedown", function(e) {
      e.preventDefault();
      e.stopPropagation();
      startX     = e.clientX;
      startY     = e.clientY;
      startScale = SCALES[key];

      function onMove(e) {
        var dx = e.clientX - startX;
        var dy = e.clientY - startY;
        var delta = (dx + dy) / 200;
        SCALES[key] = Math.max(0.3, Math.min(3, startScale + delta));
        el.style.zoom = SCALES[key];
      }

      function onUp() {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup",   onUp);
      }

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup",   onUp);
    });
    if (key === "prize_title") {
      var wHandle = document.createElement("div");
      wHandle.className = "resize-handle-w";
      el.appendChild(wHandle);

      var startWX, startWidth;
      wHandle.addEventListener("mousedown", function(e) {
        e.preventDefault(); e.stopPropagation();
        startWX    = e.clientX;
        startWidth = parseFloat(el.style.width) || el.offsetWidth;
        function onMove(e) {
          var maxAllowed = document.getElementById("main_content").offsetWidth * 0.98;
          var newWidth = Math.min(maxAllowed, Math.max(100, startWidth + (e.clientX - startWX) * 2));
          el.style.maxWidth = newWidth + "px";
          el.style.width    = newWidth + "px";
          if (PRIZES.length > 0 && PRIZE_INDEX >= 0) updatePrizeTitle(false);
        }
        function onUp() {
          document.removeEventListener("mousemove", onMove);
          document.removeEventListener("mouseup", onUp);
        }
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
      });
    }
  });
}

// Dismiss on outside click
document.addEventListener("click", function(e) {
  var active = document.querySelector(".resizable-active");
  if (active && !active.contains(e.target)) {
    active.classList.remove("resizable-active");
    active.querySelectorAll(".resize-handle, .resize-handle-w").forEach(function(h){ h.remove(); });
  }
});

makeResizable(document.getElementById("prize_title"), "prize_title");
makeResizable(document.getElementById("header"),   "header");
makeResizable(document.getElementById("showtime"), "showtime");

function handleFullscreenChange() {
  // // Check for Fullscreen API only (not F11)
  IS_FULLSCREEN = !!document.fullscreenElement;
  // console.log("Fullscreen state changed: " + IS_FULLSCREEN);
  // 
  // var headerEl     = document.querySelector('#header h1');
  // var prizeTitleEl = document.querySelector('#prize_title');
  // var clearEl      = document.getElementById('clr');
  // var numberEl     = document.querySelector('#numbers2');
  // var nameEl       = document.querySelector('#numbers3');
  //   
  // if (IS_FULLSCREEN) {
  // //    if (BASE_HEADER_FONTSIZE === null) {
  // //      BASE_HEADER_FONTSIZE  = parseFloat(getComputedStyle(headerEl).fontSize);
  // //      BASE_PRIZE_FONTSIZE   = parseFloat(getComputedStyle(prizeTitleEl).fontSize);
  // //    }
  // //    headerEl.style.fontSize     = (BASE_HEADER_FONTSIZE  * 1.05) + 'px';
  // //    prizeTitleEl.style.fontSize = (BASE_PRIZE_FONTSIZE   * 1.1) + 'px';
  //   if (clearEl) clearEl.removeAttribute('hidden');
  //   numberEl.classList.add("zoomin");
  //   nameEl.classList.add("zoomin");
  // } else {
  //   headerEl.style.fontSize     = '';
  //   prizeTitleEl.style.fontSize = '';
  //   numberEl.classList.remove("zoomin");
  //   nameEl.classList.remove("zoomin");
  //   if (clearEl) clearEl.setAttribute('hidden', '');
  //   BASE_HEADER_FONTSIZE = null;
  //   BASE_PRIZE_FONTSIZE  = null;
  // }
  headerEl     = document.querySelector('#header');
  if (IS_FULLSCREEN) {
    headerEl.style.paddingTop = '8vw';
  } else {
  headerEl.style.paddingTop = '';
  headerEl.style.backgroundColor = '';
  }
  return;
}

function fitName(el, name, prefix, suffix) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var style = window.getComputedStyle(el);
  ctx.font = style.fontSize + ' ' + style.fontFamily;
  var maxWidth = el.clientWidth;

  // Check if full name fits
  if (ctx.measureText(prefix + name + suffix).width <= maxWidth) return name;

  // Binary search for longest fitting substring
  var lo = 0, hi = name.length;
  while (lo < hi) {
    var mid = Math.floor((lo + hi + 1) / 2);
    if (ctx.measureText(prefix + name.substring(0, mid) + '...' + suffix).width <= maxWidth) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return name.substring(0, lo) + '...';
}

function showNotification(message, type) {
  var color = type === 'error' ? '#c0392b' : '#2ecc71';

  var notif = document.createElement('div');
  notif.style.cssText = [
    'position:fixed', 'top:20px', 'right:-400px',
    'background:' + color, 'color:white',
    'font-family:Arial,sans-serif', 'font-size:14px',
    'padding:12px 20px', 'border-radius:6px 0 0 6px',
    'z-index:99999', 'max-width:320px',
    'box-shadow: -2px 2px 8px rgba(0,0,0,0.4)',
    'transition:right 0.4s ease-out'
  ].join(';');
  notif.innerText = message;
  document.body.appendChild(notif);

  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      notif.style.right = '0px';
    });
  });

  setTimeout(function() {
    notif.style.right = '-400px';
    notif.addEventListener('transitionend', function() {
      if (notif.parentNode) notif.parentNode.removeChild(notif);
    });
  }, 3500);
}

//LISTENERS
document.querySelector("#file").addEventListener('change', handleFile, false);
document.querySelector("#file2").addEventListener('change', handlePrizeFile, false);

document.getElementById("name_input").addEventListener("input", function() {
  loadNamesFromTextarea();
  refreshPanel();
});

document.querySelector("#header h1").addEventListener("dblclick", function() {
  this.contentEditable = "true";
  this.focus();
});

document.querySelector("#header h1").addEventListener("blur", function() {
  this.contentEditable = "false";
});

document.querySelector("#header h1").addEventListener("keydown", function(e) {
   if (e.key === "ArrowDown") {
     e.preventDefault();
     document.execCommand("insertLineBreak");
     return;
   }
  if (e.key === "Enter") { e.preventDefault(); this.blur(); }
});

document.addEventListener('keydown', function (e) {
  if (document.activeElement && document.activeElement.contentEditable === 'true') return;
  if (document.activeElement && document.activeElement.id === 'name_input') return;
  if (e.code === 'Space') {
    e.preventDefault();
    if (!IS_SPINNING) {
      spinPrize();
      console.log("not spinning now spin");
    } else {
      quickStop();
    }
  }
});

document.getElementById("name_input").addEventListener("input", function() {
  if (this.value.trim().toLowerCase() === "demo") {
    this.value = "";
    loadDemoData();
    return;
  }
  loadNamesFromTextarea();
  refreshPanel();
});

function loadDemoData() {
  function loadFile(path, handler) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", path, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function() {
      var wb = XLSX.read(new Uint8Array(xhr.response), { type: "array" });
      handler(wb);
    };
    xhr.send();
  }
  loadFile("./asset/sample_data/DEMO_NAME.xlsx", handleWorkbook);
  loadFile("./asset/sample_data/DEMO_PRIZE.xlsx", handlePrizeWorkbook);
}
 
window.addEventListener('beforeunload', function (e) {
  if (WINNER.length > 0) {
    e.preventDefault();
  }
});
 

// document.getElementById('prizesubmit').addEventListener('click', function () {
//   if (IS_SPINNING) return;
//   var select        = document.getElementById('prizepick');
//   var selectedIndex = select.value;
//   if (selectedIndex === '') {
//     alert('Chưa chọn giải?');
//     return;
//   }
//   var index = parseInt(selectedIndex, 10); 
//   if (index >= 0 && index < PRIZES.length) {
//     PRIZES[PRIZE_INDEX].qty = SPIN_LEFT;
//     PRIZE_INDEX = index;
//     SPIN_LEFT   = PRIZES[PRIZE_INDEX].qty;
//     updatePrizeTitle();
//   }
// });

document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('keydown', (e) => {
  if (e.key === 'F11') {
    e.preventDefault(); // Prevent default F11 behavior
    requestFullscreen(); // Trigger Fullscreen API
  }
});
window.addEventListener('resize', handleFullscreenChange);