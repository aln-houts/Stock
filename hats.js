
import { saveSuggestion, loadSuggestions, renderTable, sizes } from "./shared.js";
import { saveSuggestion, loadSuggestions, renderTable, sizes } from './shared.js';
document.getElementById("addForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const styleInput = document.getElementById("style").value.trim();
  const style = styleInput.toLowerCase();
  const colorInput = document.getElementById('color').value.trim(); const color = colorInput.toLowerCase();
  
  const quantity = parseInt(document.getElementById("quantity").value, 10);
  const keyStr = style + "::" + color;

  if (!inventory[keyStr]) {
    inventory[keyStr] = {
        
      style: styleInput,
      color: colorInput,
      quantity: 0
    };
  }

  inventory[keyStr].quantity += quantity;
  localStorage.setItem("hatsInventory", JSON.stringify(inventory));

  saveSuggestion("hatsStyleSuggestions", styleInput);
  saveSuggestion("hatsColors_" + style, colorInput);
  renderInventory();
  e.target.reset();
});

let inventory = JSON.parse(localStorage.getItem("hatsInventory")) || {};

function deleteEntry(keyStr) {
    delete inventory[keyStr];
    localStorage.setItem("hatsInventory", JSON.stringify(inventory));
    renderInventory();
}

function renderInventory() {
    renderTable(inventory, { showColor: true, showSize: false, keyType: "style", onDelete: "deleteEntry" });
}
loadSuggestions("hatsStyleSuggestions", "styleSuggestions");
document.getElementById("style").addEventListener("change", () => loadSuggestions("hatsColors_" + document.getElementById("style").value.trim().toLowerCase(), "colorSuggestions"));
renderInventory();


