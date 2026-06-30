import { useState } from "react";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useServerFn } from "@tanstack/react-start";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Modal from "@mui/material/Modal";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useSnackbar } from "@/hooks/use-snackbar";
import {
  advertStatusValues,
  getAdvert,
  generateImage,
  listAdvertImages,
  regenerateImage,
  updateAdvert,
} from "@/server/functions/advert";
import { getBrand } from "@/server/functions/brand";

function imageSrc(image: string) {
  return `data:image/png;base64,${image}`;
}

export const Route = createFileRoute("/adverts/$advertId")({
  loader: async ({ params }) => {
    const advertId = Number(params.advertId);
    const advert = await getAdvert({ data: advertId });
    if (!advert) throw notFound();
    const brand = await getBrand({ data: advert.brandId });
    if (!brand) throw notFound();
    const images = await listAdvertImages({ data: advertId });
    return { advert, brand, images };
  },
  component: AdvertEditComponent,
});

const textFields = [
  { name: "headline", label: "Headline" },
  { name: "bodyText", label: "Body Text" },
  { name: "callToAction", label: "Call to Action" },
  { name: "format", label: "Format" },
] as const;

function AdvertEditComponent() {
  const { advert, brand, images } = Route.useLoaderData();
  const { showSnackbar, snackbar } = useSnackbar();
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [regeneratingImageId, setRegeneratingImageId] = useState<number | null>(
    null
  );
  const [generatedImages, setGeneratedImages] = useState(images);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const updateAdvertFn = useServerFn(updateAdvert);
  const generateImageFn = useServerFn(generateImage);
  const regenerateImageFn = useServerFn(regenerateImage);

  const form = useForm({
    defaultValues: {
      headline: advert.headline ?? "",
      bodyText: advert.bodyText ?? "",
      callToAction: advert.callToAction ?? "",
      format: advert.format ?? "",
      status: advert.status,
    },
    onSubmit: async ({ value }) => {
      await updateAdvertFn({ data: { id: advert.id, data: value } });
    },
  });

  const handleSave = async () => {
    try {
      await form.handleSubmit();
      showSnackbar("Advert saved", "success");
    } catch {
      showSnackbar("Failed to save advert", "error");
    }
  };

  const handleGenerateImages = async () => {
    setIsGeneratingImage(true);
    try {
      await form.handleSubmit();
      const newImages = await generateImageFn({ data: advert.id });
      setGeneratedImages((prev) => [...prev, ...newImages]);
      showSnackbar("Image generated", "success");
    } catch {
      showSnackbar("Failed to generate image", "error");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleRegenerateImage = async (imageId: number) => {
    setRegeneratingImageId(imageId);
    try {
      const updated = await regenerateImageFn({ data: imageId });
      setGeneratedImages((prev) =>
        prev.map((image) => (image.id === imageId ? updated : image))
      );
      showSnackbar("Image regenerated", "success");
    } catch {
      showSnackbar("Failed to regenerate image", "error");
    } finally {
      setRegeneratingImageId(null);
    }
  };

  const handleDownload = (image: string) => {
    const link = document.createElement("a");
    link.href = imageSrc(image);
    link.download = `advert-${advert.id}.png`;
    link.click();
  };

  return (
    <>
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar sx={{ gap: 1 }}>
          <Breadcrumbs sx={{ flexGrow: 1 }}>
            <Link
              to="/brands/$brandId"
              params={{ brandId: String(brand.id) }}
              style={{ color: "inherit" }}
            >
              {brand.name ?? brand.hostname ?? "Brand"}
            </Link>
            <Typography color="text.primary">Edit Advert</Typography>
          </Breadcrumbs>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ p: 2 }}>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSave();
          }}
        >
          <Stack spacing={2}>
            {textFields.map(({ name, label }) => (
              <form.Field key={name} name={name}>
                {(field) => (
                  <TextField
                    label={label}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    multiline={name === "bodyText"}
                    minRows={name === "bodyText" ? 3 : undefined}
                  />
                )}
              </form.Field>
            ))}

            <form.Field name="status">
              {(field) => (
                <FormControl>
                  <InputLabel id="advert-status-label">Status</InputLabel>
                  <Select
                    labelId="advert-status-label"
                    label="Status"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value as (typeof advertStatusValues)[number]
                      )
                    }
                    onBlur={field.handleBlur}
                  >
                    {advertStatusValues.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </form.Field>

            <Box>
              <Button
                variant="outlined"
                startIcon={
                  isGeneratingImage ? (
                    <CircularProgress size={16} />
                  ) : (
                    <AutoAwesomeIcon />
                  )
                }
                disabled={isGeneratingImage}
                onClick={handleGenerateImages}
              >
                Generate Images
              </Button>
            </Box>

            {generatedImages.length > 0 && (
              <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
                {generatedImages.map((image, i) => (
                  <Box
                    key={image.id}
                    sx={{
                      position: "relative",
                      width: { xs: "100%", sm: "calc(33.33% - 11px)" },
                    }}
                  >
                    <Box
                      component="img"
                      src={imageSrc(image.data)}
                      alt={`Generated advert preview ${i + 1}`}
                      onClick={() => setPreviewImage(image.data)}
                      sx={{
                        width: "100%",
                        display: "block",
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "divider",
                        cursor: "pointer",
                      }}
                    />
                    <IconButton
                      aria-label="Regenerate image"
                      onClick={() => handleRegenerateImage(image.id)}
                      disabled={regeneratingImageId === image.id}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        bgcolor: "rgba(0, 0, 0, 0.5)",
                        color: "white",
                        "&:hover": { bgcolor: "rgba(0, 0, 0, 0.7)" },
                      }}
                    >
                      {regeneratingImageId === image.id ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <RefreshIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            )}
          </Stack>
        </Box>

        <Modal
          open={previewImage !== null}
          onClose={() => setPreviewImage(null)}
          keepMounted={false}
        >
          <Box
            sx={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 2,
            }}
          >
            {previewImage && (
              <Box
                sx={{
                  position: "relative",
                  maxWidth: "90vw",
                  maxHeight: "90vh",
                }}
              >
                <Box
                  component="img"
                  src={imageSrc(previewImage)}
                  alt="Generated advert preview"
                  sx={{
                    maxWidth: "90vw",
                    maxHeight: "90vh",
                    borderRadius: 1,
                    display: "block",
                  }}
                />
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ position: "absolute", top: 8, right: 8 }}
                >
                  <IconButton
                    aria-label="Download image"
                    onClick={() => handleDownload(previewImage)}
                    sx={{ bgcolor: "rgba(0, 0, 0, 0.5)", color: "white" }}
                  >
                    <DownloadIcon />
                  </IconButton>
                  <IconButton
                    aria-label="Close preview"
                    onClick={() => setPreviewImage(null)}
                    sx={{ bgcolor: "rgba(0, 0, 0, 0.5)", color: "white" }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Stack>
              </Box>
            )}
          </Box>
        </Modal>

        {snackbar}
      </Container>
    </>
  );
}
