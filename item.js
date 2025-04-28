// item.js
import { saveSuggestion, loadSuggestions, renderTable, sizes } from './shared.js';

// 1) Determine type from ?type= or #hash (default to 'tees')
const params = new URLSearchParams(window.location.search);
const rawType = params.get('type') || window.location.hash.slice(1) || 'tees';
const type    = rawType.toLowerCase();

// 2) Storage key and suggestion-key helper
const keyStore      = `${type}Inventory`;
const suggestionsKey = name => `${type}${name}Suggestions`;

// 3) Per–type form field visibility config
const config = {
  tees:    { style:true, color:true,  size:true,  quantity:true },
  hoodies: { style:true, color:true,  size:true,  quantity:true },
  tanks:   { style:true, color:true,  size:true,  quantity:true },
  hats:    { style:true, color:true,  size:false, quantity:true },
  bags:    { style:true, color:true,  size:false, quantity:true },
};
const fieldsToShow = config[type] || config['tees'];
const hasSize      = !!fieldsToShow.size;

// 4) Update page titles/headings
const prettyName = type.charAt(0).toUpperCase() + type.slice(1);
document.title = prettyName;
document.getElementById('page-title').textContent = prettyName;
document.getElementById('form-title').textContent = `Add ${prettyName}`;

// 5) Load existing inventory
let inventory = JSON.parse(localStorage.getItem(keyStore)) || {};

// 6) Render & delete helpers
function deleteEntry(key) {
  delete inventory[key];
  localStorage.setItem(keyStore, JSON.stringify(inventory));
  renderInventory();
}
function renderInventory() {
  renderTable(inventory, {
    showColor: fieldsToShow.color,
    showSize:  fieldsToShow.size,
    keyType:   'style',
    onDelete:  'deleteEntry'
  });
}

// 7) Initialize form once it's injected
function initForm() {
  // a) show/hide fields
  Object.entries(fieldsToShow).forEach(([field, show]) => {
    const wrapper = document.querySelector(`[data-field="${field}"]`);
    if (wrapper) wrapper.style.display = show ? '' : 'none';
  });

  // b) populate size dropdown if needed
  if (hasSize) {
    const sizeEl = document.getElementById('size');
    sizes.forEach(s => sizeEl.add(new Option(s, s)));
  }

  // c) suggestion wiring
  loadSuggestions(suggestionsKey('Style'), 'styleSuggestions');
  document.getElementById('style')
    .addEventListener('change', () => {
      const st = document.getElementById('style').value.trim().toLowerCase();
      loadSuggestions(suggestionsKey(`Colors_${st}`), 'colorSuggestions');
    });

  // d) form submit
  document.getElementById('addForm').addEventListener('submit', e => {
    e.preventDefault();
    const style    = document.getElementById('style').value.trim();
    const color    = document.getElementById('color').value.trim();
    const qty      = parseInt(document.getElementById('quantity').value, 10);
    const size     = hasSize ? document.getElementById('size').value : null;
    const key      = `${style.toLowerCase()}::${color.toLowerCase()}`;

    if (!inventory[key]) {
      inventory[key] = { style, color, quantity: 0, sizes: {} };
      sizes.forEach(s => inventory[key].sizes[s] = 0);
    }
    if (hasSize) inventory[key].sizes[size] += qty;
    else          inventory[key].quantity  = (inventory[key].quantity || 0) + qty;

    localStorage.setItem(keyStore, JSON.stringify(inventory));
    saveSuggestion(suggestionsKey('Style'), style);
    saveSuggestion(suggestionsKey(`Colors_${style.toLowerCase()}`), color);
    renderInventory();
    e.target.reset();
  });

  // e) initial render
  renderInventory();
}

// 8) Inject shared form then init
fetch('form.html')
  .then(r => r.text())
  .then(html => {
    document.getElementById('form-placeholder').innerHTML = html;
  })
  .then(initForm);
  
