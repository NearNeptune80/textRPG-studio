import React, { useState, useRef } from "react";
import { ThemeFile, colorToCss } from "../types/theme";
import { LayoutFile, GameSimulationState, PanelDefinition } from "../types/layout";
import { CustomWidgetDefinition } from "../types/elements";
import { AtomicElementRenderer } from "./AtomicElementRenderer";
import { Trash2, Plus, ArrowUp, ArrowDown, X, Move, Maximize2 } from "lucide-react";

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

  const canvasRef = useRef<HTMLDivElement>(null);

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

  // Canvas Drop Handler (For placing new empty boxes anywhere)
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const containerType = e.dataTransfer.getData("layout-container");
    if (containerType !== "EMPTY_BOX") return;

    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPercent = Math.max(0.5, Math.min(75, Math.round((mouseX / rect.width) * 100 * 2) / 2));
    const yPercent = Math.max(0.5, Math.min(75, Math.round((mouseY / rect.height) * 100 * 2) / 2));

    const newPanel: PanelDefinition = {
      id: `box_${Date.now() % 10000}`,
      name: `Box ${activePanels.length + 1}`,
      x: xPercent,
      y: yPercent,
      width: 30,
      height: 35,
      layoutDirection: "VERTICAL",
      gap: 6,
      padding: 6,
      widgets: [],
    };

    updatePanels([...activePanels, newPanel]);
  };

  const handleDeleteBox = (panelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updatePanels(activePanels.filter((p) => p.id !== panelId));
  };

  // 2D Box Moving
  const startMoveBox = (panelId: string, initialX: number, initialY: number, startClientX: number, startClientY: number) => {
    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const targetElement = document.getElementById(`panel_${panelId}`);

    let currentX = initialX;
    let currentY = initialY;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaXPercent = ((e.clientX - startClientX) / canvasRect.width) * 100;
      const deltaYPercent = ((e.clientY - startClientY) / canvasRect.height) * 100;

      const panel = activePanels.find((p) => p.id === panelId);
      const w = panel?.width || 30;
      const h = panel?.height || 35;

      currentX = Math.max(0, Math.min(100 - w, Math.round((initialX + deltaXPercent) * 2) / 2));
      currentY = Math.max(0, Math.min(100 - h, Math.round((initialY + deltaYPercent) * 2) / 2));

      if (targetElement) {
        targetElement.style.left = `${currentX}%`;
        targetElement.style.top = `${currentY}%`;
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      updatePanels(
        activePanels.map((p) => (p.id === panelId ? { ...p, x: currentX, y: currentY } : p))
      );
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // 2D Box Resizing (Right, Bottom, Corner)
  const startResizeBox = (
    panelId: string,
    initialW: number,
    initialH: number,
    startClientX: number,
    startClientY: number,
    mode: "WIDTH" | "HEIGHT" | "CORNER"
  ) => {
    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const targetElement = document.getElementById(`panel_${panelId}`);

    let currentW = initialW;
    let currentH = initialH;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaXPercent = ((e.clientX - startClientX) / canvasRect.width) * 100;
      const deltaYPercent = ((e.clientY - startClientY) / canvasRect.height) * 100;

      const panel = activePanels.find((p) => p.id === panelId);
      const px = panel?.x || 0;
      const py = panel?.y || 0;

      if (mode === "WIDTH" || mode === "CORNER") {
        currentW = Math.max(10, Math.min(100 - px, Math.round((initialW + deltaXPercent) * 2) / 2));
      }
      if (mode === "HEIGHT" || mode === "CORNER") {
        currentH = Math.max(8, Math.min(100 - py, Math.round((initialH + deltaYPercent) * 2) / 2));
      }

      if (targetElement) {
        if (mode === "WIDTH" || mode === "CORNER") targetElement.style.width = `${currentW}%`;
        if (mode === "HEIGHT" || mode === "CORNER") targetElement.style.height = `${currentH}%`;
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      updatePanels(
        activePanels.map((p) =>
          p.id === panelId ? { ...p, width: currentW, height: currentH } : p
        )
      );
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Widget Drag & Drop inside Boxes
  const handlePanelDragOver = (e: React.DragEvent, panelId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    if (dragOverPanelId !== panelId) {
      setDragOverPanelId(panelId);
    }
  };

  const handlePanelDragLeave = () => {
    setDragOverPanelId(null);
  };

  const handlePanelDrop = (e: React.DragEvent, panelId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverPanelId(null);

    const widgetId = e.dataTransfer.getData("text/plain");

    if (draggedWidgetIndex) {
      const { panelId: srcPanelId, index: srcIndex } = draggedWidgetIndex;
      setDraggedWidgetIndex(null);

      if (srcPanelId === panelId) return;

      const nextPanels = activePanels.map((p) => {
        if (p.id === srcPanelId) {
          const nextWidgets = [...p.widgets];
          nextWidgets.splice(srcIndex, 1);
          return { ...p, widgets: nextWidgets };
        }
        if (p.id === panelId) {
          return { ...p, widgets: [...p.widgets, widgetId] };
        }
        return p;
      });
      updatePanels(nextPanels);
      return;
    }

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

  const handleRemoveWidget = (panelId: string, widgetIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleMoveWidget = (panelId: string, index: number, up: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
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

  return (
    <div className="h-full flex flex-col space-y-2.5 select-none overflow-hidden font-sans">
      {/* Simulation Viewport Controls */}
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

      {/* Freeform 2D Responsive Game Canvas */}
      <div
        ref={canvasRef}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }}
        onDrop={handleCanvasDrop}
        className="flex-1 w-full rounded-xl overflow-hidden border shadow-2xl relative transition-all min-h-0"
        style={{
          backgroundColor: colorToCss(colors.bgDark),
          borderColor: colorToCss(colors.borderNormal),
          borderWidth: borderW,
        }}
      >
        {/* Empty Canvas Guide (When no boxes exist) */}
        {activePanels.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-slate-500 pointer-events-none">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-semibold text-sm text-slate-200 mb-1">Canvas is Blank</span>
            <p className="text-xs text-slate-400 max-w-sm">
              Drag "+ Empty Box" from the left sidebar and drop it anywhere on the canvas to place custom boxes!
            </p>
          </div>
        )}

        {/* 2D Freeform Boxes */}
        {activePanels.map((panel) => {
          const isDragHover = dragOverPanelId === panel.id;

          return (
            <div
              key={panel.id}
              id={`panel_${panel.id}`}
              onDragOver={(e) => handlePanelDragOver(e, panel.id)}
              onDragLeave={handlePanelDragLeave}
              onDrop={(e) => handlePanelDrop(e, panel.id)}
              className="absolute border p-2 flex flex-col transition-all overflow-hidden group/box"
              style={{
                left: `${panel.x}%`,
                top: `${panel.y}%`,
                width: `${panel.width}%`,
                height: `${panel.height}%`,
                backgroundColor: colorToCss(colors.bgPanel, opacity),
                borderColor: colorToCss(colors.borderNormal),
                borderRadius: radius,
                borderWidth: borderW,
              }}
            >
              {/* Floating Hover Controls (Move Handle & Delete Button) */}
              <div className="absolute top-1.5 right-1.5 opacity-0 group-hover/box:opacity-100 flex items-center gap-1 z-30 transition bg-black/85 px-1.5 py-0.5 rounded border border-white/10 shadow-lg">
                <button
                  onMouseDown={(e) => startMoveBox(panel.id, panel.x, panel.y, e.clientX, e.clientY)}
                  className="p-0.5 text-slate-400 hover:text-purple-300 cursor-move"
                  title="Drag to reposition box anywhere"
                >
                  <Move className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => handleDeleteBox(panel.id, e)}
                  className="p-0.5 text-slate-400 hover:text-rose-400"
                  title="Delete Box"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Scrollable Widget Container */}
              <div
                className={`flex-1 w-full overflow-y-auto overflow-x-hidden pr-0.5 flex ${
                  panel.layoutDirection === "HORIZONTAL" ? "flex-row items-center flex-wrap" : "flex-col"
                } gap-2 rounded transition-all min-h-0 ${
                  isDragHover ? "ring-2 ring-purple-500/60 bg-purple-950/20" : ""
                }`}
              >
                {panel.widgets.length === 0 ? (
                  <div className="h-full flex-1 min-h-[48px] flex flex-col items-center justify-center p-3 rounded border-2 border-dashed border-white/10 text-slate-500 hover:border-purple-500/40 hover:text-purple-300 transition-all text-center">
                    <span className="text-[11px] font-medium flex items-center gap-1">
                      <Plus className="w-3 h-3 text-purple-400" />
                      <span>Drop Widget Here</span>
                    </span>
                  </div>
                ) : (
                  panel.widgets.map((wId, idx) => {
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
                        className="relative group/widget p-1.5 rounded transition shadow-sm w-full shrink-0"
                      >
                        {/* Hover Floating Widget Controls */}
                        <div className="absolute top-1 right-1 opacity-0 group-hover/widget:opacity-100 flex items-center gap-1 bg-black/90 px-1.5 py-0.5 rounded border border-white/10 z-20 text-[10px] shadow-lg">
                          <button
                            onClick={(e) => handleMoveWidget(panel.id, idx, true, e)}
                            disabled={idx === 0}
                            className="p-0.5 text-slate-400 hover:text-white disabled:opacity-20"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleMoveWidget(panel.id, idx, false, e)}
                            disabled={idx === panel.widgets.length - 1}
                            className="p-0.5 text-slate-400 hover:text-white disabled:opacity-20"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleRemoveWidget(panel.id, idx, e)}
                            className="p-0.5 text-slate-400 hover:text-rose-400"
                            title="Remove widget"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
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
                  })
                )}
              </div>

              {/* 2D Resize Handle - Right Border (Width) */}
              <div
                onMouseDown={(e) =>
                  startResizeBox(panel.id, panel.width, panel.height, e.clientX, e.clientY, "WIDTH")
                }
                className="absolute top-0 right-0 w-2 h-full cursor-ew-resize hover:bg-purple-500/40 transition"
                title="Drag to resize width"
              />

              {/* 2D Resize Handle - Bottom Border (Height) */}
              <div
                onMouseDown={(e) =>
                  startResizeBox(panel.id, panel.width, panel.height, e.clientX, e.clientY, "HEIGHT")
                }
                className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize hover:bg-purple-500/40 transition"
                title="Drag to resize height"
              />

              {/* 2D Resize Handle - Bottom-Right Corner (Width & Height) */}
              <div
                onMouseDown={(e) =>
                  startResizeBox(panel.id, panel.width, panel.height, e.clientX, e.clientY, "CORNER")
                }
                className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 cursor-nwse-resize text-slate-500 hover:text-purple-400 flex items-center justify-center transition"
                title="Drag to resize both width and height"
              >
                <Maximize2 className="w-2.5 h-2.5 rotate-90" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
