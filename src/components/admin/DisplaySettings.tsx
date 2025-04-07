import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/utils/ThemeProvider";
import { ThemeToggle, ThemeToggleDropdown } from "@/components/ui/theme-toggle";
import { Moon, Sun, MonitorSmartphone } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const DisplaySettings = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Display Settings</CardTitle>
        <CardDescription>Customize how the dashboard looks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Theme Preference</h3>
          <div className="flex flex-col space-y-4">
            <RadioGroup 
              value={theme} 
              onValueChange={(value) => setTheme(value as "light" | "dark")}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem 
                  value="light" 
                  id="theme-light" 
                  className="peer sr-only" 
                />
                <Label 
                  htmlFor="theme-light" 
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Sun className="mb-3 h-6 w-6" />
                  Light Mode
                </Label>
              </div>
              
              <div>
                <RadioGroupItem 
                  value="dark" 
                  id="theme-dark" 
                  className="peer sr-only" 
                />
                <Label 
                  htmlFor="theme-dark" 
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Moon className="mb-3 h-6 w-6" />
                  Dark Mode
                </Label>
              </div>
              
              <div>
                <RadioGroupItem 
                  value="system" 
                  id="theme-system" 
                  className="peer sr-only" 
                  disabled
                />
                <Label 
                  htmlFor="theme-system" 
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer opacity-50"
                >
                  <MonitorSmartphone className="mb-3 h-6 w-6" />
                  System (Coming Soon)
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-4">Theme Toggle Buttons</h3>
          <p className="text-sm text-muted-foreground mb-4">
            These toggle buttons are available throughout the dashboard for quick access.
          </p>
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex flex-col items-center gap-2">
              <Label className="text-sm">Default</Label>
              <ThemeToggle />
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <Label className="text-sm">Icon Only</Label>
              <ThemeToggle variant="icon" />
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <Label className="text-sm">With Text</Label>
              <ThemeToggle variant="default" />
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <Label className="text-sm">Dropdown</Label>
              <ThemeToggleDropdown />
            </div>
          </div>
        </div>
        
        <div className="pt-2">
          <Button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            variant="outline"
            className="w-full"
          >
            {theme === "light" ? (
              <>
                <Moon className="mr-2 h-4 w-4" />
                Switch to Dark Mode
              </>
            ) : (
              <>
                <Sun className="mr-2 h-4 w-4" />
                Switch to Light Mode
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DisplaySettings; 