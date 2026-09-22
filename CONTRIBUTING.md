# Contributing to QuantPath

Thanks for helping improve QuantPath. The most useful contributions are clear corrections, reproducible website bugs, and well-scoped interview-practice problems.

## Before contributing

- Search existing issues before opening a new one.
- Use the problem ID when discussing an existing problem.
- Do not submit confidential interview material, personal information, API keys, or other secrets.
- Employer-tagged submissions must be rewritten as original practice variants and should not claim verified employer wording.

## Content changes

Problem records live in `content/problems` and must conform to `content/problem.schema.json`. A proposed problem should include progressive hints, a complete solution, a sanity check, common mistakes, and verification notes.

Content corrections should explain the mathematical issue and, when practical, provide an independent calculation or reference.

## Code changes

Keep changes focused. Before opening a pull request, run:

```bash
npx tsc --noEmit
npm run build
```

Do not commit `.env.local`, API keys, generated credentials, or unrelated formatting changes.

## Reporting security concerns

Do not post API keys, private data, or detailed exploit instructions in a public issue. Use a minimal description and ask the repository owner for a private reporting channel.
