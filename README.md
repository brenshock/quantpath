# QuantPath

QuantPath is a free, technique-first practice site for quantitative interviews. It pairs a structured curriculum with mixed interview-style problems, progressive hints, verified solutions, and an optional problem-aware AI tutor.

**Live site:** [quantpath.brenshock.chatgpt.site](https://quantpath.brenshock.chatgpt.site)

## What it includes

- 76 human-reviewed problems across 12 categories
- Guided learning tracks with three introductory problems per category
- Mixed practice with search, difficulty, category, and employer-theme filters
- Progressive hints and fully worked, verified solutions
- Original variants inspired by common quantitative-interview themes
- An account-free AI tutor grounded in the current problem and verified solution
- Privacy and terms pages with no advertising or third-party analytics

Employer tags describe practice themes associated with public official material or candidate reports. They do not claim that the displayed wording was used by, endorsed by, or authenticated by an employer.

## Curriculum

The current categories are counting, conditional probability, expected value, linearity, symmetry, recursion, random walks, statistics, logic, games, estimation, and markets.

Problem data lives in [`content/problems`](content/problems). Each JSON record contains the prompt, difficulty, categories, hints, solution, key insight, common mistakes, source notes, verification information, and review status. The schema is defined in [`content/problem.schema.json`](content/problem.schema.json).

## AI tutor

The tutor uses OpenAI's Responses API with `gpt-5.6-luna`. The server supplies the selected problem and verified solution as context. It is instructed to teach without revealing the final answer unless the user explicitly requests it.

The tutor has no web access or external tools. It uses short conversations, bounded inputs and outputs, browser and server request limits, and a server-side API key. The rest of the site works without configuring AI.

## Technology

- React 19 and TypeScript
- Vinext and Tailwind CSS
- Cloudflare Workers-compatible server routes
- OpenAI Responses API
- OpenAI Sites hosting

## Local development

Requires Node.js 22.13 or newer and npm.

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

To enable the tutor locally, copy the environment template and add a project-scoped API key:

```bash
cp .env.example .env.local
```

```env
OPENAI_API_KEY=your_project_key
TUTOR_ENABLED=true
TUTOR_RATE_LIMIT_SALT=a_random_secret
```

Never commit `.env.local` or expose the API key through a `NEXT_PUBLIC_` variable.

## Validation

```bash
npx tsc --noEmit
npm run build
```

## Contributing

Bug reports, solution corrections, new problem suggestions, and focused improvements are welcome through [GitHub Issues](https://github.com/brenshock/quantpath/issues/new/choose). Please use the matching issue template and include the problem ID when reporting content.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the contribution guidelines.

## License

QuantPath is released under the [MIT License](LICENSE).
