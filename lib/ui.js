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

function isTruncated(el) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var style = window.getComputedStyle(el);
  ctx.font = style.fontSize + ' ' + style.fontFamily;
  var textWidth = ctx.measureText(el.textContent).width;
  return textWidth > el.clientWidth;
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

document.addEventListener('keydown', function (e) {
  if (document.activeElement && document.activeElement.contentEditable === 'true') return;
  if (e.code === 'Space') {
    e.preventDefault();
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