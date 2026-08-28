import React, { useState } from "react";
import { LayoutFile, GameSimulationState, BLANK_LAYOUT, PRESET_DEFAULT_POPULATED_LAYOUT } from "../types/layout";
import { CustomWidgetDefinition } from "../types/elements";
import { Plus, GripVertical, Layers, Sliders, Box } from "lucide-react";
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
  const [editingWidget, setEditingWidget] = useState<CustomWidgetDefinition | undefined>(undefined);

  // State Overrides
  const isOverrideActive = activeEditingState !== "UNIVERSAL";
  const stateOverride = isOverrideActive ? layout.stateOverrides?.[activeEditingState] : null;

  const toggleStateOverride = () => {
    if (!isOverrideActive) return;
    const overrides = { ...layout.stateOverrides };
    const currentStatus = overrides[activeEditingState]?.enabled ?? false;

    if (!currentStatus) {
      overrides[activeEditingState] = {
        enabled: true,
        rootNode: JSON.parse(JSON.stringify(layout.rootNode)),
      };
    } else {
      overrides[activeEditingState] = {
        enabled: false,
        rootNode: { id: "box_empty", type: "LEAF", widgets: [] },
      };
    }
    onChange({ ...layout, stateOverrides: overrides });
  };

  const handleWidgetDragStart = (e: React.DragEvent, widgetId: string) => {
    e.dataTransfer.setData("text/plain", widgetId);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleBoxDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("layout-container", "EMPTY_BOX");
    e.dataTransfer.effectAllowed = "copy";
  };

  const resetToBlank = () => {
    if (confirm("Reset layout to completely blank?")) {
      onChange(JSON.parse(JSON.stringify(BLANK_LAYOUT)));
    }
  };

  const loadDefaultPreset = () => {
    if (confirm("Load default Lilith textRPG layout preset?")) {
      onChange(JSON.parse(JSON.stringify(PRESET_DEFAULT_POPULATED_LAYOUT)));
    }
  };

  return (
    <div className="h-full flex flex-col space-y-3 select-none overflow-hidden pr-1">
      {/* State Mode Switcher & Presets */}
      <div className="bg-[#1c1a24] p-3 rounded-xl border border-white/10 space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-purple-400 font-semibold text-xs">
            <Sliders className="w-3.5 h-3.5" />
            <span>State Scope</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={resetToBlank}
              className="px-2 py-0.5 rounded bg-black/40 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-white/5 transition text-[11px]"
              title="Clear all panels and start blank"
            >
              Clear Blank
            </button>
            <button
              onClick={loadDefaultPreset}
              className="px-2 py-0.5 rounded bg-black/40 hover:bg-purple-950/40 text-slate-400 hover:text-purple-300 border border-white/5 transition text-[11px]"
              title="Load Lilith layout preset"
            >
              Load Preset
            </button>
          </div>
        </div>

        {/* State Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 text-[11px]">
          {(["UNIVERSAL", "EXPLORATION", "SCENE", "SEX", "COMBAT", "INVENTORY"] as GameSimulationState[]).map(
            (st) => {
              const isSelected = activeEditingState === st;
              const hasCustomOverride = st !== "UNIVERSAL" && layout.stateOverrides?.[st]?.enabled;

              return (
                <button
                  key={st}
                  onClick={() => onSelectEditingState(st)}
                  className={`py-1 px-1.5 rounded-lg font-medium transition text-center truncate border ${
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

        {isOverrideActive && (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
            <span className="text-amber-300 text-[11px]">Override for {activeEditingState}:</span>
            <button
              onClick={toggleStateOverride}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                stateOverride?.enabled
                  ? "bg-amber-600 text-white"
                  : "bg-purple-900/40 text-purple-300 border border-purple-500/30"
              }`}
            >
              {stateOverride?.enabled ? "Active" : "+ Enable"}
            </button>
          </div>
        )}
      </div>

      {/* Draggable Freeform Box Creator */}
      <div className="bg-[#1c1a24] p-3 rounded-xl border border-white/10 space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Layout Box Tool
          </span>
          <span className="text-[10px] text-purple-400">Drag onto canvas</span>
        </div>

        <div
          draggable={true}
          onDragStart={handleBoxDragStart}
          className="p-3 rounded-xl bg-black/40 border border-white/10 hover:border-purple-500/70 hover:bg-purple-950/30 cursor-grab active:cursor-grabbing transition group flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 group-hover:scale-105 transition">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-xs text-slate-100 group-hover:text-purple-200">
                + Empty Box
              </div>
              <div className="text-[10px] text-slate-400">Drag & drop anywhere on canvas</div>
            </div>
          </div>
          <GripVertical className="w-4 h-4 text-slate-600 group-hover:text-purple-400 shrink-0" />
        </div>
      </div>

      {/* Widget Creator Button */}
      <div className="bg-[#1c1a24] p-3 rounded-xl border border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-semibold text-xs text-slate-100 block">Widget Composer</span>
            <span className="text-[10px] text-purple-300">Build custom modular widgets</span>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingWidget(undefined);
            setBuilderOpen(true);
          }}
          className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-purple-600/20 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Widget</span>
        </button>
      </div>

      {/* Scrollable Widget Library Drawer */}
      <div className="flex-1 flex flex-col space-y-2 overflow-hidden bg-[#1c1a24] p-3 rounded-xl border border-white/10 min-h-0">
        <div className="flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Available Widgets ({availableWidgets.length})
          </span>
          <span className="text-[10px] text-purple-400">Drag into any box</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {availableWidgets.map((w) => (
            <div
              key={w.id}
              draggable={true}
              onDragStart={(e) => handleWidgetDragStart(e, w.id)}
              className="p-2.5 rounded-xl bg-black/40 border border-white/10 hover:border-purple-500/60 hover:bg-purple-950/20 cursor-grab active:cursor-grabbing transition group shadow-sm flex flex-col space-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <GripVertical className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 shrink-0" />
                  <span className="font-semibold text-xs text-slate-100 group-hover:text-purple-200">
                    {w.name}
                  </span>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ${
                    w.isPremade ? "bg-blue-950 text-blue-300" : "bg-purple-950 text-purple-300"
                  }`}
                >
                  {w.isPremade ? "Premade" : "Custom"}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-tight pl-5">{w.description}</p>

              {/* Elements preview pill list */}
              <div className="flex flex-wrap gap-1 pl-5 pt-0.5">
                {w.elements.map((el) => (
                  <span
                    key={el.id}
                    className="text-[9px] px-1.5 py-0.2 rounded bg-black/50 border border-white/5 text-slate-400 font-mono"
                  >
                    {el.label || el.type}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Widget Composer Modal */}
      <CustomWidgetBuilderModal
        isOpen={builderOpen}
        onClose={() => setBuilderOpen(false)}
        onSave={(w) => onAddCustomWidget(w)}
        initialWidget={editingWidget}
      />
    </div>
  );
};
