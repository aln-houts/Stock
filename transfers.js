
import { saveSuggestion, loadSuggestions, renderTable, sizes } from './shared.js';

let inventory = JSON.parse(localStorage.getItem("transfersInventory")) || {};

document.getElementById("addForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const titleInput = document.getElementById("title").value.trim();
  const title = titleInput.toLowerCase();
  const quantity = parseInt(document.getElementById("quantity").value, 10);

  if (!inventory[title]) {
    inventory[title] = {
      title: titleInput,
      quantity: 0
    };
  }

  inventory[title].quantity += quantity;
  localStorage.setItem("transfersInventory", JSON.stringify(inventory));
    saveSuggestion("transfersTitleSuggestions", titleInput);
  renderInventory();
  e.target.reset();
});

function renderInventory() {
  renderTable(inventory, {
    showColor: false,
    showSize: false,
    keyType: "title",
    onDelete: "deleteEntry"
  });
}

function deleteEntry(keyStr) {
  delete inventory[keyStr];
  localStorage.setItem("transfersInventory", JSON.stringify(inventory));
  renderInventory();
}
loadSuggestions("transfersTitleSuggestions", "titleSuggestions");
renderInventory();
