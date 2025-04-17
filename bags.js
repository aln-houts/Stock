let inventory = JSON.parse(localStorage.getItem("bagInventory")) || {};

document.getElementById("addForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const style = document.getElementById("style").value.trim();
  const color = document.getElementById("color").value;
  const quantity = parseInt(document.getElementById("quantity").value, 10);

  const key = style + "::" + color;
  if (!inventory[key]) {
    inventory[key] = { style, color, quantity: 0 };
  }

  inventory[key].quantity += quantity;
  localStorage.setItem("bagInventory", JSON.stringify(inventory));
  renderInventory();
  e.target.reset();
});

function renderInventory() {
  const display = document.getElementById("inventoryDisplay");
  display.innerHTML = "";

  const table = document.createElement("table");
  table.className = "table table-bordered table-striped mt-4";

  const header = document.createElement("thead");
  header.innerHTML = `
    <tr><th>Style</th><th>Color</th><th>Quantity</th></tr>
  `;
  table.appendChild(header);

  const body = document.createElement("tbody");

  Object.values(inventory).forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.style}</td>
      <td>${item.color}</td>
      <td>${item.quantity}</td>
    `;
    body.appendChild(row);
  });

  table.appendChild(body);
  display.appendChild(table);
}

renderInventory();
