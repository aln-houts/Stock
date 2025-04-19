
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
  const display = document.getElementById("inventoryDisplay");
  display.innerHTML = "";

  const table = document.createElement("table");
  table.className = "table table-sm table-bordered table-striped";

  const header = document.createElement("thead");
  header.innerHTML = `
    <tr>
      <th>Title</th>
      <th>Quantity</th>
      <th>Actions</th>
    </tr>
  `;
  table.appendChild(header);

  const body = document.createElement("tbody");
  Object.entries(inventory).forEach(([keyStr, item]) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.title}</td>
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
  localStorage.setItem("transfersInventory", JSON.stringify(inventory));
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

loadSuggestions("transfersTitleSuggestions", "titleSuggestions");
renderInventory();
