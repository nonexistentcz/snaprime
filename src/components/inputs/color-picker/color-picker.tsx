import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Hsv, hexToRgb, rgbToHsv, rgbToHex, hsvToRgb } from "./convert-color";

export type ColorPickerProps = {
  value: string;
  onChange: (hex: string) => void;
};

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [hsv, setHsv] = useState<Hsv>(() => {
    const rgb = hexToRgb(value);
    return rgb ? rgbToHsv(rgb) : { h: 0, s: 100, v: 100 };
  });
  const [textValue, setTextValue] = useState(value);

  useEffect(() => {
    const rgb = hexToRgb(value);
    if (!rgb) return;
    const next = rgbToHsv(rgb);
    setHsv(next);
    setTextValue(value);
  }, [value]);

  const currentHex = rgbToHex(hsvToRgb(hsv));

  function handleSliderChange(key: keyof Hsv, newValue: number) {
    const next = { ...hsv, [key]: newValue };
    setHsv(next);
    const hex = rgbToHex(hsvToRgb(next));
    setTextValue(hex);
    onChange(hex);
  }

  function handleTextChange(raw: string) {
    setTextValue(raw);
    const rgb = hexToRgb(raw);
    if (!rgb) return;
    const next = rgbToHsv(rgb);
    setHsv(next);
    onChange(raw.startsWith("#") ? raw : "#" + raw);
  }

  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: 1,
          bgcolor: currentHex,
          border: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
        }}
      />
      <Stack spacing={1.5} sx={{ flex: 1 }}>
        {(
          [
            { key: "h", label: "H", min: 0, max: 360 },
            { key: "s", label: "S", min: 0, max: 100 },
            { key: "v", label: "V", min: 0, max: 100 },
          ] as const
        ).map(({ key, label, min, max }) => (
          <Box
            key={key}
            sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
          >
            <Typography variant="body2" sx={{ width: 16, flexShrink: 0 }}>
              {label}
            </Typography>
            <Slider
              min={min}
              max={max}
              value={hsv[key]}
              onChange={(_, v) => handleSliderChange(key, v as number)}
              size="small"
            />
          </Box>
        ))}
        <TextField
          size="small"
          label="Hex"
          value={textValue}
          onChange={(e) => handleTextChange(e.target.value)}
          slotProps={{ htmlInput: { maxLength: 7, spellCheck: false } }}
        />
      </Stack>
    </Stack>
  );
}
