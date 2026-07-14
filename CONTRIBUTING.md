# Contributing to Green Basket POS

Thank you for wanting to contribute. This project is intentionally beginner
friendly, so you do not need previous open-source experience to help.

## Before You Start

You only need basic knowledge of:

- HTML
- CSS
- JavaScript
- Git and GitHub basics

If you are new to GitHub, start with a small documentation change or a small UI
fix. That is a perfectly valid contribution.

## Setup

1. Fork the repository on GitHub.
2. Clone your fork:

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd pos-electron-os
```

3. Use the correct Node.js version:

```bash
nvm use
```

4. Install dependencies:

```bash
npm ci
```

5. Start the app:

```bash
npm start
```

## Make a Change

Create a new branch before editing:

```bash
git checkout -b fix/product-card-spacing
```

Use a short branch name that describes your change. Examples:

- `docs/update-readme`
- `fix/cart-total`
- `feature/export-products`
- `ui/inventory-empty-state`

## Run Checks

Before opening a pull request, run:

```bash
npm run verify
```

This checks JavaScript syntax and runs a dependency audit.

If you changed packaging files, also run:

```bash
npm run pack
```

## Commit Your Work

Use clear commit messages:

```bash
git add .
git commit -m "Improve inventory empty state"
```

Good commit messages:

- `Fix cart item quantity controls`
- `Add troubleshooting guide`
- `Improve small screen layout`

Avoid unclear messages:

- `changes`
- `fix`
- `update stuff`

## Open a Pull Request

Push your branch:

```bash
git push origin fix/product-card-spacing
```

Then open a pull request on GitHub.

In your pull request, explain:

- What you changed
- Why you changed it
- How you tested it
- Any screenshots for UI changes

## Good First Contributions

These are great places to start:

- Fix typos in documentation
- Add screenshots to docs
- Improve responsive UI spacing
- Improve button labels
- Improve empty states
- Add more demo products
- Add comments to confusing code
- Improve error messages
- Write beginner-friendly explanations in `docs/`

## Code Style

- Keep JavaScript readable and simple.
- Prefer small changes over large rewrites.
- Use existing naming and layout patterns.
- Avoid adding a new library unless it clearly solves a real problem.
- Keep UI responsive on smaller screens.
- Do not commit `node_modules/` or `release/`.

## UI Contribution Guidelines

For UI changes:

- Test on a normal laptop width and a smaller POS-monitor width.
- Make sure text does not overlap.
- Make sure scroll areas still work.
- Include screenshots in your pull request.
- Keep buttons, cards, inputs, and spacing consistent with the current design.

## Reporting Bugs

When opening a bug report, include:

- What you expected to happen
- What actually happened
- Steps to reproduce the problem
- Your operating system
- Screenshots or screen recordings if helpful

## Asking Questions

It is okay to ask beginner questions. If something is confusing, open a
discussion or issue and explain what you tried. Clear questions help improve the
project for the next beginner too.
