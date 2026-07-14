# Architecture Overview

Green Basket POS is a small Electron app. It does not use React, Vue, Angular,
or a backend server. This keeps the project easier for beginners to understand.

## Main Parts

```text
Electron main process
        |
        | exposes safe APIs through preload
        v
Preload script
        |
        | window.pos.*
        v
Renderer UI
        |
        | user actions
        v
Local JSON data file
```

## `src/main.js`

This file runs in Electron's main process.

It handles:

- Creating the desktop window
- Loading the app HTML
- Reading and writing local data
- Creating backups
- Restoring backups
- Copying uploaded product images
- Completing sales
- Updating stock
- Electron IPC handlers

The app stores data in Electron's `userData` folder as `pos-data.json`.

## `src/preload.js`

This file safely exposes selected main-process features to the frontend.

The renderer does not directly access Node.js APIs. Instead, it calls methods
from `window.pos`.

This is safer than enabling full Node.js access in the browser window.

## `src/renderer/index.html`

This file contains the app layout:

- Sidebar navigation
- Sale page
- Inventory page
- Reports page
- Settings page
- Product modal
- Receipt modal

## `src/renderer/styles.css`

This file controls the visual design:

- Page layout
- Product cards
- Cart panel
- Inventory table
- Reports page
- Settings page
- Responsive behavior for smaller screens

## `src/renderer/renderer.js`

This file controls frontend behavior:

- Loading app state
- Rendering product lists
- Updating cart totals
- Handling checkout
- Filtering products
- Managing inventory forms
- Rendering reports
- Handling settings

## Data Flow Example: Completing a Sale

1. User adds products to the cart.
2. Renderer calculates subtotal, discount, total, and change.
3. User clicks Complete Sale.
4. Renderer sends sale data through `window.pos.completeSale`.
5. Preload passes the request to the main process.
6. Main process saves the sale and reduces stock.
7. Updated state returns to the renderer.
8. UI refreshes and shows the receipt.

## Why This Architecture Is Good for Beginners

- No server setup is required.
- No database setup is required.
- Most app logic is in a few readable files.
- The UI uses normal HTML, CSS, and JavaScript.
- Contributors can make useful changes without learning a large framework.
