import React, { useState } from "react";
import { LayoutFile, GameSimulationState, LayoutNode, ContainerDirection, BLANK_LAYOUT, PRESET_DEFAULT_POPULATED_LAYOUT } from "../types/layout";
import { CustomWidgetDefinition } from "../types/elements";
import {
  Plus,
  GripVertical,
  Layers,
  Sliders,
  Box,
  Settings2,
  Columns,
  Rows,
  Trash2,
  Equal,
  X,
} from "lucide-react";
import { CustomWidgetBuilderModal } from "./CustomWidgetBuilderModal";

interface LayoutEditorProps {
  layout: LayoutFile;
  onChange: (updated: LayoutFile) => void;
  availableWidgets: CustomWidgetDefinition[];
  onAddCustomWidget: (widget: CustomWidgetDefinition) => void;
  activeEditingState: GameSimulationState;
  onSelectEditingState: (st: GameSimulationState) => void;
  selectedBoxId: string | null;
  onSelectBoxId: (id: string | null) => void;
  secondarySelectedBoxId: string | null;
  onSelectSecondaryBoxId: (id: string | null) => void;
}

export const LayoutEditor: React.FC<LayoutEditorProps> = ({
  layout,
  onChange,
  availableWidgets,
  onAddCustomWidget,
  activeEditingState,
  onSelectEditingState,
  selectedBoxId,
  onSelectBoxId,
  secondarySelectedBoxId,
  onSelectSecondaryBoxId,
}) => {
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<CustomWidgetDefinition | undefined>(undefined);

  // State Overrides
  const isOverrideActive = activeEditingState !== "UNIVERSAL";
  const stateOverride = isOverrideActive ? layout.stateOverrides?.[activeEditingState] : null;
  const isStateOverride =
    activeEditingState !== "UNIVERSAL" && layout.stateOverrides?.[activeEditingState]?.enabled;
  const rootNode = isStateOverride
    ? layout.stateOverrides![activeEditingState]!.rootNode
    : layout.rootNode;

  const updateRootNode = (newRoot: LayoutNode) => {
    if (!isStateOverride) {
      onChange({ ...layout, rootNode: newRoot });
    } else {
      const overrides = { ...layout.stateOverrides };
      overrides[activeEditingState] = {
        enabled: true,
        rootNode: newRoot,
      };
      onChange({ ...layout, stateOverrides: overrides });
    }
  };

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

  // Helper: check if a subtree contains a specific node ID
  const containsNode = (node: LayoutNode, targetId: string): boolean => {
    if (node.id === targetId) return true;
    if (node.type === "CONTAINER" && node.children) {
      return node.children.some((child) => containsNode(child, targetId));
    }
    return false;
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

  // Get all leaf boxes currently in the tree
  const getAllLeafBoxes = (node: LayoutNode): LayoutNode[] => {
    if (node.type === "LEAF") return [node];
    if (node.type === "CONTAINER" && node.children) {
      return node.children.flatMap((child) => getAllLeafBoxes(child));
    }
    return [];
  };

  // Helper: Find leaf node by ID
  const findNodeById = (node: LayoutNode, id: string): LayoutNode | null => {
    if (node.id === id) return node;
    if (node.type === "CONTAINER" && node.children) {
      for (const child of node.children) {
        const found = findNodeById(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Helper: Find Parent Container of a Node
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

  // Calculate the effective absolute fractional size (width and height) of all leaf nodes
  const computeAllLeafFractions = (root: LayoutNode): Map<string, { w: number; h: number }> => {
    const map = new Map<string, { w: number; h: number }>();

    const traverse = (node: LayoutNode, currentW: number, currentH: number) => {
      if (node.type === "LEAF") {
        map.set(node.id, { w: currentW, h: currentH });
        return;
      }
      if (node.type === "CONTAINER" && node.children && node.sizes) {
        const totalSize = node.sizes.reduce((a, b) => a + b, 0) || 100;
        node.children.forEach((child, idx) => {
          const fraction = (node.sizes![idx] ?? (100 / node.children!.length)) / totalSize;
          if (node.direction === "ROW") {
            traverse(child, currentW * fraction, currentH);
          } else {
            traverse(child, currentW, currentH * fraction);
          }
        });
      }
    };

    traverse(root, 1.0, 1.0);
    return map;
  };

  // Match Size of Target Box to Reference Box
  const handleMatchDimension = (idReference: string, idTarget: string, dimension: "WIDTH" | "HEIGHT") => {
    const reqDir: ContainerDirection = dimension === "WIDTH" ? "ROW" : "COLUMN";

    const fractions = computeAllLeafFractions(rootNode);
    const refData = fractions.get(idReference);
    if (!refData) return;
    const targetAbsSize = dimension === "WIDTH" ? refData.w : refData.h;

    let currentChildId = idTarget;
    let targetContainerInfo: { parentNode: LayoutNode; childIndex: number } | null = null;

    let searchNode: LayoutNode | null = rootNode;
    while (searchNode) {
      const parentInfo = findParentContainer(rootNode, currentChildId);
      if (!parentInfo) break;
      if (parentInfo.parentNode.direction === reqDir) {
        targetContainerInfo = parentInfo;
        break;
      }
      currentChildId = parentInfo.parentNode.id;
    }

    if (!targetContainerInfo) return;

    const { parentNode, childIndex } = targetContainerInfo;
    if (!parentNode.sizes || !parentNode.children || parentNode.children.length < 2) return;

    const containerFractions = computeAllLeafFractions(rootNode);
    let containerAbsSize = 1.0;
    const firstLeafInContainer = getAllLeafBoxes(parentNode)[0];
    if (firstLeafInContainer) {
      const leafF = containerFractions.get(firstLeafInContainer.id);
      const leafFractionInContainer = (parentNode.sizes[0] || 50) / (parentNode.sizes.reduce((a, b) => a + b, 0) || 100);
      if (leafF && leafFractionInContainer > 0) {
        containerAbsSize = (dimension === "WIDTH" ? leafF.w : leafF.h) / leafFractionInContainer;
      }
    }

    const desiredPercent = Math.max(5, Math.min(90, (targetAbsSize / containerAbsSize) * 100));
    const currentPercent = parentNode.sizes[childIndex];
    const diff = desiredPercent - currentPercent;

    const neighborIndex = childIndex > 0 ? childIndex - 1 : childIndex + 1;
    const neighborCurrent = parentNode.sizes[neighborIndex];
    const newNeighborPercent = Math.max(5, neighborCurrent - diff);
    const actualAppliedDiff = neighborCurrent - newNeighborPercent;

    const newSizes = [...parentNode.sizes];
    newSizes[childIndex] = currentPercent + actualAppliedDiff;
    newSizes[neighborIndex] = newNeighborPercent;

    const updated = updateNodeInTree(rootNode, parentNode.id, (n) => ({
      ...n,
      sizes: newSizes,
    }));

    updateRootNode(updated);
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

  const handleCloseBox = (nodeId: string) => {
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

  const setParentFraction = (boxId: string, desiredFraction: number) => {
    const parentInfo = findParentContainer(rootNode, boxId);
    if (!parentInfo || !parentInfo.parentNode.sizes || parentInfo.parentNode.children!.length !== 2) return;

    const isFirst = parentInfo.childIndex === 0;
    const size0 = Math.round((isFirst ? desiredFraction : 1 - desiredFraction) * 100);
    const size1 = 100 - size0;

    const updated = updateNodeInTree(rootNode, parentInfo.parentNode.id, (n) => ({
      ...n,
      sizes: [size0, size1],
    }));
    updateRootNode(updated);
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
      onSelectBoxId(null);
      onSelectSecondaryBoxId(null);
    }
  };

  const loadDefaultPreset = () => {
    if (confirm("Load default Lilith textRPG layout preset?")) {
      onChange(JSON.parse(JSON.stringify(PRESET_DEFAULT_POPULATED_LAYOUT)));
      onSelectBoxId(null);
      onSelectSecondaryBoxId(null);
    }
  };

  const allLeafBoxes = getAllLeafBoxes(rootNode);
  const selectedNode = selectedBoxId ? findNodeById(rootNode, selectedBoxId) : null;
  const secondaryNode = secondarySelectedBoxId ? findNodeById(rootNode, secondarySelectedBoxId) : null;
  const parentContainerInfo = selectedBoxId ? findParentContainer(rootNode, selectedBoxId) : null;

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

      {/* Box Options Inspector (Rendered in Left Panel when Box is Clicked on Canvas) */}
      {selectedNode && (
        <div className="bg-[#1c1a24] p-3 rounded-xl border border-purple-500/50 space-y-3 shrink-0 shadow-lg animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <Settings2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-100 block">{selectedNode.name || "Box Inspector"}</span>
                <span className="text-[10px] text-purple-400 font-mono">ID: {selectedNode.id}</span>
              </div>
            </div>
            <button
              onClick={() => {
                onSelectBoxId(null);
                onSelectSecondaryBoxId(null);
              }}
              className="p-1 text-slate-400 hover:text-white rounded"
              title="Close Box Inspector"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Match Size with Another Box */}
          <div className="space-y-2 bg-black/35 p-2.5 rounded-lg border border-purple-500/20">
            <div className="flex items-center gap-1.5 text-purple-300 font-bold text-xs">
              <Equal className="w-3.5 h-3.5" />
              <span>Match Size with Another Box</span>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 block uppercase font-mono">
                Select 2nd Box:
              </label>
              <select
                value={secondarySelectedBoxId || ""}
                onChange={(e) => onSelectSecondaryBoxId(e.target.value || null)}
                className="w-full px-2 py-1 bg-black/60 border border-white/10 rounded text-xs text-slate-200 focus:outline-none focus:border-purple-400 font-medium"
              >
                <option value="">-- Choose a box to match --</option>
                {allLeafBoxes
                  .filter((b) => b.id !== selectedNode.id)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name || b.id} ({b.widgets?.length || 0} widgets)
                    </option>
                  ))}
              </select>
            </div>

            {secondaryNode && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] bg-purple-950/40 p-1.5 rounded border border-purple-500/20 text-purple-200">
                  <span className="text-purple-300 font-medium">{selectedNode.name || selectedNode.id}</span>
                  <span>→</span>
                  <span className="text-amber-300 font-medium">{secondaryNode.name || secondaryNode.id}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleMatchDimension(selectedNode.id, secondaryNode.id, "WIDTH")}
                    className="py-1 px-2 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition text-center"
                  >
                    Match Width
                  </button>
                  <button
                    onClick={() => handleMatchDimension(selectedNode.id, secondaryNode.id, "HEIGHT")}
                    className="py-1 px-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition text-center"
                  >
                    Match Height
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sizing Presets (if inside a 2-child container) */}
          {parentContainerInfo && parentContainerInfo.parentNode.children?.length === 2 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Split Presets
              </span>
              <div className="grid grid-cols-3 gap-1 text-xs font-mono">
                <button
                  onClick={() => setParentFraction(selectedNode.id, 0.5)}
                  className="py-1 px-1 rounded bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 text-center transition text-[10px] font-bold"
                >
                  50 / 50
                </button>
                <button
                  onClick={() => setParentFraction(selectedNode.id, 0.333)}
                  className="py-1 px-1 rounded bg-black/40 hover:bg-purple-950 text-slate-300 hover:text-white border border-white/10 text-center transition text-[10px]"
                >
                  33 / 67
                </button>
                <button
                  onClick={() => setParentFraction(selectedNode.id, 0.25)}
                  className="py-1 px-1 rounded bg-black/40 hover:bg-purple-950 text-slate-300 hover:text-white border border-white/10 text-center transition text-[10px]"
                >
                  25 / 75
                </button>
                <button
                  onClick={() => setParentFraction(selectedNode.id, 0.20)}
                  className="py-1 px-1 rounded bg-black/40 hover:bg-purple-950 text-slate-300 hover:text-white border border-white/10 text-center transition text-[10px]"
                >
                  20 / 80
                </button>
                <button
                  onClick={() => setParentFraction(selectedNode.id, 0.667)}
                  className="py-1 px-1 rounded bg-black/40 hover:bg-purple-950 text-slate-300 hover:text-white border border-white/10 text-center transition text-[10px]"
                >
                  67 / 33
                </button>
                <button
                  onClick={() => setParentFraction(selectedNode.id, 0.75)}
                  className="py-1 px-1 rounded bg-black/40 hover:bg-purple-950 text-slate-300 hover:text-white border border-white/10 text-center transition text-[10px]"
                >
                  75 / 25
                </button>
              </div>
            </div>
          )}

          {/* Quick Split & Actions */}
          <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-white/10">
            <button
              onClick={() => splitLeafNode(selectedNode.id, "ROW")}
              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-black/40 hover:bg-purple-950/60 border border-white/10 text-slate-200 text-xs transition"
            >
              <Columns className="w-3.5 h-3.5 text-purple-400" />
              <span>Split Vertical</span>
            </button>
            <button
              onClick={() => splitLeafNode(selectedNode.id, "COLUMN")}
              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-black/40 hover:bg-purple-950/60 border border-white/10 text-slate-200 text-xs transition"
            >
              <Rows className="w-3.5 h-3.5 text-purple-400" />
              <span>Split Horizontal</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => {
                const updated = updateNodeInTree(rootNode, selectedNode.id, (n) => ({
                  ...n,
                  widgets: [],
                }));
                updateRootNode(updated);
              }}
              className="py-1 px-2 rounded bg-black/40 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-white/5 text-[11px] transition text-center"
            >
              Clear Widgets
            </button>
            <button
              onClick={() => handleCloseBox(selectedNode.id)}
              className="py-1 px-2 rounded bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-[11px] font-semibold transition text-center flex items-center justify-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete Box</span>
            </button>
          </div>
        </div>
      )}

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
          className="p-2.5 rounded-xl bg-black/40 border border-white/10 hover:border-purple-500/70 hover:bg-purple-950/30 cursor-grab active:cursor-grabbing transition group flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 group-hover:scale-105 transition">
              <Box className="w-3.5 h-3.5" />
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
