
import { saveSuggestion, loadSuggestions, renderTable, sizes } from './shared.js';

let inventory = JSON.parse(localStorage.getItem("teesInventory")) || {};

document.getElementById("addForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const styleInput = document.getElementById("style").value.trim();
  const style = styleInput.toLowerCase();
  const colorInput = document.getElementById('color').value.trim(); const color = colorInput.toLowerCase();
  const size = document.getElementById('size').value;
  const quantity = parseInt(document.getElementById("quantity").value, 10);
  const keyStr = style + "::" + color;

  if (!inventory[keyStr]) {
    inventory[keyStr] = {
      style: styleInput,
      color: colorInput,
      sizes: sizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {})
    };
  }

  inventory[keyStr].sizes[size] += quantity;
  localStorage.setItem("teesInventory", JSON.stringify(inventory));

  saveSuggestion("teesStyleSuggestions", styleInput);
  saveSuggestion("teesColors_" + style, colorInput);
  renderInventory();
  e.target.reset();
});

function deleteEntry(keyStr) {
  delete inventory[keyStr];
  localStorage.setItem("teesInventory", JSON.stringify(inventory));
  renderInventory();
}

function renderInventory() { renderTable(inventory, { showColor: true, showSize: true, keyType: "style", onDelete: "deleteEntry" }); }

loadSuggestions("teesStyleSuggestions", "styleSuggestions");

document.getElementById("style").addEventListener("change", function () {
  const style = this.value.trim().toLowerCase();
  loadSuggestions("teesColors_" + style, "colorSuggestions");
});renderInventory();