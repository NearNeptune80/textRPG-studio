import React, { useState } from "react";
import { ThemeFile, colorToCss } from "../types/theme";
import { LayoutFile, GameSimulationState, LayoutNode, SplitDirection } from "../types/layout";
import { CustomWidgetDefinition } from "../types/elements";
import { AtomicElementRenderer } from "./AtomicElementRenderer";
import {
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  X,
  Settings2,
  Columns,
  Rows,
  Scale,
} from "lucide-react";

interface GamePreviewViewportProps {
  theme: ThemeFile;
  layout: LayoutFile;
  onChangeLayout: (updated: LayoutFile) => void;
  availableWidgets: CustomWidgetDefinition[];
  activeState: GameSimulationState;
  onSelectState: (st: GameSimulationState) => void;
}

type DropSplitZone = "TOP" | "BOTTOM" | "LEFT" | "RIGHT" | "CENTER" | null;

export const GamePreviewViewport: React.FC<GamePreviewViewportProps> = ({
  theme,
  layout,
  onChangeLayout,
  availableWidgets,
  activeState,
  onSelectState,
}) => {
  const [resolution, setResolution] = useState<"HD" | "FHD" | "ULTRAWIDE">("HD");
  const [activeHoverNodeId, setActiveHoverNodeId] = useState<string | null>(null);
  const [activeSplitZone, setActiveSplitZone] = useState<DropSplitZone>(null);
  const [draggedWidgetIndex, setDraggedWidgetIndex] = useState<{ nodeId: string; index: number } | null>(null);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);

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

  // Tree Helper: Update a node in the BSP Tree
  const updateNodeInTree = (node: LayoutNode, targetId: string, updater: (n: LayoutNode) => LayoutNode): LayoutNode => {
    if (node.id === targetId) {
      return updater(node);
    }
    if (node.type === "SPLIT" && node.children) {
      return {
        ...node,
        children: [
          updateNodeInTree(node.children[0], targetId, updater),
          updateNodeInTree(node.children[1], targetId, updater),
        ],
      };
    }
    return node;
  };

  // Find Parent Split Node
  const findParentSplitNode = (current: LayoutNode, targetId: string): LayoutNode | null => {
    if (current.type === "SPLIT" && current.children) {
      if (current.children[0].id === targetId || current.children[1].id === targetId) {
        return current;
      }
      const left = findParentSplitNode(current.children[0], targetId);
      if (left) return left;
      return findParentSplitNode(current.children[1], targetId);
    }
    return null;
  };

  // Set Split Ratio of Parent
  const setParentSplitRatio = (boxId: string, desiredFraction: number) => {
    const parent = findParentSplitNode(rootNode, boxId);
    if (!parent || !parent.children) return;

    const isFirst = parent.children[0].id === boxId;
    const finalRatio = isFirst ? desiredFraction : 1 - desiredFraction;

    const updated = updateNodeInTree(rootNode, parent.id, (n) => ({
      ...n,
      splitRatio: Math.round(finalRatio * 100) / 100,
    }));
    updateRootNode(updated);
  };

  // Equalize All Splits Recursively
  const equalizeAllSplits = (node: LayoutNode): LayoutNode => {
    if (node.type === "SPLIT" && node.children) {
      return {
        ...node,
        splitRatio: 0.5,
        children: [
          equalizeAllSplits(node.children[0]),
          equalizeAllSplits(node.children[1]),
        ],
      };
    }
    return node;
  };

  const handleEqualizeAll = () => {
    updateRootNode(equalizeAllSplits(rootNode));
  };

  // Tree Helper: Split a Leaf Node into 2 children
  const splitLeafNode = (targetId: string, zone: DropSplitZone) => {
    if (!zone || zone === "CENTER") return;

    const isHorizontal = zone === "LEFT" || zone === "RIGHT";
    const newEmptyNode: LayoutNode = {
      id: `box_${Date.now() % 10000}_${Math.random().toString(36).substring(2, 4)}`,
      type: "LEAF",
      name: "New Box",
      widgets: [],
    };

    const newRoot = updateNodeInTree(rootNode, targetId, (existingNode) => {
      const isFirst = zone === "LEFT" || zone === "TOP";
      return {
        id: `split_${Date.now() % 10000}`,
        type: "SPLIT",
        direction: isHorizontal ? "HORIZONTAL" : "VERTICAL",
        splitRatio: 0.5,
        children: isFirst
          ? [newEmptyNode, { ...existingNode }]
          : [{ ...existingNode }, newEmptyNode],
      };
    });

    updateRootNode(newRoot);
  };

  // Tree Helper: Close / Remove a Leaf Node (Collapse parent split)
  const removeNodeFromTree = (current: LayoutNode, targetId: string): LayoutNode | null => {
    if (current.id === targetId) {
      return null;
    }
    if (current.type === "SPLIT" && current.children) {
      const leftResult = removeNodeFromTree(current.children[0], targetId);
      const rightResult = removeNodeFromTree(current.children[1], targetId);

      if (leftResult === null && rightResult !== null) return rightResult;
      if (rightResult === null && leftResult !== null) return leftResult;
      if (leftResult && rightResult) {
        return {
          ...current,
          children: [leftResult, rightResult],
        };
      }
    }
    return current;
  };

  const handleCloseBox = (nodeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedBoxId === nodeId) setSelectedBoxId(null);

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

  // Tree Helper: Update Split Ratio on Drag (Zero-Lag direct calculation)
  const startResizeSplitter = (
    splitNodeId: string,
    direction: SplitDirection,
    containerElement: HTMLElement
  ) => {
    const rect = containerElement.getBoundingClientRect();

    const handleMouseMove = (e: MouseEvent) => {
      let ratio: number;
      if (direction === "HORIZONTAL") {
        ratio = (e.clientX - rect.left) / rect.width;
      } else {
        ratio = (e.clientY - rect.top) / rect.height;
      }
      ratio = Math.max(0.08, Math.min(0.92, ratio));

      const updated = updateNodeInTree(rootNode, splitNodeId, (node) => ({
        ...node,
        splitRatio: Math.round(ratio * 1000) / 1000,
      }));
      updateRootNode(updated);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Drop handlers for Dragging Boxes and Widgets
  const handleBoxDragOver = (e: React.DragEvent, node: LayoutNode) => {
    e.preventDefault();
    e.stopPropagation();
    const containerType = e.dataTransfer.types.includes("layout-container");

    setActiveHoverNodeId(node.id);

    if (containerType) {
      const rect = e.currentTarget.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top) / rect.height;

      if (relY < 0.28) setActiveSplitZone("TOP");
      else if (relY > 0.72) setActiveSplitZone("BOTTOM");
      else if (relX < 0.35) setActiveSplitZone("LEFT");
      else if (relX > 0.65) setActiveSplitZone("RIGHT");
      else setActiveSplitZone("RIGHT");
    } else {
      setActiveSplitZone("CENTER");
    }
  };

  const handleBoxDragLeave = () => {
    setActiveHoverNodeId(null);
    setActiveSplitZone(null);
  };

  const handleBoxDrop = (e: React.DragEvent, node: LayoutNode) => {
    e.preventDefault();
    e.stopPropagation();

    const isContainer = e.dataTransfer.getData("layout-container");
    if (isContainer === "EMPTY_BOX") {
      splitLeafNode(node.id, activeSplitZone || "RIGHT");
      setActiveHoverNodeId(null);
      setActiveSplitZone(null);
      return;
    }

    const widgetId = e.dataTransfer.getData("text/plain");

    if (draggedWidgetIndex) {
      const { nodeId: srcNodeId, index: srcIndex } = draggedWidgetIndex;
      setDraggedWidgetIndex(null);

      if (srcNodeId === node.id) {
        setActiveHoverNodeId(null);
        setActiveSplitZone(null);
        return;
      }

      let nextRoot = updateNodeInTree(rootNode, srcNodeId, (n) => {
        const nextW = [...(n.widgets || [])];
        nextW.splice(srcIndex, 1);
        return { ...n, widgets: nextW };
      });

      nextRoot = updateNodeInTree(nextRoot, node.id, (n) => {
        return { ...n, widgets: [...(n.widgets || []), widgetId] };
      });

      updateRootNode(nextRoot);
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

  // Helper to find leaf node by ID
  const findNodeById = (node: LayoutNode, id: string): LayoutNode | null => {
    if (node.id === id) return node;
    if (node.type === "SPLIT" && node.children) {
      const left = findNodeById(node.children[0], id);
      if (left) return left;
      return findNodeById(node.children[1], id);
    }
    return null;
  };

  const selectedNode = selectedBoxId ? findNodeById(rootNode, selectedBoxId) : null;
  const parentSplit = selectedBoxId ? findParentSplitNode(rootNode, selectedBoxId) : null;

  // Recursive Tree Node Renderer
  const renderLayoutNode = (node: LayoutNode): React.ReactNode => {
    if (node.type === "SPLIT" && node.children) {
      const isHorizontal = node.direction === "HORIZONTAL";
      const ratio = node.splitRatio ?? 0.5;

      return (
        <div
          key={node.id}
          className={`h-full w-full flex ${
            isHorizontal ? "flex-row" : "flex-col"
          } min-h-0 min-w-0 overflow-hidden select-none`}
        >
          {/* First Child */}
          <div
            style={{
              flex: `${ratio} ${ratio} 0%`,
            }}
            className="min-h-0 min-w-0 overflow-hidden flex flex-col"
          >
            {renderLayoutNode(node.children[0])}
          </div>

          {/* Interactive Splitter Divider Line */}
          <div
            onMouseDown={(e) => {
              const parent = e.currentTarget.parentElement;
              if (parent) {
                startResizeSplitter(node.id, node.direction || "HORIZONTAL", parent);
              }
            }}
            className={`shrink-0 transition-colors z-20 ${
              isHorizontal
                ? "w-1.5 h-full cursor-col-resize hover:bg-purple-500 active:bg-purple-400"
                : "w-full h-1.5 cursor-row-resize hover:bg-purple-500 active:bg-purple-400"
            }`}
            title="Drag to resize split"
          />

          {/* Second Child */}
          <div
            style={{
              flex: `${1 - ratio} ${1 - ratio} 0%`,
            }}
            className="min-h-0 min-w-0 overflow-hidden flex flex-col"
          >
            {renderLayoutNode(node.children[1])}
          </div>
        </div>
      );
    }

    // Leaf Node (Content Box)
    const isDragHover = activeHoverNodeId === node.id;
    const isSelected = selectedBoxId === node.id;
    const widgets = node.widgets || [];

    return (
      <div
        key={node.id}
        onClick={() => setSelectedBoxId(node.id)}
        onDragOver={(e) => handleBoxDragOver(e, node)}
        onDragLeave={handleBoxDragLeave}
        onDrop={(e) => handleBoxDrop(e, node)}
        className={`h-full w-full border p-2 flex flex-col relative transition-all overflow-hidden group/box min-h-0 min-w-0 cursor-pointer ${
          isSelected ? "ring-2 ring-purple-500 shadow-lg shadow-purple-500/20" : ""
        }`}
        style={{
          backgroundColor: colorToCss(colors.bgPanel, opacity),
          borderColor: isSelected ? colorToCss(colors.borderSelected) : colorToCss(colors.borderNormal),
          borderRadius: radius,
          borderWidth: borderW,
        }}
      >
        {/* Floating Quick Action Buttons on Hover */}
        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover/box:opacity-100 flex items-center gap-1 z-30 transition bg-black/85 px-1.5 py-0.5 rounded border border-white/10 shadow-lg">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedBoxId(node.id);
            }}
            className="p-0.5 text-slate-400 hover:text-purple-300"
            title="Box Options & Sizing"
          >
            <Settings2 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => handleCloseBox(node.id, e)}
            className="p-0.5 text-slate-400 hover:text-rose-400"
            title="Close / Collapse box"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Visual Glowing Split Drop Preview Zone */}
        {isDragHover && activeSplitZone && (
          <div
            className={`absolute z-40 bg-purple-600/30 border-2 border-purple-400 pointer-events-none transition-all rounded ${
              activeSplitZone === "TOP"
                ? "top-0 left-0 right-0 h-1/2"
                : activeSplitZone === "BOTTOM"
                ? "bottom-0 left-0 right-0 h-1/2"
                : activeSplitZone === "LEFT"
                ? "top-0 bottom-0 left-0 w-1/2"
                : activeSplitZone === "RIGHT"
                ? "top-0 bottom-0 right-0 w-1/2"
                : "inset-0"
            }`}
          />
        )}

        {/* Scrollable Widget Container */}
        <div className="flex-1 w-full overflow-y-auto overflow-x-hidden pr-0.5 flex flex-col gap-2 rounded transition-all min-h-0">
          {widgets.length === 0 ? (
            <div className="h-full flex-1 min-h-[48px] flex flex-col items-center justify-center p-3 rounded border-2 border-dashed border-white/10 text-slate-500 hover:border-purple-500/40 hover:text-purple-300 transition-all text-center">
              <span className="text-[11px] font-medium flex items-center gap-1">
                <Plus className="w-3.5 h-3.5 text-purple-400" />
                <span>Drop Widgets or Drag Box to Split</span>
              </span>
            </div>
          ) : (
            widgets.map((wId, idx) => {
              const widgetDef = availableWidgets.find((w) => w.id === wId);
              if (!widgetDef) return null;

              return (
                <div
                  key={`${wId}_${idx}`}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", wId);
                    setDraggedWidgetIndex({ nodeId: node.id, index: idx });
                  }}
                  className="relative group/widget p-1.5 rounded transition shadow-sm w-full shrink-0"
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

        {/* Global Split Equalizer */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleEqualizeAll}
            className="flex items-center gap-1.5 px-3 py-1 bg-black/40 hover:bg-purple-950/60 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-medium transition"
            title="Reset all splits to exactly equal 50/50 parts"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Equalize All Splits</span>
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

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

      {/* Main Canvas & Box Options Side-Inspector */}
      <div className="flex-1 flex gap-3 min-h-0 overflow-hidden">
        {/* BSP Tile Snapped Game Canvas */}
        <div
          className="flex-1 rounded-xl overflow-hidden border shadow-2xl relative transition-all min-h-0 p-2 flex flex-col"
          style={{
            backgroundColor: colorToCss(colors.bgDark),
            borderColor: colorToCss(colors.borderNormal),
            borderWidth: borderW,
          }}
        >
          {renderLayoutNode(rootNode)}
        </div>

        {/* Floating Box Options Popover / Drawer (Appears when box is selected) */}
        {selectedNode && (
          <div className="w-72 bg-[#1c1a24] rounded-xl border border-purple-500/40 p-4 flex flex-col space-y-4 shadow-2xl overflow-y-auto shrink-0 animate-in slide-in-from-right-4 duration-200">
            {/* Popover Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <Settings2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-100">{selectedNode.name || "Box Settings"}</h3>
                  <span className="text-[10px] text-purple-400 font-mono">ID: {selectedNode.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedBoxId(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Equal Sizing & Split Ratio Presets */}
            {parentSplit && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Sizing & Ratio Presets
                  </span>
                  <span className="text-[10px] text-purple-300">
                    {Math.round((parentSplit.splitRatio || 0.5) * 100)}% / {Math.round((1 - (parentSplit.splitRatio || 0.5)) * 100)}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <button
                    onClick={() => setParentSplitRatio(selectedNode.id, 0.5)}
                    className="p-2 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 font-semibold text-center transition"
                    title="Make this box exactly equal 50% / 50% with its neighbor"
                  >
                    50 / 50 (Equal)
                  </button>
                  <button
                    onClick={() => setParentSplitRatio(selectedNode.id, 0.333)}
                    className="p-2 rounded-lg bg-black/40 hover:bg-purple-950 text-slate-300 hover:text-white border border-white/10 text-center transition font-mono"
                  >
                    33 / 67
                  </button>
                  <button
                    onClick={() => setParentSplitRatio(selectedNode.id, 0.25)}
                    className="p-2 rounded-lg bg-black/40 hover:bg-purple-950 text-slate-300 hover:text-white border border-white/10 text-center transition font-mono"
                  >
                    25 / 75
                  </button>
                  <button
                    onClick={() => setParentSplitRatio(selectedNode.id, 0.20)}
                    className="p-2 rounded-lg bg-black/40 hover:bg-purple-950 text-slate-300 hover:text-white border border-white/10 text-center transition font-mono"
                  >
                    20 / 80
                  </button>
                  <button
                    onClick={() => setParentSplitRatio(selectedNode.id, 0.667)}
                    className="p-2 rounded-lg bg-black/40 hover:bg-purple-950 text-slate-300 hover:text-white border border-white/10 text-center transition font-mono"
                  >
                    67 / 33
                  </button>
                  <button
                    onClick={() => setParentSplitRatio(selectedNode.id, 0.75)}
                    className="p-2 rounded-lg bg-black/40 hover:bg-purple-950 text-slate-300 hover:text-white border border-white/10 text-center transition font-mono"
                  >
                    75 / 25
                  </button>
                </div>
              </div>
            )}

            {/* Quick Split Buttons */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                Quick Split
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => splitLeafNode(selectedNode.id, "RIGHT")}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-black/40 hover:bg-purple-950/60 border border-white/10 text-slate-200 hover:text-purple-200 text-xs transition"
                >
                  <Columns className="w-3.5 h-3.5 text-purple-400" />
                  <span>Split Vertical</span>
                </button>
                <button
                  onClick={() => splitLeafNode(selectedNode.id, "BOTTOM")}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-black/40 hover:bg-purple-950/60 border border-white/10 text-slate-200 hover:text-purple-200 text-xs transition"
                >
                  <Rows className="w-3.5 h-3.5 text-purple-400" />
                  <span>Split Horizontal</span>
                </button>
              </div>
            </div>

            {/* Box Destruction & Clean Up */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  const updated = updateNodeInTree(rootNode, selectedNode.id, (n) => ({
                    ...n,
                    widgets: [],
                  }));
                  updateRootNode(updated);
                }}
                className="w-full py-1.5 rounded-lg bg-black/40 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-white/5 text-xs transition text-center"
              >
                Clear All Widgets
              </button>
              <button
                onClick={() => handleCloseBox(selectedNode.id)}
                className="w-full py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition text-center flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete / Collapse Box</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
