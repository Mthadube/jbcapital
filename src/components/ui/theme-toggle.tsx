import React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/utils/ThemeProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ThemeToggleProps {
  variant?: "icon" | "default" | "outline";
  showTooltip?: boolean;
  tooltipSide?: "top" | "right" | "bottom" | "left";
  size?: "sm" | "default" | "lg";
}

export function ThemeToggle({
  variant = "outline",
  showTooltip = true,
  tooltipSide = "bottom",
  size = "default"
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  
  const toggleButton = (
    <Button
      variant={variant === "icon" ? "ghost" : variant}
      size={size}
      className={variant === "icon" ? "h-8 w-8 p-0" : ""}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className={`h-4 w-4 rotate-0 scale-100 transition-all ${theme === "dark" ? "rotate-90 scale-0" : ""}`} />
      <Moon className={`absolute h-4 w-4 rotate-90 scale-0 transition-all ${theme === "dark" ? "rotate-0 scale-100" : ""}`} />
      <span className="sr-only">Toggle theme</span>
      {variant === "default" && <span className="ml-2">{theme === "light" ? "Dark mode" : "Light mode"}</span>}
    </Button>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {toggleButton}
          </TooltipTrigger>
          <TooltipContent side={tooltipSide}>
            <p>{theme === "light" ? "Switch to dark mode" : "Switch to light mode"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return toggleButton;
}

export function ThemeToggleDropdown() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="h-4 w-4 mr-2" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="h-4 w-4 mr-2" />
          <span>Dark</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 