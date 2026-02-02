"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getStoredApiKeys, saveApiKeys, clearApiKeys } from "@/lib/api-keys";

export function SettingsMenu() {
  const [localUpriverKey, setLocalUpriverKey] = useState("");
  const [localGeminiKey, setLocalGeminiKey] = useState("");
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    saveApiKeys({
      upriverApiKey: localUpriverKey,
      geminiApiKey: localGeminiKey,
    });
    setOpen(false);
  };

  const handleClear = () => {
    clearApiKeys();
    setLocalUpriverKey("");
    setLocalGeminiKey("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      const stored = getStoredApiKeys();
      setLocalUpriverKey(stored.upriverApiKey);
      setLocalGeminiKey(stored.geminiApiKey);
    }
    setOpen(newOpen);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-1">
            <h4 className="font-medium leading-none">API Keys</h4>
            <p className="text-sm text-muted-foreground">
              Configure API keys to run this demo.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="upriver-key">Upriver</Label>
              <Input
                id="upriver-key"
                type="password"
                placeholder="Upriver API key"
                value={localUpriverKey}
                onChange={(e) => setLocalUpriverKey(e.target.value)}
              />
              {!localUpriverKey && (
                <a
                  href="mailto:support@upriver.ai?subject=API%20key%20request"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Need an Upriver API key?
                </a>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="gemini-key">Gemini</Label>
              <Input
                id="gemini-key"
                type="password"
                placeholder="Gemini API key"
                value={localGeminiKey}
                onChange={(e) => setLocalGeminiKey(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              Save
            </Button>
            <Button onClick={handleClear} variant="outline">
              Clear
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
