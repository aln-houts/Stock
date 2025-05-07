// scripts/setupSave.js

function setupSave() {
  const form = document.getElementById('save-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Grab the PIN
    const pin = form.pin.value.trim();           // uses name="pin"
    // OR: const pin = document.getElementById('pin').value.trim();

    // (If you ever need the credentials‐setup PIN:)
    const setupPin = document.getElementById('setup-pin')?.value.trim();

    // …rest of your GitHub‐save logic…
  });
}
