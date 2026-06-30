# snaprime dev. task

## How I used the AI agent (Claude)

- I tend to run multiple agents in parallel with smaller, more specific tasks, which I know won't intervene with each other, if you imagine domain driven design, when bootstrapping new project it's good to keep track of which tasks would belong into different bounded context so they don't interrupt each other and can be developed at the same time
- I tend to spend a bunch of time trying to steer the AI in plan mode rather than checking each individual update (unless the plan is bigger)

## Known limitations

- Brands and adverts use sequential integer IDs, which leak information (e.g. record counts) and
  make resources guessable. These should be UUIDs instead.
- There's missing SSRF
- DB accessing is a mess with some clear, ugly antipatterns, most likely caused by the initial setup, for some reasons it has to be lazy evaluated, decided to let it go because of time constraints

## Reflections

Personally I have little experience with Tanstack Start and I think if I knew it better, I would have used different tools. This project started off with the [tRPC template](https://github.com/tanstack/router/tree/main/examples/react/with-trpc), which requires a running server, making cloudflare pages/workers impossible without a refactor/starting over. I also decided to go with DrizzleORM which has also proven to be difficult [compared to anything listed here](https://tanstack.com/start/v0/docs/framework/react/guide/databases#what-is-prisma-postgres).

## Tech stack

- [TanStack Router](https://tanstack.com/router) + React for the frontend
- [tRPC](https://trpc.io) for type-safe client/server APIs
- [Drizzle ORM](https://orm.drizzle.team) with PostgreSQL for persistence
- [Playwright](https://playwright.dev) for site scraping
- [TanStack AI](https://tanstack.com/ai) for brand extraction and ad generation
- MUI + Tailwind for UI
