// app.js - JavaScript principal avec la logique de l'application

// --- Routage ---
let currentPage = "dashboard";

function setPage(page) {
  currentPage = page;
  window.location.hash = "#" + page;
  setTimeout(render, 60); // let hash propagate
}

window.onhashchange = function() {
  let h = window.location.hash.replace(/^#/, "");
  if (h && h !== currentPage) {
    currentPage = h;
    render();
  }
};

// --- Rendu principal ---
function render() {
  // Hide login if logged
  document.getElementById('login-modal').style.display = getLoginStatus() ? 'none' : 'flex';
  // Navigation highlighting
  Array.from(document.getElementsByClassName('nav-btn')).forEach(btn => {
    if (btn.dataset.page === currentPage) btn.classList.add('active-tab');
    else btn.classList.remove('active-tab');
  });
  // Main
  const main = document.getElementById('root');
  main.innerHTML = "";
  let content = "";
  switch(currentPage) {
    case "dashboard": content = renderDashboard(); break;
    case "devices": content = renderDevices(); break;
    case "automation": content = renderAutomation(); break;
    case "energy": content = renderEnergy(); break;
    case "settings": content = renderSettings(); break;
    default: content = renderDashboard(); break;
  }
  main.innerHTML = `<div class="fade-in">${content}</div>`;
  runAfterRender(currentPage);
}

function renderDashboard() {
  const devices = loadDevices();
  const presence = loadPresence();
  const vacation = loadVacation();
  return `
    <section class="text-center mb-3">
      <div class="mb-2 flex items-center justify-center">
        <span class="text-sm text-gray-600">${new Date().toLocaleString('fr-FR', { weekday: 'long', day:'2-digit', month: 'short', hour: '2-digit', minute: '2-digit'})}</span>
        <span class="tooltip ml-2 text-blue-400"><i class="fas fa-info-circle"></i>
          <span class="tooltiptext">Démo mobile – Données simulées</span>
        </span>
      </div>
      <div class="flex items-center justify-center gap-2">
        <span class="font-semibold text-xl text-blue-700">Bonjour ${DEFAULT_USER.user.charAt(0).toUpperCase()+DEFAULT_USER.user.slice(1)}</span>
        <span class="inline-flex items-center rounded-full px-2 ${presence.here?"bg-green-200 text-green-700":"bg-gray-200 text-gray-500"} text-xs ml-2"><i class="fas fa-map-marker-alt mr-1"></i>${presence.here?"Présent":"Absent"}</span>
        ${vacation?'<span class="ml-2 px-2 bg-yellow-100 text-yellow-600 rounded-full text-xs flex items-center"><i class="fas fa-umbrella-beach mr-1"></i>Vacances</span>':""}
      </div>
    </section>
    <section class="flex flex-wrap mb-4 gap-3 justify-center">
      ${dashboardCard("Lumières", devices.lights.filter(l=>l.on).length+"/"+devices.lights.length+" allumées", "fa-lightbulb", "#fde68a", "#f59e42", "devices", "#f9fafb")}
      ${dashboardCard("Température", Math.ceil(devices.thermostat.temp)+"°C", "fa-thermometer-half", "#a7f3d0", "#059669", "devices", "#f9fafb")}
      ${dashboardCard("Irrigation", devices.irrigation.on?"Activé":"Programmé", "fa-tint", "#bae6fd", "#2563eb","devices","#f9fafb")}
      ${dashboardCard("Sécurité", devices.security.armed? (devices.security.intrusion ? "Intrusion!": "Activée") : "Désactivée", devices.security.intrusion?"fa-exclamation-triangle":"fa-shield-alt", devices.security.intrusion?"#fecaca":"#dbeafe", devices.security.intrusion?"#b91c1c":"#1d4ed8", "devices", "#f9fafb")}
      ${dashboardCard("Énergie", avgEnergyUsage()+" kWh", "fa-bolt", "#fef9c3", "#fbbf24", "energy","#f9fafb")}
      ${dashboardCard("Automations", loadAutomation().filter(a=>a.enabled).length+" actives", "fa-robot", "#ddd6fe","#6d28d9","automation")}
    </section>
    <section class="rounded-xl p-4 bg-white shadow-sm mb-4">
      <h3 class="font-semibold text-base mb-2 flex items-center"><i class="fas fa-bolt mr-2 text-yellow-500"></i>Consommation actuelle</h3>
      <canvas id="dashboard-energy" height="116"></canvas>
      <div class="flex justify-between mt-1 text-xs text-gray-500">
        <span>8h</span><span>12h</span><span>16h</span><span>20h</span>
      </div>
    </section>
    <section class="rounded-xl p-4 bg-white shadow-sm mb-2">
      <h3 class="font-semibold text-base mb-3 flex items-center"><i class="fas fa-tasks mr-2 text-green-500"></i>Résumé automatisations</h3>
      <ul class="text-xs text-left">
        ${loadAutomation().filter(r=>r.enabled).map(r=>`<li class="mb-1"><span class="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 align-middle"></span>${r.rule} &rarr; <span class="font-semibold">${r.action}</span></li>`).join('')||"<li>Aucune automation active.</li>"}
      </ul>
    </section>
    <div class="text-xs text-gray-400 mt-4">Version démo | Pas de connexion réelle aux appareils • <span class="italic">Smart Home POC</span></div>
  `;
}

function dashboardCard(title, desc, icon, bg, fg, link, br) {
  return `<div
    onclick="setPage('${link}')"
    class="w-40 cursor-pointer rounded-lg shadow flex flex-col justify-center items-center px-3 py-2 hover:ring-2 hover:ring-blue-400 select-none"
    style="background:${br||'#fff'}"
    ><span class="mb-1 rounded-full p-2" style="background:${bg}"><i class="fas ${icon} text-lg" style="color:${fg};"></i></span><div class="font-semibold">${title}</div><div class="text-xs text-gray-500">${desc}</div></div>`;
}

function renderDevices() {
  const devices = loadDevices();
  return `
    <h2 class="font-bold text-lg mb-2 flex items-center"><i class="fas fa-sliders-h mr-2"></i>Appareils</h2>
    <section class="rounded-xl mb-4 bg-white shadow-sm py-2 px-3">
      <div class="flex justify-between items-center mb-2">
        <span class="font-semibold text-base"><i class="fas fa-lightbulb text-yellow-500 mr-2"></i>Lumières</span>
        <button onclick="toggleAllLights()" class="text-xs bg-yellow-100 px-3 py-1 rounded hover:bg-yellow-200 text-yellow-700">${lightAllOn()?"Éteindre tout":"Allumer tout"}</button>
      </div>
      ${devices.lights.map(l=>`
        <div class="flex items-center justify-between py-1 border-b last:border-b-0">
          <span><i class="fas fa-lightbulb mr-2 ${l.on?"text-yellow-400":"text-gray-300"}"></i>${l.name}</span>
          <div class="flex items-center">
            <label class="custom-toggle relative inline-block w-10 h-6 mr-2 align-middle">
              <input type="checkbox" ${l.on?"checked":""} onchange="toggleLight(${l.id})" class="opacity-0 w-0 h-0">
              <span class="bg absolute left-0 top-0 w-full h-full bg-gray-300 rounded-full transition"></span>
              <span class="dot absolute left-0 top-0 w-6 h-6 rounded-full bg-white shadow transition"></span>
            </label>
            <input type="range" min="0" max="100" value="${l.brightness}" ${l.on?"":"disabled"} onchange="setBrightness(${l.id}, this.value)" class="w-20 mx-1 align-middle">
            <span class="text-xs w-8 text-right">${l.brightness}%</span>
          </div>
        </div>
      `).join("")}
    </section>
    <section class="rounded-xl mb-4 bg-white shadow-sm py-2 px-3">
      <div class="flex items-center justify-between mb-2">
        <span class="font-semibold text-base"><i class="fas fa-thermometer-half text-green-500 mr-2"></i>Thermostat</span>
      </div>
      <div class="flex items-center mb-2">
        <span class="mr-2">Temp. actuelle:</span>
        <span class="text-xl text-blue-600 font-bold">${Math.ceil(devices.thermostat.temp)}°C</span>
        ${devices.thermostat.heat?'<i class="fas fa-fire ml-2 text-orange-500"></i>':""}
      </div>
      <div class="flex items-center">
        <button onclick="adjustTemp(-1)" class="rounded-full p-2 bg-blue-100 hover:bg-blue-200"><i class="fas fa-minus text-blue-600"></i></button>
        <span class="mx-3 text-lg font-semibold">${devices.thermostat.target}°C</span>
        <button onclick="adjustTemp(1)" class="rounded-full p-2 bg-blue-100 hover:bg-blue-200"><i class="fas fa-plus text-blue-600"></i></button>
        <span class="ml-4 text-xs">Mode&nbsp;
            <select onchange="setThermostatMode(this.value)" class="rounded border-gray-200 px-1 py-0.5">
                <option value="auto" ${devices.thermostat.mode==="auto"?"selected":""}>Auto</option>
                <option value="off"  ${devices.thermostat.mode==="off"?"selected":""}>Off</option>
            </select>
        </span>
      </div>
    </section>
    <section class="rounded-xl mb-4 bg-white shadow-sm py-2 px-3">
      <div class="flex items-center justify-between mb-2">
        <span class="font-semibold text-base"><i class="fas fa-tint text-blue-400 mr-2"></i>Irrigation Jardin</span>
        <button onclick="toggleIrrigation()" class="text-xs bg-blue-100 px-3 py-1 rounded hover:bg-blue-200 text-blue-700">${devices.irrigation.on?"Arrêter":"Démarrer"}</button>
      </div>
      <div class="flex items-center">
        <span class="mr-2">Statut: ${devices.irrigation.on?'<span class="text-green-600">Activé</span>':'<span class="text-gray-500">Programmé</span>'}</span>
        <span class="ml-4">Prochaine: <span class="font-semibold">${devices.irrigation.next}</span></span>
      </div>
    </section>
    <section class="rounded-xl mb-1 bg-white shadow-sm py-2 px-3">
      <div class="flex items-center justify-between mb-2">
        <span class="font-semibold text-base"><i class="fas fa-shield-alt text-blue-600 mr-2"></i>Sécurité</span>
        <button onclick="toggleSecurity()" class="text-xs bg-blue-100 px-3 py-1 rounded hover:bg-blue-200 text-blue-700">${devices.security.armed?'Désactiver':'Activer'}</button>
      </div>
      <div>
        <span>Statut : ${devices.security.armed?'<span class="text-green-600">Activé</span>':'<span class="text-gray-500">Désactivé</span>'}</span>
        <span class="ml-4 ${devices.security.intrusion?'text-red-600 font-semibold':''}">${devices.security.intrusion?'Intrusion détectée !':''}</span>
      </div>
      <button onclick="triggerIntrusion()" class="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200">Simuler une intrusion</button>
    </section>`;
}

function renderAutomation() {
    const auto = loadAutomation();
    const vacation = loadVacation();
    return `
      <h2 class="font-bold text-lg mb-2 flex items-center"><i class="fas fa-robot mr-2"></i>Automatisation</h2>
      <section class="rounded-xl bg-white shadow-sm px-3 py-3 mb-4">
        <div class="flex items-center justify-between mb-1">
          <span class="font-semibold text-base">Règles d'automatisation</span>
          <button onclick="showAddAuto()" class="bg-green-100 text-green-700 px-3 py-1 text-xs rounded hover:bg-green-200"><i class="fas fa-plus mr-1"></i>Ajouter</button>
        </div>
        <ul>
        ${auto.map((r,i)=>`
          <li class="flex items-center border-b last:border-b-0 py-1">
            <span class="flex-1 text-sm">${r.rule} <i class="fas fa-angle-double-right"></i> <b>${r.action}</b></span>
            <label class="custom-toggle relative inline-block w-10 h-6 align-middle mx-2">
              <input type="checkbox" ${r.enabled?"checked":""} onchange="toggleAutomation(${i})" class="opacity-0 w-0 h-0">
              <span class="bg absolute left-0 top-0 w-full h-full bg-gray-300 rounded-full transition"></span>
              <span class="dot absolute left-0 top-0 w-6 h-6 rounded-full bg-white shadow transition"></span>
            </label>
            <button onclick="deleteAutomation(${i})" class="text-red-500 text-xs ml-1 hover:text-red-700"><i class="fas fa-trash"></i></button>
          </li>`).join('')}
        </ul>
        <div id="add-auto-modal" class="hidden fixed inset-0 z-40 bg-black bg-opacity-30 flex justify-center items-center">
          <div class="bg-white p-5 rounded-lg shadow-lg w-80">
            <h3 class="font-semibold mb-2">Ajouter une règle</h3>
            <form id="add-auto-form">
              <input required placeholder="Si évènement (ex: présence détectée...)" class="w-full mb-2 border rounded px-2 py-1" id="auto-rule" maxlength="46"><br>
              <input required placeholder="Action (ex: allumer salon...)" class="w-full mb-2 border rounded px-2 py-1" id="auto-action" maxlength="33"><br>
              <button type="submit" class="bg-blue-500 text-white px-3 py-1 rounded mr-2">Ajouter</button>
              <button type="button" onclick="hideAddAuto()" class="text-gray-500 px-3 py-1 rounded">Annuler</button>
            </form>
          </div>
        </div>
      </section>
      <section class="rounded-xl bg-white shadow-sm px-3 py-3 mb-2">
        <div class="flex items-center justify-between mb-1">
          <span class="font-semibold">Simuler présence</span>
          <button onclick="simulateGeolocation(()=>{render();sendNotif('Géolocalisation simulée','success')})"
          class="bg-blue-100 px-3 py-1 rounded text-blue-800 text-xs hover:bg-blue-200"><i class="fas fa-location-arrow"></i> MAJ Position</button>
        </div>
        <p class="text-xs text-gray-500">La position simulée peut déclencher des règles de présence.</p>
      </section>
      <section class="rounded-xl bg-white shadow-sm px-3 py-3 mb-1">
        <div class="flex items-center mb-2 justify-between">
          <span class="font-semibold">Mode vacances</span>
          <label class="custom-toggle relative inline-block w-10 h-6 align-middle">
            <input type="checkbox" ${vacation?"checked":""} onchange="toggleVacation()" class="opacity-0 w-0 h-0">
            <span class="bg absolute left-0 top-0 w-full h-full bg-gray-300 rounded-full transition"></span>
            <span class="dot absolute left-0 top-0 w-6 h-6 rounded-full bg-white shadow transition"></span>
          </label>
        </div>
        <div class="text-xs text-yellow-700 mb-0"><i class="fas fa-umbrella-beach mr-1"></i>Le mode vacances simule des présences et active l'alarme.</div>
      </section>
    `;
  }

function renderEnergy() {
  const hist = loadEnergyHistory();
  return `
    <h2 class="font-bold text-lg mb-2 flex items-center"><i class="fas fa-bolt mr-2"></i>Consommation énergétique</h2>
    <section class="rounded-xl bg-white shadow-sm px-3 py-3 mb-4">
      <canvas id="energy-hist" height="160"></canvas>
      <div class="flex justify-end mb-2">
        <button onclick="refreshEnergy()" class="text-xs bg-blue-100 px-3 py-1 rounded hover:bg-blue-200 text-blue-700"><i class="fas fa-sync-alt"></i> Actualiser</button>
      </div>
      <div class="text-xs text-gray-400">Simulation 12 dernières heures</div>
      <div class="flex flex-wrap gap-2 mt-1">
        <span class="inline-flex items-center rounded px-2 bg-green-100 text-green-700 text-xs"><i class="fas fa-arrow-down mr-1"></i>Basse conso</span>
        <span class="inline-flex items-center rounded px-2 bg-yellow-100 text-yellow-600 text-xs"><i class="fas fa-arrow-up mr-1"></i>Pics</span>
      </div>
    </section>
    <section class="rounded-xl bg-white shadow-sm px-3 py-3">
      <h3 class="font-semibold text-base mb-2 flex items-center"><i class="fas fa-chart-bar mr-2 text-indigo-400"></i>Statistiques</h3>
      <div class="flex flex-wrap gap-4">
        <div><span class="font-semibold">${(hist.reduce((s,e)=>s+e.usage,0)).toFixed(2)}</span><span class="ml-1 text-xs">kWh (12h)</span></div>
        <div><span class="font-semibold">${Math.max(...hist.map(e=>e.usage)).toFixed(2)}</span><span class="ml-1 text-xs">kWh max/h</span></div>
        <div><span class="font-semibold">${Math.min(...hist.map(e=>e.usage)).toFixed(2)}</span><span class="ml-1 text-xs">kWh min/h</span></div>
      </div>
    </section>
  `;
}

function renderSettings() {
  const presence = loadPresence();
  const vacation = loadVacation();
  return `
    <h2 class="font-bold text-lg mb-3 flex items-center"><i class="fas fa-cog mr-2"></i>Paramètres</h2>
    <section class="rounded-xl bg-white shadow-sm px-3 py-3 mb-3">
      <div class="mb-3">
        <div class="font-semibold mb-1"><i class="fas fa-user mr-2"></i>Profil</div>
        <div class="ml-1 text-sm">Utilisateur : <span class="font-semibold">${DEFAULT_USER.user}</span></div>
        <div class="ml-1 text-sm">Mode vacances : <span class="font-semibold">${vacation?"Activé":"Non"}</span></div>
        <div class="ml-1 text-sm">Présence : <span class="font-semibold">${presence.here?"Présent":"Absent"}</span></div>
      </div>
      <button onclick="logout()" class="bg-red-500 text-white py-1 px-4 rounded hover:bg-red-600 text-sm"><i class="fas fa-sign-out-alt mr-1"></i>Déconnexion</button>
    </section>
    <section class="rounded-xl bg-white shadow-sm px-3 py-3 mb-3">
      <div class="flex items-center justify-between mb-2">
        <div class="font-semibold"><i class="fas fa-bell mr-2"></i> Notifications</div>
        <button onclick="sendNotif('Exemple de notification!','success')" class="bg-blue-100 px-2 text-blue-800 rounded text-xs hover:bg-blue-200"><i class="fas fa-bell"></i> Tester</button>
      </div>
      <div class="flex items-center mb-2 justify-between">
        <span class="font-semibold"><i class="fas fa-microphone mr-1"></i>Reconaissance vocale (simulée)</span>
        <button onclick="askAssistant('Activer le chauffage')" class="bg-green-100 text-green-700 px-2 rounded text-xs hover:bg-green-200"><i class="fas fa-microphone"></i> Parler</button>
      </div>
    </section>
    <section class="rounded-xl bg-white shadow-sm px-3 py-3 mb-2">
      <div class="mb-2 font-semibold"><i class="fas fa-info-circle mr-2"></i>Aide / À propos</div>
      <ul class="text-xs text-gray-500 mb-0">
        <li>- Version mobile POC du tableau de bord de Domotech</li>
        <li>- Données et interactions simulées en local</li>
      </ul>
    </section>
    <div class="text-xs text-center text-gray-400 mt-6">2025 – Démo Smart Home Domotech</div>
  `;
}

function runAfterRender(page) {
  if (page === "energy") {
    // Draw chart for energy history
    setTimeout(drawEnergyChart, 100); // wait canvas DOM
  }
  if (page === "dashboard") {
    setTimeout(drawDashboardEnergy, 80);
  }
}

// --- Assistant Virtuel ---
const aiModal = document.getElementById("ai-modal");
const aiBtn = document.getElementById("ai-btn");
const closeAiBtn = document.getElementById("close-ai");
const aiChat = document.getElementById("ai-chat");

aiBtn.addEventListener("click", () => aiModal.classList.remove("hidden"));
closeAiBtn.addEventListener("click", () => aiModal.classList.add("hidden"));

document.getElementById("ai-form").addEventListener("submit", e => {
  e.preventDefault();
  const input = document.getElementById("ai-input").value;
  if (!input) return;

  aiChat.innerHTML += `<div class="mb-1"><b>Vous :</b> ${input}</div>`;
  aiChat.innerHTML += `<div class="mb-1 text-gray-600"><b>Assistant :</b> Fonctionnalité à venir...</div>`;
  document.getElementById("ai-input").value = "";
  aiChat.scrollTop = aiChat.scrollHeight;
});

// Reconnaissance vocale
document.getElementById("ai-voice").addEventListener("click", () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "fr-FR";
  recognition.onresult = event => {
    const speech = event.results[0][0].transcript;
    document.getElementById("ai-input").value = speech;
  };
  recognition.start();
});


