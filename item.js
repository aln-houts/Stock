// item.js
import { saveSuggestion, loadSuggestions, renderTable, sizes } from './shared.js';

// 1) Determine type from URL (default 'tees')
const params   = new URLSearchParams(window.location.search);
const rawType  = params.get('type') || window.location.hash.slice(1) || 'tees';
const type     = rawType.toLowerCase();

// 2) Pick storage key – for 'tees' keep using the old 'inventory' key,
//    for everything else use `${type}Inventory`
const keyStore = type === 'tees'
  ? 'inventory'
  : `${type}Inventory`;

// 3) Suggestion-key helper (you can leave this as-is or migrate later)
const suggestionsKey = name => `${type}${name}Suggestions`;

// 4) Field-visibility config
const config = {
  tees:    { style:true, color:true,  size:true,  quantity:true },
  hoodies: { style:true, color:true,  size:true,  quantity:true },
  tanks:   { style:true, color:true,  size:true,  quantity:true },
  hats:    { style:true, color:true,  size:false, quantity:true },
  bags:    { style:true, color:true,  size:false, quantity:true },
  printtees:{ style:true, color:true,  size:true, quantity:true },
  transfers:{ style:true, color:false,  size:false, quantity:true },
};
const fieldsToShow = config[type] || config['tees'];
const hasSize      = !!fieldsToShow.size;

// 5) Page titles + headings
const prettyName = type.charAt(0).toUpperCase() + type.slice(1);
document.title = prettyName;
document.getElementById('page-title').textContent = prettyName;
document.getElementById('form-title').textContent = `Add ${prettyName}`;

// 6) Load whatever’s in storage
let inventory = JSON.parse(localStorage.getItem(keyStore)) || {};

// 7) Render / delete helpers
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

// 8) Form injection + initialization
function initForm() {
  // show/hide fields
  Object.entries(fieldsToShow).forEach(([field, show]) => {
    const wrapper = document.querySelector(`[data-field="${field}"]`);
    if (wrapper) wrapper.style.display = show ? '' : 'none';
  });

  // populate size dropdown if needed
  if (hasSize) {
    const sizeEl = document.getElementById('size');
    sizes.forEach(s => sizeEl.add(new Option(s, s)));
  }

  // wire up suggestions
  loadSuggestions(suggestionsKey('Style'), 'styleSuggestions');
  document.getElementById('style').addEventListener('change', () => {
    const st = document.getElementById('style').value.trim().toLowerCase();
    loadSuggestions(suggestionsKey(`Colors_${st}`), 'colorSuggestions');
  });

  // submit handler
  document.getElementById('addForm').addEventListener('submit', e => {
    e.preventDefault();
    const style = document.getElementById('style').value.trim();
    const color = document.getElementById('color').value.trim();
    const qty   = parseInt(document.getElementById('quantity').value, 10);
    const size  = hasSize ? document.getElementById('size').value : null;
    const key   = `${style.toLowerCase()}::${color.toLowerCase()}`;

    // initialize and update
    if (!inventory[key]) {
      inventory[key] = { style, color, quantity: 0, sizes: {} };
      sizes.forEach(s => inventory[key].sizes[s] = 0);
    }
    if (hasSize) inventory[key].sizes[size] += qty;
    else          inventory[key].quantity = (inventory[key].quantity || 0) + qty;

    localStorage.setItem(keyStore, JSON.stringify(inventory));
    saveSuggestion(suggestionsKey('Style'), style);
    saveSuggestion(suggestionsKey(`Colors_${style.toLowerCase()}`), color);
    renderInventory();
    e.target.reset();
  });

  // initial render
  renderInventory();
}

// 9) Load the shared form template and then init
fetch('form.html')
  .then(r => r.text())
  .then(html => {
    document.getElementById('form-placeholder').innerHTML = html;
  })
  .then(initForm);
