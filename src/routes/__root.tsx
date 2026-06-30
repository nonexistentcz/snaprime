import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { NotFound } from "@/components/not-found";
import { Providers } from "../providers";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { title: "Vite App" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootComponent() {
  return (
    <RootDocument>
      <RootLayout />
    </RootDocument>
  );
}

function RootLayout() {
  const isFetching = useRouterState({ select: (s) => s.isLoading });

  return (
    <Providers>
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <AppBar position="static">
          <Toolbar sx={{ gap: 2 }}>
            <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
              <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
                Get the vibe
              </Link>
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
        <Box
          component="main"
          sx={{ flex: 1, display: "flex", flexDirection: "column" }}
        >
          <Outlet />
        </Box>
      </Box>
      <TanStackRouterDevtools position="bottom-right" />
    </Providers>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
