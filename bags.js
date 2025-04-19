
let inventory = JSON.parse(localStorage.getItem("bagsInventory")) || {};

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
  localStorage.setItem("bagsInventory", JSON.stringify(inventory));

  saveSuggestion("bagsStyleSuggestions", styleInput);
  saveSuggestion("bagsColors_" + style, colorInput);
  renderInventory();
  e.target.reset();
});

function renderInventory() {
  const display = document.getElementById("inventoryDisplay");
  display.innerHTML = "";

  const table = document.createElement("table");
  table.className = "table table-sm table-bordered table-striped";

  const header = document.createElement("thead");
  header.innerHTML = `
    <tr>
      <th>Style</th>
      <th>Color</th>
      <th>Qty</th>
      <th>Actions</th>
    </tr>
  `;
  table.appendChild(header);

  const body = document.createElement("tbody");
  Object.entries(inventory).forEach(([keyStr, item]) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.style}</td>
      <td>${item.color}</td>
      <td>${item.quantity}</td>
      <td><button class="btn btn-sm btn-danger" onclick="deleteEntry('${keyStr}')">Delete</button></td>
    `;
    body.appendChild(row);
  });
  table.appendChild(body);
  display.appendChild(table);
}

function deleteEntry(keyStr) {
  delete inventory[keyStr];
  localStorage.setItem("bagsInventory", JSON.stringify(inventory));
  renderInventory();
}

function saveSuggestion(key, value) {
  const list = JSON.parse(localStorage.getItem(key) || "[]");
  if (!list.includes(value)) {
    list.push(value);
    localStorage.setItem(key, JSON.stringify(list));
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

loadSuggestions("bagsStyleSuggestions", "styleSuggestions");

document.getElementById("style").addEventListener("change", function () {
  const style = this.value.trim().toLowerCase();
  loadSuggestions("bagsColors_" + style, "colorSuggestions");
});
renderInventory();
