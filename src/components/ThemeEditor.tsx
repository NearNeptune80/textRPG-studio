import React from "react";
import { ThemeFile, ThemeColors, RGBAColor, GaugeStyle, hexToRgba, rgbaToHex } from "../types/theme";
import { Palette, Type, Sliders, Sparkles, Shield } from "lucide-react";

interface ThemeEditorProps {
  theme: ThemeFile;
  onChange: (updated: ThemeFile) => void;
}

export const ThemeEditor: React.FC<ThemeEditorProps> = ({ theme, onChange }) => {
  const updateColor = (key: keyof ThemeColors, hex: string) => {
    const prev = theme.colors[key];
    const next: RGBAColor = hexToRgba(hex, prev.a);
    onChange({
      ...theme,
      colors: {
        ...theme.colors,
        [key]: next,
      },
    });
  };

  const updateAlpha = (key: keyof ThemeColors, alphaVal: number) => {
    onChange({
      ...theme,
      colors: {
        ...theme.colors,
        [key]: {
          ...theme.colors[key],
          a: alphaVal,
        },
      },
    });
  };

  const renderColorRow = (key: keyof ThemeColors, label: string) => {
    const c = theme.colors[key];
    const hex = rgbaToHex(c);

    return (
      <div key={key} className="flex items-center justify-between py-1.5 border-b border-white/5 text-xs">
        <span className="text-slate-300 font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={hex}
            onChange={(e) => updateColor(key, e.target.value)}
            className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
          />
          <input
            type="text"
            value={hex.toUpperCase()}
            onChange={(e) => {
              if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                updateColor(key, e.target.value);
              }
            }}
            className="w-20 px-2 py-1 bg-black/40 border border-white/10 rounded font-mono text-[11px] text-slate-200"
          />
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500">A</span>
            <input
              type="range"
              min="0"
              max="255"
              value={c.a}
              onChange={(e) => updateAlpha(key, parseInt(e.target.value))}
              className="w-14 accent-purple-500"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto pr-2 space-y-4 select-none">
      {/* Aesthetics & Styling Rules */}
      <div className="bg-[#1c1a24] p-4 rounded-xl border border-white/10 space-y-3">
        <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
          <Sparkles className="w-4 h-4" />
          <span>Visual Aesthetics & Frame Styling</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Corner Radius (px)</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="16"
                value={theme.borderRadius}
                onChange={(e) => onChange({ ...theme, borderRadius: parseInt(e.target.value) || 0 })}
                className="flex-1 accent-purple-500"
              />
              <span className="w-8 font-mono text-slate-200">{theme.borderRadius}px</span>
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Border Width (px)</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="4"
                value={theme.borderWidth}
                onChange={(e) => onChange({ ...theme, borderWidth: parseInt(e.target.value) || 1 })}
                className="flex-1 accent-purple-500"
              />
              <span className="w-8 font-mono text-slate-200">{theme.borderWidth}px</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Gauge Bar Render Style</label>
            <select
              value={theme.gaugeStyle}
              onChange={(e) => onChange({ ...theme, gaugeStyle: e.target.value as GaugeStyle })}
              className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded text-slate-200 font-medium"
            >
              <option value="SOLID">Solid Clean</option>
              <option value="STRIPED">Striped Modern</option>
              <option value="SEGMENTED">Segmented Blocks</option>
              <option value="GLOW">Neon Glow</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Panel Opacity (%)</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="30"
                max="100"
                value={theme.panelOpacity}
                onChange={(e) => onChange({ ...theme, panelOpacity: parseInt(e.target.value) || 100 })}
                className="flex-1 accent-purple-500"
              />
              <span className="w-8 font-mono text-slate-200">{theme.panelOpacity}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Font Configuration */}
      <div className="bg-[#1c1a24] p-4 rounded-xl border border-white/10 space-y-3">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
          <Type className="w-4 h-4" />
          <span>TrueType Typography</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="text-xs text-slate-400 block mb-1">Font File Path</label>
            <input
              type="text"
              value={theme.fontPath || ""}
              placeholder="data/fonts/Roboto/static/Roboto-Medium.ttf"
              onChange={(e) => onChange({ ...theme, fontPath: e.target.value })}
              className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded text-xs font-mono text-slate-200"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Base Size</label>
            <input
              type="number"
              value={theme.baseFontSize || 14}
              min="8"
              max="32"
              onChange={(e) => onChange({ ...theme, baseFontSize: parseFloat(e.target.value) || 14 })}
              className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded text-xs font-mono text-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Surface Backgrounds */}
      <div className="bg-[#1c1a24] p-4 rounded-xl border border-white/10 space-y-2">
        <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm mb-2">
          <Palette className="w-4 h-4" />
          <span>Surface & Background Colours</span>
        </div>
        {renderColorRow("bgDark", "Dark App Background")}
        {renderColorRow("bgPanel", "Main Panel Surface")}
        {renderColorRow("bgHeader", "Header Banner Surface")}
        {renderColorRow("bgSlot", "Inventory Slot (Empty)")}
        {renderColorRow("bgSlotOccupied", "Inventory Slot (Occupied)")}
        {renderColorRow("bgSlotSelected", "Inventory Slot (Selected)")}
        {renderColorRow("bgButton", "Action Button Normal")}
        {renderColorRow("bgButtonDisabled", "Action Button Disabled")}
      </div>

      {/* Borders & Frames */}
      <div className="bg-[#1c1a24] p-4 rounded-xl border border-white/10 space-y-2">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm mb-2">
          <Shield className="w-4 h-4" />
          <span>Borders & Frame Outlines</span>
        </div>
        {renderColorRow("borderNormal", "Default Panel Border")}
        {renderColorRow("borderSelected", "Selected Highlight Border")}
        {renderColorRow("borderButton", "Button Border")}
        {renderColorRow("borderButtonDisabled", "Button Disabled Border")}
      </div>

      {/* Typography */}
      <div className="bg-[#1c1a24] p-4 rounded-xl border border-white/10 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-2">
          <Type className="w-4 h-4" />
          <span>Typography & Text Colours</span>
        </div>
        {renderColorRow("textPrimary", "Primary Text (Body)")}
        {renderColorRow("textSecondary", "Secondary Text (Subtitles)")}
        {renderColorRow("textMuted", "Muted Text (Disabled)")}
        {renderColorRow("textGold", "Gold Text (Headers/Values)")}
        {renderColorRow("textAccent", "Accent Text (Highlights)")}
      </div>

      {/* Vitals & Stat Gauges */}
      <div className="bg-[#1c1a24] p-4 rounded-xl border border-white/10 space-y-2">
        <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm mb-2">
          <Sliders className="w-4 h-4" />
          <span>Vitals, Gauges & Attributes</span>
        </div>
        {renderColorRow("health", "Health Bar (HP)")}
        {renderColorRow("mana", "Mana Bar (MP)")}
        {renderColorRow("lust", "Lust Bar / Arousal")}
        {renderColorRow("physique", "Physique Attribute")}
        {renderColorRow("arcane", "Arcane Attribute")}
        {renderColorRow("corruption", "Corruption Attribute")}
        {renderColorRow("currency", "Currency / Gold")}
        {renderColorRow("gems", "Gems / Crystals")}
        {renderColorRow("enemy", "Enemy Target")}
        {renderColorRow("friendly", "Friendly Entity")}
        {renderColorRow("companion", "Companion Entity")}
      </div>
    </div>
  );
};
