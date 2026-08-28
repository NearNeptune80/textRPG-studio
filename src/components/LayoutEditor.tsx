import React, { useState } from "react";
import { LayoutFile, PanelDefinition, PanelAnchorType, GameSimulationState } from "../types/layout";
import { CustomWidgetDefinition } from "../types/elements";
import { LayoutGrid, Plus, Trash2, Box, Layers, MoveVertical, MoveHorizontal, CheckSquare, Square, Copy, Sliders } from "lucide-react";
import { CustomWidgetBuilderModal } from "./CustomWidgetBuilderModal";

interface LayoutEditorProps {
  layout: LayoutFile;
  onChange: (updated: LayoutFile) => void;
  availableWidgets: CustomWidgetDefinition[];
  onAddCustomWidget: (widget: CustomWidgetDefinition) => void;
  activeEditingState: GameSimulationState;
  onSelectEditingState: (st: GameSimulationState) => void;
}

export const LayoutEditor: React.FC<LayoutEditorProps> = ({
  layout,
  onChange,
  availableWidgets,
  onAddCustomWidget,
  activeEditingState,
  onSelectEditingState,
}) => {
  const [builderOpen, setBuilderOpen] = useState(false);

  // Active panel list based on whether we are editing universal or an override
  const isOverrideActive = activeEditingState !== "UNIVERSAL";
  const stateOverride = isOverrideActive ? layout.stateOverrides?.[activeEditingState] : null;
  const currentPanels = isOverrideActive && stateOverride?.enabled ? stateOverride.panels : layout.panels;

  const setPanelsForCurrentState = (newPanels: PanelDefinition[]) => {
    if (!isOverrideActive) {
      onChange({ ...layout, panels: newPanels });
    } else {
      const overrides = { ...layout.stateOverrides };
      overrides[activeEditingState] = {
        enabled: true,
        panels: newPanels,
      };
      onChange({ ...layout, stateOverrides: overrides });
    }
  };

  const toggleStateOverride = () => {
    if (!isOverrideActive) return;
    const overrides = { ...layout.stateOverrides };
    const currentStatus = overrides[activeEditingState]?.enabled ?? false;

    if (!currentStatus) {
      // Copy universal panels as starting point
      overrides[activeEditingState] = {
        enabled: true,
        panels: JSON.parse(JSON.stringify(layout.panels)),
      };
    } else {
      overrides[activeEditingState] = {
        enabled: false,
        panels: [],
      };
    }
    onChange({ ...layout, stateOverrides: overrides });
  };

  const copyUniversalToCurrent = () => {
    if (!isOverrideActive) return;
    const overrides = { ...layout.stateOverrides };
    overrides[activeEditingState] = {
      enabled: true,
      panels: JSON.parse(JSON.stringify(layout.panels)),
    };
    onChange({ ...layout, stateOverrides: overrides });
  };

  const updatePanel = (index: number, updated: PanelDefinition) => {
    const nextPanels = [...currentPanels];
    nextPanels[index] = updated;
    setPanelsForCurrentState(nextPanels);
  };

  const removePanel = (index: number) => {
    const nextPanels = currentPanels.filter((_, i) => i !== index);
    setPanelsForCurrentState(nextPanels);
  };

  const addPanel = () => {
    const newPanel: PanelDefinition = {
      id: `panel_${Date.now() % 1000}`,
      name: "New Custom Panel",
      anchor: "CENTER_FLEX",
      backgroundColor: "bgPanel",
      borderColor: "borderNormal",
      layoutDirection: "VERTICAL",
      gap: 6,
      padding: 6,
      widgets: [],
    };
    setPanelsForCurrentState([...currentPanels, newPanel]);
  };

  const toggleWidgetInPanel = (panelIndex: number, widgetId: string) => {
    const panel = currentPanels[panelIndex];
    const exists = panel.widgets.includes(widgetId);
    const updatedWidgets = exists
      ? panel.widgets.filter((w) => w !== widgetId)
      : [...panel.widgets, widgetId];

    updatePanel(panelIndex, { ...panel, widgets: updatedWidgets });
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto pr-2 space-y-4 select-none">
      {/* State Mode Switcher (Universal vs State Override) */}
      <div className="bg-[#1c1a24] p-4 rounded-xl border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
            <Sliders className="w-4 h-4" />
            <span>Active Layout Scope</span>
          </div>
          {isOverrideActive && (
            <button
              onClick={toggleStateOverride}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                stateOverride?.enabled
                  ? "bg-amber-600 hover:bg-amber-500 text-white"
                  : "bg-purple-900/40 text-purple-300 border border-purple-500/30 hover:bg-purple-800/40"
              }`}
            >
              {stateOverride?.enabled ? "Using State Override" : "+ Create State Override"}
            </button>
          )}
        </div>

        {/* State Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          {(["UNIVERSAL", "EXPLORATION", "SCENE", "SEX", "COMBAT", "INVENTORY"] as GameSimulationState[]).map(
            (st) => {
              const isSelected = activeEditingState === st;
              const hasCustomOverride = st !== "UNIVERSAL" && layout.stateOverrides?.[st]?.enabled;

              return (
                <button
                  key={st}
                  onClick={() => onSelectEditingState(st)}
                  className={`py-1.5 px-2 rounded-lg font-medium transition text-center truncate border ${
                    isSelected
                      ? "bg-purple-600 border-purple-400 text-white shadow-sm"
                      : "bg-black/30 border-white/5 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {st} {hasCustomOverride && "★"}
                </button>
              );
            }
          )}
        </div>

        {isOverrideActive && stateOverride?.enabled && (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5 text-amber-300">
            <span>Editing custom override for {activeEditingState}</span>
            <button
              onClick={copyUniversalToCurrent}
              className="flex items-center gap-1 text-slate-400 hover:text-white"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Reset from Universal</span>
            </button>
          </div>
        )}
      </div>

      {/* Widget Creator Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 to-indigo-950/40 p-4 rounded-xl border border-purple-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-xs text-slate-100">Custom Widget Composer</h3>
            <p className="text-[11px] text-purple-300">Build your own custom modular widgets</p>
          </div>
        </div>
        <button
          onClick={() => setBuilderOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-purple-600/20 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Widget</span>
        </button>
      </div>

      {/* Layout Global Header */}
      <div className="bg-[#1c1a24] p-4 rounded-xl border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
            <LayoutGrid className="w-4 h-4" />
            <span>Panels & Containers ({currentPanels.length})</span>
          </div>
          <button
            onClick={addPanel}
            className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/15 text-slate-200 rounded text-xs font-medium transition"
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
              className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded text-xs text-slate-100 font-medium"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Panel Margin Gap (px)</label>
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
        {currentPanels.map((panel, idx) => (
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

            {/* Sizing & Direction Constraints */}
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

              <div>
                <label className="text-slate-400 text-[11px] block">Stack Direction</label>
                <div className="flex gap-1">
                  <button
                    onClick={() => updatePanel(idx, { ...panel, layoutDirection: "VERTICAL" })}
                    className={`flex-1 flex items-center justify-center p-1 rounded border text-xs ${
                      panel.layoutDirection !== "HORIZONTAL"
                        ? "bg-purple-600 border-purple-400 text-white"
                        : "bg-black/40 border-white/10 text-slate-400"
                    }`}
                    title="Vertical Stacking"
                  >
                    <MoveVertical className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => updatePanel(idx, { ...panel, layoutDirection: "HORIZONTAL" })}
                    className={`flex-1 flex items-center justify-center p-1 rounded border text-xs ${
                      panel.layoutDirection === "HORIZONTAL"
                        ? "bg-purple-600 border-purple-400 text-white"
                        : "bg-black/40 border-white/10 text-slate-400"
                    }`}
                    title="Horizontal Stacking"
                  >
                    <MoveHorizontal className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Assigned Modular Widgets */}
            <div>
              <label className="text-slate-400 text-[11px] block mb-1.5 font-medium">
                Active Widgets in Panel ({panel.widgets.length}):
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {availableWidgets.map((w) => {
                  const active = panel.widgets.includes(w.id);
                  return (
                    <button
                      key={w.id}
                      onClick={() => toggleWidgetInPanel(idx, w.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-left transition border ${
                        active
                          ? "bg-purple-950/50 border-purple-500/50 text-purple-200 shadow-sm"
                          : "bg-black/20 border-white/5 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {active ? (
                        <CheckSquare className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      )}
                      <div className="truncate">
                        <div className="text-[11px] font-medium leading-tight truncate">{w.name}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Widget Composer Modal */}
      <CustomWidgetBuilderModal
        isOpen={builderOpen}
        onClose={() => setBuilderOpen(false)}
        onSave={(w) => onAddCustomWidget(w)}
      />
    </div>
  );
};
