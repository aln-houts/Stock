let inventory = JSON.parse(localStorage.getItem("inventory")) || {};

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
      sizes: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XX: 0, "3X": 0, "4X": 0, "5X": 0 }
    };
  }

  inventory[key].sizes[size] += quantity;
  localStorage.setItem("inventory", JSON.stringify(inventory));

  saveSuggestion("teeStyleSuggestions", styleInput);
  saveSuggestion("teeColors_" + style, colorInput);

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
      <th>XS</th><th>S</th><th>M</th><th>L</th><th>XL</th>
      <th>XX</th><th>3X</th><th>4X</th><th>5X</th>
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
      <td>${item.sizes.XS}</td>
      <td>${item.sizes.S}</td>
      <td>${item.sizes.M}</td>
      <td>${item.sizes.L}</td>
      <td>${item.sizes.XL}</td>
      <td>${item.sizes.XX}</td>
      <td>${item.sizes["3X"]}</td>
      <td>${item.sizes["4X"]}</td>
      <td>${item.sizes["5X"]}</td>
      <td><button class="btn btn-sm btn-danger" onclick="deleteEntry('${key}')">Delete</button></td>
    `;
    body.appendChild(row);
  });
  table.appendChild(body);
  display.appendChild(table);
}

function deleteEntry(key) {
  delete inventory[key];
  localStorage.setItem("inventory", JSON.stringify(inventory));
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

loadSuggestions("teeStyleSuggestions", "styleSuggestions");

document.getElementById("style").addEventListener("change", function () {
  const style = this.value.trim().toLowerCase();
  loadSuggestions("teeColors_" + style, "colorSuggestions");
});

renderInventory();