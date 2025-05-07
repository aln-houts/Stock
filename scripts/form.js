import { saveSuggestion, loadSuggestions, sizes } from './shared.js';
import { inventory, initializeInventoryItem, renderInventory } from './inventory.js';

const suggestionsCache = {};

document.getElementById("addForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const styleInput = document.getElementById("style").value.trim();
  const colorInput = document.getElementById("color").value.trim();
  const style = styleInput.toLowerCase();
  const color = colorInput.toLowerCase();
  const size = document.getElementById("size").value;
  const quantity = parseInt(document.getElementById("quantity").value, 10);
  const key = style + "::" + color;

  if (!inventory[key]) {
    inventory[key] = initializeInventoryItem(styleInput, colorInput);
  }

  inventory[key].sizes[size] += quantity;
  localStorage.setItem("inventory", JSON.stringify(inventory));

  saveSuggestion("teeStyleSuggestions", styleInput);
  saveSuggestion("teeColors_" + style, colorInput);

  renderInventory();
  e.target.reset();
});

loadSuggestions("teeStyleSuggestions", "styleSuggestions");

document.getElementById('style').addEventListener('change', function() {
  const style = this.value.trim().toLowerCase();
  loadSuggestions('teeColors_' + style, 'colorSuggestions');
});

renderInventory();
