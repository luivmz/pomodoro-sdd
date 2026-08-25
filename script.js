"use strict";

const WORK_DURATION_SECONDS = 25 * 60;
const SHORT_BREAK_DURATION_SECONDS = 5 * 60;
const TICK_INTERVAL_MILLISECONDS = 1000;

const MODES = Object.freeze({
  WORK: "WORK",
  SHORT_BREAK: "SHORT_BREAK",
});

let currentMode = MODES.WORK;
let remainingSeconds = WORK_DURATION_SECONDS;
let timerIntervalId = null;
let completedPomodoros = 0;
let isRunning = false;
let hasStartedCurrentCycle = false;

const modeElement = document.querySelector("#mode");
const timerElement = document.querySelector("#timer");
const counterElement = document.querySelector("#counter");
const notificationElement = document.querySelector("#notification");
const startButton = document.querySelector("#start-button");
const pauseButton = document.querySelector("#pause-button");
const resetButton = document.querySelector("#reset-button");

function getModeLabel() {
  return currentMode === MODES.WORK ? "Work" : "Short Break";
}

function getModeDuration() {
  return currentMode === MODES.WORK
    ? WORK_DURATION_SECONDS
    : SHORT_BREAK_DURATION_SECONDS;
}

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, Math.trunc(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function render() {
  const modeLabel = getModeLabel();
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  modeElement.textContent = modeLabel;
  timerElement.textContent = formatTime(remainingSeconds);
  timerElement.setAttribute(
    "aria-label",
    `Tiempo restante: ${minutes} minutos y ${seconds} segundos`,
  );
  counterElement.textContent = `Pomodoros completados: ${completedPomodoros}`;
  startButton.textContent = !isRunning && hasStartedCurrentCycle
    ? "Reanudar"
    : "Iniciar";
  document.body.dataset.mode = currentMode === MODES.WORK
    ? "work"
    : "short-break";
}

function stopTimer() {
  if (timerIntervalId !== null) {
    window.clearInterval(timerIntervalId);
  }

  timerIntervalId = null;
  isRunning = false;
}

function tick() {
  if (!isRunning || timerIntervalId === null) {
    return;
  }

  if (remainingSeconds > 0) {
    remainingSeconds -= 1;
  }

  render();

  if (remainingSeconds === 0) {
    stopTimer();
    render();
  }
}

function startTimer() {
  if (isRunning || timerIntervalId !== null) {
    return;
  }

  if (remainingSeconds === 0) {
    return;
  }

  hasStartedCurrentCycle = true;
  isRunning = true;
  timerIntervalId = window.setInterval(tick, TICK_INTERVAL_MILLISECONDS);
  render();
}

function pauseTimer() {
  if (!isRunning) {
    return;
  }

  stopTimer();
  render();
}

function resetTimer() {
  stopTimer();
  remainingSeconds = getModeDuration();
  hasStartedCurrentCycle = false;
  notificationElement.textContent = "";
  render();
}

startButton.addEventListener("click", startTimer);
pauseButton.addEventListener("click", pauseTimer);
resetButton.addEventListener("click", resetTimer);

render();
