import React, { useState } from "react";
import { ThemeFile, colorToCss } from "../types/theme";
import { LayoutFile, GameSimulationState, PanelDefinition } from "../types/layout";
import { CustomWidgetDefinition } from "../types/elements";
import { AtomicElementRenderer } from "./AtomicElementRenderer";
import { Trash2, Plus } from "lucide-react";

interface GamePreviewViewportProps {
  theme: ThemeFile;
  layout: LayoutFile;
  onChangeLayout: (updated: LayoutFile) => void;
  availableWidgets: CustomWidgetDefinition[];
  activeState: GameSimulationState;
  onSelectState: (st: GameSimulationState) => void;
}

export const GamePreviewViewport: React.FC<GamePreviewViewportProps> = ({
  theme,
  layout,
  onChangeLayout,
  availableWidgets,
  activeState,
  onSelectState,
}) => {
  const [resolution, setResolution] = useState<"HD" | "FHD" | "ULTRAWIDE">("HD");
  const [dragOverPanelId, setDragOverPanelId] = useState<string | null>(null);

  const colors = theme.colors;
  const radius = `${theme.borderRadius}px`;
  const borderW = `${theme.borderWidth}px`;
  const opacity = theme.panelOpacity / 100;

  // Resolve current active panels based on state override
  const isStateOverride =
    activeState !== "UNIVERSAL" && layout.stateOverrides?.[activeState]?.enabled;
  const activePanels = isStateOverride
    ? layout.stateOverrides![activeState]!.panels
    : layout.panels;

  const updatePanels = (newPanels: PanelDefinition[]) => {
    if (!isStateOverride) {
      onChangeLayout({ ...layout, panels: newPanels });
    } else {
      const overrides = { ...layout.stateOverrides };
      overrides[activeState] = {
        enabled: true,
        panels: newPanels,
      };
      onChangeLayout({ ...layout, stateOverrides: overrides });
    }
  };

  const topPanel = activePanels.find((p) => p.anchor === "TOP_BAR");
  const bottomPanel = activePanels.find((p) => p.anchor === "BOTTOM_BAR");
  const leftPanel = activePanels.find((p) => p.anchor === "LEFT_SIDEBAR");
  const rightPanel = activePanels.find((p) => p.anchor === "RIGHT_SIDEBAR");
  const centerPanel = activePanels.find((p) => p.anchor === "CENTER_FLEX");

  const topHeight = topPanel?.fixedHeight || 38;
  const bottomHeight = bottomPanel?.fixedHeight || 140;
  const leftWidth = leftPanel?.fixedWidth || 320;
  const rightWidth = rightPanel?.fixedWidth || 300;

  // Drop handlers for panels
  const handlePanelDragOver = (e: React.DragEvent, panelId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDragOverPanelId(panelId);
  };

  const handlePanelDragLeave = () => {
    setDragOverPanelId(null);
  };

  const handlePanelDrop = (e: React.DragEvent, panelId: string) => {
    e.preventDefault();
    setDragOverPanelId(null);

    const widgetId = e.dataTransfer.getData("text/plain");
    if (!widgetId) return;

    const nextPanels = activePanels.map((p) => {
      if (p.id === panelId) {
        return {
          ...p,
          widgets: [...p.widgets, widgetId],
        };
      }
      return p;
    });

    updatePanels(nextPanels);
  };

  const handleRemoveWidget = (panelId: string, widgetIndex: number) => {
    const nextPanels = activePanels.map((p) => {
      if (p.id === panelId) {
        const nextWidgets = [...p.widgets];
        nextWidgets.splice(widgetIndex, 1);
        return { ...p, widgets: nextWidgets };
      }
      return p;
    });
    updatePanels(nextPanels);
  };

  // Helper to render widgets inside a panel with drag-to-remove handles
  const renderPanelDropContent = (panel: PanelDefinition) => {
    const isDragHover = dragOverPanelId === panel.id;

    if (panel.widgets.length === 0) {
      return (
        <div
          onDragOver={(e) => handlePanelDragOver(e, panel.id)}
          onDragLeave={handlePanelDragLeave}
          onDrop={(e) => handlePanelDrop(e, panel.id)}
          className={`h-full min-h-[60px] flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed transition-all ${
            isDragHover
              ? "border-purple-500 bg-purple-950/40 text-purple-200 scale-[1.01]"
              : "border-white/10 text-slate-500 hover:border-white/20"
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-medium mb-0.5">
            <Plus className="w-3.5 h-3.5 text-purple-400" />
            <span>Drop Widgets Here</span>
          </div>
          <span className="text-[10px] text-slate-600">Drag from the widget library on the left</span>
        </div>
      );
    }

    return (
      <div
        onDragOver={(e) => handlePanelDragOver(e, panel.id)}
        onDragLeave={handlePanelDragLeave}
        onDrop={(e) => handlePanelDrop(e, panel.id)}
        className={`w-full flex ${
          panel.layoutDirection === "HORIZONTAL" ? "flex-row items-center" : "flex-col"
        } gap-2 rounded transition-all ${
          isDragHover ? "ring-2 ring-purple-500/50 bg-purple-950/20" : ""
        }`}
      >
        {panel.widgets.map((wId, idx) => {
          const widgetDef = availableWidgets.find((w) => w.id === wId);
          if (!widgetDef) return null;

          return (
            <div
              key={`${wId}_${idx}`}
              className="relative group/widget p-2 rounded bg-black/25 border border-white/5 hover:border-purple-500/30 transition shadow-sm w-full"
            >
              {/* Quick Remove & Info Header */}
              <div className="absolute top-1 right-1 opacity-0 group-hover/widget:opacity-100 flex items-center gap-1 bg-black/85 px-1.5 py-0.5 rounded border border-white/10 z-20 text-[10px]">
                <span className="text-purple-300 font-semibold">{widgetDef.name}</span>
                <button
                  onClick={() => handleRemoveWidget(panel.id, idx)}
                  className="text-slate-400 hover:text-rose-400 ml-1"
                  title="Remove from panel"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {/* Render Atomic Elements in Widget */}
              <div
                className={`w-full flex ${
                  widgetDef.layoutDirection === "HORIZONTAL"
                    ? "flex-row items-center justify-between"
                    : "flex-col"
                } gap-${widgetDef.gap / 2}`}
              >
                {widgetDef.elements.map((el) => (
                  <AtomicElementRenderer
                    key={el.id}
                    element={el}
                    theme={theme}
                    activeState={activeState === "UNIVERSAL" ? "EXPLORATION" : activeState}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col space-y-3 select-none">
      {/* Simulation Viewport Controls */}
      <div className="flex items-center justify-between bg-[#1c1a24] px-4 py-2 rounded-xl border border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Test State Viewport:</span>
          {(["UNIVERSAL", "EXPLORATION", "SCENE", "SEX", "COMBAT", "INVENTORY"] as GameSimulationState[]).map(
            (st) => (
              <button
                key={st}
                onClick={() => onSelectState(st)}
                className={`px-2.5 py-1 rounded-lg transition font-medium text-xs ${
                  activeState === st
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-black/30 text-slate-400 hover:text-slate-200"
                }`}
              >
                {st}
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Mock Resolution:</span>
          <button
            onClick={() => setResolution("HD")}
            className={`px-2 py-1 rounded ${resolution === "HD" ? "bg-white/15 text-white" : "text-slate-400"}`}
          >
            1280x720
          </button>
          <button
            onClick={() => setResolution("FHD")}
            className={`px-2 py-1 rounded ${resolution === "FHD" ? "bg-white/15 text-white" : "text-slate-400"}`}
          >
            1920x1080
          </button>
          <button
            onClick={() => setResolution("ULTRAWIDE")}
            className={`px-2 py-1 rounded ${resolution === "ULTRAWIDE" ? "bg-white/15 text-white" : "text-slate-400"}`}
          >
            21:9 Ultrawide
          </button>
        </div>
      </div>

      {/* Live Game Frame Mockup Canvas */}
      <div
        className="flex-1 w-full rounded-xl overflow-hidden border shadow-2xl flex flex-col p-2 relative font-sans transition-all"
        style={{
          backgroundColor: colorToCss(colors.bgDark),
          borderColor: colorToCss(colors.borderNormal),
          borderWidth: borderW,
        }}
      >
        {/* Top Status Bar Panel */}
        {topPanel && (
          <div
            className="w-full flex items-center px-3 border mb-1.5 transition-all overflow-hidden"
            style={{
              height: `${topHeight}px`,
              backgroundColor: colorToCss(colors.bgHeader, opacity),
              borderColor: colorToCss(colors.borderNormal),
              borderRadius: radius,
              borderWidth: borderW,
            }}
          >
            {renderPanelDropContent(topPanel)}
          </div>
        )}

        {/* Middle Main Content Area */}
        <div className="flex-1 flex gap-1.5 min-h-0">
          {/* Left Sidebar Panel */}
          {leftPanel && (
            <div
              className="border p-3 flex flex-col overflow-y-auto transition-all"
              style={{
                width: `${leftWidth}px`,
                backgroundColor: colorToCss(colors.bgPanel, opacity),
                borderColor: colorToCss(colors.borderNormal),
                borderRadius: radius,
                borderWidth: borderW,
              }}
            >
              {renderPanelDropContent(leftPanel)}
            </div>
          )}

          {/* Center Flex Panel */}
          {centerPanel && (
            <div
              className="flex-1 border p-4 flex flex-col overflow-y-auto transition-all"
              style={{
                backgroundColor: colorToCss(colors.bgPanel, opacity),
                borderColor: colorToCss(colors.borderNormal),
                borderRadius: radius,
                borderWidth: borderW,
              }}
            >
              {renderPanelDropContent(centerPanel)}
            </div>
          )}

          {/* Right Sidebar Panel */}
          {rightPanel && (
            <div
              className="border p-3 flex flex-col overflow-y-auto transition-all"
              style={{
                width: `${rightWidth}px`,
                backgroundColor: colorToCss(colors.bgPanel, opacity),
                borderColor: colorToCss(colors.borderNormal),
                borderRadius: radius,
                borderWidth: borderW,
              }}
            >
              {renderPanelDropContent(rightPanel)}
            </div>
          )}
        </div>

        {/* Bottom Action Commands Grid Panel */}
        {bottomPanel && (
          <div
            className="w-full border p-2 flex flex-col justify-between mt-1.5 transition-all"
            style={{
              height: `${bottomHeight}px`,
              backgroundColor: colorToCss(colors.bgPanel, opacity),
              borderColor: colorToCss(colors.borderNormal),
              borderRadius: radius,
              borderWidth: borderW,
            }}
          >
            {renderPanelDropContent(bottomPanel)}
          </div>
        )}
      </div>
    </div>
  );
};
