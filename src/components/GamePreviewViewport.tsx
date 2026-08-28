import React, { useState } from "react";
import { ThemeFile, colorToCss } from "../types/theme";
import { LayoutFile, GameSimulationState, LayoutNode, ContainerDirection } from "../types/layout";
import { CustomWidgetDefinition } from "../types/elements";
import { AtomicElementRenderer } from "./AtomicElementRenderer";
import {
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Settings2,
  Scale,
} from "lucide-react";

interface GamePreviewViewportProps {
  theme: ThemeFile;
  layout: LayoutFile;
  onChangeLayout: (updated: LayoutFile) => void;
  availableWidgets: CustomWidgetDefinition[];
  activeState: GameSimulationState;
  onSelectState: (st: GameSimulationState) => void;
  selectedBoxId: string | null;
  onSelectBoxId: (id: string | null) => void;
  secondarySelectedBoxId: string | null;
  onSelectSecondaryBoxId: (id: string | null) => void;
}

type DropSplitZone = "TOP" | "BOTTOM" | "LEFT" | "RIGHT" | "CENTER" | null;

export const GamePreviewViewport: React.FC<GamePreviewViewportProps> = ({
  theme,
  layout,
  onChangeLayout,
  availableWidgets,
  activeState,
  onSelectState,
  selectedBoxId,
  onSelectBoxId,
  secondarySelectedBoxId,
  onSelectSecondaryBoxId,
}) => {
  const [resolution, setResolution] = useState<"HD" | "FHD" | "ULTRAWIDE">("HD");
  const [activeHoverNodeId, setActiveHoverNodeId] = useState<string | null>(null);
  const [activeSplitZone, setActiveSplitZone] = useState<DropSplitZone>(null);
  const [draggedWidgetIndex, setDraggedWidgetIndex] = useState<{ nodeId: string; index: number } | null>(null);

  const colors = theme.colors;
  const radius = `${theme.borderRadius}px`;
  const borderW = `${theme.borderWidth}px`;
  const opacity = theme.panelOpacity / 100;

  // Resolve current active rootNode based on state override
  const isStateOverride =
    activeState !== "UNIVERSAL" && layout.stateOverrides?.[activeState]?.enabled;
  const rootNode = isStateOverride
    ? layout.stateOverrides![activeState]!.rootNode
    : layout.rootNode;

  const updateRootNode = (newRoot: LayoutNode) => {
    if (!isStateOverride) {
      onChangeLayout({ ...layout, rootNode: newRoot });
    } else {
      const overrides = { ...layout.stateOverrides };
      overrides[activeState] = {
        enabled: true,
        rootNode: newRoot,
      };
      onChangeLayout({ ...layout, stateOverrides: overrides });
    }
  };

  // Tree Helper: Update a node in the Tree
  const updateNodeInTree = (node: LayoutNode, targetId: string, updater: (n: LayoutNode) => LayoutNode): LayoutNode => {
    if (node.id === targetId) {
      return updater(node);
    }
    if (node.type === "CONTAINER" && node.children) {
      return {
        ...node,
        children: node.children.map((child) => updateNodeInTree(child, targetId, updater)),
      };
    }
    return node;
  };

  // Tree Helper: Find Parent Container of a Node
  const findParentContainer = (
    current: LayoutNode,
    targetId: string
  ): { parentNode: LayoutNode; childIndex: number } | null => {
    if (current.type === "CONTAINER" && current.children) {
      const idx = current.children.findIndex((c) => c.id === targetId);
      if (idx !== -1) {
        return { parentNode: current, childIndex: idx };
      }
      for (const child of current.children) {
        const found = findParentContainer(child, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  // Drag-and-Drop Handlers
  const handleBoxDragOver = (e: React.DragEvent, node: LayoutNode) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;

    const threshold = 0.25;
    let zone: DropSplitZone = "CENTER";

    if (x < w * threshold) zone = "LEFT";
    else if (x > w * (1 - threshold)) zone = "RIGHT";
    else if (y < h * threshold) zone = "TOP";
    else if (y > h * (1 - threshold)) zone = "BOTTOM";

    setActiveHoverNodeId(node.id);
    setActiveSplitZone(zone);
  };

  const handleBoxDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveHoverNodeId(null);
    setActiveSplitZone(null);
  };

  // Tree Helper: Find Node by ID
  const findNodeById = (current: LayoutNode, targetId: string): LayoutNode | null => {
    if (current.id === targetId) return current;
    if (current.type === "CONTAINER" && current.children) {
      for (const child of current.children) {
        const found = findNodeById(child, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  // Local 2-Box Splitter Resizing
  const startResizeLocalSplitter = (
    containerId: string,
    childIndex: number,
    direction: ContainerDirection,
    containerElement: HTMLElement,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const targetContainer = findNodeById(rootNode, containerId);
    if (!targetContainer || !targetContainer.sizes || !targetContainer.children) return;

    const rect = containerElement.getBoundingClientRect();
    const totalPixels = direction === "ROW" ? rect.width : rect.height;
    if (totalPixels <= 0) return;

    const startSizes = [...targetContainer.sizes];
    if (childIndex < 0 || childIndex >= startSizes.length - 1) return;

    const initialSizeA = startSizes[childIndex];
    const initialSizeB = startSizes[childIndex + 1];
    const combinedSize = initialSizeA + initialSizeB;

    const startMousePos = direction === "ROW" ? e.clientX : e.clientY;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const currentPos = direction === "ROW" ? moveEvent.clientX : moveEvent.clientY;
      const pixelDelta = currentPos - startMousePos;
      const percentDelta = (pixelDelta / totalPixels) * 100;

      const minSize = 5;
      const newSizeA = Math.max(minSize, Math.min(combinedSize - minSize, initialSizeA + percentDelta));
      const newSizeB = combinedSize - newSizeA;

      const newSizes = [...startSizes];
      newSizes[childIndex] = Math.round(newSizeA * 10) / 10;
      newSizes[childIndex + 1] = Math.round(newSizeB * 10) / 10;

      const updated = updateNodeInTree(rootNode, containerId, (n) => ({
        ...n,
        sizes: newSizes,
      }));
      updateRootNode(updated);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    document.body.style.cursor = direction === "ROW" ? "col-resize" : "row-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Splitting a Box
  const splitLeafNode = (targetId: string, direction: ContainerDirection) => {
    const newEmptyNode: LayoutNode = {
      id: `box_${Date.now() % 10000}_${Math.random().toString(36).substring(2, 4)}`,
      type: "LEAF",
      name: "New Box",
      widgets: [],
    };

    const parentInfo = findParentContainer(rootNode, targetId);
    if (parentInfo && parentInfo.parentNode.direction === direction) {
      const parent = parentInfo.parentNode;
      const targetIdx = parentInfo.childIndex;
      const targetOldSize = parent.sizes![targetIdx];
      const halfSize = Math.round((targetOldSize / 2) * 10) / 10;

      const newChildren = [...parent.children!];
      const newSizes = [...parent.sizes!];

      newSizes[targetIdx] = halfSize;
      newChildren.splice(targetIdx + 1, 0, newEmptyNode);
      newSizes.splice(targetIdx + 1, 0, halfSize);

      const updated = updateNodeInTree(rootNode, parent.id, (n) => ({
        ...n,
        children: newChildren,
        sizes: newSizes,
      }));
      updateRootNode(updated);
      return;
    }

    const updated = updateNodeInTree(rootNode, targetId, (existingNode) => ({
      id: `container_${Date.now() % 10000}`,
      type: "CONTAINER",
      direction: direction,
      sizes: [50, 50],
      children: [{ ...existingNode }, newEmptyNode],
    }));

    updateRootNode(updated);
  };

  // Close / Remove a Box
  const removeNodeFromTree = (current: LayoutNode, targetId: string): LayoutNode | null => {
    if (current.id === targetId) {
      return null;
    }
    if (current.type === "CONTAINER" && current.children) {
      const newChildren: LayoutNode[] = [];
      const newSizes: number[] = [];

      current.children.forEach((child, idx) => {
        const res = removeNodeFromTree(child, targetId);
        if (res !== null) {
          newChildren.push(res);
          newSizes.push(current.sizes![idx]);
        }
      });

      if (newChildren.length === 0) return null;
      if (newChildren.length === 1) return newChildren[0];

      const total = newSizes.reduce((a, b) => a + b, 0) || 100;
      const normalizedSizes = newSizes.map((s) => Math.round((s / total) * 1000) / 10);

      return {
        ...current,
        children: newChildren,
        sizes: normalizedSizes,
      };
    }
    return current;
  };

  const handleCloseBox = (nodeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedBoxId === nodeId) onSelectBoxId(null);
    if (secondarySelectedBoxId === nodeId) onSelectSecondaryBoxId(null);

    const newRoot = removeNodeFromTree(rootNode, nodeId);
    if (newRoot) {
      updateRootNode(newRoot);
    } else {
      updateRootNode({
        id: "box_main",
        type: "LEAF",
        name: "Main Canvas Box",
        widgets: [],
      });
    }
  };

  // Equalize All Container Splits Recursively
  const equalizeAllSplits = (node: LayoutNode): LayoutNode => {
    if (node.type === "CONTAINER" && node.children) {
      const count = node.children.length;
      const equalSize = Math.round((100 / count) * 10) / 10;
      return {
        ...node,
        sizes: node.children.map(() => equalSize),
        children: node.children.map((c) => equalizeAllSplits(c)),
      };
    }
    return node;
  };

  const handleEqualizeAll = () => {
    updateRootNode(equalizeAllSplits(rootNode));
  };

  // Drop on Leaf Box
  const handleBoxDrop = (e: React.DragEvent, node: LayoutNode) => {
    e.preventDefault();
    e.stopPropagation();

    const widgetId = e.dataTransfer.getData("text/plain");
    const containerType = e.dataTransfer.getData("layout-container");
    const zone = activeSplitZone;

    if (draggedWidgetIndex) {
      const { nodeId: sourceNodeId, index: sourceIndex } = draggedWidgetIndex;
      if (sourceNodeId === node.id) {
        setActiveHoverNodeId(null);
        setActiveSplitZone(null);
        setDraggedWidgetIndex(null);
        return;
      }

      const widgetToMove = (node.widgets || [])[sourceIndex] || widgetId;

      let nextTree = updateNodeInTree(rootNode, sourceNodeId, (n) => {
        const nextWidgets = [...(n.widgets || [])];
        nextWidgets.splice(sourceIndex, 1);
        return { ...n, widgets: nextWidgets };
      });

      nextTree = updateNodeInTree(nextTree, node.id, (n) => ({
        ...n,
        widgets: [...(n.widgets || []), widgetToMove],
      }));

      updateRootNode(nextTree);
      setActiveHoverNodeId(null);
      setActiveSplitZone(null);
      setDraggedWidgetIndex(null);
      return;
    }

    if (containerType === "EMPTY_BOX" || (zone && zone !== "CENTER")) {
      const dir: ContainerDirection = zone === "LEFT" || zone === "RIGHT" ? "ROW" : "COLUMN";
      splitLeafNode(node.id, dir);
      setActiveHoverNodeId(null);
      setActiveSplitZone(null);
      return;
    }

    if (widgetId) {
      const updated = updateNodeInTree(rootNode, node.id, (n) => ({
        ...n,
        widgets: [...(n.widgets || []), widgetId],
      }));
      updateRootNode(updated);
    }

    setActiveHoverNodeId(null);
    setActiveSplitZone(null);
  };

  const handleRemoveWidget = (nodeId: string, widgetIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = updateNodeInTree(rootNode, nodeId, (n) => {
      const nextW = [...(n.widgets || [])];
      nextW.splice(widgetIndex, 1);
      return { ...n, widgets: nextW };
    });
    updateRootNode(updated);
  };

  const handleMoveWidget = (nodeId: string, index: number, up: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = up ? index - 1 : index + 1;
    const updated = updateNodeInTree(rootNode, nodeId, (n) => {
      const nextW = [...(n.widgets || [])];
      if (target < 0 || target >= nextW.length) return n;
      const temp = nextW[index];
      nextW[index] = nextW[target];
      nextW[target] = temp;
      return { ...n, widgets: nextW };
    });
    updateRootNode(updated);
  };

  // Recursive Tree Node Renderer
  const renderLayoutNode = (node: LayoutNode): React.ReactNode => {
    if (node.type === "CONTAINER" && node.children && node.sizes) {
      const isRow = node.direction === "ROW";

      return (
        <div
          key={node.id}
          className={`h-full w-full flex ${
            isRow ? "flex-row" : "flex-col"
          } min-h-0 min-w-0 overflow-hidden select-none`}
        >
          {node.children.map((child, idx) => {
            const sizePercent = node.sizes![idx] ?? (100 / node.children!.length);

            return (
              <React.Fragment key={child.id}>
                {/* Child Container / Box */}
                <div
                  style={{
                    flex: `${sizePercent} ${sizePercent} 0%`,
                  }}
                  className="min-h-0 min-w-0 overflow-hidden flex flex-col"
                >
                  {renderLayoutNode(child)}
                </div>

                {/* Local Splitter Handle between child idx and idx+1 */}
                {idx < node.children!.length - 1 && (
                  <div
                    onMouseDown={(e) => {
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        startResizeLocalSplitter(node.id, idx, node.direction || "ROW", parent, e);
                      }
                    }}
                    className={`shrink-0 transition-colors z-20 ${
                      isRow
                        ? "w-1.5 h-full cursor-col-resize hover:bg-purple-500 active:bg-purple-400"
                        : "w-full h-1.5 cursor-row-resize hover:bg-purple-500 active:bg-purple-400"
                    }`}
                    title="Drag to resize between these 2 boxes only"
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      );
    }

    // Leaf Node (Content Box)
    const isDragHover = activeHoverNodeId === node.id;
    const isSelected = selectedBoxId === node.id;
    const isSecondarySelected = secondarySelectedBoxId === node.id;
    const widgets = node.widgets || [];

    return (
      <div
        key={node.id}
        onClick={(e) => {
          if (e.shiftKey && selectedBoxId && selectedBoxId !== node.id) {
            onSelectSecondaryBoxId(node.id);
          } else {
            onSelectBoxId(node.id);
          }
        }}
        onDragOver={(e) => handleBoxDragOver(e, node)}
        onDragLeave={handleBoxDragLeave}
        onDrop={(e) => handleBoxDrop(e, node)}
        className={`h-full w-full border p-2 flex flex-col relative transition-all overflow-hidden group/box min-h-0 min-w-0 cursor-pointer ${
          isSelected
            ? "ring-2 ring-purple-500 shadow-lg shadow-purple-500/20"
            : isSecondarySelected
            ? "ring-2 ring-amber-500 shadow-lg shadow-amber-500/20"
            : ""
        }`}
        style={{
          backgroundColor: colorToCss(colors.bgPanel, opacity),
          borderColor: isSelected
            ? colorToCss(colors.borderSelected)
            : isSecondarySelected
            ? "#f59e0b"
            : colorToCss(colors.borderNormal),
          borderRadius: radius,
          borderWidth: borderW,
        }}
      >
        {/* Floating Quick Action Buttons on Hover */}
        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover/box:opacity-100 flex items-center gap-1 z-30 transition bg-black/85 px-1.5 py-0.5 rounded border border-white/10 shadow-lg">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectBoxId(node.id);
            }}
            className="p-0.5 text-slate-400 hover:text-purple-300"
            title="Box Options & Sizing in Left Panel"
          >
            <Settings2 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => handleCloseBox(node.id, e)}
            className="p-0.5 text-slate-400 hover:text-rose-400"
            title="Close / Collapse box"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        {/* Drop Glow Visualizers */}
        {isDragHover && activeSplitZone && (
          <div
            className={`absolute pointer-events-none z-30 bg-purple-500/30 border-2 border-purple-400 rounded-lg transition-all animate-pulse ${
              activeSplitZone === "TOP"
                ? "top-1 inset-x-1 h-1/3"
                : activeSplitZone === "BOTTOM"
                ? "bottom-1 inset-x-1 h-1/3"
                : activeSplitZone === "LEFT"
                ? "left-1 inset-y-1 w-1/3"
                : activeSplitZone === "RIGHT"
                ? "right-1 inset-y-1 w-1/3"
                : "inset-1"
            }`}
          />
        )}

        {/* Mounted Widgets Container with Scroll Support */}
        <div className="flex-1 flex flex-col space-y-2 overflow-y-auto min-h-0 pr-0.5">
          {widgets.length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 border border-dashed border-white/10 rounded-lg p-2 hover:border-purple-500/30 hover:bg-purple-950/10 transition">
              <Plus className="w-5 h-5 text-slate-600 mb-1" />
              <span className="text-[11px] text-center font-medium">
                + Drop Widgets or Drag Box to Split
              </span>
            </div>
          ) : (
            widgets.map((widgetId, idx) => {
              const widgetDef = availableWidgets.find((w) => w.id === widgetId);
              if (!widgetDef) {
                return (
                  <div
                    key={`${widgetId}_${idx}`}
                    className="p-2 bg-rose-950/40 border border-rose-500/30 rounded text-rose-300 text-xs flex items-center justify-between"
                  >
                    <span>Missing Widget: {widgetId}</span>
                    <button
                      onClick={(e) => handleRemoveWidget(node.id, idx, e)}
                      className="text-rose-400 hover:text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={`${widgetDef.id}_${idx}`}
                  draggable={true}
                  onDragStart={(e) => {
                    e.stopPropagation();
                    e.dataTransfer.setData("text/plain", widgetDef.id);
                    e.dataTransfer.effectAllowed = "move";
                    setDraggedWidgetIndex({ nodeId: node.id, index: idx });
                  }}
                  className="p-2 rounded-lg relative group/widget transition cursor-grab active:cursor-grabbing border border-transparent hover:border-purple-500/40"
                  style={{
                    backgroundColor: colorToCss(colors.bgHeader, 0.4),
                  }}
                >
                  {/* Hover Floating Widget Controls */}
                  <div className="absolute top-1 right-1 opacity-0 group-hover/widget:opacity-100 flex items-center gap-1 bg-black/90 px-1.5 py-0.5 rounded border border-white/10 z-20 text-[10px] shadow-lg">
                    <button
                      onClick={(e) => handleMoveWidget(node.id, idx, true, e)}
                      disabled={idx === 0}
                      className="p-0.5 text-slate-400 hover:text-white disabled:opacity-20"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleMoveWidget(node.id, idx, false, e)}
                      disabled={idx === widgets.length - 1}
                      className="p-0.5 text-slate-400 hover:text-white disabled:opacity-20"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleRemoveWidget(node.id, idx, e)}
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
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col space-y-2.5 select-none overflow-hidden font-sans">
      {/* Simulation Viewport Controls & Equalize Action */}
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

        {/* Global Split Equalizer & Resolution Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleEqualizeAll}
            className="flex items-center gap-1.5 px-3 py-1 bg-black/40 hover:bg-purple-950/60 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-medium transition"
            title="Reset all splits across the entire layout to equal parts"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Equalize All Splits</span>
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          <span className="text-slate-400">Resolution:</span>
          <button
            onClick={() => setResolution("HD")}
            className={`px-2.5 py-1 rounded-lg transition font-medium text-xs ${
              resolution === "HD"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-black/30 text-slate-400 hover:text-slate-200"
            }`}
          >
            1280x720 (16:9)
          </button>
          <button
            onClick={() => setResolution("FHD")}
            className={`px-2.5 py-1 rounded-lg transition font-medium text-xs ${
              resolution === "FHD"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-black/30 text-slate-400 hover:text-slate-200"
            }`}
          >
            1920x1080 (16:9)
          </button>
          <button
            onClick={() => setResolution("ULTRAWIDE")}
            className={`px-2.5 py-1 rounded-lg transition font-medium text-xs ${
              resolution === "ULTRAWIDE"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-black/30 text-slate-400 hover:text-slate-200"
            }`}
          >
            21:9 Ultrawide
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport Area (Fixed Scale & 100% Fully Visible) */}
      <div className="flex-1 min-h-0 overflow-hidden flex items-center justify-center p-2">
        {/* Snapped Game Canvas (Strictly locked in place & aspect ratio) */}
        <div
          className={`w-full h-full rounded-xl overflow-hidden border shadow-2xl relative transition-all p-2 flex flex-col ${
            resolution === "ULTRAWIDE" ? "aspect-[21/9]" : "aspect-[16/9]"
          }`}
          style={{
            backgroundColor: colorToCss(colors.bgDark),
            borderColor: colorToCss(colors.borderNormal),
            borderWidth: borderW,
            maxHeight: "100%",
            maxWidth: "100%",
          }}
        >
          {renderLayoutNode(rootNode)}
        </div>
      </div>
    </div>
  );
};
