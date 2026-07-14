# Reproducible Release Guide

This project is packaged with pinned Electron and electron-builder versions. Use
`npm ci` instead of `npm install` for repeatable installs from `package-lock.json`.

## Build Environment

- Node.js 22.12.0 or newer. The included `.nvmrc` pins Node.js 22.22.3.
- npm 10 or newer
- macOS for macOS installers
- Windows for Windows installers
- Linux for Linux installers

Cross-platform builds can work in some cases, but native builds on each target
OS are the most reliable way to reproduce installer output.

## Fresh Clone

```bash
git clone <your-repo-url>
cd pos-electron-os
nvm use
npm ci
npm run verify
```

## Development

```bash
npm start
```

## Local Package Smoke Test

```bash
npm run pack
```

The unpacked application is written to `release/`.

## Installer Builds

```bash
npm run dist:mac
npm run dist:win
npm run dist:linux
```

Use the command that matches the operating system you are building on. Generated
installers are written to `release/`.

## Customizing for Another Shop

- Change app name, app ID, and output settings in `package.json`.
- Replace app icon assets in `build/`.
- Change default shop details and seed products in `src/main.js`.
- Change colors, spacing, and layouts in `src/renderer/styles.css`.
- The runtime data is stored outside the app bundle in Electron's `userData`
  folder, so rebuilding the app does not overwrite a shop's sales data.

## Data Portability

Use the built-in Backup and Restore actions from the app to move a shop's data
between computers. Product images are copied into the app data folder and are
included in normal runtime use.
