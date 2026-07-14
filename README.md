# Green Basket POS

Green Basket POS is a beginner-friendly offline point-of-sale desktop
application for grocery shops. It is built with Electron, HTML, CSS, and plain
JavaScript so new contributors can understand the codebase without learning a
large framework first.

This project is designed for two groups:

- Small shop owners who need a simple offline POS system
- Beginner developers who want real open-source contribution experience

## What the App Can Do

- Run fully offline on a desktop computer
- Manage products, categories, prices, stock, and product images
- Search products by name, category, item ID, or barcode
- Add products to a checkout cart
- Handle discounts, payment type, cash received, and change
- Hold and restore carts
- Complete sales and automatically reduce stock
- Print and reprint receipts
- View reports for sales, payment totals, and top products
- Backup and restore shop data
- Build installable desktop apps for macOS, Windows, and Linux

## Screens and Pages

- Sale: checkout cart, product search, category filters, held carts
- Inventory: product editor, product image upload, stock adjustment
- Reports: sales summary, payment breakdown, top products, sales history
- Settings: shop profile, backup, restore, reset demo data

## Tech Stack

- Electron for the desktop application shell
- HTML for structure
- CSS for layout and styling
- JavaScript for application logic
- JSON file storage for offline data
- electron-builder for packaging installers

## Requirements

- Node.js 22.12.0 or newer. The included `.nvmrc` pins Node.js 22.22.3.
- npm 10 or newer
- Git

If you use `nvm`, run:

```bash
nvm use
```

## Quick Start

```bash
git clone <your-repo-url>
cd pos-electron-os
nvm use
npm ci
npm start
```

Use `npm ci` instead of `npm install` when you want a reproducible setup from
`package-lock.json`.

## Useful Commands

```bash
npm start
```

Runs the app in development mode.

```bash
npm run check
```

Checks JavaScript files for syntax errors.

```bash
npm run verify
```

Runs syntax checks and dependency audit.

```bash
npm run pack
```

Creates an unpacked desktop app in `release/`.

```bash
npm run dist
```

Creates installer files for the current operating system.

## Project Structure

```text
.
├── build/                  App icons used by installer builds
├── docs/                   Beginner-friendly project documentation
├── .github/                GitHub issue, pull request, and CI templates
├── src/
│   ├── main.js             Electron main process, IPC, data persistence
│   ├── preload.js          Safe bridge between Electron and the UI
│   └── renderer/
│       ├── index.html      App screens and UI structure
│       ├── renderer.js     POS UI logic and state rendering
│       └── styles.css      Layout, responsive design, visual styling
├── package.json            Scripts, metadata, and packaging config
├── package-lock.json       Reproducible dependency lockfile
├── CONTRIBUTING.md         How to contribute
├── CODE_OF_CONDUCT.md      Community rules
├── SECURITY.md             Security reporting policy
└── RELEASE.md              Build and release guide
```

## Beginner Contribution Ideas

Good first contributions do not need to be huge. Useful beginner-friendly work
can include:

- Improve documentation or fix spelling
- Add screenshots to the README
- Improve empty states or button labels
- Add more demo products
- Improve receipt layout
- Add more report filters
- Improve keyboard shortcuts
- Fix responsive layout issues on smaller screens
- Add tests for small utility functions when test tooling is added

Look for issues labeled `good first issue`, `documentation`, or `help wanted`.

## How to Contribute

Please read [CONTRIBUTING.md](CONTRIBUTING.md). It explains how to fork the
project, create a branch, make a change, run checks, and open a pull request.

If this is your first open-source contribution, you are welcome here. Ask
questions, share screenshots, and make small pull requests. Small improvements
are still real contributions.

## Documentation

- [Development Guide](docs/DEVELOPMENT.md)
- [Your First Contribution](docs/FIRST_CONTRIBUTION.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Release Guide](RELEASE.md)
- [Roadmap](ROADMAP.md)
- [Changelog](CHANGELOG.md)

## Data Storage

The app stores runtime data in Electron's `userData` folder on the user's
computer. Product images are copied into the same app data area. This means the
app can be rebuilt or updated without overwriting shop sales data.

Use the built-in Backup and Restore buttons to move data between computers.

## Reuse for Another Shop

- App name, app ID, and installer settings: `package.json`
- App icon assets: `build/`
- Default shop details and seed products: `src/main.js`
- Interface layout and styling: `src/renderer/styles.css`
- Screen behavior and POS logic: `src/renderer/renderer.js`

## License

This project is licensed under the MIT License. You can use, copy, modify, and
redistribute it. See [LICENSE](LICENSE).
