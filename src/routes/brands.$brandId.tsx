import { useState } from "react";
import {
  Link,
  createFileRoute,
  notFound,
  useNavigate,
} from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useServerFn } from "@tanstack/react-start";
import { useLiveQuery } from "@tanstack/react-db";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ColorPicker from "@/components/inputs/color-picker/color-picker";
import { useSnackbar } from "@/hooks/use-snackbar";
import { getBrand, refetchBrand, updateBrand } from "@/server/functions/brand";
import { createAdvertFromBrand } from "@/server/functions/advert";
import { getBrandsCollection } from "@/lib/collections/brands";
import { getAdvertsCollection } from "@/lib/collections/adverts";
import type { Brand } from "@/db/schema/brand";

export const Route = createFileRoute("/brands/$brandId")({
  loader: async ({ params }) => {
    const brandId = Number(params.brandId);
    const brand = await getBrand({ data: brandId });
    if (!brand) throw notFound();
    await getBrandsCollection().preload();
    await getAdvertsCollection(brandId).preload();
    return { brandId, brand };
  },
  component: BrandPageComponent,
});

const textFields = [
  { name: "hostname", label: "Hostname" },
  { name: "name", label: "Name" },
  { name: "logoUrl", label: "Logo URL" },
  { name: "tone", label: "Tone" },
  { name: "slogan", label: "Slogan" },
  { name: "targetAudience", label: "Target Audience" },
  { name: "industry", label: "Industry" },
  { name: "values", label: "Values" },
  { name: "language", label: "Language" },
  { name: "socialInstagram", label: "Instagram" },
  { name: "socialFacebook", label: "Facebook" },
  { name: "socialTwitter", label: "Twitter" },
  { name: "socialLinkedin", label: "LinkedIn" },
  { name: "socialTiktok", label: "TikTok" },
  { name: "socialYoutube", label: "YouTube" },
] as const;

const paletteFields = [
  { name: "palettePrimary", label: "Primary" },
  { name: "paletteSecondary", label: "Secondary" },
  { name: "paletteTertiary", label: "Tertiary" },
] as const;

enum BrandTab {
  Detail = 0,
  Ads = 1,
}

function BrandPageComponent() {
  const { brandId, brand: loaderBrand } = Route.useLoaderData();
  const { data: brands } = useLiveQuery(getBrandsCollection());
  const brand = brands.find((b) => b.id === brandId) ?? loaderBrand;

  return <BrandPageDetail brand={brand} />;
}

