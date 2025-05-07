let inventory = JSON.parse(localStorage.getItem("inventory")) || {};

function initializeInventoryItem(styleInput, colorInput) {
  const item = {
    style: styleInput,
    color: colorInput,
    sizes: {}
  };
  sizes.forEach(size => item.sizes[size] = 0);
  return item;
}

function renderInventory() {
  const display = document.getElementById("inventoryDisplay");
  display.innerHTML = "";

  const table = document.createElement("table");
  table.className = "table table-sm table-bordered table-striped";

  const header = document.createElement("thead");
  const headerRow = document.createElement("tr");
  ["Style", "Color", ...sizes, "Actions"].forEach(text => {
    const th = document.createElement("th");
    th.textContent = text;
    headerRow.appendChild(th);
  });
  header.appendChild(headerRow);
  table.appendChild(header);

  const body = document.createElement("tbody");
  Object.entries(inventory).forEach(([key, item]) => {
    const row = document.createElement("tr");

    const styleCell = document.createElement("td");
    styleCell.textContent = item.style;
    row.appendChild(styleCell);

    const colorCell = document.createElement("td");
    colorCell.textContent = item.color;
    row.appendChild(colorCell);

    sizes.forEach(size => {
      const sizeCell = document.createElement("td");
      sizeCell.textContent = item.sizes[size];
      row.appendChild(sizeCell);
    });

    const actionCell = document.createElement("td");
    actionCell.innerHTML = `<button class="btn btn-sm btn-danger" onclick="deleteEntry('${key}')">Delete</button>`;
    row.appendChild(actionCell);

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

export { inventory, initializeInventoryItem, renderInventory, deleteEntry };
