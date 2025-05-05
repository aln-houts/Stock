function setupSave() {
  console.log("setupSave.js loaded");

  const form = document.getElementById("saveForm");
  const statusEl = document.getElementById("saveStatus");

  if (!form || !statusEl) {
    console.warn("Save form or status element missing.");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusEl.textContent = "Saving...";

    const pin = document.getElementById("setupPIN").value.trim();

    // Try to load credentials
    const saved = localStorage.getItem("githubCreds");
    if (!saved) {
      statusEl.textContent = "No credentials found. Set them up first.";
      return;
    }

    let githubToken, githubUser, repoName;
    try {
      const creds = JSON.parse(atob(saved));
      if (creds.pin !== pin) {
        statusEl.textContent = "Incorrect PIN.";
        return;
      }

      githubToken = creds.token;
      githubUser = creds.user;
      repoName = creds.repo;
    } catch (err) {
      statusEl.textContent = "Corrupt credentials.";
      return;
    }

    // Build combined inventory
    const inventoryKeys = Object.keys(localStorage).filter(k => k.endsWith("Inventory"));
    const combined = {};
    inventoryKeys.forEach(k => {
      combined[k] = JSON.parse(localStorage.getItem(k));
    });

    const content = btoa(JSON.stringify(combined, null, 2));

    try {
      const res = await fetch(`https://api.github.com/repos/${githubUser}/${repoName}/contents/data/inventory.json`, {
        method: "PUT",
        headers: {
          Authorization: `token ${githubToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: "Update inventory.json",
          content: content,
          sha: "" // If you want overwrite protection, you can fetch SHA later
        })
      });

      if (!res.ok) throw new Error("GitHub save failed.");
      statusEl.textContent = "Inventory saved to GitHub!";
    } catch (err) {
      console.error(err);
      statusEl.textContent = "Error saving to GitHub.";
    }
  });

  // If no saved credentials, show credential setup UI
  const credsSection = document.getElementById("setup-credentials");
  if (!localStorage.getItem("githubCreds") && credsSection) {
    credsSection.style.display = "block";

    document.getElementById("saveCredsBtn").addEventListener("click", () => {
      const token = document.getElementById("githubToken").value.trim();
      const user = document.getElementById("githubUser").value.trim();
      const repo = document.getElementById("repoName").value.trim();
      const pin = document.getElementById("setupPIN").value.trim();

      if (!token || !user || !repo || !pin) {
        alert("Fill out all fields to save credentials.");
        return;
      }

      const data = { token, user, repo, pin };
      localStorage.setItem("githubCreds", btoa(JSON.stringify(data)));
      alert("Credentials saved. You can now just use your PIN to save.");
      credsSection.style.display = "none";
    });
  }
}
