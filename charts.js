// charts.js - Code spécifique aux graphiques

function drawEnergyChart() {
    let ctx = document.getElementById('energy-hist').getContext('2d');
    let hist = loadEnergyHistory();
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: hist.map(e=>e.hour),
        datasets: [{
          label: 'kWh',
          data: hist.map(e=>e.usage.toFixed(2)),
          backgroundColor: hist.map(e=>
            e.usage < 1.5? '#4ade80'
            : e.usage > 1.5? '#ffa500' 
            : '#4ade80'
          ),
          borderRadius:5,
          barPercentage:0.92,
          categoryPercentage:0.85
        }]
      },
      options: {
        responsive: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid:{display:false} },
          y: { beginAtZero:true, grid:{color:'#eee'}, ticks:{stepSize:0.5} }
        }
      }
    });
  }
  
  function drawDashboardEnergy() {
    let ctx = document.getElementById('dashboard-energy').getContext('2d');
    let d = loadEnergyHistory();
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: d.map(e=>e.hour),
        datasets:[{
          data: d.map(e=>e.usage.toFixed(2)),
          borderColor: "#2563eb",
          backgroundColor: "#93c5fd22",
          pointRadius:2,
          pointBackgroundColor:"#3b82f6",
          fill: true
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        responsive: false,
        scales: {
          x: { grid:{display:false}},
          y: { beginAtZero:true, grid:{color:'#f3f4f6'}}
        }
      }
    });
  }
  
  function avgEnergyUsage() {
    let d = loadEnergyHistory();
    let avg = d.reduce((s,x)=>s+x.usage,0)/d.length;
    return avg.toFixed(2);
  }
  
  function refreshEnergy() {
    // Simulate new data
    let hist = [];
    for (let i=0; i<12; ++i) hist.push({hour:`${i+8}h`, usage: Math.random()*1.3+0.4 });  
    saveEnergyHistory(hist);
    render();
  }