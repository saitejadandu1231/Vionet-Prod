/**
 * Vionet Engineering - Ultra-Modern Interactive Telecom Engine
 * 100% Vanilla JS, 0 dependencies, GPU-composited requestAnimationFrame
 */

document.addEventListener('DOMContentLoaded', () => {
  initAmbientFiberBackground();
  initHeroFiberCanvas();
  initTelemetryCounters();
  initServicesTabs();
  initPipelineInteraction();
  initFttxArchitectureSimulator();
  initOcalcPoleSimulator();
  init5GBeamVisualizer();
  initLidarLaserSweep();
  initMobileMenu();
});

/* -----------------------------------------------------------
 * 1. REALISTIC 3D CUT-AWAY FIBER OPTIC CABLE ASSEMBLY
 * Renders a true-to-life engineering cross-section of a 288-core armored
 * fiber optic cable:
 * Layer 1: Outer Black HDPE Jacket with UV weatherproofing
 * Layer 2: Corrugated Steel Tape Armor (CSTA) with metallic sheen
 * Layer 3: Inner Strength Polyethylene Sheath
 * Layer 4: Aramid / Kevlar Yarn Strength Yarns (water-swellable tape)
 * Layer 5: Central FRP (Fiberglass Reinforced Plastic) Strength Member
 * Layer 6: Color-Coded Buffer Tubes (TIA-598-C: Blue, Orange, Green, Brown, Slate, White...)
 * Layer 7: Individual Glass Cores (9/125µm single-mode) with live laser photons
 * Supports interactive inspection of each layer & live laser bursts on click
 * ----------------------------------------------------------- */
