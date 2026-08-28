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
  X,
  Settings2,
  Columns,
  Rows,
  Scale,
  Equal,
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
  const [secondarySelectedBoxId, setSecondarySelectedBoxId] = useState<string | null>(null);

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

  // Tree Helper: Check if a subtree contains a specific node ID
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

  // Match Size of Target Box (idTarget) to Reference Box (idReference)
  // Box 1 (idReference) remains 100% frozen!
  const handleMatchDimension = (idReference: string, idTarget: string, dimension: "WIDTH" | "HEIGHT") => {
    const reqDir: ContainerDirection = dimension === "WIDTH" ? "ROW" : "COLUMN";

    // 1. Get Reference Dimension (unchanged)
    const fractions = computeAllLeafFractions(rootNode);
    const refData = fractions.get(idReference);
    if (!refData) return;
    const targetAbsSize = dimension === "WIDTH" ? refData.w : refData.h;

    // 2. Find target's parent container in that direction
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

    // Find the available space of this container relative to canvas
    const containerFractions = computeAllLeafFractions(rootNode);
    // Find absolute size of the container
    let containerAbsSize = 1.0;
    const firstLeafInContainer = getAllLeafBoxes(parentNode)[0];
    if (firstLeafInContainer) {
      const leafF = containerFractions.get(firstLeafInContainer.id);
      const leafFractionInContainer = (parentNode.sizes[0] || 50) / (parentNode.sizes.reduce((a, b) => a + b, 0) || 100);
      if (leafF && leafFractionInContainer > 0) {
        containerAbsSize = (dimension === "WIDTH" ? leafF.w : leafF.h) / leafFractionInContainer;
      }
    }

    // Desired percentage of target box inside this container
    const desiredPercent = Math.max(5, Math.min(90, (targetAbsSize / containerAbsSize) * 100));
    const currentPercent = parentNode.sizes[childIndex];
    const diff = desiredPercent - currentPercent;

    // Determine neighbor to absorb the difference (prefer previous, otherwise next)
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

  // Local Two-Box Border Resizing: Dragging the splitter between child i and child i+1
  const startResizeLocalSplitter = (
    containerId: string,
    splitterIndex: number,
    direction: ContainerDirection,
    containerElement: HTMLElement
  ) => {
    const rect = containerElement.getBoundingClientRect();
    const parentContainer = findNodeById(rootNode, containerId);
    if (!parentContainer || !parentContainer.sizes) return;

    const initialSizes = [...parentContainer.sizes];
    const sumTwo = initialSizes[splitterIndex] + initialSizes[splitterIndex + 1];

    const handleMouseMove = (e: MouseEvent) => {
      const totalPixels = direction === "ROW" ? rect.width : rect.height;
      const currentPos = direction === "ROW" ? e.clientX - rect.left : e.clientY - rect.top;

      // Calculate pixel offset before splitterIndex
      let pixelsBefore = 0;
      for (let i = 0; i < splitterIndex; i++) {
        pixelsBefore += (initialSizes[i] / 100) * totalPixels;
      }

      const localOffset = currentPos - pixelsBefore;
      const localRatio = Math.max(0.05, Math.min(0.95, localOffset / ((sumTwo / 100) * totalPixels)));

      const newSizeLeft = Math.round(sumTwo * localRatio * 10) / 10;
      const newSizeRight = Math.round((sumTwo - newSizeLeft) * 10) / 10;

      const nextSizes = [...initialSizes];
      nextSizes[splitterIndex] = newSizeLeft;
      nextSizes[splitterIndex + 1] = newSizeRight;

      const updated = updateNodeInTree(rootNode, containerId, (n) => ({
        ...n,
        sizes: nextSizes,
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

  // Splitting a Box (Horizontal or Vertical)
  const splitLeafNode = (targetId: string, zone: DropSplitZone) => {
    if (!zone || zone === "CENTER") return;

    const isHorizontal = zone === "LEFT" || zone === "RIGHT";
    const reqDirection: ContainerDirection = isHorizontal ? "ROW" : "COLUMN";
    const isFirst = zone === "LEFT" || zone === "TOP";

    const newEmptyNode: LayoutNode = {
      id: `box_${Date.now() % 10000}_${Math.random().toString(36).substring(2, 4)}`,
      type: "LEAF",
      name: "New Box",
      widgets: [],
    };

    // Check if target is already inside a container with the same direction
    const parentInfo = findParentContainer(rootNode, targetId);
    if (parentInfo && parentInfo.parentNode.direction === reqDirection) {
      // Insert alongside target in existing container!
      const parent = parentInfo.parentNode;
      const targetIdx = parentInfo.childIndex;
      const targetOldSize = parent.sizes![targetIdx];
      const halfSize = Math.round((targetOldSize / 2) * 10) / 10;

      const newChildren = [...parent.children!];
      const newSizes = [...parent.sizes!];

      newSizes[targetIdx] = halfSize;
      if (isFirst) {
        newChildren.splice(targetIdx, 0, newEmptyNode);
        newSizes.splice(targetIdx, 0, halfSize);
      } else {
        newChildren.splice(targetIdx + 1, 0, newEmptyNode);
        newSizes.splice(targetIdx + 1, 0, halfSize);
      }

      const updated = updateNodeInTree(rootNode, parent.id, (n) => ({
        ...n,
        children: newChildren,
        sizes: newSizes,
      }));
      updateRootNode(updated);
      return;
    }

    // Otherwise, wrap the target in a new container of reqDirection with 2 children (50/50)
    const updated = updateNodeInTree(rootNode, targetId, (existingNode) => ({
      id: `container_${Date.now() % 10000}`,
      type: "CONTAINER",
      direction: reqDirection,
      sizes: [50, 50],
      children: isFirst
        ? [newEmptyNode, { ...existingNode }]
        : [{ ...existingNode }, newEmptyNode],
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
      if (newChildren.length === 1) return newChildren[0]; // Collapse single-child container

      // Normalize remaining sizes to sum to 100
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
    if (selectedBoxId === nodeId) setSelectedBoxId(null);
    if (secondarySelectedBoxId === nodeId) setSecondarySelectedBoxId(null);

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

  const allLeafBoxes = getAllLeafBoxes(rootNode);
  const selectedNode = selectedBoxId ? findNodeById(rootNode, selectedBoxId) : null;
  const secondaryNode = secondarySelectedBoxId ? findNodeById(rootNode, secondarySelectedBoxId) : null;

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
                        startResizeLocalSplitter(node.id, idx, node.direction || "ROW", parent);
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
            setSecondarySelectedBoxId(node.id);
          } else {
            setSelectedBoxId(node.id);
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

      {/* Main Canvas Viewport Area with Non-Shifting Canvas */}
      <div className="flex-1 min-h-0 overflow-hidden relative flex items-center justify-center p-1">
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

        {/* Floating Overlay Box Options Drawer (Overlays cleanly without pushing or shifting the game canvas) */}
        {selectedNode && (
          <div className="absolute top-4 right-4 bottom-4 w-80 bg-[#1c1a24]/95 backdrop-blur-md rounded-xl border border-purple-500/50 p-4 flex flex-col space-y-4 shadow-2xl overflow-y-auto z-50 animate-in slide-in-from-right-4 duration-200">
            {/* Popover Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <Settings2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-100">{selectedNode.name || "Box Inspector"}</h3>
                  <span className="text-[10px] text-purple-400 font-mono">ID: {selectedNode.id}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedBoxId(null);
                  setSecondarySelectedBoxId(null);
                }}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Match Size with Another Box (2-Box Equalizer) */}
            <div className="bg-black/35 p-3 rounded-xl border border-purple-500/30 space-y-2.5">
              <div className="flex items-center gap-1.5 text-purple-300 font-bold text-xs">
                <Equal className="w-4 h-4" />
                <span>Match Size with Another Box</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Select any 2nd box to make it take this box's exact size:
              </p>

              {/* Target Box Selector */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 block uppercase font-mono">
                  Select 2nd Box:
                </label>
                <select
                  value={secondarySelectedBoxId || ""}
                  onChange={(e) => setSecondarySelectedBoxId(e.target.value || null)}
                  className="w-full px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-purple-400 font-medium"
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
                <div className="space-y-2 pt-1">
                  <div className="flex flex-col gap-1 text-[11px] bg-purple-950/40 p-2.5 rounded-lg border border-purple-500/20 text-purple-200">
                    <div className="flex justify-between">
                      <span className="text-slate-400">1. Reference (Unchanged):</span>
                      <span className="font-semibold text-purple-300">{selectedNode.name || selectedNode.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">2. Target to Resize:</span>
                      <span className="font-semibold text-amber-300">{secondaryNode.name || secondaryNode.id}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleMatchDimension(selectedNode.id, secondaryNode.id, "WIDTH")}
                      className="py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition text-center"
                    >
                      Match Width
                    </button>
                    <button
                      onClick={() => handleMatchDimension(selectedNode.id, secondaryNode.id, "HEIGHT")}
                      className="py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition text-center"
                    >
                      Match Height
                    </button>
                  </div>
                </div>
              )}
            </div>

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
