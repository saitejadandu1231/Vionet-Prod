/**
 * Vionet Engineering - Modern Telecom Domain Animations
 * 100% Vanilla JS, 0 dependencies, GPU-accelerated requestAnimationFrame & IntersectionObserver
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeroFiberCanvas();
  initTelemetryCounters();
  initServicesTabs();
  initOcalcPoleSimulator();
  init5GBeamVisualizer();
  initLidarLaserSweep();
  initMobileMenu();
});

/* -----------------------------------------------------------
 * 1. HERO FIBER PULSE CANVAS
 * Generates network nodes (central office, fiber hubs, towers)
 * and animates optical light packets traveling through fiber conduits
 * ----------------------------------------------------------- */
function initHeroFiberCanvas() {
  const canvas = document.getElementById('fiberPulseCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let animationFrameId;
  let width, height;

  function resize() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  resize();
  window.addEventListener('resize', resize);

  // Network Topology Nodes
  const nodes = [
    { x: 0.15, y: 0.25, label: 'CENTRAL OFFICE', type: 'core' },
    { x: 0.50, y: 0.20, label: 'FTTx SPLITTER HUB', type: 'hub' },
    { x: 0.82, y: 0.35, label: '5G MACRO TOWER', type: 'tower' },
    { x: 0.30, y: 0.65, label: 'OSP VAULT #4', type: 'vault' },
    { x: 0.70, y: 0.75, label: 'IN-BUILDING DAS', type: 'das' },
    { x: 0.50, y: 0.50, label: 'FIBER BACKHAUL NOC', type: 'core' }
  ];

  // Fiber Routes (Conduits)
  const connections = [
    [0, 1], [1, 2], [0, 5], [1, 5], [5, 3], [5, 4], [3, 4], [2, 4]
  ];

  // Optical Light Packets
  const packets = [];
  for (let i = 0; i < 12; i++) {
    packets.push({
      connIndex: Math.floor(Math.random() * connections.length),
      progress: Math.random(),
      speed: 0.003 + Math.random() * 0.004,
      color: Math.random() > 0.3 ? '#00f0ff' : '#ff7a00',
      size: 2.5 + Math.random() * 2
    });
  }

  let isVisible = true;
  const observer = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
    if (isVisible) render();
    else cancelAnimationFrame(animationFrameId);
  }, { threshold: 0.1 });
  observer.observe(canvas);

  function render() {
    if (!isVisible) return;
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Fiber Conduits (Lines)
    connections.forEach(([i, j]) => {
      const n1 = nodes[i];
      const n2 = nodes[j];
      ctx.beginPath();
      ctx.moveTo(n1.x * width, n1.y * height);
      ctx.lineTo(n2.x * width, n2.y * height);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Dashed CAD measurement lines
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // 2. Animate Optical Photonic Packets
    packets.forEach(p => {
      p.progress += p.speed;
      if (p.progress >= 1) {
        p.progress = 0;
        p.connIndex = Math.floor(Math.random() * connections.length);
      }

      const [i, j] = connections[p.connIndex];
      const x = nodes[i].x * width + (nodes[j].x * width - nodes[i].x * width) * p.progress;
      const y = nodes[i].y * height + (nodes[j].y * height - nodes[i].y * height) * p.progress;

      ctx.save();
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 3. Draw Nodes (Hardware Junctions)
    nodes.forEach(n => {
      const nx = n.x * width;
      const ny = n.y * height;

      // Glow ring
      ctx.save();
      ctx.shadowColor = 'rgba(0, 240, 255, 0.4)';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(nx, ny, 6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#060911';
      ctx.fill();

      // Center core
      ctx.fillStyle = n.type === 'tower' ? '#ff7a00' : '#00f0ff';
      ctx.beginPath();
      ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Technical Label
      ctx.font = '9px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(n.label, nx + 10, ny + 3);
    });

    animationFrameId = requestAnimationFrame(render);
  }

  render();
}

/* -----------------------------------------------------------
 * 2. TELEMETRY COUNTERS
 * High-performance requestAnimationFrame roll-up
 * ----------------------------------------------------------- */
function initTelemetryCounters() {
  const counterElements = document.querySelectorAll('.metric-number[data-target]');
  if (!counterElements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  counterElements.forEach(el => observer.observe(el));

  function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-target'));
    const isDecimal = target % 1 !== 0;
    const duration = 1800; // ms
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quartic
      const ease = 1 - Math.pow(1 - progress, 4);
      const currentVal = target * ease;

      if (isDecimal) {
        el.textContent = currentVal.toFixed(1);
      } else {
        el.textContent = Math.floor(currentVal).toLocaleString();
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = isDecimal ? target.toFixed(1) : target.toLocaleString();
      }
    }

    requestAnimationFrame(update);
  }
}

/* -----------------------------------------------------------
 * 3. SERVICES INTERACTIVE TABS
 * Zero lag DOM switching
 * ----------------------------------------------------------- */
function initServicesTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panes = document.querySelectorAll('.tab-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const activePane = document.getElementById(targetId);
      if (activePane) activePane.classList.add('active');
    });
  });
}