function initHeroFiberCanvas() {
  const canvas = document.getElementById('fiberAssemblyCanvas');
  const activeLayerEl = document.getElementById('activeFiberLayer');
  const activeSpecEl = document.getElementById('activeFiberSpec');
  const activeAttenEl = document.getElementById('activeFiberAttenuation');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;
  let width = 580, height = 350;

  function resize() {
    const parent = canvas.parentElement;
    width = parent ? (parent.clientWidth || 580) : 580;
    height = parent ? (parent.clientHeight || 350) : 350;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener('resize', () => {
    requestAnimationFrame(resize);
  });

  // View modes: 'full' | 'cores' | 'crosssection' | 'lasers'
  let currentView = 'full';
  const pills = document.querySelectorAll('.cable-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');
      currentView = pill.getAttribute('data-view');
    });
  });

  // TIA-598-C Standard 12 Optical Fiber Color Code
  const tiaColors = [
    { name: 'BLUE', hex: '#007BFF', loss: '0.18 dB/km' },
    { name: 'ORANGE', hex: '#FF7300', loss: '0.19 dB/km' },
    { name: 'GREEN', hex: '#00E676', loss: '0.18 dB/km' },
    { name: 'BROWN', hex: '#8D6E63', loss: '0.19 dB/km' },
    { name: 'SLATE', hex: '#94A3B8', loss: '0.19 dB/km' },
    { name: 'WHITE', hex: '#FFFFFF', loss: '0.18 dB/km' },
    { name: 'RED', hex: '#EF4444', loss: '0.18 dB/km' },
    { name: 'BLACK', hex: '#334155', loss: '0.20 dB/km' },
    { name: 'YELLOW', hex: '#FACC15', loss: '0.18 dB/km' },
    { name: 'VIOLET', hex: '#A855F7', loss: '0.19 dB/km' },
    { name: 'ROSE', hex: '#EC4899', loss: '0.18 dB/km' },
    { name: 'AQUA', hex: '#06B6D4', loss: '0.18 dB/km' }
  ];

  // Cable Structural Layers for hover detection & rendering
  const layers = [
    {
      id: 'outer-jacket',
      name: 'OUTER HDPE WEATHERPROOF JACKET',
      spec: 'HIGH-DENSITY POLYETHYLENE (HDPE) UV RESISTANT',
      attenuation: 'CRUSH RESISTANCE: 3000 N/10cm (TIA-455-41)',
      cutX: 0.28,
      radius: 46,
      color: '#111827'
    },
    {
      id: 'steel-armor',
      name: 'CORRUGATED STEEL TAPE ARMOR (CSTA)',
      spec: 'ELECTROLYTIC CHROME-COATED STEEL (RODENT PROOF)',
      attenuation: 'TENSILE STRENGTH: 2700 N (INSTALLATION)',
      cutX: 0.42,
      radius: 40,
      color: '#475569'
    },
    {
      id: 'inner-jacket',
      name: 'INNER POLYETHYLENE SHEATH & WATER TAPE',
      spec: 'MOISTURE BARRIER WATER-SWELLABLE ARAMID TAPE',
      attenuation: 'WATER PENETRATION: 1m HEAD / 24 HRS (PASS)',
      cutX: 0.54,
      radius: 34,
      color: '#0284c7'
    },
    {
      id: 'buffer-tubes',
      name: 'PBT GEL-FILLED LOOSE BUFFER TUBES',
      spec: 'POLYBUTYLENE TEREPHTHALATE WITH THIXOTROPIC GEL',
      attenuation: 'HYDROGEN AGEING RESISTANT • ITU-T G.652.D',
      cutX: 0.72,
      radius: 27,
      color: '#FF7300'
    },
    {
      id: 'glass-cores',
      name: 'INDIVIDUAL SINGLE-MODE FIBER CORES',
      spec: '9/125µm GERMANIUM-DOPED SILICA GLASS CORE',
      attenuation: '≤ 0.19 dB/km @ 1550nm • TIA-598-C COMPLIANT',
      cutX: 1.0,
      radius: 22,
      color: '#00f0ff'
    }
  ];

  // Photonic Light Pulses traveling through the exposed fiber cores
  const photonPulses = [];
  for (let i = 0; i < 16; i++) {
    photonPulses.push({
      fiberIdx: i % 12,
      progress: Math.random(),
      speed: 0.003 + Math.random() * 0.004,
      size: 2.2 + Math.random() * 1.5,
      tailLen: 25 + Math.random() * 15
    });
  }

  let hoveredLayer = null;
  let hoveredFiber = null;
  let mouseX = -100, mouseY = -100;

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    const centerY = height * 0.52;
    const normX = mouseX / width;
    const dy = Math.abs(mouseY - centerY);

    hoveredLayer = null;
    hoveredFiber = null;

    if (dy <= 55 && mouseX >= 0 && mouseX <= width) {
      if (normX < layers[0].cutX) hoveredLayer = layers[0];
      else if (normX < layers[1].cutX) hoveredLayer = layers[1];
      else if (normX < layers[2].cutX) hoveredLayer = layers[2];
      else if (normX < layers[3].cutX) hoveredLayer = layers[3];
      else hoveredLayer = layers[4];
    }

    if (normX >= layers[3].cutX) {
      const strandCount = 12;
      for (let f = 0; f < strandCount; f++) {
        const spreadY = (f - 5.5) * 4.2;
        const fy = centerY + spreadY;
        if (Math.abs(mouseY - fy) < 4) {
          hoveredFiber = tiaColors[f];
          break;
        }
      }
    }

    if (hoveredFiber) {
      if (activeLayerEl) activeLayerEl.textContent = `STRAND #${tiaColors.indexOf(hoveredFiber) + 1} (${hoveredFiber.name} FIBER)`;
      if (activeSpecEl) activeSpecEl.textContent = '9/125µm LOW BEND-LOSS SILICA OPTICAL GLASS';
      if (activeAttenEl) activeAttenEl.textContent = `LOSS: ${hoveredFiber.loss} @ 1550nm (PASS)`;
    } else if (hoveredLayer) {
      if (activeLayerEl) activeLayerEl.textContent = hoveredLayer.name;
      if (activeSpecEl) activeSpecEl.textContent = hoveredLayer.spec;
      if (activeAttenEl) activeAttenEl.textContent = hoveredLayer.attenuation;
    }
  });

  canvas.addEventListener('mouseleave', () => {
    hoveredLayer = null;
    hoveredFiber = null;
    mouseX = -100;
    mouseY = -100;
  });

  canvas.addEventListener('click', () => {
    for (let f = 0; f < 12; f++) {
      photonPulses.push({
        fiberIdx: f,
        progress: 0,
        speed: 0.007 + Math.random() * 0.005,
        size: 3.5,
        tailLen: 40
      });
    }
    if (photonPulses.length > 36) photonPulses.splice(0, 12);
  });

  function render() {
    ctx.clearRect(0, 0, width, height);

    const centerY = height * 0.52;
    const startX = -20;

    // 1. Technical Grid Backdrop
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1;
    for (let x = 40; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 15);
      ctx.lineTo(x, height - 15);
      ctx.stroke();
    }

    // 2. Central FRP Strength Member
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(startX, centerY - 3, width + 40, 6, 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '7.5px monospace';
    ctx.fillText('CENTRAL FRP STRENGTH MEMBER', 20, centerY - 6);

    // 3. LAYER 1: OUTER BLACK HDPE JACKET
    const l1CutX = layers[0].cutX * width;
    const l1Radius = layers[0].radius;
    const l1Grad = ctx.createLinearGradient(0, centerY - l1Radius, 0, centerY + l1Radius);
    l1Grad.addColorStop(0, '#2d3748');
    l1Grad.addColorStop(0.2, '#1a202c');
    l1Grad.addColorStop(0.5, '#0f172a');
    l1Grad.addColorStop(0.8, '#1a202c');
    l1Grad.addColorStop(1, '#0b0f19');

    ctx.fillStyle = l1Grad;
    ctx.beginPath();
    ctx.roundRect(startX, centerY - l1Radius, l1CutX + 20, l1Radius * 2, [0, 8, 8, 0]);
    ctx.fill();

    // Outer Jacket Grooves & Cable Print
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    for (let x = 20; x < l1CutX - 10; x += 22) {
      ctx.beginPath();
      ctx.moveTo(x, centerY - l1Radius);
      ctx.lineTo(x, centerY + l1Radius);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('VIONET OPTICAL 288F ARMORED SM G.652.D [TIA-598-C] 00482M', 25, centerY + 4);

    // 4. LAYER 2: CORRUGATED STEEL TAPE ARMOR (CSTA)
    const l2CutX = layers[1].cutX * width;
    const l2Radius = layers[1].radius;
    const l2Grad = ctx.createLinearGradient(0, centerY - l2Radius, 0, centerY + l2Radius);
    l2Grad.addColorStop(0, '#94a3b8');
    l2Grad.addColorStop(0.3, '#cbd5e1');
    l2Grad.addColorStop(0.5, '#475569');
    l2Grad.addColorStop(0.7, '#cbd5e1');
    l2Grad.addColorStop(1, '#334155');

    ctx.fillStyle = l2Grad;
    ctx.beginPath();
    ctx.roundRect(l1CutX - 4, centerY - l2Radius, (l2CutX - l1CutX) + 8, l2Radius * 2, [0, 6, 6, 0]);
    ctx.fill();

    // Steel corrugation
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.lineWidth = 1.5;
    for (let x = l1CutX; x < l2CutX; x += 7) {
      ctx.beginPath();
      ctx.moveTo(x, centerY - l2Radius);
      ctx.lineTo(x + 3, centerY + l2Radius);
      ctx.stroke();
    }

    // 5. LAYER 3: INNER SHEATH & ARAMID YARN
    const l3CutX = layers[2].cutX * width;
    const l3Radius = layers[2].radius;
    const l3Grad = ctx.createLinearGradient(0, centerY - l3Radius, 0, centerY + l3Radius);
    l3Grad.addColorStop(0, '#0284c7');
    l3Grad.addColorStop(0.5, '#0369a1');
    l3Grad.addColorStop(1, '#075985');

    ctx.fillStyle = l3Grad;
    ctx.beginPath();
    ctx.roundRect(l2CutX - 4, centerY - l3Radius, (l3CutX - l2CutX) + 8, l3Radius * 2, [0, 5, 5, 0]);
    ctx.fill();

    // Kevlar strength fibers
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1;
    for (let x = l2CutX; x < l3CutX; x += 10) {
      ctx.beginPath();
      ctx.moveTo(x, centerY - l3Radius + 2);
      ctx.lineTo(x + 8, centerY + l3Radius - 2);
      ctx.stroke();
    }

    // 6. LAYER 4: 12-FIBER LOOSE BUFFER TUBES
    const l4CutX = layers[3].cutX * width;
    const bufferCount = 6;
    for (let b = 0; b < bufferCount; b++) {
      const bColor = tiaColors[b].hex;
      const bSpread = (b - 2.5) * 8.5;
      const bY = centerY + bSpread;

      ctx.fillStyle = bColor;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(l3CutX - 4, bY - 3.5, (l4CutX - l3CutX) + 8, 7, 3);
      ctx.fill();
      ctx.stroke();
    }

    // 7. LAYER 5: INDIVIDUAL GLASS OPTICAL FIBERS
    const strandCount = 12;
    for (let f = 0; f < strandCount; f++) {
      const strand = tiaColors[f];
      const startFibersX = l4CutX;
      const spreadY = (f - 5.5) * 9.5;
      const fy = centerY + spreadY;

      ctx.beginPath();
      ctx.moveTo(startFibersX, centerY + (f - 5.5) * 3);
      ctx.bezierCurveTo(
        startFibersX + 40, centerY + (f - 5.5) * 3,
        startFibersX + 70, fy,
        width + 10, fy
      );
      ctx.strokeStyle = strand.hex;
      ctx.lineWidth = (hoveredFiber === strand) ? 2.8 : 1.6;
      ctx.globalAlpha = (hoveredFiber && hoveredFiber !== strand) ? 0.35 : 0.85;
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.fillStyle = strand.hex;
      ctx.font = '7.5px monospace';
      ctx.fillText(`${f + 1}.${strand.name}`, width - 68, fy - 3);

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(width - 5, fy, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // 8. LASER PHOTON STREAMS
    photonPulses.forEach(pulse => {
      pulse.progress += pulse.speed;
      if (pulse.progress > 1) pulse.progress = 0;

      const f = pulse.fiberIdx;
      const strand = tiaColors[f];
      const startFibersX = l4CutX;
      const spreadY = (f - 5.5) * 9.5;
      const fy = centerY + spreadY;

      const t = pulse.progress;
      const p0 = { x: startFibersX, y: centerY + (f - 5.5) * 3 };
      const p1 = { x: startFibersX + 40, y: centerY + (f - 5.5) * 3 };
      const p2 = { x: startFibersX + 70, y: fy };
      const p3 = { x: width + 10, y: fy };

      const mt = 1 - t;
      const curX = mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x;
      const curY = mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y;

      ctx.save();
      ctx.shadowColor = strand.hex;
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(curX, curY, pulse.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = strand.hex;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(curX, curY, pulse.size + 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 9. LAYER INSPECTION HIGHLIGHT
    if (hoveredLayer && !hoveredFiber) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 123, 255, 0.15)';
      ctx.strokeStyle = '#007BFF';
      ctx.lineWidth = 1.5;

      const prevX = layers.indexOf(hoveredLayer) === 0 ? startX : layers[layers.indexOf(hoveredLayer) - 1].cutX * width;
      const curX = hoveredLayer.cutX * width;
      ctx.strokeRect(prevX + 2, centerY - hoveredLayer.radius - 2, (curX - prevX), (hoveredLayer.radius * 2) + 4);
      ctx.restore();
    }

    // 10. End-Face Cross Section Inset View
    if (currentView === 'crosssection' || currentView === 'full') {
      const csX = width - 85;
      const csY = 70;
      const csR = 34;

      ctx.save();
      ctx.fillStyle = 'rgba(6, 11, 23, 0.9)';
      ctx.strokeStyle = 'rgba(0, 123, 255, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(csX, csY, csR + 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(csX, csY, csR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(csX, csY, csR - 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(csX, csY, csR - 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(csX, csY, 5, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const tx = csX + Math.cos(ang) * 15;
        const ty = csY + Math.sin(ang) * 15;

        ctx.fillStyle = tiaColors[i].hex;
        ctx.beginPath();
        ctx.arc(tx, ty, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(tx - 1.2, ty - 1.2, 0.8, 0, Math.PI * 2);
        ctx.arc(tx + 1.2, ty - 1.2, 0.8, 0, Math.PI * 2);
        ctx.arc(tx - 1.2, ty + 1.2, 0.8, 0, Math.PI * 2);
        ctx.arc(tx + 1.2, ty + 1.2, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#94a3b8';
      ctx.font = '7px monospace';
      ctx.fillText('CROSS-SECTION', csX - 28, csY + csR + 18);
      ctx.restore();
    }

    animationFrameId = requestAnimationFrame(render);
  }

  render();
}

/* -----------------------------------------------------------
 * 2. TELEMETRY COUNTERS
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
    const duration = 1800;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
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
 * 3. BUSINESS FLOW PIPELINE (INTERACTIVE)
 * ----------------------------------------------------------- */
function initPipelineInteraction() {
  const cards = document.querySelectorAll('.pipeline-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });
  });
}

/* -----------------------------------------------------------
 * 4. SERVICES TABS & DIRECT HASH ROUTING
 * Allows user or links (#wireless, #gis, #field, #tab-engineering)
 * to instantly activate the tab and smoothly scroll to the section.
 * ----------------------------------------------------------- */
function initServicesTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panes = document.querySelectorAll('.tab-pane');

  function activateTabById(targetId, shouldScroll = false) {
    let resolvedId = targetId;
    if (resolvedId === 'wireless' || resolvedId === 'tab-wireless') resolvedId = 'tab-wireless';
    else if (resolvedId === 'gis' || resolvedId === 'tab-gis') resolvedId = 'tab-gis';
    else if (resolvedId === 'field' || resolvedId === 'tab-field') resolvedId = 'tab-field';
    else if (resolvedId === 'services' || resolvedId === 'engineering' || resolvedId === 'tab-engineering') resolvedId = 'tab-engineering';

    const matchingTab = document.querySelector(`.tab-btn[data-tab="${resolvedId}"]`);
    const activePane = document.getElementById(resolvedId);

    if (matchingTab && activePane) {
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      matchingTab.classList.add('active');
      activePane.classList.add('active');

      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new CustomEvent('tab-switched', { detail: { tabId: resolvedId } }));

      if (shouldScroll) {
        const servicesSection = document.getElementById('services');
        if (servicesSection) {
          servicesSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');
      activateTabById(targetId, false);
    });
  });

  // Handle URL Hash navigation on load and on hashchange
  function checkHash() {
    const rawHash = window.location.hash.replace('#', '').toLowerCase();
    if (rawHash) {
      const validTabs = ['wireless', 'tab-wireless', 'gis', 'tab-gis', 'field', 'tab-field', 'engineering', 'tab-engineering'];
      if (validTabs.includes(rawHash)) {
        setTimeout(() => activateTabById(rawHash, true), 100);
      }
    }
  }

  checkHash();
  window.addEventListener('hashchange', checkHash);
}

/* -----------------------------------------------------------
 * 4.B FTTx OPTICAL ARCHITECTURE & ODN LINK BUDGET SIMULATOR
 * Visualizes the complete 5-stage Optical Distribution Network (ODN):
 * Stage 1: Central Office (ISP) - OLT Optical Line Terminal & ODF Rack
 * Stage 2: Feeder Fiber Trunk - High-count ribbon cable (288F / 432F)
 * Stage 3: Fiber Distribution Hub (FDH) - Primary Optical Splitter Cabinet
 * Stage 4: Distribution Network & Multi-Service Terminal (MST / NAP)
 * Stage 5: Drop Cable to Customer Premise (ONT Optical Network Terminal)
 * Includes photon pulse packet tracing, architecture switcher, and link budget HUD
 * ----------------------------------------------------------- */
function initFttxArchitectureSimulator() {
  const container = document.getElementById('fttxArchBox');
  const stageNameDisplay = document.getElementById('fttxStageName');
  const splitRatioDisplay = document.getElementById('fttxSplitRatio');
  const lossDisplay = document.getElementById('fttxLoss');
  const marginDisplay = document.getElementById('fttxMargin');
  const homesDisplay = document.getElementById('fttxHomes');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = 600, height = 320;
  let animId = null;
  let isRunning = false;

  function resize() {
    const rect = container.getBoundingClientRect();
    width = rect.width || container.clientWidth || 600;
    height = rect.height || container.clientHeight || 320;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
  }
  window.addEventListener('resize', () => {
    if (isRunning) requestAnimationFrame(resize);
  });
  window.addEventListener('tab-switched', () => {
    if (isRunning) setTimeout(resize, 40);
  });

  // Architectures: 'centralized' | 'distributed' | 'rural'
  let currentArch = 'centralized';
  const archButtons = document.querySelectorAll('.fttx-mode-btn');
  archButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      archButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentArch = btn.getAttribute('data-arch');
      updateArchMetrics();
    });
  });

  function updateArchMetrics() {
    if (currentArch === 'centralized') {
      if (splitRatioDisplay) splitRatioDisplay.textContent = 'CENTRALIZED 1:32 FDH CABINET';
      if (lossDisplay) lossDisplay.textContent = '15.4 dB (HEALTHY: < 28 dB)';
      if (marginDisplay) {
        marginDisplay.textContent = '+12.6 dB HEADROOM';
        marginDisplay.style.color = '#00e676';
      }
      if (homesDisplay) homesDisplay.textContent = '1,024 HOMES SERVICED';
    } else if (currentArch === 'distributed') {
      if (splitRatioDisplay) splitRatioDisplay.textContent = 'CASCADE 1:4 FDH -> 1:8 MST';
      if (lossDisplay) lossDisplay.textContent = '17.8 dB (HEALTHY: < 28 dB)';
      if (marginDisplay) {
        marginDisplay.textContent = '+10.2 dB HEADROOM';
        marginDisplay.style.color = '#00e676';
      }
      if (homesDisplay) homesDisplay.textContent = '512 HOMES SERVICED';
    } else if (currentArch === 'rural') {
      if (splitRatioDisplay) splitRatioDisplay.textContent = 'LONG-HAUL 1:16 (24 KM REACH)';
      if (lossDisplay) lossDisplay.textContent = '22.1 dB (CLASS C+ OPTICS)';
      if (marginDisplay) {
        marginDisplay.textContent = '+5.9 dB MARGIN';
        marginDisplay.style.color = '#ff9100';
      }
      if (homesDisplay) homesDisplay.textContent = '256 HOMES (SPARSE CORRIDOR)';
    }
  }

  // 5 Vertical Architectural Zones (Columns)
  // Zone 1: CENTRAL OFFICE (ISP)   x ~ 0.08
  // Zone 2: FEEDER NETWORK (OSP)   x ~ 0.28
  // Zone 3: SPLITTER HUB (FDH)     x ~ 0.50
  // Zone 4: DISTRIBUTION & MST     x ~ 0.72
  // Zone 5: CUSTOMER PREMISE (ONT) x ~ 0.92

  // Structural Nodes
  const oltNodes = [
    { id: 'olt1', x: 0.08, y: 0.38, label: 'OLT PORT 1 (XGS-PON)', stage: 'STAGE 1: CENTRAL OFFICE (ISP)', loss: '0.0 dB', spec: '10G SYMMETRIC SFP+ TRANSCEIVER' },
    { id: 'olt2', x: 0.08, y: 0.62, label: 'OLT PORT 2 (GPON)', stage: 'STAGE 1: CENTRAL OFFICE (ISP)', loss: '0.0 dB', spec: '2.5G/1.25G OPTICAL LINE TERMINAL' }
  ];

  // Feeder Splice Enclosure (Vault)
  const vaultNodes = [
    { id: 'vault1', x: 0.28, y: 0.38, label: 'FEEDER VAULT #MH-10', stage: 'STAGE 2: FEEDER NETWORK (OSP)', loss: '0.3 dB', spec: '288-FIBER DIELECTRIC BACKBONE CABLE' },
    { id: 'vault2', x: 0.28, y: 0.62, label: 'FEEDER VAULT #MH-11', stage: 'STAGE 2: FEEDER NETWORK (OSP)', loss: '0.3 dB', spec: '288-FIBER DIELECTRIC BACKBONE CABLE' }
  ];

  // Fiber Distribution Hubs (FDH Primary Splitters)
  const fdhNodes = [
    { id: 'fdh1', x: 0.50, y: 0.30, label: 'FDH CABINET #01 (1:4 or 1:32)', stage: 'STAGE 3: FIBER DISTRIBUTION HUB (FDH)', loss: '7.4 dB', spec: 'PLANAR LIGHTWAVE CIRCUIT (PLC) SPLITTER' },
    { id: 'fdh2', x: 0.50, y: 0.70, label: 'FDH CABINET #02 (1:8)', stage: 'STAGE 3: FIBER DISTRIBUTION HUB (FDH)', loss: '10.8 dB', spec: 'WEATHERPROOF OUTDOOR PEDESTAL CABINET' }
  ];

  // Multi-Service Terminals (MST / Fiber NAPs on Poles/Peds)
  const mstNodes = [
    { id: 'mst1', x: 0.72, y: 0.18, parentFdh: 0, label: 'MST TERMINAL #01 (POLE 401)', stage: 'STAGE 4: DISTRIBUTION & MST TERMINALS', loss: '12.6 dB', spec: '8-PORT HARDENED OPTICAL CONNECTOR (HMFOC)' },
    { id: 'mst2', x: 0.72, y: 0.40, parentFdh: 0, label: 'MST TERMINAL #02 (POLE 402)', stage: 'STAGE 4: DISTRIBUTION & MST TERMINALS', loss: '12.8 dB', spec: '8-PORT HARDENED OPTICAL CONNECTOR' },
    { id: 'mst3', x: 0.72, y: 0.60, parentFdh: 1, label: 'MST TERMINAL #03 (PEDESTAL 12)', stage: 'STAGE 4: DISTRIBUTION & MST TERMINALS', loss: '14.2 dB', spec: '4-PORT UNDERGROUND VAULT TERMINAL' },
    { id: 'mst4', x: 0.72, y: 0.82, parentFdh: 1, label: 'MST TERMINAL #04 (POLE 405)', stage: 'STAGE 4: DISTRIBUTION & MST TERMINALS', loss: '14.5 dB', spec: '4-PORT HARDENED OPTICAL CONNECTOR' }
  ];

  // Customer Premises (ONT Fiber Jack & Router)
  const ontNodes = [
    { id: 'ont1', x: 0.92, y: 0.12, parentMst: 0, label: 'RESIDENTIAL HOME A', stage: 'STAGE 5: CUSTOMER PREMISE (ONT)', loss: '15.4 dB', speed: '1 Gbps FIBER INTERNET' },
    { id: 'ont2', x: 0.92, y: 0.22, parentMst: 0, label: 'RESIDENTIAL HOME B', stage: 'STAGE 5: CUSTOMER PREMISE (ONT)', loss: '15.5 dB', speed: '1 Gbps FIBER INTERNET' },
    { id: 'ont3', x: 0.92, y: 0.34, parentMst: 1, label: 'COMMERCIAL ENTERPRISE C', stage: 'STAGE 5: CUSTOMER PREMISE (ONT)', loss: '15.2 dB', speed: '10 Gbps DEDICATED XGS-PON' },
    { id: 'ont4', x: 0.92, y: 0.44, parentMst: 1, label: 'RESIDENTIAL HOME D', stage: 'STAGE 5: CUSTOMER PREMISE (ONT)', loss: '15.6 dB', speed: '500 Mbps FIBER INTERNET' },
    { id: 'ont5', x: 0.92, y: 0.56, parentMst: 2, label: 'MULTI-DWELLING UNIT E', stage: 'STAGE 5: CUSTOMER PREMISE (ONT)', loss: '16.1 dB', speed: '2 Gbps GIGABIT BROADBAND' },
    { id: 'ont6', x: 0.92, y: 0.66, parentMst: 2, label: 'SMART CITY IOT HUB', stage: 'STAGE 5: CUSTOMER PREMISE (ONT)', loss: '16.0 dB', speed: 'LOW-LATENCY BACKHAUL' },
    { id: 'ont7', x: 0.92, y: 0.78, parentMst: 3, label: 'RESIDENTIAL HOME G', stage: 'STAGE 5: CUSTOMER PREMISE (ONT)', loss: '16.4 dB', speed: '1 Gbps FIBER INTERNET' },
    { id: 'ont8', x: 0.92, y: 0.88, parentMst: 3, label: '5G SMALL CELL BACKHAUL', stage: 'STAGE 5: CUSTOMER PREMISE (ONT)', loss: '16.2 dB', speed: '10 Gbps WIRELESS FRONTHAUL' }
  ];

  // Moving Photonic Light Pulses traveling through the network
  const pulses = [];
  function createPulse() {
    // Generate a photon packet from OLT to an ONT through the tree
    const targetOnt = ontNodes[Math.floor(Math.random() * ontNodes.length)];
    const targetMst = mstNodes[targetOnt.parentMst];
    const targetFdh = fdhNodes[targetMst.parentFdh];
    const targetVault = vaultNodes[targetMst.parentFdh];
    const targetOlt = oltNodes[targetMst.parentFdh];

    pulses.push({
      path: [
        { x: targetOlt.x, y: targetOlt.y },
        { x: targetVault.x, y: targetVault.y },
        { x: targetFdh.x, y: targetFdh.y },
        { x: targetMst.x, y: targetMst.y },
        { x: targetOnt.x, y: targetOnt.y }
      ],
      currentSegment: 0,
      segmentProgress: 0,
      speed: 0.014 + Math.random() * 0.006,
      color: Math.random() > 0.4 ? '#00f0ff' : '#FF7300'
    });
  }

  // Pre-populate pulses
  for (let i = 0; i < 6; i++) {
    createPulse();
    if (pulses[i]) {
      pulses[i].currentSegment = Math.floor(Math.random() * 4);
      pulses[i].segmentProgress = Math.random();
    }
  }

  let activeHoverNode = null;

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    activeHoverNode = null;
    const allNodes = [...oltNodes, ...vaultNodes, ...fdhNodes, ...mstNodes, ...ontNodes];
    allNodes.forEach(node => {
      const nx = node.x * width;
      const ny = node.y * height;
      if (Math.hypot(mx - nx, my - ny) < 22) {
        activeHoverNode = node;
      }
    });

    if (activeHoverNode) {
      if (stageNameDisplay) stageNameDisplay.textContent = activeHoverNode.stage;
      if (lossDisplay) lossDisplay.textContent = `${activeHoverNode.loss} INSERTION LOSS`;
      if (splitRatioDisplay) splitRatioDisplay.textContent = activeHoverNode.label;
    }
  });

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const allNodes = [...oltNodes, ...vaultNodes, ...fdhNodes, ...mstNodes, ...ontNodes];
    allNodes.forEach(node => {
      const nx = node.x * width;
      const ny = node.y * height;
      if (Math.hypot(mx - nx, my - ny) < 26) {
        activeHoverNode = node;
        // Inject multiple rapid photons into this path
        for (let k = 0; k < 3; k++) createPulse();
        if (stageNameDisplay) stageNameDisplay.textContent = node.stage;
        if (lossDisplay) lossDisplay.textContent = `${node.loss} INSERTION LOSS`;
        if (splitRatioDisplay) splitRatioDisplay.textContent = node.label;
      }
    });
  });

  function draw() {
    if (width <= 0 || height <= 0) resize();
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Architectural Stage Zone Columns & Labels
    const stages = [
      { x1: 0.02, x2: 0.18, title: 'STAGE 1: CENTRAL OFFICE', sub: 'ISP HEADEND (OLT)' },
      { x1: 0.20, x2: 0.38, title: 'STAGE 2: FEEDER NETWORK', sub: 'OSP MAIN BACKBONE' },
      { x1: 0.40, x2: 0.60, title: 'STAGE 3: PRIMARY SPLITTER', sub: 'FDH OPTICAL CABINET' },
      { x1: 0.62, x2: 0.82, title: 'STAGE 4: DISTRIBUTION', sub: 'MST / NAP TERMINALS' },
      { x1: 0.84, x2: 0.98, title: 'STAGE 5: CUSTOMER DROP', sub: 'ONT PREMISE UNITS' }
    ];

    stages.forEach((st, idx) => {
      const sx = st.x1 * width;
      const sw = (st.x2 - st.x1) * width;

      // Soft architectural zone tint
      ctx.fillStyle = idx % 2 === 0 ? 'rgba(255, 255, 255, 0.015)' : 'rgba(0, 123, 255, 0.025)';
      ctx.fillRect(sx, 0, sw, height);

      // Zone Divider Line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx + sw, 0);
      ctx.lineTo(sx + sw, height);
      ctx.stroke();

      // Stage Header Title at the top
      ctx.fillStyle = idx === 0 ? '#FF7300' : (idx === 2 ? '#00f0ff' : '#94a3b8');
      ctx.font = '700 8.5px monospace';
      ctx.fillText(st.title, sx + 4, 16);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '7.5px monospace';
      ctx.fillText(st.sub, sx + 4, 28);
    });

    // 2. Draw Optical Fiber Cables Connecting the Hierarchy
    // (A) OLT to Vault (Feeder Trunk)
    oltNodes.forEach((olt, idx) => {
      const vault = vaultNodes[idx];
      ctx.strokeStyle = 'rgba(255, 115, 0, 0.45)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(olt.x * width, olt.y * height);
      ctx.lineTo(vault.x * width, vault.y * height);
      ctx.stroke();
    });

    // (B) Vault to FDH Cabinets
    vaultNodes.forEach((vault, idx) => {
      const fdh = fdhNodes[idx];
      ctx.strokeStyle = 'rgba(0, 123, 255, 0.55)';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(vault.x * width, vault.y * height);
      ctx.lineTo(fdh.x * width, fdh.y * height);
      ctx.stroke();
    });

    // (C) FDH to Distribution MST Terminals (Optical Splitting Fanout)
    mstNodes.forEach(mst => {
      const fdh = fdhNodes[mst.parentFdh];
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(fdh.x * width, fdh.y * height);
      ctx.lineTo(mst.x * width, mst.y * height);
      ctx.stroke();
    });

    // (D) MST to ONT Customer Drops
    ontNodes.forEach(ont => {
      const mst = mstNodes[ont.parentMst];
      ctx.strokeStyle = 'rgba(0, 230, 118, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(mst.x * width, mst.y * height);
      ctx.lineTo(ont.x * width, ont.y * height);
      ctx.stroke();
    });

    // 3. Animate Optical Data Photon Pulses along the tree
    if (Math.random() < 0.04 && pulses.length < 12) {
      createPulse();
    }

    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.segmentProgress += p.speed;

      if (p.segmentProgress >= 1) {
        p.segmentProgress = 0;
        p.currentSegment++;
        if (p.currentSegment >= p.path.length - 1) {
          pulses.splice(i, 1);
          continue;
        }
      }

      const p1 = p.path[p.currentSegment];
      const p2 = p.path[p.currentSegment + 1];
      const curX = (p1.x + (p2.x - p1.x) * p.segmentProgress) * width;
      const curY = (p1.y + (p2.y - p1.y) * p.segmentProgress) * height;

      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(curX, curY, 3, 0, Math.PI * 2);
      ctx.fill();

      // Trailing tail
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(curX, curY, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 4. Render Physical Network Nodes with Professional Telecom Icons / Enclosures
    // (A) OLT Racks (Stage 1)
    oltNodes.forEach(olt => {
      const nx = olt.x * width;
      const ny = olt.y * height;
      const isHovered = (activeHoverNode === olt);

      ctx.save();
      ctx.fillStyle = isHovered ? '#FF7300' : '#1e1b4b';
      ctx.strokeStyle = '#FF7300';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(nx - 14, ny - 14, 28, 28, 4);
      ctx.fill();
      ctx.stroke();

      // Optical Port Indicators
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(nx - 8, ny - 6, 4, 4);
      ctx.fillRect(nx - 2, ny - 6, 4, 4);
      ctx.fillRect(nx + 4, ny - 6, 4, 4);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(nx - 4, ny + 3, 8, 3);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(olt.label, nx - 16, ny + 24);
      ctx.restore();
    });

    // (B) Feeder Vaults (Stage 2)
    vaultNodes.forEach(vault => {
      const nx = vault.x * width;
      const ny = vault.y * height;
      const isHovered = (activeHoverNode === vault);

      ctx.save();
      ctx.fillStyle = isHovered ? '#3b82f6' : '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(nx, ny, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Splice enclosure icon
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(nx - 5, ny - 5, 10, 10);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '8px monospace';
      ctx.fillText(vault.label, nx - 28, ny + 22);
      ctx.restore();
    });

    // (C) FDH Optical Splitter Cabinets (Stage 3 - Primary Splitting)
    fdhNodes.forEach((fdh, fIdx) => {
      const nx = fdh.x * width;
      const ny = fdh.y * height;
      const isHovered = (activeHoverNode === fdh);

      ctx.save();
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = isHovered ? 16 : 8;
      ctx.fillStyle = isHovered ? '#00f0ff' : '#082f49';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(nx - 16, ny - 18, 32, 36, 5);
      ctx.fill();
      ctx.stroke();

      // Optical Splitter Prism Graphic inside cabinet
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(nx - 6, ny);
      ctx.lineTo(nx + 6, ny - 7);
      ctx.lineTo(nx + 6, ny + 7);
      ctx.closePath();
      ctx.fill();

      // Ratio Badge
      ctx.fillStyle = '#FF7300';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(fIdx === 0 ? '1:32' : '1:8', nx - 10, ny + 30);
      ctx.restore();
    });

    // (D) Multi-Service Terminals (Stage 4)
    mstNodes.forEach((mst, idx) => {
      const nx = mst.x * width;
      const ny = mst.y * height;
      const isHovered = (activeHoverNode === mst);

      ctx.save();
      ctx.fillStyle = isHovered ? '#00f0ff' : '#1e293b';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(nx, ny, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Terminal Port Dot
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(nx, ny, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '7.5px monospace';
      ctx.fillText(`MST #${idx + 1}`, nx - 14, ny - 12);
      ctx.restore();
    });

    // (E) Customer Premises (Stage 5 - Homes & ONTs)
    ontNodes.forEach(ont => {
      const nx = ont.x * width;
      const ny = ont.y * height;
      const isHovered = (activeHoverNode === ont);

      ctx.save();
      ctx.fillStyle = isHovered ? '#22c55e' : '#064e3b';
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.2;

      // House Silhouette / ONT Box
      ctx.beginPath();
      ctx.moveTo(nx - 6, ny + 5);
      ctx.lineTo(nx - 6, ny);
      ctx.lineTo(nx, ny - 6);
      ctx.lineTo(nx + 6, ny);
      ctx.lineTo(nx + 6, ny + 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isHovered ? '#ffffff' : '#6ee7b7';
      ctx.font = '7.5px monospace';
      ctx.fillText(ont.label, nx + 10, ny + 3);
      ctx.restore();
    });

    // 5. Active Hover Card Callout
    if (activeHoverNode) {
      const hx = activeHoverNode.x * width;
      const hy = activeHoverNode.y * height;

      ctx.save();
      ctx.fillStyle = 'rgba(6, 11, 23, 0.94)';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.2;
      ctx.shadowColor = 'rgba(0, 240, 255, 0.4)';
      ctx.shadowBlur = 10;

      const cardW = 160;
      const cardH = 50;
      let cardX = hx + 15;
      if (cardX + cardW > width - 10) cardX = hx - cardW - 15;
      let cardY = hy - 25;
      if (cardY < 10) cardY = 10;

      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FF7300';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(activeHoverNode.label, cardX + 8, cardY + 14);

      ctx.fillStyle = '#ffffff';
      ctx.font = '7.5px monospace';
      ctx.fillText(activeHoverNode.spec || activeHoverNode.speed || 'TELECOM OPTICAL ASSET', cardX + 8, cardY + 28);

      ctx.fillStyle = '#00e676';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(`LOSS: ${activeHoverNode.loss}`, cardX + 8, cardY + 42);
      ctx.restore();
    }

    if (isRunning) {
      animId = requestAnimationFrame(draw);
    }
  }

  function startLoop() {
    if (!isRunning) {
      isRunning = true;
      animId = requestAnimationFrame(draw);
    }
  }
  function stopLoop() {
    isRunning = false;
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  const fttxObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        requestAnimationFrame(() => {
          resize();
          startLoop();
        });
      } else {
        stopLoop();
      }
    });
  }, { rootMargin: '100px' });
  fttxObserver.observe(container);
}

