// Main.jsx - Updated with Dark Mode Support
import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme, CssBaseline, Box } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Hero from "./Home";
import Analytics from "./Analytics";
import Features from "./Features";
import UserRoles from "./Userroles";
import Pricing from "./Pricing";
import Testimonials from "./Testimonials";
import Contact from "./Contact";
import ServicesSection from "./Services";

const THEME_STORAGE_KEY = "assetmach-theme-mode";
const THEME_EXPLICIT_STORAGE_KEY = "assetmach-theme-mode-explicit";

const resolveStoredDarkMode = () => {
  const mode = localStorage.getItem(THEME_STORAGE_KEY);
  if (mode === "dark") return true;
  if (mode === "light") return false;
  if (mode === "auto") {
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches || false;
  }
  return false;
};

// Create light theme
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: "#1a4a6b",
      light: "#2c6b94",
      dark: "#003350",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#51606f",
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#64748b",
    },
  },
  typography: {
    fontFamily: '"Inter", "sans-serif"',
    h1: {
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
  },
});

// Create dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: "#3b82f6",
      light: "#60a5fa",
      dark: "#2563eb",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#8b5cf6",
    },
    background: {
      default: "#0f172a",
      paper: "#1e293b",
    },
    text: {
      primary: "#f1f5f9",
      secondary: "#94a3b8",
    },
  },
  typography: {
    fontFamily: '"Inter", "sans-serif"',
    h1: {
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
  },
});

function Main() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("home");
  const [isDarkMode, setIsDarkMode] = useState(resolveStoredDarkMode);

  const sections = [
    { id: "home", label: "Home" },
    { id: "analytics", label: "Analytics" },
    { id: "features", label: "Features" },
    { id: "services", label: "Services" },
    { id: "roles", label: "Solutions" },
    { id: "pricing", label: "Pricing" },
    { id: "contact", label: "Contact" },
  ];

  useEffect(() => {
    const handleThemeChange = (event) => {
      const mode = event.detail?.mode || localStorage.getItem(THEME_STORAGE_KEY);
      if (mode === "dark") setIsDarkMode(true);
      else if (mode === "light") setIsDarkMode(false);
      else if (mode === "auto") {
        setIsDarkMode(window.matchMedia?.("(prefers-color-scheme: dark)").matches || false);
      }
    };

    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      if (localStorage.getItem(THEME_STORAGE_KEY) === "auto") {
        setIsDarkMode(media?.matches || false);
      }
    };

    window.addEventListener("assetmach-theme-change", handleThemeChange);
    media?.addEventListener?.("change", handleSystemThemeChange);
    return () => {
      window.removeEventListener("assetmach-theme-change", handleThemeChange);
      media?.removeEventListener?.("change", handleSystemThemeChange);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.offsetTop - offset;

      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const sectionId = location.state?.scrollTo || location.hash?.replace("#", "");
    if (!sectionId) return;

    const timer = setTimeout(() => {
      scrollToSection(sectionId);
      setActiveSection(sectionId);
      if (location.state?.scrollTo) {
        navigate(location.pathname, { replace: true });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [location.hash, location.pathname, location.state, navigate]);

  const toggleTheme = () => {
    const nextIsDark = !isDarkMode;
    const nextMode = nextIsDark ? "dark" : "light";
    setIsDarkMode(nextIsDark);
    localStorage.setItem(THEME_STORAGE_KEY, nextMode);
    localStorage.setItem(THEME_EXPLICIT_STORAGE_KEY, "true");
    window.dispatchEvent(new CustomEvent("assetmach-theme-change", { detail: { mode: nextMode } }));
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
        <Navbar
          activeSection={activeSection}
          scrollToSection={scrollToSection}
          toggleTheme={toggleTheme}
          isDarkMode={isDarkMode}
        />
        <Hero scrollToSection={scrollToSection} />
        <Analytics />
        <Features />
        <ServicesSection />
        <UserRoles />
        <Pricing />
        <Testimonials />
        <Contact />
      </Box>
    </ThemeProvider>
  );
}

export default Main;
