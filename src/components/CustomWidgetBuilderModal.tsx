import React, { useState } from "react";
import { CustomWidgetDefinition, AtomicElementType, AtomicElementConfig } from "../types/elements";
import { X, Trash2, Layers, MoveVertical, MoveHorizontal, GripVertical, Plus } from "lucide-react";
import { AtomicElementRenderer } from "./AtomicElementRenderer";
import { DEFAULT_DARK_FANTASY_THEME } from "../types/theme";

interface CustomWidgetBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (widget: CustomWidgetDefinition) => void;
  initialWidget?: CustomWidgetDefinition;
}

const AVAILABLE_ATOMIC_ELEMENTS: { type: AtomicElementType; label: string; desc: string; category: string }[] = [
  // Character & Bio
  { type: "PLAYER_NAME", label: "Player Name", desc: "Hero display name text", category: "Bio & Status" },
  { type: "PLAYER_TITLE", label: "Racial / Class Title", desc: "E.g. Lilim Infiltrator, Felis Rogue", category: "Bio & Status" },
  { type: "PLAYER_RACE_GENDER", label: "Gender & Race", desc: "Gender archetype and dominant species", category: "Bio & Status" },

  // Gauges
  { type: "HEALTH_BAR", label: "Health Bar (HP)", desc: "HP progress gauge", category: "Vitals & Gauges" },
  { type: "MANA_BAR", label: "Mana Bar (MP)", desc: "Mana energy gauge", category: "Vitals & Gauges" },
  { type: "LUST_BAR", label: "Lust / Arousal Gauge", desc: "Lust / Arousal progress gauge", category: "Vitals & Gauges" },
  { type: "DOMINANCE_BAR", label: "Dominance Continuum", desc: "Dominant vs Submissive slider", category: "Vitals & Gauges" },

  // Stats & Anatomy
  { type: "STAT_ATTRIBUTES_LIST", label: "Attributes Table", desc: "Physique, Agility, Arcane, Corruption", category: "Attributes & Body" },
  { type: "ANATOMY_FLUID_SUMMARY", label: "Anatomy & Fluid Levels", desc: "Breasts, Groin, Milk & Cum levels", category: "Attributes & Body" },
  { type: "PAPERDOLL_EQUIPMENT_GRID", label: "Paperdoll Gear Grid", desc: "35 clothing and jewelry sockets", category: "Attributes & Body" },

  // World & Radar
  { type: "MINIMAP_RADAR", label: "9x9 World Map Grid", desc: "Overworld tile radar with player cursor", category: "World & Radar" },
  { type: "TARGET_INSPECTOR", label: "Target NPC Card", desc: "Proximity NPC name, level & HP", category: "World & Radar" },
  { type: "TIME_DATE_BANNER", label: "Time & Date Clock", desc: "Formatted time, date and phase", category: "World & Radar" },
  { type: "LOCATION_MAP_BADGE", label: "Active Location Name", desc: "Current map district name", category: "World & Radar" },
  { type: "CURRENCY_GOLD_COUNTER", label: "Gold / Currency Badge", desc: "Current gold display", category: "World & Radar" },

  // CYOA Narrative & Combat
  { type: "CYOA_STORY_VIEW", label: "Narrative Dialogue Text", desc: "Speaker header & scene story body", category: "CYOA & Actions" },
  { type: "CYOA_SEX_LOG", label: "Erotic Encounter Log", desc: "Turn-by-turn sex narrative text", category: "CYOA & Actions" },
  { type: "COMBAT_PARTY_STATUS", label: "Player Combat Party", desc: "Player + companion status bars", category: "CYOA & Actions" },
  { type: "COMBAT_ENEMY_STATUS", label: "Enemy Combat Party", desc: "Hostile opponent health meters", category: "CYOA & Actions" },
  { type: "COMBAT_LOG_STREAM", label: "Tactical Combat Log", desc: "Combat damage & spell roll feed", category: "CYOA & Actions" },
  { type: "INVENTORY_BACKPACK_LIST", label: "Player Backpack List", desc: "Dual inventory side 0", category: "CYOA & Actions" },
  { type: "INVENTORY_GROUND_CONTAINER", label: "Ground / Chest Container", desc: "Dual inventory side 1", category: "CYOA & Actions" },
  { type: "ACTION_COMMANDS_GRID", label: "Action Commands Grid", desc: "5x2 Grid with pagination", category: "CYOA & Actions" },
  { type: "CUSTOM_TEXT_LABEL", label: "Custom Static Text", desc: "Arbitrary decorative text", category: "General" },
];

