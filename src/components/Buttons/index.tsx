import React from "react";
import "./styles.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "ghost" | "icon";
  fullWidth?: boolean;
}

export const Button = ({
  variant = "primary",
  fullWidth = false,
  className = "",
  children,
  style,
  ...props
}: ButtonProps) => {
  let variantClass = "btn-primary";

  switch (variant) {
    case "danger":
      variantClass = "btn-danger";
      break;
    case "ghost":
      variantClass = "btn-ghost";
      break;
    case "icon":
      variantClass = "btn-ghost btn-icon";
      break;
  }

  return (
    <button
      className={`btn ${variantClass} ${className}`}
      style={{ width: fullWidth ? "100%" : "auto", ...style }}
      {...props}
    >
      {children}
    </button>
  );
};
