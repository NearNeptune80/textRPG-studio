import React from "react";
import { LayoutFile, PanelDefinition, PanelAnchorType, WidgetType } from "../types/layout";
import { LayoutGrid, Plus, Trash2, Box, CheckSquare, Square } from "lucide-react";

interface LayoutEditorProps {
  layout: LayoutFile;
  onChange: (updated: LayoutFile) => void;
}

const ALL_WIDGETS: { id: WidgetType; label: string; desc: string }[] = [
  { id: "TOP_STATUS_BAR", label: "Top Status Bar", desc: "Clock, Date, Phase, Location, Gold" },
  { id: "CHARACTER_OVERVIEW", label: "Character Overview", desc: "Name, Race, Gender, Class" },
  { id: "STAT_BARS", label: "Vitals & Attributes", desc: "HP, Mana, Lust & Core Attributes" },
  { id: "PAPERDOLL_SOCKETS", label: "Paperdoll Body Anatomy", desc: "Breasts, Groin, Tail, Horns" },
  { id: "EQUIPMENT_GRID", label: "Equipped Gear Slots", desc: "35 Paperdoll Clothing Slots" },
  { id: "BACKPACK_INVENTORY", label: "Backpack & Container", desc: "Split dual-pane item lists" },
  { id: "SCENE_NARRATIVE", label: "CYOA Narrative Scene", desc: "Speaker & story body text" },
  { id: "INTERACTIVE_SEX", label: "CYOA Erotic Encounter", desc: "Arousal meters, Dominance & Log" },
  { id: "COMBAT_VIEW", label: "Tactical Combat Grid", desc: "Party status, Enemy party & Log" },
  { id: "RESOLUTION_HUB", label: "Post-Combat Resolution", desc: "Defeated NPC options & Mercy" },
  { id: "MINIMAP_RADAR", label: "World Map & Radar", desc: "9x9 Tile exploration radar" },
  { id: "TARGET_INSPECTOR", label: "Target NPC Inspector", desc: "Target stats, level & health" },
  { id: "ACTION_GRID", label: "Action Commands Grid", desc: "5x2 Grid with pagination" },
];

