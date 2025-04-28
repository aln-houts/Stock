import { saveSuggestion, loadSuggestions, renderTable, sizes } from './shared.js';
let suggestionsCache = {};
let inventory = JSON.parse(localStorage.getItem("printInventory")) || {};

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
    inventory[key] = {
      style: styleInput,
      color: colorInput,
      sizes: {}
    };
    sizes.forEach(size => inventory[key].sizes[size] = 0)
        XS: 0, S: 0, M: 0, L: 0, XL: 0, XX: 0, "3X": 0, "4X": 0, "5X": 0
      }
    };
  }

  inventory[key].sizes[size] += quantity;
  localStorage.setItem("printInventory", JSON.stringify(inventory));
  saveSuggestion("styleSuggestions", styleInput);
  saveSuggestion("colorSuggestions", colorInput);
  renderInventory();
  e.target.reset();
});

function renderInventory(){
  renderTable(inventory, {
    showColor: true,
    showSize: true,
    keyType: "style",
    onDelete: "deleteEntry"
  });
}

function deleteEntry(key) {
  if (confirm("Are you sure you want to delete this entry?")) {
    delete inventory[key];
    localStorage.setItem("printInventory", JSON.stringify(inventory));
    renderInventory();    
  }
}

function loadSuggestions(key, datalistId) {
  const list = JSON.parse(localStorage.getItem(key) || "[]");
  const datalist = document.getElementById(datalistId);
  datalist.innerHTML = "";
  list.forEach(item => {
    const option = document.createElement("option");
    option.value = item;
    datalist.appendChild(option);
  });
}
loadSuggestions("styleSuggestions", "styleSuggestions");
loadSuggestions("colorSuggestions", "colorSuggestions");
renderInventory();
