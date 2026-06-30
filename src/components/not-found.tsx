import { Link } from "@tanstack/react-router";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export function NotFound() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        flex: 1,
        p: 2,
        gap: 2,
      }}
    >
      <Typography variant="h3" component="h1">
        404
      </Typography>
      <Typography color="text.secondary">
        We couldn&apos;t find what you were looking for.
      </Typography>
      <Button component={Link} to="/" variant="contained">
        Go home
      </Button>
    </Box>
  );
}
