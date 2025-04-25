// utils.js - Fonctions utilitaires

// --- Gestion du stockage local ---
const APP_VERSION = "1.0_POC";
const LOCAL_KEYS = {
  LOGIN: "smarthome_login_" + APP_VERSION,
  DEVICES: "smarthome_devices_" + APP_VERSION,
  AUTOMATION: "smarthome_auto_" + APP_VERSION,
  ENERGY: "smarthome_energy_" + APP_VERSION,
  PRESENCE: "smarthome_presence_" + APP_VERSION,
  VACATION: "smarthome_vacation_" + APP_VERSION
};

const DEFAULT_USER = {user: "demo", pin: "1234"};

// Session/User
function getLoginStatus() {
  return Boolean(localStorage.getItem(LOCAL_KEYS.LOGIN));
}

function setLoginStatus(val) {
  if (val) localStorage.setItem(LOCAL_KEYS.LOGIN, "1");
  else localStorage.removeItem(LOCAL_KEYS.LOGIN);
}

// Device state
function loadDevices() {
  let str = localStorage.getItem(LOCAL_KEYS.DEVICES);
  return str ? JSON.parse(str) : JSON.parse(JSON.stringify(initialDevices));
}

function saveDevices(dev) {
  localStorage.setItem(LOCAL_KEYS.DEVICES, JSON.stringify(dev));
}

// Automation rules
function loadAutomation() {
  let str = localStorage.getItem(LOCAL_KEYS.AUTOMATION);
  return str ? JSON.parse(str) : JSON.parse(JSON.stringify(initialAutomation));
}

function saveAutomation(rules) {
  localStorage.setItem(LOCAL_KEYS.AUTOMATION, JSON.stringify(rules));
}

// Energy data
function loadEnergyHistory() {
  let str = localStorage.getItem(LOCAL_KEYS.ENERGY);
  return str ? JSON.parse(str) : JSON.parse(JSON.stringify(initialEnergyHistory));
}

function saveEnergyHistory(lst) {
  localStorage.setItem(LOCAL_KEYS.ENERGY, JSON.stringify(lst));
}

// Presence
function loadPresence() {
  let val = localStorage.getItem(LOCAL_KEYS.PRESENCE);
  return val ? JSON.parse(val) : { here: true, lastGeo: {lat: 48.857, lon: 2.352}, lastUpdate: Date.now() };
}

function savePresence(pres) {
  localStorage.setItem(LOCAL_KEYS.PRESENCE, JSON.stringify(pres));
}

// Vacation mode
function loadVacation() {
  let val = localStorage.getItem(LOCAL_KEYS.VACATION);
  return val ? val === "1" : false;
}

function saveVacation(val) {
  localStorage.setItem(LOCAL_KEYS.VACATION, val ? "1" : "0");
}

// --- Notifications ---
function sendNotif(msg, type = "info") {
    const id = "notif_" + Math.random().toString(36).slice(2, 8);
    const icon = type === "success"
      ? '<i class="fas fa-check-circle"></i>'
      : type === "warning" ? '<i class="fas fa-exclamation-circle"></i>'
      : type === "error" ? '<i class="fas fa-times-circle"></i>'
      : '<i class="fas fa-bell"></i>';
  
    const bg = type === "success"
      ? "bg-green-500" : type === "warning"
      ? "bg-yellow-400" : type === "error"
      ? "bg-red-500" : "bg-blue-500";
  
    const n = document.createElement("div");
    n.id = id;
    n.className = `${bg} text-white px-4 py-2 rounded shadow-md fixed left-1/2 -translate-x-1/2 bottom-24 z-50 text-center fade-in transition-all`;
    n.innerHTML = `${icon} <span class="ml-2">${msg}</span>`;
    document.body.appendChild(n);
  
    setTimeout(() => { n.style.opacity = 0; }, 1000);
    setTimeout(() => { n.remove(); }, 3700);
  }
  
  

// --- Géolocalisation simulée ---
function simulateGeolocation(cb) {
  // Simulate random movement (toggle presence)
  let presence = loadPresence();
  presence.here = Math.random() > 0.4;
  presence.lastUpdate = Date.now();
  presence.lastGeo = presence.here
    ? {lat: 48.857 + (Math.random()-0.5)/300, lon:2.352 + (Math.random()-0.5)/300}
    : {lat: 47.382 + (Math.random()-0.5)/30, lon: 1.932 + (Math.random()-0.5)/30};
  savePresence(presence);
  if (cb) setTimeout(() => cb(presence), 400);
}

// --- Données initiales ---
const initialDevices = {
  lights: [
    { id: 1, name: "Salon", on: true, brightness: 80 },
    { id: 2, name: "Cuisine", on: false, brightness: 0 },
    { id: 3, name: "Chambre", on: false, brightness: 0 }
  ],
  thermostat: { temp: 21, target: 22, mode: "auto", heat: false },
  irrigation: { on: false, next: "18:00" },
  security: { armed: true, intrusion: false }
};

const initialAutomation = [
  { rule: "Si température < 20°C", action: "Activer le chauffage", enabled: true },
  { rule: "Si présence détectée après 19h", action: "Allumer lumières Salon", enabled: false }
];

const initialEnergyHistory = Array.from({length: 12}, (_, i) => ({
  hour: `${i+8}h`, usage: Math.random() * 1.5 + 0.5
}));