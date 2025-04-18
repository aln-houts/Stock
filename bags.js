
let inventory = JSON.parse(localStorage.getItem("bagInventory")) || {};

document.getElementById("addForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const styleInput = document.getElementById("style")?.value.trim() || "";
  const colorInput = document.getElementById("color")?.value.trim() || "";
  const style = styleInput.toLowerCase();
  const color = colorInput.toLowerCase();
  const designInput = document.getElementById("design")?.value.trim() || "";
  const quantity = parseInt(document.getElementById("quantity").value, 10);

  const key = designInput ? designInput.toLowerCase() : (style + "::" + color);

  if (!inventory[key]) {
    inventory[key] = designInput ? {
      design: designInput,
      quantity: 0
    } : {
      style: styleInput,
      color: colorInput,
      quantity: 0
    };
  }

  inventory[key].quantity += quantity;
  localStorage.setItem("bagInventory", JSON.stringify(inventory));

  if (styleInput) saveSuggestion("styleSuggestions", styleInput);
  if (colorInput) saveSuggestion("colorSuggestions", colorInput);

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
      <th>Quantity</th>
      <th>Actions</th>
    </tr>
  `;
  table.appendChild(header);

  const body = document.createElement("tbody");

  Object.entries(inventory).forEach(([key, item]) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.style}</td>
      <td>${item.color}</td>
      <td>${item.quantity}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteEntry('${key}')">Delete</button>
      </td>
    `;
    body.appendChild(row);
  });

  table.appendChild(body);
  display.appendChild(table);
}

function deleteEntry(key) {
  if (confirm("Are you sure you want to delete this entry?")) {
    delete inventory[key];
    localStorage.setItem("bagInventory", JSON.stringify(inventory));
    renderInventory();
  }
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

loadSuggestions("styleSuggestions", "styleSuggestions");
loadSuggestions("colorSuggestions", "colorSuggestions");

renderInventory();
