# Your First Contribution

This guide is for people who have never contributed to open source before.

## What Is a Contribution?

A contribution can be:

- Fixing a typo
- Improving a sentence in the docs
- Reporting a bug clearly
- Adding a screenshot
- Fixing a small UI issue
- Improving code readability

You do not need to build a big feature for your first contribution.

## Step 1: Choose a Small Issue

Look for labels like:

- `good first issue`
- `documentation`
- `help wanted`

If you are unsure, comment on the issue and ask:

```text
Hi, I am new to open source. Can I try working on this?
```

## Step 2: Fork the Repository

Click Fork on GitHub. This creates your own copy of the project.

## Step 3: Clone Your Fork

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd pos-electron-os
```

## Step 4: Create a Branch

```bash
git checkout -b docs/fix-typo
```

## Step 5: Make the Change

Open the project in your editor and edit the file.

For your first pull request, changing one small thing is enough.

## Step 6: Test

For documentation-only changes, read the changed file and make sure it looks
right.

For code changes, run:

```bash
npm run verify
```

## Step 7: Commit

```bash
git add .
git commit -m "Fix typo in README"
```

## Step 8: Push

```bash
git push origin docs/fix-typo
```

## Step 9: Open a Pull Request

GitHub will show a button to open a pull request. Click it and fill in the pull
request template.

## What Happens Next?

A maintainer may:

- Approve your pull request
- Ask for a small change
- Ask a question
- Suggest another approach

This is normal. Pull request feedback is part of open source, not a failure.

## Beginner Tips

- Keep your first pull request small.
- Ask questions early.
- Do not worry if you make a mistake.
- Read feedback calmly.
- Thank reviewers for their time.
