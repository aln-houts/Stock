function setupItems() {
  console.log("setupItems.js loaded");

  const form = document.getElementById("addForm");
  const display = document.getElementById("itemDisplay");

  if (!form || !display) {
    console.warn("Missing form or display container.");
    return;
  }

  const rawType = new URLSearchParams(window.location.search).get('type') || window.location.hash.slice(1) || 'tees';
  const type = rawType.toLowerCase();
  const keyStore = `${type}Inventory`;
  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3X"];
  const suggestionsKey = name => `${type}${name}Suggestions`;
  let inventory = JSON.parse(localStorage.getItem(keyStore)) || {};

  const config = {
    tees:      { style: true, color: true, size: true, quantity: true },
    hoodies:   { style: true, color: true, size: true, quantity: true },
    tanks:     { style: true, color: true, size: true, quantity: true },
    bags:      { style: true, color: true, size: false, quantity: true },
    hats:      { style: true, color: true, size: false, quantity: true },
    printtees: { style: true, color: true, size: true, quantity: true },
    transfers: { style: true, color: false, size: false, quantity: true },
    raglan:    { style: true, color: true, size: true, quantity: true },
    longsleeve:{ style: true, color: true, size: true, quantity: true }
  };

  const fieldsToShow = config[type] || config['tees'];
  const hasSize = !!fieldsToShow.size;

  Object.entries(fieldsToShow).forEach(([field, show]) => {
    const wrapper = document.querySelector(`[data-field="${field}"]`);
    if (wrapper) wrapper.style.display = show ? '' : 'none';
  });

  if (hasSize) {
    const sizeEl = document.getElementById('size');
    if (sizeEl) {
      sizes.forEach(s => sizeEl.add(new Option(s, s))); // ✅
    }
  }
  
  loadSuggestions(suggestionsKey('Style'), 'styleSuggestions');
  document.getElementById('style').addEventListener('change', () => {
    const st = document.getElementById('style').value.trim().toLowerCase();
    loadSuggestions(suggestionsKey(`Colors_${st}`), 'colorSuggestions');
  });

  form.addEventListener('submit', e => {
    e.preventDefault();

    const style = document.getElementById('style').value.trim();
    const color = document.getElementById('color').value.trim();
    const qty = parseInt(document.getElementById('quantity').value, 10);
    const size = hasSize ? document.getElementById('size').value : null;
    const key = `${style.toLowerCase()}::${color.toLowerCase()}`;

    if (!inventory[key]) {
      inventory[key] = { style, color, quantity: 0, sizes: {} };
      sizes.forEach(s => (inventory[key].sizes[s] = 0));
    }

    if (hasSize) inventory[key].sizes[size] += qty;
    else inventory[key].quantity = (inventory[key].quantity || 0) + qty;

    localStorage.setItem(keyStore, JSON.stringify(inventory));
    saveSuggestion(suggestionsKey('Style'), style);
    saveSuggestion(suggestionsKey(`Colors_${style.toLowerCase()}`), color);
    renderInventory();
    form.reset();
  });

  function renderInventory() {
    renderTable(inventory, {
      showColor: fieldsToShow.color,
      showSize: fieldsToShow.size,
      keyType: 'style',
      onDelete: 'deleteEntry'
    });
  }

  window.deleteEntry = function (key) {
    delete inventory[key];
    localStorage.setItem(keyStore, JSON.stringify(inventory));
    renderInventory();
  };

  renderInventory();
}
function renderTable(data, options = {}) {
  const display = document.getElementById("itemDisplay");
  if (!display) return;

  const rows = Object.entries(data).map(([key, val]) => {
    const sizeCols = options.showSize && val.sizes
      ? Object.entries(val.sizes).map(([sz, qty]) => `${sz}: ${qty}`).join(", ")
      : "";
    const qty = options.showSize ? '' : (val.quantity || 0);

    return `
      <tr>
        <td>${val.style}</td>
        ${options.showColor ? `<td>${val.color}</td>` : ""}
        ${options.showSize ? `<td>${sizeCols}</td>` : `<td>${qty}</td>`}
        <td>
          <button class="btn btn-sm btn-danger" onclick="deleteEntry('${key}')">🗑️</button>
        </td>
      </tr>
    `;
  });

  display.innerHTML = `
    <table class="table table-bordered table-sm align-middle">
      <thead>
        <tr>
          <th>Style</th>
          ${options.showColor ? "<th>Color</th>" : ""}
          <th>${options.showSize ? "Sizes" : "Quantity"}</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>${rows.join("") || "<tr><td colspan='4'>No items found.</td></tr>"}</tbody>
    </table>
  `;
}
