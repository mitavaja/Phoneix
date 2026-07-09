import React, { useState, useEffect } from "react";
import axios from "axios";

const Logo = ({ className = "", showText = true, theme = "light", size = "md", text, subtitle, logoUrl }) => {
  const [logoConfig, setLogoConfig] = useState(null);

  useEffect(() => {
    // If text/subtitle/logoUrl is not explicitly passed, fetch from backend API
    if (text === undefined || subtitle === undefined || logoUrl === undefined) {
      axios.get("http://localhost:5000/api/page-content/header")
        .then(res => {
          if (res.data?.sections?.logo) {
            setLogoConfig(res.data.sections.logo);
          }
        })
        .catch(err => {
          // Fallback silently if endpoint fails or 404
        });
    }
  }, [text, subtitle, logoUrl]);

  // Keep it optional: If dynamic content isn't loaded yet or not configured, fall back.
  const displayText = text !== undefined ? text : logoConfig?.text;
  const displaySubtitle = subtitle !== undefined ? subtitle : logoConfig?.subtitle;
  const displayLogoUrl = logoUrl !== undefined ? logoUrl : logoConfig?.logoUrl;

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

  const colors = iconColorMap[theme] || iconColorMap.light;

  const sizeClasses = {
    sm: { icon: "h-10 w-12", text: "text-xl" },
    md: { icon: "h-14 w-16", text: "text-3xl font-bold" },
    lg: { icon: "h-16 w-20", text: "text-4xl font-bold" },
    xl: { icon: "h-24 w-28", text: "text-6xl font-bold" }
  }[size] || { icon: "h-14 w-16", text: "text-3xl font-bold" };

  // Proper sizes for logo image to prevent distortion (maintaining aspect-ratio)
  const imgSizeClasses = {
    sm: "h-10 w-auto max-w-[140px] scale-110 origin-left",
    md: "h-14 w-auto max-w-[280px] scale-[1.3] origin-left",
    lg: "h-16 w-auto max-w-[350px] scale-[1.4] origin-left",
    xl: "h-24 w-auto max-w-[500px] scale-[1.5] origin-left"
  }[size] || "h-14 w-auto max-w-[280px] scale-[1.3] origin-left";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {displayLogoUrl ? (
        <img
          src={displayLogoUrl.startsWith("http") ? displayLogoUrl : `http://localhost:5000${displayLogoUrl}`}
          alt="Brand Logo"
          className={`${imgSizeClasses} object-contain select-none`}
          onError={(e) => {
            e.target.style.display = "none";
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

      {showText && displayText && (
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
