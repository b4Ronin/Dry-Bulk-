const PRODUCTS = [
  {
    "name": "Portland +33% GEL",
    "factor": 1.75
  },
  {
    "name": "Class H +35% OKLA #1",
    "factor": 1.587
  },
  {
    "name": "Portland +12\u201318% GEL",
    "factor": 1.366
  },
  {
    "name": "Trinity Lite White",
    "factor": 1.311
  },
  {
    "name": "Portland +8\u201311% GEL",
    "factor": 1.311
  },
  {
    "name": "Portland +4\u20137% GEL",
    "factor": 1.266
  },
  {
    "name": "Portland +1\u20133% Gel",
    "factor": 1.215
  },
  {
    "name": "SLO-SLT +5\u20138% Gel",
    "factor": 1.171
  },
  {
    "name": "Portland Neat",
    "factor": 1.171
  },
  {
    "name": "Halliburton Light",
    "factor": 1.171
  },
  {
    "name": "50/50 POZMIX",
    "factor": 1.171
  },
  {
    "name": "Class A +2% Econolite",
    "factor": 1.142
  },
  {
    "name": "Class H Neat",
    "factor": 1.098
  },
  {
    "name": "Class H +2% Econolite",
    "factor": 1.095
  },
  {
    "name": "SLO-SET +5\u20138% Gel",
    "factor": 1.093
  },
  {
    "name": "SLO-SET Neat",
    "factor": 1.025
  },
  {
    "name": "Gel",
    "factor": 2.0
  },
  {
    "name": "HTLD",
    "factor": 1.17
  },
  {
    "name": "Class H Silica Flour",
    "factor": 1.84
  },
  {
    "name": "Class H +35% Silica Flour +20# Hi-Dense",
    "factor": 1.96
  },
  {
    "name": "Class H +35% OKLA #1 +20# HI-Dense/Sk",
    "factor": 1.73
  },
  {
    "name": "Class H +35% OKLA #1 +40# HI-Dense/Sk",
    "factor": 1.84
  },
  {
    "name": "50/50 POZ +4% Gel",
    "factor": 1.27
  },
  {
    "name": "Barite Neat",
    "factor": 0.8
  },
  {
    "name": "Class H +18% Salt",
    "factor": 1.2
  },
  {
    "name": "Class H +10#SK Gilsonite",
    "factor": 1.51
  },
  {
    "name": "Class H +20#SK Gilsonite",
    "factor": 1.75
  }
];

const STORAGE_KEY = "bulkSackCalculator.v1";
let locked = false;

const tankInput = document.getElementById("tankCapacity");
const safeInput = document.getElementById("safeFill");
const lockButton = document.getElementById("lockButton");
const productSelect = document.getElementById("productSelect");

const factorDisplay = document.getElementById("factorDisplay");
const sacksResult = document.getElementById("sacksResult");
const calcProduct = document.getElementById("calcProduct");
const calcFactor = document.getElementById("calcFactor");
const tankSummary = document.getElementById("tankSummary");
const safeSummary = document.getElementById("safeSummary");
const reserveLabel = document.getElementById("reserveLabel");
const reserveSummary = document.getElementById("reserveSummary");
const usableLabel = document.getElementById("usableLabel");
const usableSummary = document.getElementById("usableSummary");

function numericClean(value) {
  return String(value).replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
}

function toNumber(value) {
  const parsed = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function fmt(value, decimals = 1) {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, {
    minimumFractionDigits: value % 1 === 0 ? 0 : decimals,
    maximumFractionDigits: decimals
  });
}

function fmtFactor(value) {
  return Number(value).toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

function populateProducts() {
  productSelect.innerHTML = "";
  PRODUCTS.forEach((product, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = product.name;
    productSelect.appendChild(option);
  });
}

function getSelectedProduct() {
  const index = Number(productSelect.value || 0);
  return PRODUCTS[index] || PRODUCTS[0];
}

function saveState() {
  const state = {
    tank: tankInput.value,
    safe: safeInput.value,
    productIndex: productSelect.value,
    locked
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    tankInput.value = state.tank || "";
    safeInput.value = state.safe || "85";
    productSelect.value = state.productIndex || "0";
    locked = Boolean(state.locked);
  } catch {
    safeInput.value = "85";
    locked = false;
  }
}

function applyLockState() {
  tankInput.disabled = locked;
  safeInput.disabled = locked;
  lockButton.classList.toggle("locked", locked);
  lockButton.classList.toggle("unlocked", !locked);
  lockButton.innerHTML = locked ? "INPUTS<br>LOCKED" : "INPUTS<br>UNLOCKED";
}

function calculate() {
  const product = getSelectedProduct();
  const tank = toNumber(tankInput.value);
  let safe = toNumber(safeInput.value);

  if (safe > 100) safe = 100;
  if (safe < 0) safe = 0;

  const reservePercent = 100 - safe;
  const reserveCapacity = tank * (reservePercent / 100);
  const usableCapacity = tank * (safe / 100);
  const sacks = product.factor > 0 ? usableCapacity / product.factor : 0;

  factorDisplay.textContent = `${fmtFactor(product.factor)} ft³ per sack`;
  sacksResult.textContent = tank > 0 ? fmt(sacks, 1) : "—";
  calcProduct.textContent = product.name;
  calcFactor.textContent = `${fmtFactor(product.factor)} ft³ per sack`;

  tankSummary.textContent = tank > 0 ? `${fmt(tank, 1)} ft³` : "— ft³";
  safeSummary.textContent = `${fmt(safe, 1)} %`;
  reserveLabel.textContent = `Reserve Capacity (${fmt(reservePercent, 1)}%)`;
  reserveSummary.textContent = tank > 0 ? `${fmt(reserveCapacity, 1)} ft³` : "— ft³";
  usableLabel.textContent = `Usable Capacity (${fmt(safe, 1)}%)`;
  usableSummary.textContent = tank > 0 ? `${fmt(usableCapacity, 1)} ft³` : "— ft³";

  saveState();
}

[tankInput, safeInput].forEach(input => {
  input.addEventListener("input", () => {
    input.value = numericClean(input.value);
    calculate();
  });
});

productSelect.addEventListener("change", calculate);

lockButton.addEventListener("click", () => {
  locked = !locked;
  applyLockState();
  calculate();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}

populateProducts();
loadState();
applyLockState();
calculate();
