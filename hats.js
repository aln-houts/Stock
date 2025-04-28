import { saveSuggestion, loadSuggestions, renderTable } from './shared.js';

let inventory = JSON.parse(localStorage.getItem("hatsInventory")) || {};

document.getElementById("addForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const styleInput = document.getElementById("style").value.trim();
  const style = styleInput.toLowerCase();
  const colorInput = document.getElementById("color").value.trim();
  const color = colorInput.toLowerCase();
  const quantity = parseInt(document.getElementById("quantity").value, 10);
  const keyStr = style + "::" + color;

  if (!inventory[keyStr]) {
    inventory[keyStr] = { style: styleInput, color: colorInput, quantity: 0 };
  }
  inventory[keyStr].quantity += quantity;
  localStorage.setItem("hatsInventory", JSON.stringify(inventory));

  saveSuggestion("hatsStyleSuggestions", styleInput);
  saveSuggestion("hatsColors_" + style, colorInput);

  renderInventory();
  e.target.reset();
});

function deleteEntry(keyStr) {
  delete inventory[keyStr];
  localStorage.setItem("hatsInventory", JSON.stringify(inventory));
  renderInventory();
}

function renderInventory() {
  renderTable(inventory, {
    showColor: true,
    showSize: false,
    keyType: "style",
    onDelete: "deleteEntry"
  });
}

// populate the style datalist
loadSuggestions("hatsStyleSuggestions", "styleSuggestions");

// when style changes, populate color datalist
document.getElementById("style").addEventListener("change", function () {
  const style = this.value.trim().toLowerCase();
  loadSuggestions("hatsColors_" + style, "colorSuggestions");
});

renderInventory();
