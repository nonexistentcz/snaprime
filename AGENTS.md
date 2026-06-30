# AGENTS.md

Guidance for AI coding agents working in this repository.

## Stack

- **Framework**: TanStack Start (full-stack React meta-framework, SSR) on React 19
- **Routing**: TanStack Router, file-based, with codegen (`src/routeTree.gen.ts` — do not hand-edit)
- **Data layer**: Drizzle ORM (PostgreSQL, `postgres.js` driver) → TanStack Start server functions → TanStack Query → TanStack DB collections (live queries / optimistic mutations)
- **Forms**: TanStack Form
- **UI**: MUI (`@mui/material`, `@emotion`) + Tailwind CSS v4 (via `@tailwindcss/vite`, no `tailwind.config`)
- **Validation**: Zod v4, used both for server function input validation and shared form schemas
- **AI**: `@tanstack/ai` + `@tanstack/ai-openai` for brand extraction and ad generation
- **Scraping**: `@cloudflare/puppeteer` against Cloudflare Browser Rendering
- **Deployment**: Cloudflare Workers, via `@cloudflare/vite-plugin` + Wrangler
- **Package manager**: pnpm (`pnpm-lock.yaml` is canonical; a stray `package-lock.json` exists but is gitignored — don't trust it)
- **Build/type-check**: `vite build && tsc --noEmit` (no eslint/prettier configured)
- **Testing**: none configured currently. `tsc --noEmit` is the only automated correctness gate.

## Directory structure

```
src/
  components/    # shared UI components
  db/            # Drizzle client + schema (src/db/schema/*.ts)
  hooks/
  lib/
    ai/              # brand extraction, ad generation, cost/latency caps
    cloudflare/      # Puppeteer scraping via Browser Rendering
    collections/     # TanStack DB collections wrapping server functions
  routes/            # TanStack Router file-based routes
  server/functions/  # createServerFn API boundary (see pattern below)
  routeTree.gen.ts   # auto-generated, do not edit
drizzle/             # generated SQL migrations
```

Path alias: `@/*` → `src/*` (used consistently; configured in both `tsconfig.json` and `vite.config.ts`).

## Server function pattern

No REST/tRPC API layer — use `createServerFn` from `@tanstack/react-start`:

```ts
export const getBrand = createServerFn({ method: "GET" })
  .validator(z.number())
  .handler(async ({ data: brandId }) => {
    const [brand] = await db
      .select()
      .from(brands)
      .where(eq(brands.id, brandId));
    return brand ?? null;
  });
```

- `.validator(zodSchema)` for input validation; shared Zod object schemas (e.g. `brandInput`, `advertInput`) are exported alongside and reused for form typing too.
- Keep business logic (scraping, AI calls) in `src/lib/*` and import it into the handler rather than inlining it.
- On the client, call server functions via the `useServerFn()` hook, or wrap them in a TanStack DB collection (`src/lib/collections/`) for optimistic/live-query semantics.

## Database

- Schema lives in `src/db/schema/*.ts`; add new tables there, then `pnpm db:generate` to emit a migration into `drizzle/`.
- Runtime connection goes through the Cloudflare **Hyperdrive** binding when available (`env.HYPERDRIVE.connectionString`), falling back to `DB_*` env vars otherwise — see `src/db/index.ts`.
- Migrations run against port 5432 (session mode); the app's runtime pooler uses port 6543 — these are intentionally different (see `.env.example` / `drizzle.config.ts`).

## Deployment

- Single Cloudflare Worker named `snaprime`; entrypoint is TanStack Start's own (`@tanstack/react-start/server-entry`) — there is no custom `src/worker.ts`.
- Bindings: `MYBROWSER` (Browser Rendering), `HYPERDRIVE` (Postgres pooling). `nodejs_compat` flag is required for the `postgres` driver.
- After changing `wrangler.jsonc` bindings, run `pnpm cf-typegen` to refresh `worker-configuration.d.ts` (gitignored, regenerate locally rather than editing).

## Notes for agents

- Not a monorepo — single `package.json`, no workspaces.
- No linter is configured; rely on `tsc --noEmit` and existing code style for consistency.
- `README.md` is partly stale (mentions `lib/playwright/scrape.ts` and tRPC, both since replaced — see commit `cc8cdbb`). Trust the code/this file over the README for architecture.
- AI calls are wrapped with latency caps (`src/lib/ai/with-timeout.ts`: 30s text / 60s images) and pre-call cost caps (`src/lib/ai/cost-cap.ts`) — preserve these wrappers when touching AI call sites.
- IDs are sequential integers (serial), not UUIDs — a known/accepted limitation, not a bug to silently fix.