/* -----------------------------------------------------------
 * 4. OCALC POLE STRUCTURAL STRESS SIMULATOR
 * Real-time load calculations for US joint-use utility poles
 * ----------------------------------------------------------- */
function initOcalcPoleSimulator() {
  const slider = document.getElementById('poleLoadSlider');
  const loadValDisplay = document.getElementById('poleLoadValue');
  const stressVectorLine = document.getElementById('stressVectorLine');
  const safetyStatus = document.getElementById('poleSafetyStatus');
  const deflectionLabel = document.getElementById('poleDeflection');

  if (!slider) return;

  function updateSimulation() {
    const loadPercent = parseInt(slider.value, 10);
    if (loadValDisplay) loadValDisplay.textContent = `${loadPercent}%`;

    // Calculate pole tip deflection based on loading
    const maxDeflectionX = 30; // pixels
    const currentDeflection = (loadPercent / 100) * maxDeflectionX;
    
    if (deflectionLabel) {
      const inches = ((loadPercent / 100) * 1.85).toFixed(2);
      deflectionLabel.textContent = `${inches} in`;
    }

    if (stressVectorLine) {
      // Curve the pole top SVG element
      const poleTipX = 150 + currentDeflection;
      stressVectorLine.setAttribute('x2', poleTipX);
    }

    if (safetyStatus) {
      if (loadPercent < 75) {
        safetyStatus.textContent = 'STATUS: NESC GRADE B PASSED';
        safetyStatus.style.color = 'var(--green-pass)';
      } else if (loadPercent <= 95) {
        safetyStatus.textContent = 'STATUS: APPROACHING ALLOWABLE LIMIT';
        safetyStatus.style.color = 'var(--amber-safety)';
      } else {
        safetyStatus.textContent = 'STATUS: MAKE-READY REINFORCEMENT REQUIRED';
        safetyStatus.style.color = '#ef4444';
      }
    }
  }

  slider.addEventListener('input', updateSimulation);
  updateSimulation();
}

/* -----------------------------------------------------------
 * 5. 5G RF BEAMFORMING & SIGNAL SIMULATOR
 * Visualizes antenna array sector coverage
 * ----------------------------------------------------------- */
function init5GBeamVisualizer() {
  const container = document.getElementById('wirelessBeamBox');
  if (!container) return;

  // Add canvas for RF wavefronts
  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width, height;
  function resize() {
    width = container.clientWidth;
    height = container.clientHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
  resize();
  window.addEventListener('resize', resize);

  let waveOffset = 0;
  function drawWaves() {
    ctx.clearRect(0, 0, width, height);
    const towerX = width * 0.2;
    const towerY = height * 0.5;

    // Draw Tower Icon
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(towerX - 12, towerY + 30);
    ctx.lineTo(towerX, towerY - 20);
    ctx.lineTo(towerX + 12, towerY + 30);
    ctx.stroke();

    // Antenna array point
    ctx.fillStyle = '#ff7a00';
    ctx.beginPath();
    ctx.arc(towerX, towerY - 20, 4, 0, Math.PI * 2);
    ctx.fill();

    // Concentric RF waves propagating to the right
    waveOffset = (waveOffset + 0.8) % 35;
    for (let r = 20 + waveOffset; r < width * 0.75; r += 35) {
      const alpha = Math.max(0, 1 - r / (width * 0.75)) * 0.6;
      ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(towerX, towerY - 20, r, -Math.PI * 0.35, Math.PI * 0.35);
      ctx.stroke();
    }

    requestAnimationFrame(drawWaves);
  }

  drawWaves();
}

/* -----------------------------------------------------------
 * 6. LIDAR ELEVATION LASER SWEEP (GIS)
 * Sweeps horizontal beam illuminating topographic data points
 * ----------------------------------------------------------- */
function initLidarLaserSweep() {
  const container = document.getElementById('lidarSweepBox');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width, height;
  function resize() {
    width = container.clientWidth;
    height = container.clientHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
  resize();
  window.addEventListener('resize', resize);

  // Generate 80 random GIS point clouds
  const points = [];
  for (let i = 0; i < 90; i++) {
    points.push({
      x: Math.random(),
      y: 0.2 + Math.random() * 0.6,
      elevation: Math.floor(100 + Math.random() * 500)
    });
  }

  let laserX = 0;
  function drawLidar() {
    ctx.clearRect(0, 0, width, height);

    laserX = (laserX + 1.2) % width;

    // Laser Beam
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(laserX, 0);
    ctx.lineTo(laserX, height);
    ctx.stroke();
    ctx.restore();

    // Render GIS Data Points with scan glow
    points.forEach(p => {
      const px = p.x * width;
      const py = p.y * height;
      const dist = Math.abs(px - laserX);

      let alpha = 0.2;
      let size = 2;
      if (dist < 30) {
        alpha = 1 - (dist / 30) * 0.5;
        size = 3.5;
      }

      ctx.fillStyle = `rgba(0, 230, 118, ${alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(drawLidar);
  }

  drawLidar();
}

/* -----------------------------------------------------------
 * 7. MOBILE MENU TOGGLE
 * ----------------------------------------------------------- */
function initMobileMenu() {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('mobile-open');
    });

    // Close when clicking nav link
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('mobile-open');
      });
    });
  }
}
