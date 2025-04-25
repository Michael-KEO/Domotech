// devices.js - Logique des appareils connectés

// --- Contrôles des appareils ---
function lightAllOn() {
    return loadDevices().lights.every(l=>l.on);
  }
  
  function toggleAllLights() {
    const dev = loadDevices();
    const to = !dev.lights.every(l=>l.on);
    dev.lights.forEach(l=>{ l.on=to; l.brightness = to?80:0 });
    saveDevices(dev); 
    sendNotif(to?"Lumières allumées.":"Lumières éteintes.","success");
    render();
  }
  
  function toggleLight(id) {
    const dev = loadDevices();
    let l = dev.lights.find(x=>x.id==id);
    if (l) { l.on=!l.on; l.brightness = l.on?80:0;}
    saveDevices(dev);
    render();
  }
  
  function setBrightness(id, val) {
    const dev = loadDevices();
    let l = dev.lights.find(x=>x.id==id);
    if (l) { l.brightness=parseInt(val); l.on = l.brightness>0; }
    saveDevices(dev);
    render();
  }
  
  function adjustTemp(delta) {
    const d = loadDevices();
    d.thermostat.target = Math.max(14, Math.min(28, d.thermostat.target + delta));
    // Simulate immediate change for demo
    d.thermostat.temp = d.thermostat.target + ((Math.random()-0.5)*2);
    d.thermostat.heat = (d.thermostat.temp < d.thermostat.target);
    saveDevices(d);
    sendNotif(`Température réglée à ${d.thermostat.target}°C`,"info");
    render();
  }
  
  function setThermostatMode(mode) {
    const d = loadDevices();
    d.thermostat.mode = mode;
    if (mode==="off") d.thermostat.heat = false;
    saveDevices(d);
    sendNotif(`Thermostat: mode ${mode}`,"info");
    render();
  }
  
  function toggleIrrigation() {
    const d = loadDevices();
    d.irrigation.on = !d.irrigation.on;
    saveDevices(d);
    sendNotif(d.irrigation.on?"Irrigation démarrée":"Irrigation arrêtée","success");
    render();
  }
  
  function toggleSecurity() {
    const d = loadDevices();
    d.security.armed = !d.security.armed;
    d.security.intrusion = false;
    saveDevices(d);
    sendNotif(d.security.armed?"Sécurité activée":"Sécurité désactivée","info");
    render();
  }
  
  function triggerIntrusion() {
    const d = loadDevices();
    if (!d.security.armed) {
      sendNotif("Sécurité désactivée.","warning");
      return;
    }
    d.security.intrusion = true;
    saveDevices(d);
    sendNotif("INTRUSION DÉTECTÉE!","error");
    render();
    setTimeout(()=>{
      d.security.intrusion = false; saveDevices(d); render();
    }, 5000);
  }
  
  // --- Contrôles d'automatisation ---
  function toggleAutomation(i) {
    let a = loadAutomation();
    a[i].enabled = !a[i].enabled;
    saveAutomation(a);
    render();
  }
  
  function deleteAutomation(i) {
    let a = loadAutomation();
    a.splice(i,1);
    saveAutomation(a);
    sendNotif("Automation supprimée","success");
    render();
  }
  
  function showAddAuto() {
    document.getElementById('add-auto-modal').classList.remove("hidden");
  }
  
  function hideAddAuto() {
    document.getElementById('add-auto-modal').classList.add("hidden");
  }
  
  function toggleVacation() {
    let now = !loadVacation();
    saveVacation(now);
    sendNotif(now?"Mode vacances activé!":"Mode vacances désactivé.","success");
    render();
  }
  
  // --- Gestion du formulaire d'automatisation ---
  document.addEventListener("submit", function(e){
    if (e.target && e.target.id === 'add-auto-form') {
      e.preventDefault();
      let rule = document.getElementById("auto-rule").value.trim();
      let action = document.getElementById("auto-action").value.trim();
      let autos = loadAutomation();
      autos.push({rule: rule, action: action, enabled: true});
      saveAutomation(autos);
      hideAddAuto();
      sendNotif("Automation ajoutée!","success");
      render();
    }
  });