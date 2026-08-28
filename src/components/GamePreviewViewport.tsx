import React, { useState } from "react";
import { ThemeFile, colorToCss } from "../types/theme";
import { LayoutFile, GameSimulationState } from "../types/layout";
import { CustomWidgetDefinition } from "../types/elements";
import { AtomicElementRenderer } from "./AtomicElementRenderer";

interface GamePreviewViewportProps {
  theme: ThemeFile;
  layout: LayoutFile;
  availableWidgets: CustomWidgetDefinition[];
  activeState: GameSimulationState;
  onSelectState: (st: GameSimulationState) => void;
}

export const GamePreviewViewport: React.FC<GamePreviewViewportProps> = ({
  theme,
  layout,
  availableWidgets,
  activeState,
  onSelectState,
}) => {
  const [resolution, setResolution] = useState<"HD" | "FHD" | "ULTRAWIDE">("HD");

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

  const topPanel = activePanels.find((p) => p.anchor === "TOP_BAR");
  const bottomPanel = activePanels.find((p) => p.anchor === "BOTTOM_BAR");
  const leftPanel = activePanels.find((p) => p.anchor === "LEFT_SIDEBAR");
  const rightPanel = activePanels.find((p) => p.anchor === "RIGHT_SIDEBAR");
  const centerPanel = activePanels.find((p) => p.anchor === "CENTER_FLEX");

  const topHeight = topPanel?.fixedHeight || 38;
  const bottomHeight = bottomPanel?.fixedHeight || 140;
  const leftWidth = leftPanel?.fixedWidth || 320;
  const rightWidth = rightPanel?.fixedWidth || 300;

  // Helper to render widgets inside a panel
  const renderPanelWidgets = (widgetIds: string[], layoutDir: "VERTICAL" | "HORIZONTAL" = "VERTICAL") => {
    if (widgetIds.length === 0) {
      return (
        <div className="h-full flex items-center justify-center p-4 border border-dashed border-white/10 rounded text-center text-xs text-slate-500">
          Empty Panel — assign widgets in the Layout tab
        </div>
      );
    }

    return (
      <div
        className={`w-full flex ${
          layoutDir === "HORIZONTAL" ? "flex-row items-center" : "flex-col"
        } gap-2`}
      >
        {widgetIds.map((wId) => {
          const widgetDef = availableWidgets.find((w) => w.id === wId);
          if (!widgetDef) return null;

          return (
            <div
              key={wId}
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
          <span className="text-slate-400 font-semibold">Test Simulation State:</span>
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
          <span className="text-slate-400">Resolution:</span>
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

      {/* Live Game Frame Mockup */}
      <div
        className="flex-1 w-full rounded-xl overflow-hidden border shadow-2xl flex flex-col p-2 relative font-sans transition-all"
        style={{
          backgroundColor: colorToCss(colors.bgDark),
          borderColor: colorToCss(colors.borderNormal),
          borderWidth: borderW,
        }}
      >
        {/* Top Status Bar */}
        {topPanel && (
          <div
            className="w-full flex items-center px-3 border mb-1.5 transition-all"
            style={{
              height: `${topHeight}px`,
              backgroundColor: colorToCss(colors.bgHeader, opacity),
              borderColor: colorToCss(colors.borderNormal),
              borderRadius: radius,
              borderWidth: borderW,
            }}
          >
            {renderPanelWidgets(topPanel.widgets, topPanel.layoutDirection || "HORIZONTAL")}
          </div>
        )}

        {/* Middle Main Content Area */}
        <div className="flex-1 flex gap-1.5 min-h-0">
          {/* Left Sidebar */}
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
              {renderPanelWidgets(leftPanel.widgets, leftPanel.layoutDirection || "VERTICAL")}
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
              {renderPanelWidgets(centerPanel.widgets, centerPanel.layoutDirection || "VERTICAL")}
            </div>
          )}

          {/* Right Sidebar */}
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
              {renderPanelWidgets(rightPanel.widgets, rightPanel.layoutDirection || "VERTICAL")}
            </div>
          )}
        </div>

        {/* Bottom Action Commands Grid */}
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
            {renderPanelWidgets(bottomPanel.widgets, bottomPanel.layoutDirection || "VERTICAL")}
          </div>
        )}
      </div>
    </div>
  );
};
