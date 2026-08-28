import React, { useState } from "react";
import { ThemeFile, colorToCss } from "../types/theme";
import { LayoutFile, GameSimulationState, PanelDefinition } from "../types/layout";
import { CustomWidgetDefinition } from "../types/elements";
import { AtomicElementRenderer } from "./AtomicElementRenderer";
import { Trash2, Plus, ArrowUp, ArrowDown, Layers, Columns, Rows, X } from "lucide-react";

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
  const [draggedWidgetIndex, setDraggedWidgetIndex] = useState<{ panelId: string; index: number } | null>(null);
  const [activePickerPanelId, setActivePickerPanelId] = useState<string | null>(null);

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

  // Group panels into Top Rows, Middle Columns, and Bottom Rows
  const topPanels = activePanels.filter((p) => p.anchor === "TOP_BAR");
  const bottomPanels = activePanels.filter((p) => p.anchor === "BOTTOM_BAR");
  const middlePanels = activePanels.filter(
    (p) => p.anchor === "LEFT_SIDEBAR" || p.anchor === "CENTER_FLEX" || p.anchor === "RIGHT_SIDEBAR"
  );

  // Add / Delete Box Helpers
  const handleAddBox = (type: "TOP" | "MIDDLE" | "BOTTOM") => {
    const id = `box_${Date.now() % 10000}`;
    let newPanel: PanelDefinition;

    if (type === "TOP") {
      newPanel = {
        id,
        name: `Top Bar ${topPanels.length + 1}`,
        anchor: "TOP_BAR",
        fixedHeight: 65,
        backgroundColor: "bgHeader",
        borderColor: "borderNormal",
        layoutDirection: "HORIZONTAL",
        widgets: [],
      };
    } else if (type === "BOTTOM") {
      newPanel = {
        id,
        name: `Bottom Bar ${bottomPanels.length + 1}`,
        anchor: "BOTTOM_BAR",
        fixedHeight: 140,
        backgroundColor: "bgPanel",
        borderColor: "borderNormal",
        layoutDirection: "VERTICAL",
        widgets: [],
      };
    } else {
      newPanel = {
        id,
        name: `Middle Box ${middlePanels.length + 1}`,
        anchor: middlePanels.length === 0 ? "CENTER_FLEX" : "LEFT_SIDEBAR",
        fixedWidth: 280,
        backgroundColor: "bgPanel",
        borderColor: "borderNormal",
        layoutDirection: "VERTICAL",
        widgets: [],
      };
    }

    updatePanels([...activePanels, newPanel]);
  };

  const handleDeleteBox = (panelId: string) => {
    if (confirm("Delete this box container?")) {
      updatePanels(activePanels.filter((p) => p.id !== panelId));
    }
  };

  // Interactive Border Drag Resizers
  const startHorizontalResize = (panelId: string, currentHeight: number, startY: number, isTop: boolean) => {
    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientY - startY;
      const nextHeight = Math.max(36, Math.min(500, isTop ? currentHeight + delta : currentHeight - delta));
      updatePanels(
        activePanels.map((p) => (p.id === panelId ? { ...p, fixedHeight: nextHeight } : p))
      );
    };
    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const startVerticalResize = (panelId: string, currentWidth: number, startX: number, isLeft: boolean) => {
    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startX;
      const nextWidth = Math.max(140, Math.min(800, isLeft ? currentWidth + delta : currentWidth - delta));
      updatePanels(
        activePanels.map((p) => (p.id === panelId ? { ...p, fixedWidth: nextWidth } : p))
      );
    };
    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Drag & Drop Handlers for Widgets
  const handlePanelDragOver = (e: React.DragEvent, panelId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if (dragOverPanelId !== panelId) {
      setDragOverPanelId(panelId);
    }
  };

  const handlePanelDragLeave = () => {
    setDragOverPanelId(null);
  };

  const handlePanelDrop = (e: React.DragEvent, panelId: string, insertIndex?: number) => {
    e.preventDefault();
    setDragOverPanelId(null);

    const widgetId = e.dataTransfer.getData("text/plain");

    if (draggedWidgetIndex) {
      const { panelId: srcPanelId, index: srcIndex } = draggedWidgetIndex;
      setDraggedWidgetIndex(null);

      if (srcPanelId === panelId) {
        const targetIdx = insertIndex !== undefined ? insertIndex : activePanels.find(p => p.id === panelId)!.widgets.length;
        const nextPanels = activePanels.map((p) => {
          if (p.id === panelId) {
            const nextWidgets = [...p.widgets];
            const item = nextWidgets.splice(srcIndex, 1)[0];
            nextWidgets.splice(targetIdx, 0, item);
            return { ...p, widgets: nextWidgets };
          }
          return p;
        });
        updatePanels(nextPanels);
        return;
      } else {
        const nextPanels = activePanels.map((p) => {
          if (p.id === srcPanelId) {
            const nextWidgets = [...p.widgets];
            nextWidgets.splice(srcIndex, 1);
            return { ...p, widgets: nextWidgets };
          }
          if (p.id === panelId) {
            const nextWidgets = [...p.widgets];
            const targetIdx = insertIndex !== undefined ? insertIndex : nextWidgets.length;
            nextWidgets.splice(targetIdx, 0, widgetId);
            return { ...p, widgets: nextWidgets };
          }
          return p;
        });
        updatePanels(nextPanels);
        return;
      }
    }

    if (!widgetId) return;

    const nextPanels = activePanels.map((p) => {
      if (p.id === panelId) {
        const nextWidgets = [...p.widgets];
        if (insertIndex !== undefined) {
          nextWidgets.splice(insertIndex, 0, widgetId);
        } else {
          nextWidgets.push(widgetId);
        }
        return {
          ...p,
          widgets: nextWidgets,
        };
      }
      return p;
    });

    updatePanels(nextPanels);
  };

  const handleAddWidgetDirectly = (panelId: string, widgetId: string) => {
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
    setActivePickerPanelId(null);
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

  const handleMoveWidget = (panelId: string, index: number, up: boolean) => {
    const target = up ? index - 1 : index + 1;
    const panel = activePanels.find((p) => p.id === panelId);
    if (!panel || target < 0 || target >= panel.widgets.length) return;

    const nextPanels = activePanels.map((p) => {
      if (p.id === panelId) {
        const nextWidgets = [...p.widgets];
        const temp = nextWidgets[index];
        nextWidgets[index] = nextWidgets[target];
        nextWidgets[target] = temp;
        return { ...p, widgets: nextWidgets };
      }
      return p;
    });
    updatePanels(nextPanels);
  };

  // Render Panel Box Content with Scroll and Drop
  const renderPanelBox = (panel: PanelDefinition) => {
    const isDragHover = dragOverPanelId === panel.id;

    return (
      <div
        onDragOver={(e) => handlePanelDragOver(e, panel.id)}
        onDragLeave={handlePanelDragLeave}
        onDrop={(e) => handlePanelDrop(e, panel.id)}
        className="h-full w-full flex flex-col justify-start relative select-none overflow-hidden"
      >
        {/* Panel Action Header */}
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/5 shrink-0 px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              {panel.name || panel.id}
            </span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-black/40 text-purple-300 font-mono">
              {panel.widgets.length} {panel.widgets.length === 1 ? "widget" : "widgets"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                onClick={() => setActivePickerPanelId(activePickerPanelId === panel.id ? null : panel.id)}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/40 hover:bg-purple-950 text-[10px] text-purple-300 border border-white/5 transition"
                title="Add widget"
              >
                <Plus className="w-2.5 h-2.5" />
                <span>Add</span>
              </button>

              {/* Quick Picker Popup */}
              {activePickerPanelId === panel.id && (
                <div className="absolute right-0 top-6 w-56 max-h-64 overflow-y-auto bg-[#221f2d] border border-purple-500/40 rounded-xl shadow-2xl z-50 p-2 space-y-1">
                  <div className="text-[10px] font-bold text-purple-300 px-2 py-1 uppercase tracking-wider">
                    Pick Widget to Add:
                  </div>
                  {availableWidgets.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => handleAddWidgetDirectly(panel.id, w.id)}
                      className="w-full text-left p-1.5 rounded-lg hover:bg-purple-600/30 text-xs text-slate-200 flex items-center justify-between group transition"
                    >
                      <span className="truncate">{w.name}</span>
                      <Plus className="w-3 h-3 text-purple-400 opacity-0 group-hover:opacity-100 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => handleDeleteBox(panel.id)}
              className="p-1 text-slate-500 hover:text-rose-400 rounded transition"
              title="Delete Box"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Container */}
        <div
          className={`flex-1 w-full overflow-y-auto overflow-x-hidden pr-0.5 flex ${
            panel.layoutDirection === "HORIZONTAL" ? "flex-row items-center flex-wrap" : "flex-col"
          } gap-2 rounded transition-all min-h-0 ${
            isDragHover ? "ring-2 ring-purple-500/50 bg-purple-950/20" : ""
          }`}
        >
          {panel.widgets.length === 0 ? (
            <div className="h-full flex-1 min-h-[50px] flex flex-col items-center justify-center p-3 rounded-lg border-2 border-dashed border-white/10 text-slate-500 hover:border-purple-500/40 hover:text-purple-300 transition-all text-center">
              <Plus className="w-3.5 h-3.5 text-purple-400 mb-0.5" />
              <span className="text-[11px] font-semibold">Drop Widgets Here</span>
            </div>
          ) : (
            <>
              {panel.widgets.map((wId, idx) => {
                const widgetDef = availableWidgets.find((w) => w.id === wId);
                if (!widgetDef) return null;

                return (
                  <div
                    key={`${wId}_${idx}`}
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", wId);
                      setDraggedWidgetIndex({ panelId: panel.id, index: idx });
                    }}
                    className="relative group/widget p-2 rounded-xl bg-black/35 border border-white/10 hover:border-purple-500/40 transition shadow-sm w-full shrink-0"
                  >
                    {/* Widget Action Bar */}
                    <div className="flex items-center justify-between mb-1 pb-1 border-b border-white/5">
                      <div className="flex items-center gap-1.5 text-[10px] text-purple-300 font-semibold truncate">
                        <Layers className="w-3 h-3 text-purple-400 shrink-0" />
                        <span className="truncate">{widgetDef.name}</span>
                      </div>

                      <div className="flex items-center gap-1 opacity-60 group-hover/widget:opacity-100 transition">
                        <button
                          onClick={() => handleMoveWidget(panel.id, idx, true)}
                          disabled={idx === 0}
                          className="p-0.5 text-slate-400 hover:text-white disabled:opacity-20"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleMoveWidget(panel.id, idx, false)}
                          disabled={idx === panel.widgets.length - 1}
                          className="p-0.5 text-slate-400 hover:text-white disabled:opacity-20"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleRemoveWidget(panel.id, idx)}
                          className="p-0.5 text-slate-400 hover:text-rose-400"
                          title="Remove widget"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Rendered Elements inside Widget */}
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

              {/* Bottom Quick Drop Slot */}
              <div
                onDragOver={(e) => handlePanelDragOver(e, panel.id)}
                onDragLeave={handlePanelDragLeave}
                onDrop={(e) => handlePanelDrop(e, panel.id)}
                className="w-full py-1.5 flex items-center justify-center rounded border border-dashed border-white/5 hover:border-purple-500/40 text-[10px] text-slate-500 hover:text-purple-300 transition shrink-0"
              >
                + Drop another widget
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col space-y-3 select-none overflow-hidden">
      {/* Simulation Viewport Controls & Add Box Bar */}
      <div className="flex items-center justify-between bg-[#1c1a24] px-4 py-2 rounded-xl border border-white/10 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Test State:</span>
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

        {/* Box Creation Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleAddBox("TOP")}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-black/40 hover:bg-purple-950/60 border border-white/10 text-slate-300 hover:text-purple-300 text-[11px] font-medium transition"
          >
            <Rows className="w-3 h-3 text-purple-400" />
            <span>+ Top Box</span>
          </button>
          <button
            onClick={() => handleAddBox("MIDDLE")}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-black/40 hover:bg-purple-950/60 border border-white/10 text-slate-300 hover:text-purple-300 text-[11px] font-medium transition"
          >
            <Columns className="w-3 h-3 text-purple-400" />
            <span>+ Middle Column Box</span>
          </button>
          <button
            onClick={() => handleAddBox("BOTTOM")}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-black/40 hover:bg-purple-950/60 border border-white/10 text-slate-300 hover:text-purple-300 text-[11px] font-medium transition"
          >
            <Rows className="w-3 h-3 text-purple-400" />
            <span>+ Bottom Box</span>
          </button>
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
            21:9
          </button>
        </div>
      </div>

      {/* Live Game Mockup Canvas */}
      <div
        className="flex-1 w-full rounded-xl overflow-hidden border shadow-2xl flex flex-col p-2 relative font-sans transition-all min-h-0"
        style={{
          backgroundColor: colorToCss(colors.bgDark),
          borderColor: colorToCss(colors.borderNormal),
          borderWidth: borderW,
        }}
      >
        {/* Top Boxes List */}
        {topPanels.map((p) => {
          const currentH = p.fixedHeight || 65;
          return (
            <React.Fragment key={p.id}>
              <div
                className="w-full border mb-1.5 p-2 flex flex-col transition-all overflow-hidden shrink-0"
                style={{
                  height: `${currentH}px`,
                  backgroundColor: colorToCss(colors.bgHeader, opacity),
                  borderColor: colorToCss(colors.borderNormal),
                  borderRadius: radius,
                  borderWidth: borderW,
                }}
              >
                {renderPanelBox(p)}
              </div>
              {/* Horizontal Resizing Divider Line */}
              <div
                onMouseDown={(e) => startHorizontalResize(p.id, currentH, e.clientY, true)}
                className="w-full h-1.5 cursor-row-resize hover:bg-purple-500/40 active:bg-purple-500 rounded my-0.5 transition"
                title="Drag to resize box height"
              />
            </React.Fragment>
          );
        })}

        {/* Middle Columns List (Left, Center, Right, and extra columns) */}
        <div className="flex-1 flex min-h-0 overflow-hidden relative">
          {middlePanels.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl text-slate-500 p-8">
              <Columns className="w-8 h-8 text-purple-400 mb-2" />
              <span className="text-sm font-semibold">No Middle Columns Present</span>
              <p className="text-xs text-slate-500 mb-3">Add 1 or more middle columns to place widgets</p>
              <button
                onClick={() => handleAddBox("MIDDLE")}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
              >
                + Add Middle Column
              </button>
            </div>
          ) : (
            middlePanels.map((p, idx) => {
              const isCenterFlex = p.anchor === "CENTER_FLEX";
              const currentW = p.fixedWidth || 280;

              return (
                <React.Fragment key={p.id}>
                  <div
                    className="border p-2 flex flex-col transition-all overflow-hidden min-h-0"
                    style={{
                      flex: isCenterFlex ? 1 : undefined,
                      width: !isCenterFlex ? `${currentW}px` : undefined,
                      backgroundColor: colorToCss(colors.bgPanel, opacity),
                      borderColor: colorToCss(colors.borderNormal),
                      borderRadius: radius,
                      borderWidth: borderW,
                    }}
                  >
                    {renderPanelBox(p)}
                  </div>

                  {/* Vertical Resizing Divider Line between columns */}
                  {idx < middlePanels.length - 1 && (
                    <div
                      onMouseDown={(e) => startVerticalResize(p.id, currentW, e.clientX, true)}
                      className="w-1.5 h-full cursor-col-resize hover:bg-purple-500/40 active:bg-purple-500 rounded mx-0.5 transition shrink-0"
                      title="Drag to resize column width"
                    />
                  )}
                </React.Fragment>
              );
            })
          )}
        </div>

        {/* Bottom Boxes List */}
        {bottomPanels.map((p) => {
          const currentH = p.fixedHeight || 140;
          return (
            <React.Fragment key={p.id}>
              {/* Horizontal Resizing Divider Line */}
              <div
                onMouseDown={(e) => startHorizontalResize(p.id, currentH, e.clientY, false)}
                className="w-full h-1.5 cursor-row-resize hover:bg-purple-500/40 active:bg-purple-500 rounded my-0.5 transition"
                title="Drag to resize bottom box height"
              />
              <div
                className="w-full border p-2 flex flex-col transition-all shrink-0 overflow-hidden"
                style={{
                  height: `${currentH}px`,
                  backgroundColor: colorToCss(colors.bgPanel, opacity),
                  borderColor: colorToCss(colors.borderNormal),
                  borderRadius: radius,
                  borderWidth: borderW,
                }}
              >
                {renderPanelBox(p)}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
