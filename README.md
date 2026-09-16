# QuantPath practice site

The site is a Vinext application deployed to OpenAI Sites. Problem content lives in `content/` and the accountless AI tutor is implemented by `app/api/tutor/route.ts` plus `components/tutor-chat.tsx`.

## AI tutor configuration

The tutor is disabled safely when `OPENAI_API_KEY` is absent. Add these as server runtime environment variables in the hosting provider; never put the API key in browser code or a `NEXT_PUBLIC_` variable.

- `OPENAI_API_KEY`: required project-scoped OpenAI API key
- `TUTOR_ENABLED`: optional kill switch; set to `false` to stop model calls
- `TUTOR_RATE_LIMIT_SALT`: optional random secret for hashing IP addresses used by the best-effort server limiter

The tutor uses `gpt-5.6-luna`, streams text from the Responses API, does not request response storage, and sends only the selected problem, its verified answer, and the six most recent chat messages.

Current caps:

- 500 characters per question
- 6 prior messages sent to the model, each capped at 600 characters
- 8 user questions per problem conversation in the browser
- 10 successful tutor questions per browser per day
- 10 requests per anonymous browser ID and 30 requests per hashed IP per day on the server
- 320 maximum output tokens and a prompt instruction to stay under 180 words
- no model tools, web search, file access, or user accounts

The server limiter is intentionally best-effort because Worker memory is not durable across instances. The browser cap improves ordinary usage, while the OpenAI project hard spend limit is the actual billing backstop. Before public launch, configure a project hard limit of $5/month and a lower spend alert, then replace or supplement the in-memory limiter with durable Cloudflare storage if traffic grows.

Run locally with:

```bash
npm run dev
```

Build with:

```bash
npm run build
```
