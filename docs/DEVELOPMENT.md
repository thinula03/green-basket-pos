# Development Guide

This guide explains how to work on Green Basket POS locally.

## 1. Install Tools

Install:

- Git
- Node.js 22.12.0 or newer
- npm 10 or newer
- A code editor such as VS Code

If you use `nvm`, run this inside the project:

```bash
nvm use
```

## 2. Install Dependencies

```bash
npm ci
```

`npm ci` installs the exact versions from `package-lock.json`. This helps all
contributors work with the same dependency versions.

## 3. Run the App

```bash
npm start
```

Electron will open the desktop app.

## 4. Make Changes

Common files:

- `src/renderer/index.html` for page structure
- `src/renderer/styles.css` for UI design and responsive layout
- `src/renderer/renderer.js` for frontend behavior
- `src/main.js` for Electron, data storage, and app-level actions
- `src/preload.js` for the safe API exposed to the frontend

## 5. Check Your Work

Run:

```bash
npm run verify
```

This catches syntax errors and checks dependencies for known vulnerabilities.

## 6. Test Manually

Before opening a pull request, try these flows:

- Open the Sale page
- Add products to cart
- Change quantity
- Apply discount
- Complete a sale
- Open Inventory
- Edit a product
- Upload a product image
- Adjust stock
- Open Reports
- Open Settings
- Backup data

For UI changes, test at smaller window sizes too.

## 7. Build the App

For an unpacked build:

```bash
npm run pack
```

For installer output:

```bash
npm run dist
```

Build files are written to `release/`.

## Tips for Beginners

- Make one small change at a time.
- Run the app often while editing.
- Use screenshots when asking for UI feedback.
- Read existing code before adding new patterns.
- Ask questions if a file is confusing.
