let inventory = JSON.parse(localStorage.getItem("transferInventory")) || {};

document.getElementById("addForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const design = document.getElementById("design").value.trim();
  const quantity = parseInt(document.getElementById("quantity").value, 10);

  if (!inventory[design]) {
    inventory[design] = { design, quantity: 0 };
  }

  inventory[design].quantity += quantity;
  localStorage.setItem("transferInventory", JSON.stringify(inventory));
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
    <tr><th>Design</th><th>Quantity</th></tr>
  `;
  table.appendChild(header);

  const body = document.createElement("tbody");

  Object.values(inventory).forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.design}</td>
      <td>${item.quantity}</td>
    `;
    body.appendChild(row);
  });

  table.appendChild(body);
  display.appendChild(table);
}

renderInventory();