export const LayoutEditor: React.FC<LayoutEditorProps> = ({ layout, onChange }) => {
  const updatePanel = (index: number, updated: PanelDefinition) => {
    const nextPanels = [...layout.panels];
    nextPanels[index] = updated;
    onChange({ ...layout, panels: nextPanels });
  };

  const removePanel = (index: number) => {
    const nextPanels = layout.panels.filter((_, i) => i !== index);
    onChange({ ...layout, panels: nextPanels });
  };

  const addPanel = () => {
    const newPanel: PanelDefinition = {
      id: `panel_${Date.now() % 1000}`,
      anchor: "CENTER_FLEX",
      backgroundColor: "bgPanel",
      borderColor: "borderNormal",
      widgets: ["SCENE_NARRATIVE"],
    };
    onChange({ ...layout, panels: [...layout.panels, newPanel] });
  };

  const toggleWidget = (panelIndex: number, widgetId: WidgetType) => {
    const panel = layout.panels[panelIndex];
    const exists = panel.widgets.includes(widgetId);
    const updatedWidgets = exists
      ? panel.widgets.filter((w) => w !== widgetId)
      : [...panel.widgets, widgetId];

    updatePanel(panelIndex, { ...panel, widgets: updatedWidgets });
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto pr-2 space-y-4">
      {/* Layout Global Header */}
      <div className="bg-[#1c1a24] p-4 rounded-xl border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
            <LayoutGrid className="w-4 h-4" />
            <span>Layout Configuration</span>
          </div>
          <button
            onClick={addPanel}
            className="flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-medium transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Panel</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Layout Name</label>
            <input
              type="text"
              value={layout.layoutName}
              onChange={(e) => onChange({ ...layout, layoutName: e.target.value })}
              className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded text-xs text-slate-100"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Panel Gap Margin (px)</label>
            <input
              type="number"
              value={layout.margin}
              min="0"
              max="24"
              onChange={(e) => onChange({ ...layout, margin: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded text-xs text-slate-100 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Panels List */}
      <div className="space-y-3">
        {layout.panels.map((panel, idx) => (
          <div key={idx} className="bg-[#1c1a24] p-4 rounded-xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-amber-400" />
                <input
                  type="text"
                  value={panel.id}
                  onChange={(e) => updatePanel(idx, { ...panel, id: e.target.value })}
                  className="bg-transparent font-semibold text-xs text-slate-200 border-b border-white/20 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={panel.anchor}
                  onChange={(e) =>
                    updatePanel(idx, { ...panel, anchor: e.target.value as PanelAnchorType })
                  }
                  className="px-2 py-1 bg-black/50 border border-white/10 rounded text-xs text-purple-300 font-medium"
                >
                  <option value="TOP_BAR">TOP_BAR</option>
                  <option value="BOTTOM_BAR">BOTTOM_BAR</option>
                  <option value="LEFT_SIDEBAR">LEFT_SIDEBAR</option>
                  <option value="RIGHT_SIDEBAR">RIGHT_SIDEBAR</option>
                  <option value="CENTER_FLEX">CENTER_FLEX</option>
                </select>
                <button
                  onClick={() => removePanel(idx)}
                  className="p-1 text-slate-500 hover:text-rose-400 rounded transition"
                  title="Delete Panel"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sizing Constraints */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(panel.anchor === "LEFT_SIDEBAR" || panel.anchor === "RIGHT_SIDEBAR") && (
                <>
                  <div>
                    <label className="text-slate-400 text-[11px] block">Width (px)</label>
                    <input
                      type="number"
                      value={panel.fixedWidth || 320}
                      onChange={(e) =>
                        updatePanel(idx, { ...panel, fixedWidth: parseFloat(e.target.value) })
                      }
                      className="w-full px-2 py-1 bg-black/40 border border-white/10 rounded text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[11px] block">Min Width</label>
                    <input
                      type="number"
                      value={panel.minWidth || 200}
                      onChange={(e) =>
                        updatePanel(idx, { ...panel, minWidth: parseFloat(e.target.value) })
                      }
                      className="w-full px-2 py-1 bg-black/40 border border-white/10 rounded text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[11px] block">Max Width</label>
                    <input
                      type="number"
                      value={panel.maxWidth || 600}
                      onChange={(e) =>
                        updatePanel(idx, { ...panel, maxWidth: parseFloat(e.target.value) })
                      }
                      className="w-full px-2 py-1 bg-black/40 border border-white/10 rounded text-slate-200 font-mono"
                    />
                  </div>
                </>
              )}

              {(panel.anchor === "TOP_BAR" || panel.anchor === "BOTTOM_BAR") && (
                <div>
                  <label className="text-slate-400 text-[11px] block">Height (px)</label>
                  <input
                    type="number"
                    value={panel.fixedHeight || 40}
                    onChange={(e) =>
                      updatePanel(idx, { ...panel, fixedHeight: parseFloat(e.target.value) })
                    }
                    className="w-full px-2 py-1 bg-black/40 border border-white/10 rounded text-slate-200 font-mono"
                  />
                </div>
              )}
            </div>

            {/* Assigned Widgets */}
            <div>
              <label className="text-slate-400 text-[11px] block mb-1.5 font-medium">
                Assigned Widgets in Panel:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {ALL_WIDGETS.map((w) => {
                  const active = panel.widgets.includes(w.id);
                  return (
                    <button
                      key={w.id}
                      onClick={() => toggleWidget(idx, w.id)}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-left transition border ${
                        active
                          ? "bg-purple-950/40 border-purple-500/40 text-purple-200"
                          : "bg-black/20 border-white/5 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {active ? (
                        <CheckSquare className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      )}
                      <span className="text-[11px] truncate">{w.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
