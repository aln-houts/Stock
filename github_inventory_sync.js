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

  const branch = "main";  // Set the branch to 'main' (or adjust if different)

  try {
  const url = `https://api.github.com/repos/aln-houts/Stock/contents/data/inventory.json`;
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `token ${window.githubToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Sync inventory data: ${new Date().toISOString()}`,
        content: btoa(unescape(encodeURIComponent(JSON.stringify(inventoryData)))),  // Ensure proper encoding
        branch: branch  // Ensure the branch is defined
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
  // Validate GitHub token
  if (!window.githubToken) {
    updateStatus("Unlock with PIN first.", "danger");
    return;
  }

  // Basic validation for repository details
  if (!window.owner || !window.repo || !window.path) {
    updateStatus("Missing repository details.", "danger");
    return;
  }

  updateStatus("Saving…", "info");

  try {
    // Helper function to safely parse localStorage data
    function parseLocalStorage(key) {
      try {
        return JSON.parse(localStorage.getItem(key)) || {};
      } catch (e) {
        console.error(`Error parsing localStorage key "${key}":`, e);
        return {};
      }
    }

    // Prepare inventory data
    const inventoryData = {
      tees: parseLocalStorage("teesInventory"),
      tanks: parseLocalStorage("tanksInventory"),
      hoodies: parseLocalStorage("hoodiesInventory"),
      hats: parseLocalStorage("hatsInventory"),
      bags: parseLocalStorage("bagsInventory"),
      printtees: parseLocalStorage("printteesInventory"),
      transfers: parseLocalStorage("transfersInventory"),
    };

    // Ensure the branch is dynamically configurable
    const branch = window.defaultBranch || "main";

    // GitHub API URL
    const url = `https://api.github.com/repos/${window.owner}/${window.repo}/contents/${window.path}`;

    // Construct request payload
    const payload = {
      message: `Save inventory data: ${new Date().toISOString()}`,
      content: btoa(JSON.stringify(inventoryData)), // Safe encoding
      branch: branch,
    };

    // Make the API request
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `token ${window.githubToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Handle the response
    if (res.ok) {
      updateStatus("Inventory saved to GitHub!", "success");
    } else if (res.status === 403 && res.headers.get("X-RateLimit-Remaining") === "0") {
      updateStatus("Rate limit exceeded. Please wait and try again.", "danger");
    } else {
      const err = await res.json();
      console.error("GitHub API Error:", err);
      updateStatus(`GitHub error: ${err.message || "Unknown error"}`, "danger");
    }
  } catch (e) {
    updateStatus("Save failed.", "danger");
    console.error("Unexpected error:", e);
  }
});