function BrandPageDetail({ brand }: { brand: Brand }) {
  const { showSnackbar, snackbar } = useSnackbar();
  const [isRefetching, setIsRefetching] = useState(false);
  const [tab, setTab] = useState<BrandTab>(BrandTab.Detail);
  const refetchBrandFn = useServerFn(refetchBrand);
  const updateBrandFn = useServerFn(updateBrand);

  const handleRefetch = async () => {
    setIsRefetching(true);
    try {
      const updated = await refetchBrandFn({ data: brand.id });
      if (!updated) {
        showSnackbar("Brand has no hostname to refetch from", "error");
        return;
      }
      await getBrandsCollection().utils.refetch();
      form.reset({
        hostname: updated.hostname ?? "",
        name: updated.name ?? "",
        logoUrl: updated.logoUrl ?? "",
        tone: updated.tone ?? "",
        slogan: updated.slogan ?? "",
        targetAudience: updated.targetAudience ?? "",
        industry: updated.industry ?? "",
        values: updated.values ?? "",
        language: updated.language ?? "",
        palettePrimary: updated.palettePrimary ?? "#000000",
        paletteSecondary: updated.paletteSecondary ?? "#000000",
        paletteTertiary: updated.paletteTertiary ?? "#000000",
        socialInstagram: updated.socialInstagram ?? "",
        socialFacebook: updated.socialFacebook ?? "",
        socialTwitter: updated.socialTwitter ?? "",
        socialLinkedin: updated.socialLinkedin ?? "",
        socialTiktok: updated.socialTiktok ?? "",
        socialYoutube: updated.socialYoutube ?? "",
      });
      showSnackbar("Brand refetched", "success");
    } catch {
      showSnackbar("Failed to refetch brand", "error");
    } finally {
      setIsRefetching(false);
    }
  };

  const form = useForm({
    defaultValues: {
      hostname: brand.hostname ?? "",
      name: brand.name ?? "",
      logoUrl: brand.logoUrl ?? "",
      tone: brand.tone ?? "",
      slogan: brand.slogan ?? "",
      targetAudience: brand.targetAudience ?? "",
      industry: brand.industry ?? "",
      values: brand.values ?? "",
      language: brand.language ?? "",
      palettePrimary: brand.palettePrimary ?? "#000000",
      paletteSecondary: brand.paletteSecondary ?? "#000000",
      paletteTertiary: brand.paletteTertiary ?? "#000000",
      socialInstagram: brand.socialInstagram ?? "",
      socialFacebook: brand.socialFacebook ?? "",
      socialTwitter: brand.socialTwitter ?? "",
      socialLinkedin: brand.socialLinkedin ?? "",
      socialTiktok: brand.socialTiktok ?? "",
      socialYoutube: brand.socialYoutube ?? "",
    },
    onSubmit: async ({ value }) => {
      try {
        await updateBrandFn({ data: { id: brand.id, data: value } });
        await getBrandsCollection().utils.refetch();
        showSnackbar("Brand saved", "success");
      } catch {
        showSnackbar("Failed to save brand", "error");
      }
    },
  });

  return (
    <>
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar sx={{ gap: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Edit Brand
          </Typography>
          <Tooltip title="Refetch brand from website">
            <span>
              <IconButton
                aria-label="Refetch brand"
                onClick={handleRefetch}
                disabled={isRefetching}
                size="small"
              >
                {isRefetching ? (
                  <CircularProgress size={20} />
                ) : (
                  <RefreshIcon />
                )}
              </IconButton>
            </span>
          </Tooltip>
          {tab === BrandTab.Detail && (
            <Button variant="contained" onClick={() => form.handleSubmit()}>
              Save
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ p: 2 }}>
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}
        >
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label="Brand Detail" value={BrandTab.Detail} />
            <Tab label="Brand Ads" value={BrandTab.Ads} />
          </Tabs>
          {tab === BrandTab.Ads && (
            <CreateAdButton brandId={brand.id} showSnackbar={showSnackbar} />
          )}
        </Stack>

        {tab === BrandTab.Detail && (
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
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
                    />
                  )}
                </form.Field>
              ))}

              <Typography variant="subtitle1">Palette</Typography>
              {paletteFields.map(({ name, label }) => (
                <Box key={name}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    {label}
                  </Typography>
                  <form.Field name={name}>
                    {(field) => (
                      <ColorPicker
                        value={field.state.value}
                        onChange={(hex) => field.handleChange(hex)}
                      />
                    )}
                  </form.Field>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
        {tab === BrandTab.Ads && <BrandAdsTab brandId={brand.id} />}

        {snackbar}
      </Container>
    </>
  );
}

function CreateAdButton({
  brandId,
  showSnackbar,
}: {
  brandId: number;
  showSnackbar: (
    message: string,
    severity?: "success" | "error" | "info" | "warning"
  ) => void;
}) {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const createAdvertFn = useServerFn(createAdvertFromBrand);

  const handleCreateAd = async () => {
    setIsCreating(true);
    try {
      const advert = await createAdvertFn({ data: { brandId } });
      navigate({
        to: "/adverts/$advertId",
        params: { advertId: String(advert.id) },
      });
    } catch {
      showSnackbar("Failed to create advert", "error");
      setIsCreating(false);
    }
  };

  return (
    <Button
      variant="contained"
      startIcon={
        isCreating ? (
          <CircularProgress size={16} color="inherit" />
        ) : (
          <AddIcon />
        )
      }
      disabled={isCreating}
      onClick={handleCreateAd}
    >
      Create Ad
    </Button>
  );
}

function BrandAdsTab({ brandId }: { brandId: number }) {
  const { data: adverts } = useLiveQuery(getAdvertsCollection(brandId));

  return (
    <Stack spacing={2}>
      {adverts.length === 0 ? (
        <Typography color="text.secondary">No ads yet.</Typography>
      ) : (
        <List disablePadding>
          {adverts.map((advert) => (
            <Link
              key={advert.id}
              to="/adverts/$advertId"
              params={{ advertId: String(advert.id) }}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <ListItemButton divider>
                <ListItemText
                  primary={advert.headline ?? "(untitled)"}
                  secondary={advert.bodyText}
                  slotProps={{
                    primary: { noWrap: true },
                    secondary: { noWrap: true },
                  }}
                  sx={{ minWidth: 0 }}
                />
                {advert.status && (
                  <Chip
                    label={advert.status}
                    size="small"
                    variant="outlined"
                    sx={{ flexShrink: 0 }}
                  />
                )}
              </ListItemButton>
            </Link>
          ))}
        </List>
      )}
    </Stack>
  );
}
