import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import Stack from "@mui/material/Stack";
import { ColorPicker } from "@/components/inputs/color-picker";

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

function IndexComponent() {
  const [color, setColor] = React.useState("#ff6600");

  return (
    <Stack direction="column" spacing={2} sx={{ p: 2 }}>
      <ColorPicker value={color} onChange={setColor} />
    </Stack>
  );
}
