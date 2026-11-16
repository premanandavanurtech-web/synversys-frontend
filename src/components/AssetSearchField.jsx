import React from "react";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import { Close, Search } from "@mui/icons-material";




const defaultTokens = {
  border: "#e4e9ee",
  brand: "#0d4f63",
  muted: "#94a3b8",
  radius: "10px",
  bg: "#f8fafc",
};

export default function AssetSearchField({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  fullWidth = true,
  size = "small",
  sx,
  inputSx,
  searchIconSx,
  clearIconSx,
  InputProps,
  ...props
}) {
  const hasValue = Boolean(value);

  return (
    <TextField
      {...props}
      fullWidth={fullWidth}
      size={size}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      sx={sx}
      InputProps={{
        ...InputProps,
        startAdornment: (
          <InputAdornment position="start">
            <Search
              sx={{
                fontSize: 17,
                color: defaultTokens.muted,
                ...searchIconSx,
              }}
            />
          </InputAdornment>
        ),
        endAdornment: hasValue ? (
          <IconButton size="small" onClick={onClear} aria-label="Clear search">
            <Close sx={{ fontSize: 14, ...clearIconSx }} />
          </IconButton>
        ) : (
          InputProps?.endAdornment || null
        ),
        sx: {
          ...InputProps?.sx,
          borderRadius: defaultTokens.radius,
          fontSize: "0.85rem",
          bgcolor: defaultTokens.bg,
          "& fieldset": { borderColor: defaultTokens.border },
          "&:hover fieldset": { borderColor: "#cbd5e1" },
          "&.Mui-focused fieldset": { borderColor: defaultTokens.brand },
          ...inputSx,
        },
      }}
    />
  );
}
