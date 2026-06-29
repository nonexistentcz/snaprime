import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface Hsv {
  h: number; // [0, 360]
  s: number; // [0, 100]
  v: number; // [0, 100]
}

function hexToRgb(hex: string): Rgb | null {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function rgbToHex({ r, g, b }: Rgb): string {
  return "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");
}

function rgbToHsv({ r, g, b }: Rgb): Hsv {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const d = max - min;
  const v = max;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
}

function hsvToRgb({ h, s, v }: Hsv): Rgb {
  const sn = s / 100, vn = v / 100;
  const i = Math.floor(h / 60) % 6;
  const f = h / 60 - Math.floor(h / 60);
  const p = vn * (1 - sn);
  const q = vn * (1 - f * sn);
  const t = vn * (1 - (1 - f) * sn);
  const [rn, gn, bn] = [
    [vn, q, p, p, t, vn],
    [t, vn, vn, q, p, p],
    [p, p, t, vn, vn, q],
  ].map((channel) => channel[i]);
  return { r: Math.round(rn * 255), g: Math.round(gn * 255), b: Math.round(bn * 255) };
}

export interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
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
    <Stack direction="row" spacing={2} alignItems="flex-start">
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
      <Stack flex={1} spacing={1.5}>
        {(
          [
            { key: "h", label: "H", min: 0, max: 360 },
            { key: "s", label: "S", min: 0, max: 100 },
            { key: "v", label: "V", min: 0, max: 100 },
          ] as const
        ).map(({ key, label, min, max }) => (
          <Box key={key} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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
