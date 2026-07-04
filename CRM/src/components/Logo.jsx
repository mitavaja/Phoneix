import React from "react";

const Logo = ({ className = "", showText = true, theme = "light", size = "md" }) => {
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
    sm: { icon: "h-8 w-10", text: "text-lg" },
    md: { icon: "h-12 w-14", text: "text-2xl" },
    lg: { icon: "h-16 w-20", text: "text-4xl" },
    xl: { icon: "h-24 w-28", text: "text-6xl" }
  }[size] || { icon: "h-12 w-14", text: "text-2xl" };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
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

      {showText && (
        <div className="flex flex-col select-none leading-none">
          <span
            className={`font-black tracking-wider uppercase ${sizeClasses.text}`}
            style={{ color: colors.navy }}
          >
            Phreight
          </span>
          <span
            className="text-[8px] sm:text-[9px] tracking-[0.25em] uppercase font-bold mt-1"
            style={{ color: theme === "light" ? "#687280" : "#E5E7EB" }}
          >
            International Courier Company
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
