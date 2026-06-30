import { createRouter } from '@tanstack/react-router'
import CircularProgress from '@mui/material/CircularProgress'

import { routeTree } from './routeTree.gen'

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPendingComponent: () => (
      <div className={`p-2 text-2xl`}>
        <CircularProgress />
      </div>
    ),
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
