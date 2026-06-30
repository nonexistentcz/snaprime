import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useServerFn } from "@tanstack/react-start";
import { useSnackbar } from "@/hooks/use-snackbar";
import { createBrandFromUrl } from "@/server/functions/brand";

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

const urlSchema = z.url();

function IndexComponent() {
  const navigate = useNavigate();
  const { showSnackbar, snackbar } = useSnackbar();
  const createBrand = useServerFn(createBrandFromUrl);

  const form = useForm({
    defaultValues: {
      url: "",
    },
    onSubmit: async ({ value }) => {
      try {
        const brand = await createBrand({ data: { url: value.url } });
        navigate({
          to: "/brands/$brandId",
          params: { brandId: String(brand.id) },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : undefined;
        showSnackbar(message ?? "Failed to create brand", "error");
      }
    },
  });

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
      }}
    >
      <Box
        component="form"
        sx={{ width: "100%", maxWidth: 480 }}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
          <form.Field
            name="url"
            validators={{
              onChange: ({ value }) => {
                const result = urlSchema.safeParse(value);
                return result.success ? undefined : "Enter a valid URL";
              },
            }}
          >
            {(field) => (
              <TextField
                label="URL"
                placeholder="https://example.com"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.length > 0}
                helperText={field.state.meta.errors[0]}
                sx={{ flex: 1 }}
              />
            )}
          </form.Field>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                sx={{ height: 56 }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Create"
                )}
              </Button>
            )}
          </form.Subscribe>
        </Stack>
      </Box>
      {snackbar}
    </Box>
  );
}
