
let inventory = JSON.parse(localStorage.getItem("hoodiesInventory")) || {};

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
      sizes: {{ XS: 0, S: 0, M: 0, L: 0, XL: 0, XX: 0, '3X': 0, '4X': 0, '5X': 0 }}
    };
  }

  inventory[keyStr].sizes[size] += quantity;
  localStorage.setItem("hoodiesInventory", JSON.stringify(inventory));

  saveSuggestion("hoodiesStyleSuggestions", styleInput);
  saveSuggestion("hoodiesColors_" + style, colorInput);
  renderInventory();
  e.target.reset();
});

function deleteEntry(keyStr) {
  delete inventory[keyStr];
  localStorage.setItem("hoodiesInventory", JSON.stringify(inventory));
  renderInventory();
}

function renderInventory() {
  renderTable(inventory, {
    showColor: true,
    showSize: true,
    keyType: "style",
    onDelete: "deleteEntry"
  });
}

loadSuggestions("hoodiesStyleSuggestions", "styleSuggestions");

document.getElementById("style").addEventListener("change", function () {
  const style = this.value.trim().toLowerCase();
  loadSuggestions("hoodiesColors_" + style, "colorSuggestions");
});

renderInventory();
