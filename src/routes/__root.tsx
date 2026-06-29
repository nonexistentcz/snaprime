import {
  Outlet,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Providers } from "../providers";
import type { trpc } from "../trpc";

export interface RouterAppContext {
  trpc: typeof trpc;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
});

function RootComponent() {
  const isFetching = useRouterState({ select: (s) => s.isLoading });

  return (
    <Providers>
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <AppBar position="static">
          <Toolbar sx={{ gap: 2 }}>
            <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
              Get the vibe
            </Typography>
            <Box
              sx={{
                opacity: isFetching ? 0.4 : 0,
                transition: isFetching ? "opacity 1s" : "opacity 0.3s",
              }}
            >
              <CircularProgress color="inherit" size={24} />
            </Box>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ flex: 1, display: "flex" }}>
          <Outlet />
        </Box>
      </Box>
      <TanStackRouterDevtools position="bottom-right" />
    </Providers>
  );
}
