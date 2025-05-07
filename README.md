# Stock Inventory App

This is a lightweight inventory management web app for tracking various garment types (e.g., tees, tanks, hoodies). It supports adding, viewing, and deleting stock items by style, color, size, and quantity. Each item type is managed independently using modular HTML/JS.

## Features

- Add new inventory items by style, color, and size
- Real-time inventory table display
- Per-item-type storage (e.g., teesInventory, tanksInventory, etc.)
- Auto-suggest inputs for previously used styles and colors
- Size-aware and non-size-aware category support
- Local storage persistence (no backend required)
- Modular script structure for maintainability
- PWA support (manifest + service worker)

## Getting Started

1. Clone or download this repo:
   ```bash
   git clone https://github.com/aln-houts/Stock.git
   ```

2. Open index.html in a browser:

Use a query string like ?type=tees, ?type=tanks, or ?type=hoodies to load a category:
file:///path/to/index.html?type=tees

3. Add items using the form:

Enter style, color, select size (if applicable), and quantity.

Items will appear in the inventory table below.

## Structure
Stock/
│
├── index.html              # Main page with form and inventory table
├── setupItems.js           # Category-aware inventory form and display logic
├── inventory.js            # Handles rendering inventory and localStorage updates
├── overview.html/js        # Overview display of total stock
├── item.html               # Shared page for category-based inventory
├── menu.html/head.html     # Modular HTML includes
├── styles.css              # Custom styling (uses Bootstrap base)
├── manifest.json, sw.js    # Progressive Web App support
└── data/                   # Future use or static content

## Deployment

This app is static and can be hosted on GitHub Pages:

1. Push to a public GitHub repo
2. Enable GitHub Pages under repo settings (source: / (root))
