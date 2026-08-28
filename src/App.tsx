import React, { useState } from "react";
import { ThemeFile, DEFAULT_DARK_FANTASY_THEME } from "./types/theme";
import { LayoutFile, BLANK_LAYOUT, GameSimulationState } from "./types/layout";
import { CustomWidgetDefinition, PREMADE_WIDGETS } from "./types/elements";
import { ThemeEditor } from "./components/ThemeEditor";
import { LayoutEditor } from "./components/LayoutEditor";
import { GamePreviewViewport } from "./components/GamePreviewViewport";
import { Palette, LayoutGrid, Download, Upload, Sparkles, Copy, Check } from "lucide-react";

type ActiveTab = "THEME" | "LAYOUT";

export const App: React.FC = () => {
  const [theme, setTheme] = useState<ThemeFile>(DEFAULT_DARK_FANTASY_THEME);
  const [layout, setLayout] = useState<LayoutFile>(BLANK_LAYOUT);
  const [availableWidgets, setAvailableWidgets] = useState<CustomWidgetDefinition[]>(PREMADE_WIDGETS);
  const [activeTab, setActiveTab] = useState<ActiveTab>("LAYOUT");
  const [activeSimulationState, setActiveSimulationState] = useState<GameSimulationState>("UNIVERSAL");
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  const handleAddCustomWidget = (newWidget: CustomWidgetDefinition) => {
    setAvailableWidgets([...availableWidgets, newWidget]);
  };

  const exportThemeJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(theme, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `theme_${theme.themeName.toLowerCase().replace(/\s+/g, "_")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportLayoutJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(layout, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `layout_${layout.layoutName.toLowerCase().replace(/\s+/g, "_")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const copyToClipboard = (content: object, label: string) => {
    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    setCopiedNotification(`${label} JSON copied to clipboard!`);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  const importJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.colors) {
            setTheme(parsed);
          } else if (parsed.panels) {
            setLayout(parsed);
          }
        } catch (err) {
          alert("Invalid JSON file format.");
        }
      };
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#121118] text-slate-100 font-sans select-none overflow-hidden">
      {/* Studio Navigation Banner */}
      <header className="h-14 bg-[#1a1822] border-b border-white/10 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-100 tracking-wide">textRPG Studio</h1>
            <p className="text-[11px] text-purple-400 font-medium">Drag-and-Drop Theme & Modular Layout Designer</p>
          </div>
        </div>

        {/* Studio View Mode Switcher */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab("LAYOUT")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === "LAYOUT" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Layout & Widgets</span>
          </button>
          <button
            onClick={() => setActiveTab("THEME")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === "THEME" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Theme Aesthetics</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 text-xs">
          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg border border-white/10 cursor-pointer transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={importJson} className="hidden" />
          </label>

          <button
            onClick={() =>
              copyToClipboard(
                activeTab === "THEME" ? theme : layout,
                activeTab === "THEME" ? "Theme" : "Layout"
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg border border-white/10 transition"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy JSON</span>
          </button>

          <button
            onClick={activeTab === "THEME" ? exportThemeJson : exportLayoutJson}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-lg shadow-md transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export {activeTab === "THEME" ? "Theme" : "Layout"}</span>
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {copiedNotification && (
        <div className="fixed bottom-6 right-6 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 text-xs z-50 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* Main Workspace (Left Inspector + Right Live Mockup) */}
      <main className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left Side: Active Editor */}
        <section className="w-[420px] shrink-0 h-full flex flex-col">
          {activeTab === "THEME" ? (
            <ThemeEditor theme={theme} onChange={setTheme} />
          ) : (
            <LayoutEditor
              layout={layout}
              onChange={setLayout}
              availableWidgets={availableWidgets}
              onAddCustomWidget={handleAddCustomWidget}
              activeEditingState={activeSimulationState}
              onSelectEditingState={setActiveSimulationState}
            />
          )}
        </section>

        {/* Right Side: Live Game Viewport Preview */}
        <section className="flex-1 h-full flex flex-col min-w-0">
          <GamePreviewViewport
            theme={theme}
            layout={layout}
            onChangeLayout={setLayout}
            availableWidgets={availableWidgets}
            activeState={activeSimulationState}
            onSelectState={setActiveSimulationState}
          />
        </section>
      </main>
    </div>
  );
};
export default App;
