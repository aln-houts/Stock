
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

function renderTable(inventory, options = {}) {
  const {
    showColor = false,
    showSize = false,
    keyType = "style",
    onDelete
  } = options;

  const display = document.getElementById("inventoryDisplay");
  display.innerHTML = "";

  const table = document.createElement("table");
  table.className = "table table-sm table-bordered table-striped";

  const thead = document.createElement("thead");
  let headerRow = "<th>Style</th>";
  if (showColor) headerRow += "<th>Color</th>";
  if (showSize) {
    headerRow += "<th>XS</th><th>S</th><th>M</th><th>L</th><th>XL</th><th>XX</th><th>3X</th><th>4X</th><th>5X</th>";
  } else {
    headerRow += "<th>Qty</th>";
  }
  headerRow += "<th>Actions</th>";
  thead.innerHTML = `<tr>${headerRow}</tr>`;
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  Object.entries(inventory).forEach(([keyStr, item]) => {
    let row = `<td>${item.style}</td>`;
    if (showColor) row += `<td>${item.color}</td>`;
    if (showSize) {
      row += `<td>${item.sizes.XS}</td><td>${item.sizes.S}</td><td>${item.sizes.M}</td><td>${item.sizes.L}</td>
              <td>${item.sizes.XL}</td><td>${item.sizes.XX}</td><td>${item.sizes["3X"]}</td><td>${item.sizes["4X"]}</td><td>${item.sizes["5X"]}</td>`;
    } else {
      row += `<td>${item.quantity}</td>`;
    }
    row += `<td><button class="btn btn-sm btn-danger" onclick="${onDelete}('${keyStr}')">Delete</button></td>`;
    const tr = document.createElement("tr");
    tr.innerHTML = row;
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  display.appendChild(table);
}

const sizes = ["XS", "S", "M", "L", "XL", "XX", "3X", "4X", "5X"];
export { saveSuggestion, loadSuggestions, renderTable, sizes };
