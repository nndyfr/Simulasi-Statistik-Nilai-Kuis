function mulaiSimulasi() {
  document.getElementById('halaman-awal').style.display = 'none';
  document.getElementById('halaman-simulasi').style.display = 'block';
}

function kembaliKeHalamanAwal() {
  document.getElementById('halaman-simulasi').style.display = 'none';
  document.getElementById('halaman-awal').style.display = 'flex';
}

function resetInput() {
  document.getElementById('jumlah').value = '';
  document.getElementById('min').value = '';
  document.getElementById('max').value = '';
  document.getElementById('distribusi').value = 'uniform';
  document.getElementById('hasil').textContent = '';
  document.getElementById('tombol-simulasi').disabled = false;
  if (window.histChart) window.histChart.destroy();
}

function generateNormalRandom(mean, stdDev) {
  // Box-Muller transform
  let u1 = Math.random();
  let u2 = Math.random();
  let z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z * stdDev + mean;
}

function simulasi() {
  const jumlah = parseInt(document.getElementById('jumlah').value);
  const min = parseFloat(document.getElementById('min').value);
  const max = parseFloat(document.getElementById('max').value);
  const distribusi = document.getElementById('distribusi').value;
  const hasilDiv = document.getElementById('hasil');
  const tombolSimulasi = document.getElementById('tombol-simulasi');

  if (isNaN(jumlah) || isNaN(min) || isNaN(max) || jumlah <= 0 || min >= max) {
    hasilDiv.textContent = 'Input tidak valid!';
    return;
  }

  if (max > 100 || min < 0) {
    hasilDiv.textContent = 'Nilai harus antara 0 dan 100.';
    return;
  }
  

  let nilai = [];
  for (let i = 0; i < jumlah; i++) {
    if (distribusi === 'uniform') {
      nilai.push(Math.random() * (max - min) + min);
    } else if (distribusi === 'normal') {
      if (distribusi === 'normal') {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        const mean = (max + min) / 2;
        const stddev = (max - min) / 6;
        let value = z * stddev + mean;
        value = Math.max(min, Math.min(max, value));
        nilai.push(value);
      } 
    }     
  }

  const mean = nilai.reduce((a, b) => a + b, 0) / nilai.length;
  const median = (() => {
    const sorted = [...nilai].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  })();

  const modus = (() => {
    const freq = {};
    nilai.forEach(n => {
      const key = Math.round(n);
      freq[key] = (freq[key] || 0) + 1;
    });
    let maxFreq = 0, mod = [];
    for (let key in freq) {
      if (freq[key] > maxFreq) {
        mod = [key];
        maxFreq = freq[key];
      } else if (freq[key] === maxFreq) {
        mod.push(key);
      }
    }
    return mod.join(', ');
  })();

  const variance = nilai.reduce((sum, n) => sum + (n - mean) ** 2, 0) / nilai.length;
    const stddev = Math.sqrt(variance);
    const range = Math.max(...nilai) - Math.min(...nilai);
  
    hasilDiv.textContent =
      `Nilai:\n${nilai.map(n => n.toFixed(2)).join(', ')}\n\n` +
      `Mean: ${mean.toFixed(2)}\n` +
      `Median: ${median.toFixed(2)}\n` +
      `Modus: ${modus}\n` +
      `Range: ${range.toFixed(2)}\n` +
      `Variansi: ${variance.toFixed(2)}\n` +
      `Standar Deviasi: ${stddev.toFixed(2)}`;

  const bins = Array.from({length: 10}, (_, i) => ({ label: `${(i*10)}-${(i+1)*10}`, count: 0 }));
  nilai.forEach(n => {
    const index = Math.min(9, Math.floor((n - min) / (max - min) * 10));
    bins[index].count++;
  });

  const ctx = document.getElementById('histogram').getContext('2d');
  if (window.histChart) window.histChart.destroy();
  window.histChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: bins.map(b => b.label),
      datasets: [{
        label: 'Frekuensi',
        data: bins.map(b => b.count),
        backgroundColor: '#4CAF50'
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true },
        x: { title: { display: true, text: 'Rentang Nilai' } }
      }
    }
  });
}