/* -----------------------------------------------------------
 * 5. OCALC POLE STRUCTURAL SIMULATOR
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

    const maxDeflectionX = 32;
    const currentDeflection = (loadPercent / 100) * maxDeflectionX;
    
    if (deflectionLabel) {
      const inches = ((loadPercent / 100) * 1.95).toFixed(2);
      deflectionLabel.textContent = `${inches} in`;
    }

    if (stressVectorLine) {
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
 * 6. 5G RF BEAMFORMING & MULTI-BAND SIMULATOR
 * Interactive toggle between Sub-6 GHz and mmWave Beamforming
 * ----------------------------------------------------------- */
function init5GBeamVisualizer() {
  const container = document.getElementById('wirelessBeamBox');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = 600, height = 250;
  let animId = null;
  let isRunning = false;

  function resize() {
    const rect = container.getBoundingClientRect();
    width = rect.width || container.clientWidth || 600;
    height = rect.height || container.clientHeight || 250;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
  }
  window.addEventListener('resize', () => {
    if (isRunning) requestAnimationFrame(resize);
  });
  window.addEventListener('tab-switched', () => {
    if (isRunning) setTimeout(resize, 20);
  });

  let currentMode = 'sub6'; // 'sub6' or 'mmwave'
  const modeBtns = document.querySelectorAll('.rf-mode-btn');
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.getAttribute('data-mode');
    });
  });

  let waveOffset = 0;
  function drawWaves() {
    // If tab is displayed and dimensions were 0, auto-refresh dimensions
    if (width <= 0 || height <= 0) {
      resize();
    }
    ctx.clearRect(0, 0, width || 600, height || 250);
    const effectiveW = width || 600;
    const effectiveH = height || 250;
    const towerX = effectiveW * 0.18;
    const towerY = effectiveH * 0.52;

    // Draw Tower Mast
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(towerX - 14, towerY + 36);
    ctx.lineTo(towerX, towerY - 24);
    ctx.lineTo(towerX + 14, towerY + 36);
    ctx.stroke();

    // Antenna array point
    ctx.fillStyle = '#ff7a00';
    ctx.beginPath();
    ctx.arc(towerX, towerY - 24, 5, 0, Math.PI * 2);
    ctx.fill();

    if (currentMode === 'sub6') {
      // Wide Sub-6 GHz Omni/Sector Waves
      waveOffset = (waveOffset + 0.9) % 36;
      for (let r = 24 + waveOffset; r < effectiveW * 0.78; r += 36) {
        const alpha = Math.max(0, 1 - r / (effectiveW * 0.78)) * 0.65;
        ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(towerX, towerY - 24, r, -Math.PI * 0.38, Math.PI * 0.38);
        ctx.stroke();
      }
    } else {
      // Focused mmWave High-Gain Pencil Beams
      waveOffset = (waveOffset + 1.8) % 25;
      for (let r = 20 + waveOffset; r < effectiveW * 0.78; r += 25) {
        const alpha = Math.max(0, 1 - r / (effectiveW * 0.78)) * 0.85;
        ctx.strokeStyle = `rgba(255, 122, 0, ${alpha})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(towerX, towerY - 24, r, -Math.PI * 0.12, Math.PI * 0.12);
        ctx.stroke();
      }
    }

    if (isRunning) {
      animId = requestAnimationFrame(drawWaves);
    }
  }

  function startLoop() {
    if (!isRunning) {
      isRunning = true;
      animId = requestAnimationFrame(drawWaves);
    }
  }
  function stopLoop() {
    isRunning = false;
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  const rfObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        requestAnimationFrame(() => {
          resize();
          startLoop();
        });
      } else {
        stopLoop();
      }
    });
  }, { rootMargin: '100px' });
  rfObserver.observe(container);
}

/* -----------------------------------------------------------
 * 7. INTERACTIVE TELECOM GIS & MOBILE LIDAR CORRIDOR SCANNER
 * Displays an authentic 3D-projected road & utility corridor:
 * - Utility poles with aerial fiber spans and crossarms
 * - Overhead fiber lines with sag and clearance measurement
 * - Roadway pavement & underground duct vault markers
 * - Vegetation canopy with safety clearance audit zone
 * - Moving Mobile LiDAR Survey Vehicle with rotating laser fan
 * - Switchable modes: Classified Assets, Elevation Heatmap, Clearance Envelope
 * ----------------------------------------------------------- */
function initLidarLaserSweep() {
  const container = document.getElementById('lidarSweepBox');
  const assetCountDisplay = document.getElementById('lidarAssetCount');
  const elevationDisplay = document.getElementById('lidarElevation');
  const clearanceDisplay = document.getElementById('lidarClearance');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = 600, height = 310;
  let animId = null;
  let isRunning = false;

  function resize() {
    const rect = container.getBoundingClientRect();
    width = rect.width || container.clientWidth || 600;
    height = rect.height || container.clientHeight || 310;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
  }
  window.addEventListener('resize', () => {
    if (isRunning) requestAnimationFrame(resize);
  });
  window.addEventListener('tab-switched', () => {
    if (isRunning) setTimeout(resize, 40);
  });

  // Current survey view: 'classified' | 'elevation' | 'clearance'
  let currentView = 'classified';
  const modeButtons = document.querySelectorAll('.gis-mode-btn');
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentView = btn.getAttribute('data-view');
    });
  });

  // Generate dense, structured corridor point clouds that accurately represent telecom infrastructure
  // Categories: POLE, AERIAL_FIBER, ROAD_SURFACE, VAULT, VEGETATION, BUILDING
  const pointCloud = [];

  // 1. Road corridor & Curb points
  const roadYRatio = 0.82;
  for (let x = 0; x <= 1.0; x += 0.012) {
    for (let r = 0; r < 4; r++) {
      const yr = roadYRatio + (r - 1.5) * 0.035;
      pointCloud.push({
        rx: x,
        ry: yr,
        category: 'ROAD',
        elevationFt: (1.2 + Math.random() * 0.8).toFixed(1),
        assetName: 'ROADWAY SURFACE [ASPHALT]',
        clearanceFt: 'GROUND LEVEL',
        status: 'BASEMAP'
      });
    }
  }

  // 2. Underground Fiber Vaults / Manholes
  const vaultLocs = [0.24, 0.72];
  vaultLocs.forEach((vx, idx) => {
    for (let dx = -0.022; dx <= 0.022; dx += 0.007) {
      for (let dy = -0.015; dy <= 0.015; dy += 0.007) {
        pointCloud.push({
          rx: vx + dx,
          ry: roadYRatio + 0.045 + dy,
          category: 'VAULT',
          elevationFt: '-3.5',
          assetName: `FIBER SPLICE VAULT #MH-0${idx + 1}`,
          clearanceFt: 'SUB-SURFACE',
          status: 'DIGITIZED'
        });
      }
    }
  });

  // 3. Utility Poles (Poles at x = 0.18, 0.50, 0.84)
  const poleXs = [
    { x: 0.18, id: 'VL-4091', heightFt: '40.0', type: 'CLASS 3 WOOD' },
    { x: 0.50, id: 'VL-4092', heightFt: '45.0', type: 'CLASS 2 WOOD' },
    { x: 0.84, id: 'VL-4093', heightFt: '40.0', type: 'CLASS 3 WOOD' }
  ];

  poleXs.forEach(p => {
    // Pole vertical shaft
    for (let y = roadYRatio - 0.02; y >= 0.22; y -= 0.016) {
      for (let w = -0.008; w <= 0.008; w += 0.004) {
        const heightAboveGround = ((roadYRatio - y) * 55).toFixed(1);
        pointCloud.push({
          rx: p.x + w,
          ry: y,
          category: 'POLE',
          elevationFt: heightAboveGround,
          assetName: `UTILITY POLE #${p.id} (${p.type})`,
          clearanceFt: 'VERTICAL ATTACHMENT',
          status: 'INSPECTED'
        });
      }
    }
    // Crossarm at pole top
    for (let cx = -0.035; cx <= 0.035; cx += 0.007) {
      pointCloud.push({
        rx: p.x + cx,
        ry: 0.23,
        category: 'POLE_CROSSARM',
        elevationFt: '38.5',
        assetName: `PRIMARY POWER CROSSARM #${p.id}`,
        clearanceFt: '38.5 FT',
        status: 'PASS'
      });
    }
  });

  // 4. Overhead Catenary Fiber Cables (Fiber Attachment spans with realistic catenary sag)
  for (let i = 0; i < poleXs.length - 1; i++) {
    const xStart = poleXs[i].x;
    const xEnd = poleXs[i + 1].x;
    const yAttach = 0.38; // Comm attachment height
    for (let x = xStart; x <= xEnd; x += 0.008) {
      const spanT = (x - xStart) / (xEnd - xStart);
      const sag = Math.sin(spanT * Math.PI) * 0.045; // Catenary sag
      const y = yAttach + sag;
      const heightAboveRoad = ((roadYRatio - y) * 55).toFixed(1);
      const clearancePass = parseFloat(heightAboveRoad) >= 18.0;

      pointCloud.push({
        rx: x,
        ry: y,
        category: 'AERIAL_FIBER',
        elevationFt: heightAboveRoad,
        assetName: '288-FIBER DIELECTRIC ADSS TRUNK',
        clearanceFt: `${heightAboveRoad} FT (${clearancePass ? 'PASS - NESC' : 'VIOLATION'})`,
        status: clearancePass ? 'COMPLIANT' : 'ENCROACHMENT'
      });
    }
  }

  // 5. Tree Canopy / Vegetation Encroachment Zone (around x = 0.34, y = 0.33)
  for (let i = 0; i < 90; i++) {
    const angle = Math.random() * Math.PI * 2;
    const rad = Math.sqrt(Math.random()) * 0.075;
    const vx = 0.34 + Math.cos(angle) * rad * 1.3;
    const vy = 0.33 + Math.sin(angle) * rad;
    const elev = ((roadYRatio - vy) * 55).toFixed(1);
    const distToFiber = Math.abs(vy - 0.40);
    const encroaching = distToFiber < 0.06;

    pointCloud.push({
      rx: vx,
      ry: vy,
      category: 'VEGETATION',
      elevationFt: elev,
      assetName: encroaching ? 'TREE CANOPY [TRIM REQUIRED]' : 'URBAN TREE CANOPY',
      clearanceFt: encroaching ? '4.8 FT (ALERT: NESC VIOLATION)' : '14.2 FT (CLEAR)',
      status: encroaching ? 'TRIM_HAZARD' : 'SAFE'
    });
  }

  // Mobile LiDAR Vehicle scanner animation
  let vehicleX = 0;
  let sweepAngle = 0;
  let activeHover = null;

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    activeHover = null;
    let minDist = 18;
    pointCloud.forEach(pt => {
      const px = pt.rx * width;
      const py = pt.ry * height;
      const dist = Math.hypot(mx - px, my - py);
      if (dist < minDist) {
        minDist = dist;
        activeHover = pt;
      }
    });

    if (activeHover) {
      if (assetCountDisplay) assetCountDisplay.textContent = activeHover.assetName;
      if (elevationDisplay) elevationDisplay.textContent = `${activeHover.elevationFt} FT`;
      if (clearanceDisplay) {
        clearanceDisplay.textContent = activeHover.clearanceFt;
        clearanceDisplay.style.color = activeHover.status.includes('VIOLATION') || activeHover.status.includes('TRIM') ? '#ff3b30' : '#00e676';
      }
    }
  });

  canvas.addEventListener('mouseleave', () => {
    activeHover = null;
  });

  function draw() {
    if (width <= 0 || height <= 0) resize();
    ctx.clearRect(0, 0, width, height);

    // Update Mobile LiDAR scanner position along the roadway
    vehicleX += 0.8;
    if (vehicleX > width + 80) vehicleX = -60;
    sweepAngle = (sweepAngle + 0.08) % (Math.PI * 2);

    const vehicleY = roadYRatio * height - 8;

    // 1. Draw Architectural Grid & CAD Survey Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 2. Draw Mobile LiDAR Laser Scanner Fan / Cones
    ctx.save();
    const scannerHeadX = vehicleX + 22;
    const scannerHeadY = vehicleY - 14;

    // Dual rotating pulsed LiDAR scan beams sweeping upward across poles & cables
    for (let b = 0; b < 4; b++) {
      const bAngle = -Math.PI * 0.5 + Math.sin(sweepAngle + b * 0.5) * 0.75;
      const beamLen = height * 0.95;
      const beamEndX = scannerHeadX + Math.sin(bAngle) * beamLen;
      const beamEndY = scannerHeadY - Math.cos(bAngle) * beamLen;

      if (Number.isFinite(scannerHeadX) && Number.isFinite(scannerHeadY) && Number.isFinite(beamEndX) && Number.isFinite(beamEndY)) {
        const beamGrad = ctx.createLinearGradient(scannerHeadX, scannerHeadY, beamEndX, beamEndY);
        beamGrad.addColorStop(0, 'rgba(0, 123, 255, 0.75)');
        beamGrad.addColorStop(0.7, 'rgba(0, 240, 255, 0.25)');
        beamGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');

        ctx.strokeStyle = beamGrad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(scannerHeadX, scannerHeadY);
        ctx.lineTo(beamEndX, beamEndY);
        ctx.stroke();
      }
    }

    // Circular 360-degree LiDAR dome emitter pulse
    const domePulse = (Date.now() * 0.003) % 1;
    ctx.beginPath();
    ctx.arc(scannerHeadX, scannerHeadY, 12 + domePulse * 30, -Math.PI * 0.9, -Math.PI * 0.1);
    ctx.strokeStyle = `rgba(0, 240, 255, ${1 - domePulse})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();

    // 3. Render 3D Point Cloud with Classified Telecom Color Encodings
    pointCloud.forEach(pt => {
      const px = pt.rx * width;
      const py = pt.ry * height;
      const distToScanner = Math.hypot(px - scannerHeadX, py - scannerHeadY);

      let color = '#007BFF';
      let size = 2.0;
      let alpha = 0.45;

      // Color scheme based on Selected Survey View
      if (currentView === 'classified') {
        // Engineering Asset Classifications
        switch (pt.category) {
          case 'POLE':
          case 'POLE_CROSSARM':
            color = '#FF7300'; // Vionet Orange for Utility Poles
            size = 2.2;
            alpha = 0.75;
            break;
          case 'AERIAL_FIBER':
            color = '#00f0ff'; // Electric Cyan for Optical Fiber Strands
            size = 2.4;
            alpha = 0.85;
            break;
          case 'VEGETATION':
            color = pt.status === 'TRIM_HAZARD' ? '#ff3b30' : '#22c55e'; // Green canopy, Red if hazard
            size = 1.8;
            alpha = 0.55;
            break;
          case 'VAULT':
            color = '#a855f7'; // Purple for Underground Manholes & Vaults
            size = 2.5;
            alpha = 0.8;
            break;
          case 'ROAD':
          default:
            color = '#64748b'; // Gray for ground basemap
            size = 1.6;
            alpha = 0.3;
            break;
        }
      } else if (currentView === 'elevation') {
        // Scientific Rainbow / Thermal Elevation Heatmap (Z-Axis)
        const elevNorm = Math.min(1, Math.max(0, parseFloat(pt.elevationFt) / 45));
        if (elevNorm > 0.75) color = '#ef4444';      // Red: Pole top / Primary Wire (40+ ft)
        else if (elevNorm > 0.5) color = '#f97316';  // Orange: Secondary / Comm Span (25-35 ft)
        else if (elevNorm > 0.25) color = '#eab308'; // Yellow: Clearance Envelope (15-25 ft)
        else color = '#3b82f6';                      // Blue: Ground / Road / Vault (0-15 ft)
        size = 2.1;
        alpha = 0.7;
      } else if (currentView === 'clearance') {
        // NESC Safety Clearance Audit Envelope
        if (pt.category === 'AERIAL_FIBER' || pt.category === 'POLE') {
          color = '#00e676'; // Compliant clearances in Green
          size = 2.4;
          alpha = 0.85;
        } else if (pt.status === 'TRIM_HAZARD') {
          color = '#ff1744'; // Tree encroachment in Bright Red
          size = 3.0;
          alpha = 0.95;
        } else {
          color = '#334155'; // Subdued environment
          size = 1.6;
          alpha = 0.25;
        }
      }

      // Point illumination when LiDAR laser sweeps past
      if (distToScanner < 65) {
        alpha = Math.min(1, alpha + 0.45);
        size += 1.2;
      }

      // Hover Inspection Highlight
      if (activeHover === pt) {
        size = 5.5;
        color = '#ffffff';
        alpha = 1;

        // Draw crosshair ring around inspected point
        ctx.strokeStyle = '#FF7300';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(px, py, 10, 0, Math.PI * 2);
        ctx.stroke();

        // Draw elevation guide-line down to road level
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, roadYRatio * height);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // 4. Draw Mobile Survey LiDAR Vehicle Silhouette on the road
    ctx.save();
    ctx.fillStyle = '#0b1329';
    ctx.strokeStyle = '#007BFF';
    ctx.lineWidth = 1.5;

    // Vehicle Chassis
    ctx.beginPath();
    ctx.roundRect(vehicleX - 2, vehicleY - 10, 48, 12, 3);
    ctx.fill();
    ctx.stroke();

    // Vehicle Cab
    ctx.beginPath();
    ctx.roundRect(vehicleX + 10, vehicleY - 18, 22, 9, 2);
    ctx.fill();
    ctx.stroke();

    // Wheels
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(vehicleX + 8, vehicleY + 2, 4, 0, Math.PI * 2);
    ctx.arc(vehicleX + 38, vehicleY + 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Roof-Mounted LiDAR Dome Rig
    ctx.fillStyle = '#FF7300';
    ctx.beginPath();
    ctx.arc(scannerHeadX, scannerHeadY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Vehicle Label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '700 8px monospace';
    ctx.fillText('MOBILE LIDAR', vehicleX + 2, vehicleY + 16);
    ctx.restore();

    // 5. Draw Corridor Annotation Badges
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '8px monospace';
    ctx.fillText('[NESC CLEARANCE: 18.0 FT MIN]', width * 0.44, roadYRatio * height - 85);

    // Callout on vegetation encroachment
    if (currentView === 'clearance' || currentView === 'classified') {
      ctx.fillStyle = '#ff3b30';
      ctx.font = '600 8px monospace';
      ctx.fillText('! VEGETATION ENCROACHMENT', width * 0.28, 0.26 * height);
    }

    if (isRunning) {
      animId = requestAnimationFrame(draw);
    }
  }

  function startLoop() {
    if (!isRunning) {
      isRunning = true;
      animId = requestAnimationFrame(draw);
    }
  }
  function stopLoop() {
    isRunning = false;
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  const lidarObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        requestAnimationFrame(() => {
          resize();
          startLoop();
        });
      } else {
        stopLoop();
      }
    });
  }, { rootMargin: '100px' });
  lidarObserver.observe(container);
}

/* -----------------------------------------------------------
 * 8. MOBILE MENU TOGGLE
 * ----------------------------------------------------------- */
function initMobileMenu() {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  function openMenu() {
    links.classList.add('mobile-open');
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    links.classList.remove('mobile-open');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (links.classList.contains('mobile-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close when clicking any nav link
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (links.classList.contains('mobile-open') && !links.contains(e.target) && !toggle.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links.classList.contains('mobile-open')) {
      closeMenu();
    }
  });
}

/* -----------------------------------------------------------
 * 9. AMBIENT HALF-CUT FIBER OPTIC CABLE CONDUIT & PHOTONS
 * Ultra-subtle engineering cut-away of a multi-strand fiber optic cable.
 * Shows cross-section buffer tubes and passing light atoms/photons
 * that stay very faint in the background without distracting the user.
 * ----------------------------------------------------------- */
function initAmbientFiberBackground() {
  const canvas = document.getElementById('ambientFiberBgCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = window.innerWidth || 1200;
  let height = window.innerHeight || 800;
  let animId;

  function resize() {
    width = window.innerWidth || 1200;
    height = window.innerHeight || 800;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener('resize', () => {
    requestAnimationFrame(resize);
  });

  // We design 2 elegant, continuous cut-away fiber optic cable paths across the screen:
  // Cable 1: Sweeps gently from top-left diagonally down across the right
  // Cable 2: Runs softly along the lower half of the screen
  const cables = [
    {
      // Primary trunk cut-away cable
      getY: (x) => height * 0.22 + Math.sin(x * 0.0012) * 90 + (x / width) * (height * 0.28),
      slope: (x) => Math.cos(x * 0.0012) * 90 * 0.0012 + (height * 0.28) / width,
      jacketWidth: 38,
      coreCount: 6
    },
    {
      // Secondary deeper route
      getY: (x) => height * 0.76 - Math.sin(x * 0.0015 + 1.2) * 60 - (x / width) * (height * 0.12),
      slope: (x) => -Math.cos(x * 0.0015 + 1.2) * 60 * 0.0015 - (height * 0.12) / width,
      jacketWidth: 32,
      coreCount: 5
    }
  ];

  // Optical core strands inside each cut-away cable
  const fiberStrands = [];
  cables.forEach((cable, cIdx) => {
    for (let i = 0; i < cable.coreCount; i++) {
      // Offset position inside the cable jacket (cross-section)
      const offsetRatio = (i - (cable.coreCount - 1) / 2) / (cable.coreCount / 2);
      const isOrange = i % 2 === 0;
      fiberStrands.push({
        cable,
        offsetRatio,
        color: isOrange ? '#FF7300' : '#007BFF',
        alpha: 0.065,
        width: 1.2,
        // Atoms / Photons passing through this core
        photons: [
          { x: Math.random() * width, speed: 1.2 + Math.random() * 1.4, size: 2.2 + Math.random() * 1.5, tail: 28 },
          { x: Math.random() * width, speed: 0.9 + Math.random() * 1.1, size: 1.8 + Math.random() * 1.2, tail: 22 }
        ]
      });
    }
  });

  // Faint floating ambient telecom ions / particles drifting gently
  const ambientAtoms = [];
  const atomCount = 18;
  for (let i = 0; i < atomCount; i++) {
    ambientAtoms.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0.15 + Math.random() * 0.25,
      vy: (Math.random() - 0.5) * 0.15,
      size: 1.2 + Math.random() * 1.8,
      color: i % 2 === 0 ? '#007BFF' : '#FF7300',
      pulse: Math.random() * Math.PI * 2
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Half-Cut Cable Outer Protective Sheath & Buffer Jacket (Faint Blueprint Outline)
    cables.forEach(cable => {
      const halfJacket = cable.jacketWidth / 2;

      // Top sheath cut edge
      ctx.beginPath();
      for (let x = 0; x <= width; x += 30) {
        const y = cable.getY(x);
        const sl = cable.slope(x);
        const normAngle = Math.atan(sl) + Math.PI / 2;
        const px = x + Math.cos(normAngle) * halfJacket;
        const py = y + Math.sin(normAngle) * halfJacket;
        if (x === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = '#007BFF';
      ctx.globalAlpha = 0.045; // Very faint so it never distracts
      ctx.lineWidth = 1;
      ctx.stroke();

      // Bottom sheath cut edge (creates the half-cut visual tube)
      ctx.beginPath();
      for (let x = 0; x <= width; x += 30) {
        const y = cable.getY(x);
        const sl = cable.slope(x);
        const normAngle = Math.atan(sl) - Math.PI / 2;
        const px = x + Math.cos(normAngle) * halfJacket;
        const py = y + Math.sin(normAngle) * halfJacket;
        if (x === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = '#FF7300';
      ctx.globalAlpha = 0.035;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Subtle periodic cable ring ribs (cut cross-section segments)
      for (let x = 80; x < width; x += 180) {
        const y = cable.getY(x);
        const sl = cable.slope(x);
        const normAngle = Math.atan(sl) + Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(normAngle) * halfJacket, y + Math.sin(normAngle) * halfJacket);
        ctx.lineTo(x - Math.cos(normAngle) * halfJacket, y - Math.sin(normAngle) * halfJacket);
        ctx.strokeStyle = '#94a3b8';
        ctx.globalAlpha = 0.025;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    });

    // 2. Draw Internal Exposed Glass Fiber Strands & Passing Light Atoms/Photons
    fiberStrands.forEach(strand => {
      const halfJacket = strand.cable.jacketWidth / 2;
      const strandOffset = strand.offsetRatio * (halfJacket * 0.72);

      // Draw the glass fiber waveguide line
      ctx.beginPath();
      for (let x = 0; x <= width; x += 25) {
        const y = strand.cable.getY(x);
        const sl = strand.cable.slope(x);
        const normAngle = Math.atan(sl) + Math.PI / 2;
        const px = x + Math.cos(normAngle) * strandOffset;
        const py = y + Math.sin(normAngle) * strandOffset;
        if (x === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = strand.color;
      ctx.globalAlpha = strand.alpha;
      ctx.lineWidth = strand.width;
      ctx.stroke();

      // Passing Light Photons / Atoms through this fiber glass strand
      strand.photons.forEach(atom => {
        atom.x += atom.speed;
        if (atom.x > width + 40) {
          atom.x = -40;
        }

        const y = strand.cable.getY(atom.x);
        const sl = strand.cable.slope(atom.x);
        const normAngle = Math.atan(sl) + Math.PI / 2;
        const px = atom.x + Math.cos(normAngle) * strandOffset;
        const py = y + Math.sin(normAngle) * strandOffset;

        // Tail behind the passing atom (ultra subtle)
        const tailX = atom.x - atom.tail;
        const tailY = strand.cable.getY(tailX);
        const tailPx = tailX + Math.cos(normAngle) * strandOffset;
        const tailPy = tailY + Math.sin(normAngle) * strandOffset;

        if (Number.isFinite(tailPx) && Number.isFinite(tailPy) && Number.isFinite(px) && Number.isFinite(py)) {
          const tailGrad = ctx.createLinearGradient(tailPx, tailPy, px, py);
          tailGrad.addColorStop(0, 'rgba(0,0,0,0)');
          tailGrad.addColorStop(1, strand.color);

          ctx.beginPath();
          ctx.moveTo(tailPx, tailPy);
          ctx.lineTo(px, py);
          ctx.strokeStyle = tailGrad;
          ctx.globalAlpha = 0.08;
          ctx.lineWidth = strand.width;
          ctx.stroke();
        }

        // Atom particle core (very light)
        ctx.beginPath();
        ctx.arc(px, py, atom.size, 0, Math.PI * 2);
        ctx.fillStyle = strand.color;
        ctx.globalAlpha = 0.12;
        ctx.fill();

        // Inner glowing photon nucleus (soft)
        ctx.beginPath();
        ctx.arc(px, py, atom.size * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.18;
        ctx.fill();
      });
    });

    // 3. Very light ambient floating telecom energy particles
    ambientAtoms.forEach(atom => {
      atom.x += atom.vx;
      atom.y += atom.vy;
      atom.pulse += 0.015;

      if (atom.x > width + 10) atom.x = -10;
      if (atom.y < -10) atom.y = height + 10;
      if (atom.y > height + 10) atom.y = -10;

      const alphaPulse = 0.04 + Math.sin(atom.pulse) * 0.02;
      ctx.beginPath();
      ctx.arc(atom.x, atom.y, atom.size, 0, Math.PI * 2);
      ctx.fillStyle = atom.color;
      ctx.globalAlpha = alphaPulse;
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    animId = requestAnimationFrame(draw);
  }

  draw();
}
