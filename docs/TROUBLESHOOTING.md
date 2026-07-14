# Troubleshooting

This guide lists common problems and fixes.

## `npm start` Fails with Electron Install Errors

Use the Node.js version from `.nvmrc`:

```bash
nvm use
rm -rf node_modules
npm ci
npm start
```

## `npm run pack` Fails on Node 20

The packaging toolchain requires a newer Node.js version.

Run:

```bash
nvm use
npm ci
npm run pack
```

The included `.nvmrc` pins Node.js 22.22.3.

## The App Opens with Demo Data Again

The app creates demo data the first time it runs. Runtime data is stored in
Electron's `userData` folder, not inside the project folder.

If you click Reset Demo, sales and edited products are reset to the demo state.

## Product Images Do Not Appear

Try these checks:

- Make sure the image file still exists when uploading.
- Use common image formats such as PNG, JPG, JPEG, or WebP.
- Upload the image again from the Inventory page.
- Restart the app after restoring a backup.

## Layout Looks Broken on a Small Screen

Try resizing the Electron window wider first. If the problem is still visible,
open an issue and include:

- Screenshot
- Screen resolution
- Operating system
- The page where it happened

## `npm audit` Reports Vulnerabilities

First run:

```bash
npm ci
npm audit
```

If the issue remains, open a GitHub issue with the audit output. Do not upgrade
major dependencies without testing the app and packaging flow.

## Build Output Is Missing

Build output is created in:

```text
release/
```

If the folder does not exist, run:

```bash
npm run pack
```

## Git Says `node_modules` Has Many Files

Do not commit `node_modules/`. It is ignored by `.gitignore`.

If files are already staged accidentally, unstage them:

```bash
git reset node_modules
```
