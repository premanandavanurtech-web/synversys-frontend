import React, { useState, useEffect } from "react";
import { Box, Typography, Stack, keyframes } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PROJECT_LOGO_URL } from "../utils/brand";

// ── Keyframe Animations ──
const shimmerGleam = keyframes`
  0% { transform: translateX(-150%); }
  50% { transform: translateX(150%); }
  100% { transform: translateX(150%); }
`;

const beaconPulse = keyframes`
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(127, 174, 201, 0.7);
  }
  50% {
    transform: scale(1.2);
    box-shadow: 0 0 0 8px rgba(127, 174, 201, 0);
  }
`;

const logoHalo = keyframes`
  0%, 100% {
    box-shadow: 0 10px 35px rgba(0, 0, 0, 0.5), 0 0 25px rgba(127, 174, 201, 0.4);
  }
  50% {
    box-shadow: 0 15px 45px rgba(0, 0, 0, 0.6), 0 0 45px rgba(127, 174, 201, 0.75);
  }
`;

const ambientOrb1 = keyframes`
  0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.18; }
  50% { transform: translate(35px, -25px) scale(1.15); opacity: 0.28; }
`;

const ambientOrb2 = keyframes`
  0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.15; }
  50% { transform: translate(-30px, 30px) scale(1.12); opacity: 0.25; }
`;

