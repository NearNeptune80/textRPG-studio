import React, { useState, useRef } from "react";
import { ThemeFile, colorToCss } from "../types/theme";
import { LayoutFile, GameSimulationState, PanelDefinition } from "../types/layout";
import { CustomWidgetDefinition } from "../types/elements";
import { AtomicElementRenderer } from "./AtomicElementRenderer";
import { Trash2, Plus, ArrowUp, ArrowDown, X, Columns } from "lucide-react";

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
  const [dragOverInsertionIndex, setDragOverInsertionIndex] = useState<{ type: "COLUMN" | "ROW_TOP" | "ROW_BOTTOM"; index: number } | null>(null);
  const [draggedWidgetIndex, setDraggedWidgetIndex] = useState<{ panelId: string; index: number } | null>(null);

  // References for zero-lag smooth resizing
  const isResizingRef = useRef(false);

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

  // Add Box at specific position via drop
  const handleInsertBox = (type: "COLUMN" | "ROW_TOP" | "ROW_BOTTOM", index: number) => {
    const id = `box_${Date.now() % 10000}`;
    let newPanel: PanelDefinition;

    if (type === "ROW_TOP") {
      newPanel = {
        id,
        name: `Top Bar`,
        anchor: "TOP_BAR",
        fixedHeight: 65,
        backgroundColor: "bgHeader",
        borderColor: "borderNormal",
        layoutDirection: "HORIZONTAL",
        widgets: [],
      };
      updatePanels([newPanel, ...activePanels]);
    } else if (type === "ROW_BOTTOM") {
      newPanel = {
        id,
        name: `Bottom Bar`,
        anchor: "BOTTOM_BAR",
        fixedHeight: 140,
        backgroundColor: "bgPanel",
        borderColor: "borderNormal",
        layoutDirection: "VERTICAL",
        widgets: [],
      };
      updatePanels([...activePanels, newPanel]);
    } else {
      newPanel = {
        id,
        name: `Column ${middlePanels.length + 1}`,
        anchor: middlePanels.length === 0 ? "CENTER_FLEX" : "LEFT_SIDEBAR",
        fixedWidth: 280,
        backgroundColor: "bgPanel",
        borderColor: "borderNormal",
        layoutDirection: "VERTICAL",
        widgets: [],
      };

      const nextPanels = [...activePanels];
      // Find insertion point among middle panels
      const targetMiddlePanel = middlePanels[index];
      const insertAt = targetMiddlePanel
        ? nextPanels.indexOf(targetMiddlePanel)
        : nextPanels.length;
      nextPanels.splice(insertAt, 0, newPanel);
      updatePanels(nextPanels);
    }
  };

  const handleDeleteBox = (panelId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    updatePanels(activePanels.filter((p) => p.id !== panelId));
  };

  // Zero-Lag 60fps Splitter Resizing using direct DOM + requestAnimationFrame
  const startHorizontalResize = (panelId: string, currentHeight: number, startY: number, isTop: boolean) => {
    isResizingRef.current = true;
    let finalHeight = currentHeight;
    const targetElement = document.getElementById(`panel_${panelId}`);

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const delta = e.clientY - startY;
      finalHeight = Math.max(36, Math.min(500, isTop ? currentHeight + delta : currentHeight - delta));

      if (targetElement) {
        targetElement.style.height = `${finalHeight}px`;
      }
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      updatePanels(
        activePanels.map((p) => (p.id === panelId ? { ...p, fixedHeight: finalHeight } : p))
      );
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const startVerticalResize = (panelId: string, currentWidth: number, startX: number, isLeft: boolean) => {
    isResizingRef.current = true;
    let finalWidth = currentWidth;
    const targetElement = document.getElementById(`panel_${panelId}`);

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const delta = e.clientX - startX;
      finalWidth = Math.max(120, Math.min(800, isLeft ? currentWidth + delta : currentWidth - delta));

      if (targetElement) {
        targetElement.style.width = `${finalWidth}px`;
      }
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      updatePanels(
        activePanels.map((p) => (p.id === panelId ? { ...p, fixedWidth: finalWidth } : p))
      );
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Drag & Drop Handlers for Widgets & Containers
  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handlePanelDragOver = (e: React.DragEvent, panelId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    if (dragOverPanelId !== panelId) {
      setDragOverPanelId(panelId);
    }
  };

  const handlePanelDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverPanelId(null);
  };

  const handlePanelDrop = (e: React.DragEvent, panelId: string, insertIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverPanelId(null);

    // Dropping a container box?
    const containerType = e.dataTransfer.getData("layout-container");
    if (containerType) {
      if (containerType === "COLUMN") handleInsertBox("COLUMN", middlePanels.length);
      else if (containerType === "ROW_TOP") handleInsertBox("ROW_TOP", 0);
      else if (containerType === "ROW_BOTTOM") handleInsertBox("ROW_BOTTOM", 0);
      return;
    }

    const widgetId = e.dataTransfer.getData("text/plain");

    // Moving widget from one panel to another
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

  // Render Clean Authentic Game Box
  const renderPanelBox = (panel: PanelDefinition) => {
    const isDragHover = dragOverPanelId === panel.id;

    return (
      <div
        id={`panel_${panel.id}`}
        onDragOver={(e) => handlePanelDragOver(e, panel.id)}
        onDragLeave={handlePanelDragLeave}
        onDrop={(e) => handlePanelDrop(e, panel.id)}
        className="h-full w-full flex flex-col relative select-none overflow-hidden group/box"
      >
        {/* Floating Quick Delete Box Pill (Appears only on hover, zero height in normal layout) */}
        <button
          onClick={(e) => handleDeleteBox(panel.id, e)}
          className="absolute top-1 right-1 opacity-0 group-hover/box:opacity-100 p-1 rounded bg-black/80 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-white/10 z-30 transition shadow"
          title="Delete Box Container"
        >
          <X className="w-3 h-3" />
        </button>

        {/* Scrollable Widget Content */}
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
              })}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      onDragOver={handleCanvasDragOver}
      className="h-full flex flex-col space-y-2.5 select-none overflow-hidden"
    >
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

      {/* Live Game Frame Mockup Canvas */}
      <div
        className="flex-1 w-full rounded-xl overflow-hidden border shadow-2xl flex flex-col p-2 relative font-sans transition-all min-h-0"
        style={{
          backgroundColor: colorToCss(colors.bgDark),
          borderColor: colorToCss(colors.borderNormal),
          borderWidth: borderW,
        }}
      >
        {/* Top Drop Zone (When dragging a row box to the very top) */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverInsertionIndex({ type: "ROW_TOP", index: 0 });
          }}
          onDragLeave={() => setDragOverInsertionIndex(null)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOverInsertionIndex(null);
            const containerType = e.dataTransfer.getData("layout-container");
            if (containerType === "ROW_BOX") {
              handleInsertBox("ROW_TOP", 0);
            }
          }}
          className={`w-full transition-all flex items-center justify-center ${
            dragOverInsertionIndex?.type === "ROW_TOP"
              ? "h-8 bg-purple-600/30 border-2 border-dashed border-purple-400 rounded mb-1 text-xs text-purple-200"
              : "h-0 overflow-hidden"
          }`}
        >
          + Insert Top Row Box Here
        </div>

        {/* Top Boxes List */}
        {topPanels.map((p) => {
          const currentH = p.fixedHeight || 65;
          return (
            <React.Fragment key={p.id}>
              <div
                id={`panel_${p.id}`}
                className="w-full border mb-1 p-2 flex flex-col transition-all overflow-hidden shrink-0"
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
              {/* Resizing Divider Line */}
              <div
                onMouseDown={(e) => startHorizontalResize(p.id, currentH, e.clientY, true)}
                className="w-full h-1.5 cursor-row-resize hover:bg-purple-500 active:bg-purple-500 rounded my-0.5 transition"
                title="Drag to resize height"
              />
            </React.Fragment>
          );
        })}

        {/* Middle Columns Row (Left, Center, Right, etc.) */}
        <div className="flex-1 flex min-h-0 overflow-hidden relative">
          {middlePanels.length === 0 ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverInsertionIndex({ type: "COLUMN", index: 0 });
              }}
              onDragLeave={() => setDragOverInsertionIndex(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverInsertionIndex(null);
                handleInsertBox("COLUMN", 0);
              }}
              className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl text-slate-500 p-8 hover:border-purple-500/50 hover:bg-purple-950/20 transition"
            >
              <Columns className="w-8 h-8 text-purple-400 mb-2" />
              <span className="text-sm font-semibold text-slate-200">No Middle Boxes Present</span>
              <p className="text-xs text-slate-500 mb-3">Drag "+ Column Box" from the left toolbox and drop here</p>
            </div>
          ) : (
            middlePanels.map((p, idx) => {
              const isCenterFlex = p.anchor === "CENTER_FLEX";
              const currentW = p.fixedWidth || 280;

              return (
                <React.Fragment key={p.id}>
                  <div
                    id={`panel_${p.id}`}
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

                  {/* Vertical Resizing Divider Line + Column Drop Target */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverInsertionIndex({ type: "COLUMN", index: idx + 1 });
                    }}
                    onDragLeave={() => setDragOverInsertionIndex(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOverInsertionIndex(null);
                      const containerType = e.dataTransfer.getData("layout-container");
                      if (containerType === "COLUMN") {
                        handleInsertBox("COLUMN", idx + 1);
                      }
                    }}
                    onMouseDown={(e) => startVerticalResize(p.id, currentW, e.clientX, true)}
                    className={`h-full cursor-col-resize rounded mx-0.5 transition shrink-0 flex items-center justify-center ${
                      dragOverInsertionIndex?.type === "COLUMN" && dragOverInsertionIndex.index === idx + 1
                        ? "w-8 bg-purple-600/40 border border-purple-400"
                        : "w-1.5 hover:bg-purple-500 active:bg-purple-500"
                    }`}
                    title="Drag to resize column width, or drop column box to insert"
                  />
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
              {/* Resizing Divider Line */}
              <div
                onMouseDown={(e) => startHorizontalResize(p.id, currentH, e.clientY, false)}
                className="w-full h-1.5 cursor-row-resize hover:bg-purple-500 active:bg-purple-500 rounded my-0.5 transition"
                title="Drag to resize height"
              />
              <div
                id={`panel_${p.id}`}
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

        {/* Bottom Drop Zone (When dragging a row box to the very bottom) */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverInsertionIndex({ type: "ROW_BOTTOM", index: bottomPanels.length });
          }}
          onDragLeave={() => setDragOverInsertionIndex(null)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOverInsertionIndex(null);
            const containerType = e.dataTransfer.getData("layout-container");
            if (containerType === "ROW_BOX") {
              handleInsertBox("ROW_BOTTOM", bottomPanels.length);
            }
          }}
          className={`w-full transition-all flex items-center justify-center ${
            dragOverInsertionIndex?.type === "ROW_BOTTOM"
              ? "h-8 bg-purple-600/30 border-2 border-dashed border-purple-400 rounded mt-1 text-xs text-purple-200"
              : "h-0 overflow-hidden"
          }`}
        >
          + Insert Bottom Row Box Here
        </div>
      </div>
    </div>
  );
};
