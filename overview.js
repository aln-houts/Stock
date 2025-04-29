// Load inventory.json when app starts (no auth needed)
async function loadInventory() {
  try {
    const url = `https://raw.githubusercontent.com/aln-houts/Stock/main/data/inventory.json`; // Public raw URL
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('Failed to load inventory');
    }
    const data = await res.json();
    localStorage.setItem('inventory', JSON.stringify(data)); // Save to localStorage if you want
    console.log('Inventory loaded:', data);
    // You can now call your function to display items, e.g.:
    displayInventory(data); 
  } catch (error) {
    console.error('Error loading inventory:', error);
  }
}

// Immediately load the inventory
loadInventory();

function overviewApp() {
  return {
    token:        '',
    pin:          '',
    unlockPin:    '',
    unlocked:     false,
    status:       '',
    statusClass:  '',

    init() {
      // read saved credentials (if any) on load
      this.token = '';
      this.pin   = '';
      this.unlocked = !!localStorage.getItem('ghToken');
      if (this.unlocked) {
        this.status = 'Token already unlocked';
        this.statusClass = 'text-success';
      }
    },

    saveToken() {
      if (this.token && this.pin.length === 4) {
        localStorage.setItem('ghToken', this.token);
        localStorage.setItem('ghPin', this.pin);
        this.token = '';
        this.pin   = '';
        this.status = 'Token & PIN saved';
        this.statusClass = 'text-success';
      } else {
        this.status = 'Enter token & 4-digit PIN';
        this.statusClass = 'text-danger';
      }
    },

    unlockToken() {
      const storedPin = localStorage.getItem('ghPin');
      if (this.unlockPin === storedPin && localStorage.getItem('ghToken')) {
        this.unlocked = true;
        this.status   = 'Unlocked! You can now Save';
        this.statusClass = 'text-success';
      } else {
        this.status = 'Wrong PIN or no token set';
        this.statusClass = 'text-danger';
      }
    },

    resetToken() {
      localStorage.removeItem('ghToken');
      localStorage.removeItem('ghPin');
      this.unlocked = false;
      this.status   = 'Credentials cleared';
      this.statusClass = 'text-warning';
    },

    async syncAll() {
      this.status = 'Syncing…';
      this.statusClass = 'text-info';
      const categories = ["tees","tanks","hoodies","hats","bags","printtees","transfers"];
      for (const cat of categories) {
        try {
          // your existing Firebase code, e.g.:
          await loadCategory(cat);
        } catch(e) {
          console.error(e);
        }
      }
      this.status = 'Sync complete';
      this.statusClass = 'text-success';
    },

    async saveAll() {
      if (!this.unlocked) {
        this.status = 'Unlock first';
        this.statusClass = 'text-danger';
        return;
      }
      this.status = 'Saving…';
      this.statusClass = 'text-info';
      try {
        // your existing GitHub save code (use localStorage.getItem('inventory'))
        await saveToGitHub();
        this.status = 'Saved to GitHub!';
        this.statusClass = 'text-success';
      } catch(err) {
        console.error(err);
        this.status = 'Save failed';
        this.statusClass = 'text-danger';
      }
    }
  }
}

// You can still import or declare your
// loadCategory() and saveToGitHub() functions
// here or in another shared.js file.
    