// --- Gestion de la navigation ---
Array.from(document.getElementsByClassName('nav-btn')).forEach(btn => {
  btn.onclick = ()=> setPage(btn.dataset.page || 'dashboard');
});

document.getElementById('main-header').onclick = function() {
  setPage("dashboard");
};

// --- Gestion de la connexion ---
document.getElementById('login-form').onsubmit = function(ev) {
  ev.preventDefault();
  let user = document.getElementById('login-user').value.trim();
  let pin = document.getElementById('login-pin').value.trim();
  if (user.toLowerCase() === DEFAULT_USER.user && pin === DEFAULT_USER.pin) {
    setLoginStatus(true);
    render();
  } else sendNotif("Identifiant ou code incorrect.","error");
};

function logout() {
  setLoginStatus(false);
  sendNotif("Déconnecté.","info");
  window.location.reload();
}

// --- Initialisation ---
function initialize() {
  // First run: initialize data if not present
  if (!localStorage.getItem(LOCAL_KEYS.DEVICES)) saveDevices(initialDevices);
  if (!localStorage.getItem(LOCAL_KEYS.AUTOMATION)) saveAutomation(initialAutomation);
  if (!localStorage.getItem(LOCAL_KEYS.ENERGY)) saveEnergyHistory(initialEnergyHistory);
  
  // Set initial page from hash
  if (!window.location.hash) window.location.hash = "#dashboard";
  currentPage = window.location.hash.replace(/^#/, "") || "dashboard";
  
  render();
  
  // Random presence simulation every 120s (if vacation mode)
  setInterval(()=>{
    if (loadVacation()) {
      simulateGeolocation();
      // Simulate random device triggers for demo
      let dev = loadDevices();
      dev.lights.forEach(l=>{
        if (Math.random()<0.35) { l.on = !l.on; l.brightness=l.on?100:0;}
      });
      saveDevices(dev);
      render();
    }
  }, 120*1000);
  
  // Random simulate intrusion if security armed and vacation mode
  setInterval(()=>{
    let dev = loadDevices();
    if (loadVacation() && dev.security.armed && Math.random()<0.085) {
      dev.security.intrusion = true;
      saveDevices(dev);
      render();
      sendNotif("INTRUSION DÉTECTÉE!","error");
      setTimeout(()=>{dev.security.intrusion=false;saveDevices(dev);render();},4500);
    }
  }, 31*1000);
}

initialize();