export default function UnderConstruction() {
  const navigate = useNavigate();
  const targetPercent = 78;
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const accentColor = "#7faec9"; // Authentic light steel/sky blue from the screenshot

  // Smooth live counter animation on mount
  useEffect(() => {
    const duration = 1600; // 1.6s
    const intervalTime = 20;
    const step = targetPercent / (duration / intervalTime);

    const timer = setInterval(() => {
      setAnimatedPercent((prev) => {
        const next = prev + step;
        if (next >= targetPercent) {
          clearInterval(timer);
          return targetPercent;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [targetPercent]);

  const currentVal = Math.round(animatedPercent);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        bgcolor: "#0d1117",
        color: "#ffffff",
        userSelect: "none",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ── Background: Deep Atmospheric Cloudscape with Vignette ── */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(circle at 50% 48%, rgba(68, 77, 88, 0.48) 0%, rgba(33, 39, 47, 0.78) 45%, rgba(13, 17, 23, 0.96) 85%, #090c10 100%),
            radial-gradient(circle at 20% 25%, rgba(54, 65, 78, 0.3) 0%, transparent 60%),
            radial-gradient(circle at 80% 65%, rgba(46, 56, 68, 0.35) 0%, transparent 60%)
          `,
          zIndex: 0,
        }}
      />

      {/* Floating Animated Ambient Lights */}
      <Box
        sx={{
          position: "absolute",
          top: "12%",
          left: "18%",
          width: "550px",
          height: "450px",
          background: "radial-gradient(ellipse at center, rgba(127, 174, 201, 0.25) 0%, rgba(20, 26, 32, 0) 70%)",
          filter: "blur(90px)",
          pointerEvents: "none",
          animation: `${ambientOrb1} 9s ease-in-out infinite`,
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "12%",
          right: "18%",
          width: "600px",
          height: "480px",
          background: "radial-gradient(ellipse at center, rgba(90, 115, 140, 0.22) 0%, rgba(20, 26, 32, 0) 70%)",
          filter: "blur(95px)",
          pointerEvents: "none",
          animation: `${ambientOrb2} 11s ease-in-out infinite`,
          zIndex: 0,
        }}
      />

      {/* ── CENTER CONTENT ── */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          position: "relative",
          zIndex: 2,
          px: 2,
        }}
      >
        {/* ── Synversis Logo: High-Contrast Crisp White Medallion with Floating Animation ── */}
        <Box
          component={motion.div}
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 3.8,
            ease: "easeInOut",
          }}
          onClick={() => navigate("/landing")}
          sx={{
            cursor: "pointer",
            mb: { xs: 3, sm: 3.5, md: 4 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Horizontal Capsule Badge for the Wide "SYNVERSYS" Logo */}
          <Box
            sx={{
              width: { xs: 170, sm: 200, md: 230 },
              height: { xs: 58, sm: 66, md: 74 },
              borderRadius: "999px",
              bgcolor: "#ffffff", // Pure high-contrast white background so the navy Synversis logo is 100% crystal clear
              border: "2px solid rgba(255, 255, 255, 0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              px: { xs: 2.5, sm: 3 },
              py: 1,
              animation: `${logoHalo} 4s ease-in-out infinite`,
              transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.7), 0 0 50px rgba(127, 174, 201, 0.9)",
              },
            }}
          >
            <Box
              component="img"
              src={PROJECT_LOGO_URL}
              alt="Synversis Logo"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          </Box>
        </Box>

        {/* ── Main Headline: UNDER CONSTRUCTION ── */}
        <Typography
          variant="h1"
          component={motion.h1}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.15 }}
          sx={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 800,
            fontSize: { xs: "2.4rem", sm: "3.6rem", md: "4.4rem", lg: "5rem" },
            lineHeight: 1.08,
            letterSpacing: { xs: "0.08em", sm: "0.1em" },
            textTransform: "uppercase",
            color: "#ffffff",
            textShadow: "0 4px 35px rgba(0, 0, 0, 0.8)",
            mb: { xs: 2, sm: 2.5 },
          }}
        >
          UNDER
          <br />
          CONSTRUCTION
        </Typography>

        {/* ── Subtitle: SITE NEARLY READY ── */}
        <Typography
          component={motion.p}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.75 }}
          transition={{ duration: 1, delay: 0.35 }}
          sx={{
            fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.85rem" },
            fontWeight: 500,
            letterSpacing: { xs: "0.22em", sm: "0.3em" },
            color: "rgba(255, 255, 255, 0.75)",
            textTransform: "uppercase",
            mb: { xs: 4, sm: 5 },
          }}
        >
          SITE NEARLY READY
        </Typography>

        {/* ── Enhanced Animated Progress Bar Container ── */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          sx={{
            width: { xs: "290px", sm: "380px", md: "450px" },
            position: "relative",
          }}
        >
          {/* Floating Live Percentage Tag anchored to the active progress tip */}
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: 28,
              mb: 1.2,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                left: `${currentVal}%`,
                transform: "translateX(-50%)",
                transition: "left 0.05s linear",
                bgcolor: accentColor,
                color: "#ffffff",
                fontSize: "0.76rem",
                fontWeight: 800,
                letterSpacing: "0.04em",
                px: 1.2,
                py: 0.3,
                borderRadius: "5px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -4,
                  left: "50%",
                  transform: "translateX(-50%)",
                  borderWidth: "4px 4px 0 4px",
                  borderStyle: "solid",
                  borderColor: `${accentColor} transparent transparent transparent`,
                },
              }}
            >
              {currentVal}%
            </Box>
          </Box>

          {/* Progress Track (Sleek, refined height with rounded ends) */}
          <Box
            sx={{
              width: "100%",
              height: 9,
              bgcolor: "rgba(255, 255, 255, 0.16)",
              borderRadius: "5px",
              position: "relative",
              overflow: "visible",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            {/* Filled Progress Bar with Dynamic Width & Rounded End */}
            <Box
              sx={{
                width: `${currentVal}%`,
                height: "100%",
                borderRadius: "5px",
                background: `linear-gradient(90deg, #5a9ab9 0%, ${accentColor} 80%, #a2d2ed 100%)`,
                position: "relative",
                overflow: "hidden",
                transition: "width 0.05s linear",
                boxShadow: "0 0 12px rgba(127, 174, 201, 0.4)",
              }}
            >
              {/* Sweeping Shimmer Gleam Animation */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)",
                  animation: `${shimmerGleam} 2.6s ease-in-out infinite`,
                }}
              />
            </Box>

            {/* Glowing Beacon Dot on the active Progress Tip */}
            <Box
              sx={{
                position: "absolute",
                left: `${currentVal}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: 13,
                height: 13,
                borderRadius: "50%",
                bgcolor: "#ffffff",
                border: `2px solid ${accentColor}`,
                animation: `${beaconPulse} 2s ease-in-out infinite`,
                zIndex: 3,
                transition: "left 0.05s linear",
              }}
            />
          </Box>

          {/* Bottom Labels: 0%, Status text, and 100% */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              mt: 1.5,
              px: 0.5,
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "0.72rem", sm: "0.78rem" },
                color: "rgba(255, 255, 255, 0.65)",
                fontWeight: 600,
                letterSpacing: "0.05em",
              }}
            >
              0%
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: "0.68rem", sm: "0.74rem" },
                color: accentColor,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              {currentVal}% COMPLETED
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: "0.72rem", sm: "0.78rem" },
                color: "rgba(255, 255, 255, 0.65)",
                fontWeight: 600,
                letterSpacing: "0.05em",
              }}
            >
              100%
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
