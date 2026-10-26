import React, { useState, useEffect } from "react";
import API, { resolveAssetUrl } from "../services/api";

const DEFAULT_LOGO_URL = "/phreights-logo.png";

const Logo = ({ className = "", showText = true, theme = "navy", size = "md", text, subtitle, logoUrl }) => {
  const [logoConfig, setLogoConfig] = useState(null);
  const [imgError, setImgError] = useState(false);

  const fetchHeaderLogo = () => {
    API.get("/page-content/header?t=" + Date.now())
      .then(res => {
        if (res.data?.sections?.logo) {
          setLogoConfig(res.data.sections.logo);
          setImgError(false);
        }
      })
      .catch(() => {
        // Fallback silently
      });
  };

  useEffect(() => {
    // If text/subtitle/logoUrl is not explicitly passed, fetch from backend API
    if (text === undefined || subtitle === undefined || logoUrl === undefined) {
      fetchHeaderLogo();
    }
  }, [text, subtitle, logoUrl]);

  // Listen to cross-component or cross-tab logo updates
  useEffect(() => {
    const handleUpdate = () => {
      fetchHeaderLogo();
    };

    window.addEventListener("logo-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("logo-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const displayText = text !== undefined ? text : logoConfig?.text;
  const displaySubtitle = subtitle !== undefined ? subtitle : logoConfig?.subtitle;
  const activeLogoUrl = logoUrl !== undefined ? logoUrl : logoConfig?.logoUrl;

  // Determine which image URL to show: custom logo if configured, else default brand logo
  const effectiveLogoUrl = activeLogoUrl && activeLogoUrl.trim() !== "" ? activeLogoUrl : DEFAULT_LOGO_URL;

  const iconColorMap = {
    light: {
      navy: "#0A1F44",
      orange: "#FF6A00",
      gray: "#687280",
    },
    dark: {
      navy: "#FFFFFF",
      orange: "#FF6A00",
      gray: "#E5E7EB",
    },
    navy: {
      navy: "#FFFFFF",
      orange: "#FF6A00",
      gray: "#E5E7EB",
    }
  };

  const colors = iconColorMap[theme] || iconColorMap.navy;

  const sizeClasses = {
    sm: { icon: "h-9 w-10", text: "text-lg font-bold" },
    md: { icon: "h-12 w-14", text: "text-2xl font-bold" },
    lg: { icon: "h-20 w-22", text: "text-3xl font-bold" },
    xl: { icon: "h-26 w-28", text: "text-5xl font-bold" },
    sidebar: { icon: "h-20 w-22", text: "text-3xl font-bold" }
  }[size] || { icon: "h-14 w-16", text: "text-2xl font-bold" };

  // Proper sizes for logo image to prevent distortion (maintaining aspect-ratio)
  const imgSizeClasses = {
    sm: "h-9 w-auto max-w-[130px]",
    md: "h-11 sm:h-12 w-auto max-w-[190px]",
    lg: "h-16 sm:h-20 w-auto max-w-[200px]",
    xl: "h-22 sm:h-26 w-auto max-w-[260px]",
    sidebar: "h-16 sm:h-20 w-auto max-w-[200px]"
  }[size] || "h-12 w-auto max-w-[190px]";

  const srcToRender = !imgError 
    ? (effectiveLogoUrl.startsWith("/") && !effectiveLogoUrl.startsWith("/uploads/") 
        ? effectiveLogoUrl 
        : resolveAssetUrl(effectiveLogoUrl))
    : (effectiveLogoUrl !== DEFAULT_LOGO_URL ? DEFAULT_LOGO_URL : null);

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {srcToRender ? (
        <img
          src={srcToRender}
          alt="Brand Logo"
          className={`${imgSizeClasses} object-contain select-none`}
          onError={() => {
            if (!imgError && effectiveLogoUrl !== DEFAULT_LOGO_URL) {
              setImgError(true);
            }
          }}
        />
      ) : (
        <svg
          viewBox="0 0 120 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${sizeClasses.icon} select-none`}
        >
          <path
            d="M 42 20 L 78 20 C 94 20 102 32 102 48 C 102 64 94 76 78 76 L 50 76"
            stroke={colors.navy}
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 18 48 L 82 48"
            stroke={colors.orange}
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 70 36 L 82 48 L 70 60"
            stroke={colors.orange}
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 50 62 L 32 62 L 32 86"
            stroke={colors.gray}
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {showText && displayText && !srcToRender && (
        <div className="flex flex-col select-none leading-none">
          <span
            className={`font-black tracking-wider uppercase ${sizeClasses.text}`}
            style={{ color: colors.navy }}
          >
            {displayText}
          </span>
          {displaySubtitle && (
            <span
              className="text-[8px] sm:text-[9px] tracking-[0.25em] uppercase font-bold mt-1"
              style={{ color: theme === "light" ? "#687280" : "#E5E7EB" }}
            >
              {displaySubtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
