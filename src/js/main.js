/* =========================================================
   SENTINEL MESH // PLAYER
  Seven-scene cinematic presentation. Auto-advances through
   the sequence, loops back to scene one at the end.
   ========================================================= */

const SCENES = [
  {
    file: "videos/scene_00_boot.mp4",
    name: "BOOT",
    info: "SENTINEL // COLD START",
    sub:  "INITIALISING MESH CORE",
    tel:  "AES-256 // TFLITE-MICRO"
  },
  {
    file: "videos/scene_01_coverage.mp4",
    name: "THEATRE OVERVIEW",
    info: "RANGE GAP ANALYSIS",
    sub:  "NO GSM // NO REPEATER // NO EYES",
    tel:  "SURVEY COMPLETE"
  },
  {
    file: "videos/scene_02_deploy.mp4",
    name: "TIERED DEPLOYMENT",
    info: "8 SQUAD NODES // 40 OPERATORS",
    sub:  "$5 TAG // $45 NODE",
    tel:  "NO SIM // NO MONTHLY FEES"
  },
  {
    file: "videos/scene_03_tracking.mp4",
    name: "LIVE TRACKING",
    info: "14 OPERATORS ONLINE",
    sub:  "MESH ROUTED // NO INTERNET",
    tel:  "LATENCY < 100 MS"
  },
  {
    file: "videos/scene_04_selfheal.mp4",
    name: "SELF-HEALING",
    info: "SIMULATED NODE LOSS",
    sub:  "AUTOMATIC REROUTE",
    tel:  "0 PACKETS LOST"
  },
  {
    file: "videos/scene_05_threat.mp4",
    name: "THREAT DETECTION",
    info: "EDGE INFERENCE ACTIVE",
    sub:  "ON-DEVICE CLASSIFICATION",
    tel:  "ALERT LATENCY 0.8 S"
  },
  {
    file: "videos/scene_06_superiority.mp4",
    name: "SUPERIORITY",
    info: "COST // WEIGHT // LATENCY",
    sub:  "SENTINEL VS LEGACY SYSTEMS",
    tel:  "CAPABILITY SCORE"
  }
];

const $ = (id) => document.getElementById(id);
const boot          = $("boot");
const bootFill      = $("boot-fill");
const bootStat      = $("boot-status");
const app           = $("app");
const video         = $("player");
const sceneName     = $("scene-name");
const infoLine1     = $("info-line-1");
const infoLine2     = $("info-line-2");
const telemetry     = $("telemetry");
const timelineFill  = $("timeline-fill");
const timelineMarks = $("timeline-marks");
const timeCurrent   = $("time-current");
const timeTotal     = $("time-total");
const btnPlay       = $("btn-play");
const btnPrev       = $("btn-prev");
const btnNext       = $("btn-next");
const btnSpeed      = $("btn-speed");
const btnReplay     = $("btn-replay");
const unmuteBtn     = $("unmute");

let index = 0;

/* Speed control: cycle 1x -> 0.75x -> 0.5x -> 0.25x -> 1x */
const SPEEDS = [1, 0.75, 0.5, 0.25];
let speedIndex = 0;

/* ---------- BOOT SEQUENCE ---------- */

const bootSteps = [
  { t: "initialising mesh core",         w: 18 },
  { t: "loading crypto layer [AES-256]", w: 38 },
  { t: "loading edge inference",         w: 58 },
  { t: "loading geo reference [ZIM-19]", w: 78 },
  { t: "authenticating operators",       w: 92 },
  { t: "SENTINEL ONLINE",                w: 100 }
];

function runBoot() {
  let i = 0;
  const tick = () => {
    if (i >= bootSteps.length) {
      setTimeout(() => {
        boot.classList.add("fade");
        setTimeout(() => {
          boot.style.display = "none";
          app.hidden = false;
          loadScene(0, true);
        }, 600);
      }, 400);
      return;
    }
    const step = bootSteps[i++];
    bootFill.style.width = step.w + "%";
    bootStat.textContent = step.t;
    setTimeout(tick, 300);
  };
  tick();
}

/* ---------- SCENE CONTROL ---------- */

function buildMarks() {
  timelineMarks.innerHTML = "";
  SCENES.forEach((s, i) => {
    const m = document.createElement("div");
    m.className = "mark" + (i === 0 ? " active" : "");
    m.title = s.name;
    m.addEventListener("click", () => loadScene(i, true));
    timelineMarks.appendChild(m);
  });
}

function updateMark() {
  [...timelineMarks.children].forEach((m, i) => {
    m.classList.toggle("active", i === index);
  });
}

function loadScene(i, autoplay = true) {
  index = ((i % SCENES.length) + SCENES.length) % SCENES.length;
  const s = SCENES[index];

  sceneName.textContent = "SCENE " + String(index).padStart(2, "0") + " // " + s.name;
  infoLine1.textContent = s.info;
  infoLine2.textContent = s.sub;
  telemetry.textContent = s.tel;

  document.querySelector(".overlay-info").classList.add("show");
  telemetry.classList.add("show");

  video.src = s.file;
  video.load();
  updateMark();

  if (autoplay) {
    video.play().catch(() => {});
  }
}

/* ---------- VIDEO EVENTS ---------- */

video.addEventListener("ended", () => {
  // Loop through the sequence forever
  setTimeout(() => loadScene(index + 1, true), 350);
});

video.addEventListener("loadedmetadata", () => {
  if (isFinite(video.duration)) {
    timeTotal.textContent = fmt(video.duration);
  }
});

video.addEventListener("timeupdate", () => {
  if (video.duration && isFinite(video.duration)) {
    const pct = (video.currentTime / video.duration) * 100;
    timelineFill.style.width = pct + "%";
    timeCurrent.textContent = fmt(video.currentTime);
  }
});

video.addEventListener("play",  () => btnPlay.textContent = "❚❚");
video.addEventListener("pause", () => btnPlay.textContent = "▶");

/* ---------- CONTROLS ---------- */

btnPlay.addEventListener("click", () => {
  if (video.paused) video.play();
  else video.pause();
});

btnPrev.addEventListener("click", () => loadScene(index - 1, true));
btnNext.addEventListener("click", () => loadScene(index + 1, true));

btnSpeed.addEventListener("click", () => {
  speedIndex = (speedIndex + 1) % SPEEDS.length;
  const s = SPEEDS[speedIndex];
  video.playbackRate = s;
  btnSpeed.textContent = (s === 1 ? "1x" : s + "x");
});

/* Preserve chosen speed when a new scene loads */
video.addEventListener("loadedmetadata", () => {
  video.playbackRate = SPEEDS[speedIndex];
});

btnReplay.addEventListener("click", () => loadScene(0, true));

unmuteBtn.addEventListener("click", () => {
  video.muted = !video.muted;
  unmuteBtn.classList.toggle("on", !video.muted);
  unmuteBtn.textContent = video.muted ? "SOUND" : "MUTED";
});

/* Keyboard shortcuts */
document.addEventListener("keydown", (e) => {
  if (e.key === " ")          { e.preventDefault(); btnPlay.click(); }
  if (e.key === "ArrowRight") btnNext.click();
  if (e.key === "ArrowLeft")  btnPrev.click();
  if (e.key === "r" || e.key === "R") btnReplay.click();
  if (e.key === "m" || e.key === "M") unmuteBtn.click();
  if (e.key === "s" || e.key === "S") btnSpeed.click();
});

/* ---------- UTIL ---------- */

function fmt(sec) {
  sec = Math.max(0, Math.floor(sec));
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return m + ":" + s;
}

/* ---------- GO ---------- */

buildMarks();
runBoot();