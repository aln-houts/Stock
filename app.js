
let inventory = JSON.parse(localStorage.getItem("inventory")) || {};

document.getElementById("addForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const style = document.getElementById("style").value.trim();
  const color = document.getElementById("color").value;
  const size = document.getElementById("size").value;
  const quantity = parseInt(document.getElementById("quantity").value, 10);

  const key = style + "::" + color;
  if (!inventory[key]) {
    inventory[key] = {
      style,
      color,
      sizes: {
        XS: 0, S: 0, M: 0, L: 0, XL: 0, XX: 0, "3X": 0, "4X": 0, "5X": 0
      }
    };
  }

  inventory[key].sizes[size] += quantity;
  localStorage.setItem("inventory", JSON.stringify(inventory));
  renderInventory();
  e.target.reset();
});

function renderInventory() {
  const display = document.getElementById("inventoryDisplay");
  display.innerHTML = "";

  Object.entries(inventory).forEach(([key, item]) => {
    const table = document.createElement("table");
    table.className = "table table-bordered table-striped mt-4";

    const header = document.createElement("thead");
    header.innerHTML = `
      <tr><th colspan="9">${item.style} - ${item.color}</th></tr>
      <tr>
        <th>XS</th><th>S</th><th>M</th><th>L</th><th>XL</th>
        <th>XX</th><th>3X</th><th>4X</th><th>5X</th>
      </tr>
    `;
    table.appendChild(header);

    const body = document.createElement("tbody");
    const row = document.createElement("tr");

    ["XS", "S", "M", "L", "XL", "XX", "3X", "4X", "5X"].forEach(size => {
      const td = document.createElement("td");
      td.textContent = item.sizes[size];
      row.appendChild(td);
    });

    body.appendChild(row);

    const deleteRow = document.createElement("tr");
    const deleteCell = document.createElement("td");
    deleteCell.colSpan = 9;
    deleteCell.className = "text-center";
    deleteCell.innerHTML = `<button class="btn btn-sm btn-danger" onclick="deleteEntry('${key}')">Delete Entry</button>`;
    deleteRow.appendChild(deleteCell);
    body.appendChild(deleteRow);

    table.appendChild(body);
    display.appendChild(table);
  });
}

function deleteEntry(key) {
  if (confirm("Are you sure you want to delete this entry?")) {
    delete inventory[key];
    localStorage.setItem("inventory", JSON.stringify(inventory));
    renderInventory();
  }
}

renderInventory();
