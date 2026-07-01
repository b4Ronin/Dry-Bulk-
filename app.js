const products = [
  { name: "Portland +33% GEL", factor: 1.750 },
  { name: "Class H +35% OKLA #1", factor: 1.587 },
  { name: "Portland +12–18% GEL", factor: 1.366 },
  { name: "Trinity Lite White", factor: 1.311 },
  { name: "Portland +8–11% GEL", factor: 1.311 },
  { name: "Portland +4–7% GEL", factor: 1.266 },
  { name: "Portland +1–3% GEL", factor: 1.215 },
  { name: "SLO-SLT +5–8% Gel", factor: 1.171 },
  { name: "Portland Neat", factor: 1.171 },
  { name: "Halliburton Light", factor: 1.171 },
  { name: "50/50 POZMIX", factor: 1.171 },
  { name: "Class A +2% Econolite", factor: 1.142 },
  { name: "Class H Neat", factor: 1.098 },
  { name: "Class H +2% Econolite", factor: 1.095 },
  { name: "SLO-SET +5–8% Gel", factor: 1.093 },
  { name: "SLO-SET Neat", factor: 1.025 },
  { name: "Gel", factor: 2.000 },
  { name: "HTLD", factor: 1.170 },
  { name: "Class H Silica Flour", factor: 1.840 },
  { name: "Class H +35% Silica Flour +20# Hi-Dense", factor: 1.960 },
  { name: "Class H +35% OKLA #1 +20# Hi-Dense/Sk", factor: 1.730 },
  { name: "Class H +35% OKLA #1 +40# Hi-Dense/Sk", factor: 1.840 },
  { name: "50/50 POZ +4% Gel", factor: 1.270 },
  { name: "Barite Neat", factor: 0.800 },
  { name: "Class H +18% Salt", factor: 1.200 },
  { name: "Class H +10#SK Gilsonite", factor: 1.510 },
  { name: "Class H +20#SK Gilsonite", factor: 1.750 }
];

const els = {
  tank: document.getElementById('tankCapacity'),
  fill: document.getElementById('safeFill'),
  lock: document.getElementById('lockButton'),
  select: document.getElementById('productSelect'),
  factor: document.getElementById('selectedFactor'),
  sack: document.getElementById('sackResult'),
  calc: document.getElementById('calculationLine'),
  reserve: document.getElementById('reserveCapacity'),
  usable: document.getElementById('usableCapacity'),
  productOut: document.getElementById('productNameOutput')
};

let locked = false;

function formatNumber(value, digits = 1) {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString(undefined, { maximumFractionDigits: digits });
}

function populateProducts() {
  els.select.innerHTML = '<option value="">Select product</option>';
  products.forEach((product, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = product.name;
    els.select.appendChild(option);
  });
}

function saveSettings() {
  localStorage.setItem('bulkSackSettings', JSON.stringify({
    tank: els.tank.value,
    fill: els.fill.value,
    product: els.select.value
  }));
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem('bulkSackSettings') || '{}');
    if (saved.tank) els.tank.value = saved.tank;
    if (saved.fill) els.fill.value = saved.fill;
    if (saved.product) els.select.value = saved.product;
  } catch (_) {}
}

function setLocked(nextState) {
  locked = nextState;
  els.tank.disabled = locked;
  els.fill.disabled = locked;
  els.lock.textContent = locked ? 'Inputs Locked' : 'Inputs Unlocked';
  els.lock.classList.toggle('locked', locked);
  els.lock.classList.toggle('unlocked', !locked);
  saveSettings();
  calculate();
}

function calculate() {
  const tank = parseFloat(els.tank.value);
  const fill = parseFloat(els.fill.value);
  const product = products[parseInt(els.select.value, 10)];

  els.factor.textContent = product ? `${product.factor.toFixed(3)} ft³/sk` : 'Select a product';
  els.productOut.textContent = product ? `${product.name} — ${product.factor.toFixed(3)} ft³/sk` : '—';

  if (!Number.isFinite(tank) || !Number.isFinite(fill)) {
    els.sack.textContent = '—';
    els.reserve.textContent = '—';
    els.usable.textContent = '—';
    els.calc.textContent = 'Enter tank capacity and safe fill level.';
    return;
  }

  const safeFill = Math.min(Math.max(fill, 0), 100);
  const reservePercent = 100 - safeFill;
  const usable = tank * (safeFill / 100);
  const reserve = tank - usable;

  els.reserve.textContent = `${formatNumber(reserve)} ft³`;
  els.usable.textContent = `${formatNumber(usable)} ft³`;

  if (!product) {
    els.sack.textContent = '—';
    els.calc.textContent = `Reserve is ${formatNumber(reserve)} ft³ (${formatNumber(reservePercent)}%).`;
    return;
  }

  const sacks = usable / product.factor;
  els.sack.textContent = formatNumber(sacks, 1);
  els.calc.textContent = `${formatNumber(usable)} ft³ ÷ ${product.factor.toFixed(3)} ft³/sk`;
  saveSettings();
}

['input', 'change'].forEach(evt => {
  els.tank.addEventListener(evt, calculate);
  els.fill.addEventListener(evt, calculate);
  els.select.addEventListener(evt, calculate);
});

els.select.addEventListener('change', saveSettings);
els.lock.addEventListener('click', () => setLocked(!locked));

populateProducts();
loadSettings();
calculate();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  });
}
