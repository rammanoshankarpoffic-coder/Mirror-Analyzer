const socket = io();

// Clock
function updateClock() {
  const now = new Date();
  const d = now.toLocaleDateString('en-GB', {
    day:'2-digit', month:'short', year:'numeric'
  });
  const t = now.toLocaleTimeString('en-GB');
  document.getElementById('clock').textContent = d + '  ' + t;
}
setInterval(updateClock, 1000);
updateClock();

// Session timer
let seconds = 0;
setInterval(() => {
  seconds++;
  const h = String(Math.floor(seconds/3600)).padStart(2,'0');
  const m = String(Math.floor((seconds%3600)/60)).padStart(2,'0');
  const s = String(seconds%60).padStart(2,'0');
  document.getElementById('session').textContent =
    `${h}:${m}:${s}`;
}, 1000);

function setBar(id, pct) {
  const el = document.getElementById(id);
  if (el) el.style.width = Math.min(pct,100) + '%';
}

function setBadge(id, text, color) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = 'badge ' + color;
}

function setVal(id, text, color) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  if (color) el.className = 'metric-val ' + color;
}

socket.on('health_data', (d) => {

  // Frame
  const img = document.getElementById('faceImg');
  if (d.frame) img.src = 'data:image/jpeg;base64,' + d.frame;

  // Top bar
  document.getElementById('fps').textContent = d.fps;
  document.getElementById('landmarks').textContent =
    d.face.landmarks;
  document.getElementById('b-lm').textContent =
    d.face.landmarks;
  document.getElementById('b-fps').textContent = d.fps;
  document.getElementById('b-alerts').textContent =
    d.alerts.length;
  document.getElementById('b-alerts').style.color =
    d.alerts.length > 0 ? '#ff1744' : '#00e676';

  // Face stats
  document.getElementById('st-lm').textContent =
    d.face.landmarks;
  document.getElementById('st-sym').textContent =
    d.face.symmetry.toFixed(1) + '%';

  // Alert banner
  const banner = document.getElementById('alertBanner');
  const alertText = document.getElementById('alertText');
  const redAlerts = d.alerts.filter(a => a.level === 'RED');
  if (redAlerts.length > 0) {
    banner.className = 'alert-banner red';
    alertText.textContent = 'WARNING  ' +
      redAlerts[0].message.toUpperCase();
  } else {
    banner.className = 'alert-banner';
    const fatigue = d.eyes.fatigue;
    alertText.textContent = fatigue
      ? 'MILD FATIGUE DETECTED - REST ADVISABLE  |  ALL CRITICAL FLAGS CLEAR'
      : 'ALL CRITICAL FLAGS CLEAR';
  }

  // Eyes
  setBar('bar-fatigue', d.eyes.fatigue_score);
  setVal('val-fatigue', d.eyes.fatigue_score + '%',
    d.eyes.fatigue_score > 50 ? 'yellow' : 'green');
  setBar('bar-redness', d.eyes.redness);
  setVal('val-redness',
    d.eyes.redness < 20 ? 'Low' : 'High',
    d.eyes.redness < 20 ? 'green' : 'red');
  setBadge('val-dark',
    d.eyes.dark_circles ? 'Mild' : 'NONE',
    d.eyes.dark_circles ? 'yellow' : 'green');
  setBar('bar-sym', d.face.symmetry);
  setVal('val-sym', d.face.symmetry.toFixed(0) + '%',
    d.face.symmetry > 75 ? 'green' : 'yellow');

  // Nose
  setBar('bar-nose-red', d.nose.redness);
  setVal('val-nose-red',
    d.nose.redness < 20 ? 'Low' : 'High',
    d.nose.redness < 20 ? 'green' : 'red');
  setBadge('val-pore', d.nose.pore_size, 'green');
  setBadge('val-black',
    d.nose.blackheads ? 'MILD' : 'NONE',
    d.nose.blackheads ? 'yellow' : 'green');
  setBadge('val-ncolor', d.nose.color_change, 'green');
  setBar('bar-nose-sym', d.nose.symmetry);
  setVal('val-nose-sym',
    d.nose.symmetry.toFixed(0) + '%', 'green');

  // Lips
  setVal('val-lipcolor', d.lips.lip_color, 'blue');
  setBadge('val-pallor',
    d.lips.pallor ? 'DETECTED' : 'NONE',
    d.lips.pallor ? 'red' : 'green');
  setBadge('val-cyan',
    d.lips.cyanosis ? 'DETECTED' : 'NOT DETECTED',
    d.lips.cyanosis ? 'red' : 'green');
  setBadge('val-dry',
    d.lips.dryness ? 'Mild' : 'None',
    d.lips.dryness ? 'yellow' : 'green');
  setBar('bar-lip-sym', d.lips.symmetry);
  setVal('val-lip-sym',
    d.lips.symmetry.toFixed(0) + '%', 'green');

  // Skin
  const skinEl = document.getElementById('skinDisease');
  skinEl.textContent = d.skin.disease;
  skinEl.className = 'skin-disease' +
    (d.skin.urgent ? ' urgent' : '');
  document.getElementById('skinConf').textContent =
    'Confidence: ' + d.skin.confidence + '%';

  // Melanoma flag
  setBadge('flag-mel',
    d.skin.urgent ? 'ALERT' : 'CLEAR',
    d.skin.urgent ? 'red' : 'green');

  // Score bars
  const barsDiv = document.getElementById('scoreBars');
  barsDiv.innerHTML = '';
  const scores = d.skin.scores;
  Object.entries(scores).forEach(([name, val]) => {
    const short = name.includes('(')
      ? name.split('(')[1].replace(')','')
      : name.substring(0,4);
    const h = Math.max(val * 0.35, 2);
    barsDiv.innerHTML += `
      <div class="score-bar-item">
        <div class="score-bar-pct">${val}%</div>
        <div class="score-bar-fill"
             style="height:${h}px"></div>
        <div class="score-bar-lbl">${short}</div>
      </div>`;
  });

  // PHI-3 report
  if (d.report) {
    document.getElementById('reportText')
      .textContent = d.report;
  }
});
