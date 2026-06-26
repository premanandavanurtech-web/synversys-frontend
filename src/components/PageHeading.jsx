import React from "react";
import { Box, Typography } from "@mui/material";

export default function PageHeading({
  title,
  subtitle,
  titleColor = "#0d2b35",
  subtitleColor = "#4a5568",
  sx,
  subtitleSx,
}) {
  return (
    <Box sx={sx}>
      <Typography
        fontWeight={800}
        fontSize={{ xs: "1.3rem", md: "1.5rem" }}
        color={titleColor}
        lineHeight={1.2}
        fontFamily="inherit"
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          fontSize="0.82rem"
          color={subtitleColor}
          mt={0.4}
          fontFamily="inherit"
          sx={subtitleSx}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
