
document.getElementById("syncBtn").addEventListener("click", async () => {
  updateStatus("Syncing…", "info");

  // Sync all items from localStorage
  const inventoryData = {
    tees: JSON.parse(localStorage.getItem("teesInventory")) || {},
    tanks: JSON.parse(localStorage.getItem("tanksInventory")) || {},
    hoodies: JSON.parse(localStorage.getItem("hoodiesInventory")) || {},
    hats: JSON.parse(localStorage.getItem("hatsInventory")) || {},
    bags: JSON.parse(localStorage.getItem("bagsInventory")) || {},
    printtees: JSON.parse(localStorage.getItem("printteesInventory")) || {},
    transfers: JSON.parse(localStorage.getItem("transfersInventory")) || {}
  };

  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `token ${window.githubToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Sync inventory data: ${new Date().toISOString()}`,
        content: btoa(unescape(encodeURIComponent(JSON.stringify(inventoryData)))),
        branch
      })
    });

    if (res.ok) {
      updateStatus("Inventory synced to GitHub!", "success");
    } else {
      const err = await res.json();
      updateStatus(`GitHub error: ${err.message}`, "danger");
    }
  } catch (e) {
    updateStatus("Sync failed.", "danger");
    console.error(e);
  }
});

document.getElementById("saveBtn").addEventListener("click", async () => {
  if (!window.githubToken) {
    updateStatus("Unlock with PIN first.", "danger");
    return;
  }
  updateStatus("Saving…", "info");

  try {
    const inventoryData = {
      tees: JSON.parse(localStorage.getItem("teesInventory")) || {},
      tanks: JSON.parse(localStorage.getItem("tanksInventory")) || {},
      hoodies: JSON.parse(localStorage.getItem("hoodiesInventory")) || {},
      hats: JSON.parse(localStorage.getItem("hatsInventory")) || {},
      bags: JSON.parse(localStorage.getItem("bagsInventory")) || {},
      printtees: JSON.parse(localStorage.getItem("printteesInventory")) || {},
      transfers: JSON.parse(localStorage.getItem("transfersInventory")) || {}
    };

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `token ${window.githubToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Update inventory: ${new Date().toISOString()}`,
        content: btoa(unescape(encodeURIComponent(JSON.stringify(inventoryData)))),
        branch
      })
    });

    if (res.ok) {
      updateStatus("Inventory saved to GitHub!", "success");
    } else {
      const err = await res.json();
      updateStatus(`GitHub error: ${err.message}`, "danger");
    }
  } catch (e) {
    updateStatus("Save failed.", "danger");
    console.error(e);
  }
});