export const CustomWidgetBuilderModal: React.FC<CustomWidgetBuilderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialWidget,
}) => {
  const [name, setName] = useState(initialWidget?.name || "Custom Widget");
  const [description, setDescription] = useState(initialWidget?.description || "User-composed modular widget");
  const [direction, setDirection] = useState<"VERTICAL" | "HORIZONTAL">(
    initialWidget?.layoutDirection || "VERTICAL"
  );
  const [gap, setGap] = useState(initialWidget?.gap ?? 6);
  const [padding, setPadding] = useState(initialWidget?.padding ?? 6);
  const [elements, setElements] = useState<AtomicElementConfig[]>(initialWidget?.elements || []);
  const [isDragOverDropZone, setIsDragOverDropZone] = useState(false);
  const [draggedElementIndex, setDraggedElementIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleAddElement = (type: AtomicElementType, label: string) => {
    const newEl: AtomicElementConfig = {
      id: `el_${Date.now() % 10000}_${Math.random().toString(36).substring(2, 5)}`,
      type,
      label,
    };
    setElements((prev) => [...prev, newEl]);
  };

  const handleRemoveElement = (index: number) => {
    setElements((prev) => prev.filter((_, i) => i !== index));
  };

  // Drag handlers for Palette Items
  const handlePaletteDragStart = (e: React.DragEvent, elem: (typeof AVAILABLE_ATOMIC_ELEMENTS)[0]) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ type: elem.type, label: elem.label }));
    e.dataTransfer.effectAllowed = "copy";
  };

  // Drag handlers for Drop Zone
  const handleDropZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOverDropZone(true);
  };

  const handleDropZoneDragLeave = () => {
    setIsDragOverDropZone(false);
  };

  const handleDropZoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverDropZone(false);

    try {
      const dataStr = e.dataTransfer.getData("application/json");
      if (dataStr) {
        const item = JSON.parse(dataStr);
        if (item.type) {
          handleAddElement(item.type, item.label);
          return;
        }
      }
    } catch {
      // Ignored
    }

    // Reorder inside elements
    if (draggedElementIndex !== null) {
      setDraggedElementIndex(null);
    }
  };

  // Internal Reordering Handlers
  const handleInternalDragStart = (e: React.DragEvent, index: number) => {
    setDraggedElementIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleInternalDragOverItem = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedElementIndex === null || draggedElementIndex === targetIndex) return;

    const updated = [...elements];
    const item = updated.splice(draggedElementIndex, 1)[0];
    updated.splice(targetIndex, 0, item);
    setDraggedElementIndex(targetIndex);
    setElements(updated);
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert("Please provide a widget name.");
      return;
    }
    const widget: CustomWidgetDefinition = {
      id: initialWidget?.id || `custom_${Date.now() % 10000}`,
      name,
      description,
      isPremade: false,
      layoutDirection: direction,
      gap,
      padding,
      elements,
    };
    onSave(widget);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6 select-none font-sans">
      <div className="bg-[#181620] w-[1050px] max-h-[90vh] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-3.5 bg-[#221f2d] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-100">Custom Widget Composer</h2>
              <p className="text-xs text-purple-400">Drag and drop atomic elements into the widget box</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-white/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden p-6 gap-6">
          {/* Left Column: Atomic Elements Palette (Draggable) */}
          <div className="w-[340px] shrink-0 flex flex-col space-y-3 overflow-hidden border-r border-white/10 pr-4">
            <div>
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
                Atomic Elements Library
              </span>
              <span className="text-[11px] text-slate-400">Drag or click to add to your widget</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {AVAILABLE_ATOMIC_ELEMENTS.map((elem) => (
                <div
                  key={elem.type}
                  draggable={true}
                  onDragStart={(e) => handlePaletteDragStart(e, elem)}
                  onClick={() => handleAddElement(elem.type, elem.label)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-purple-500/50 hover:bg-purple-950/20 cursor-grab active:cursor-grabbing transition group shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-purple-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-xs text-slate-200 group-hover:text-purple-200">
                        {elem.label}
                      </div>
                      <div className="text-[10px] text-slate-500 leading-tight">{elem.desc}</div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddElement(elem.type, elem.label);
                    }}
                    className="p-1 text-slate-500 hover:text-purple-300 rounded hover:bg-white/5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Widget Configuration & Visual Drop Canvas */}
          <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-1">
            {/* Widget Global Properties */}
            <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Widget Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded text-xs text-slate-100 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded text-xs text-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Stack Direction</label>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setDirection("VERTICAL")}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded border text-xs font-medium ${
                        direction === "VERTICAL"
                          ? "bg-purple-600 border-purple-400 text-white"
                          : "bg-black/40 border-white/10 text-slate-400"
                      }`}
                    >
                      <MoveVertical className="w-3.5 h-3.5" />
                      <span>Vertical</span>
                    </button>
                    <button
                      onClick={() => setDirection("HORIZONTAL")}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded border text-xs font-medium ${
                        direction === "HORIZONTAL"
                          ? "bg-purple-600 border-purple-400 text-white"
                          : "bg-black/40 border-white/10 text-slate-400"
                      }`}
                    >
                      <MoveHorizontal className="w-3.5 h-3.5" />
                      <span>Horizontal</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Gap Between Elements (px)</label>
                  <input
                    type="number"
                    value={gap}
                    min="0"
                    max="24"
                    onChange={(e) => setGap(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 bg-black/40 border border-white/10 rounded text-xs text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Padding (px)</label>
                  <input
                    type="number"
                    value={padding}
                    min="0"
                    max="24"
                    onChange={(e) => setPadding(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 bg-black/40 border border-white/10 rounded text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Visual Drop Canvas Box */}
            <div className="flex-1 flex flex-col space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-200">
                  Composed Widget Drop Box ({elements.length} elements):
                </span>
                {elements.length > 0 && (
                  <button
                    onClick={() => setElements([])}
                    className="text-[11px] text-slate-400 hover:text-rose-400"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* The Live Drop Zone Container */}
              <div
                onDragOver={handleDropZoneDragOver}
                onDragLeave={handleDropZoneDragLeave}
                onDrop={handleDropZoneDrop}
                className={`min-h-[220px] rounded-xl border-2 transition-all p-4 flex flex-col ${
                  isDragOverDropZone
                    ? "border-purple-500 bg-purple-950/30 ring-2 ring-purple-500/30 scale-[1.005]"
                    : "border-dashed border-white/15 bg-black/40"
                }`}
              >
                {elements.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-xs text-slate-400 space-y-2">
                    <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-slate-200">Empty Widget Box</span>
                    <p className="text-[11px] text-slate-500 max-w-[280px]">
                      Drag atomic elements from the left and drop them directly into this box to compose your widget.
                    </p>
                  </div>
                ) : (
                  <div
                    className={`w-full flex ${
                      direction === "HORIZONTAL" ? "flex-row items-center" : "flex-col"
                    } gap-${gap / 2}`}
                  >
                    {elements.map((el, idx) => (
                      <div
                        key={el.id}
                        draggable={true}
                        onDragStart={(e) => handleInternalDragStart(e, idx)}
                        onDragOver={(e) => handleInternalDragOverItem(e, idx)}
                        className="relative group/elem p-2.5 rounded-lg bg-black/50 border border-white/10 hover:border-purple-500/40 transition cursor-grab active:cursor-grabbing"
                      >
                        <div className="absolute top-1 right-1 opacity-0 group-hover/elem:opacity-100 flex items-center gap-1 bg-black/80 px-1.5 py-0.5 rounded border border-white/10 z-10">
                          <span className="text-[10px] text-purple-300 font-mono">#{idx + 1}</span>
                          <button
                            onClick={() => handleRemoveElement(idx)}
                            className="text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Rendered Live Element Mock */}
                        <AtomicElementRenderer
                          element={el}
                          theme={DEFAULT_DARK_FANTASY_THEME}
                          activeState="EXPLORATION"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#221f2d] border-t border-white/10 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-xs font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-purple-600/30 transition"
          >
            Save Widget to Library
          </button>
        </div>
      </div>
    </div>
  );
};
