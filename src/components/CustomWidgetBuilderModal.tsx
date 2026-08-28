import React, { useState } from "react";
import { CustomWidgetDefinition, AtomicElementType, AtomicElementConfig } from "../types/elements";
import { X, Plus, Trash2, Layers, MoveVertical, MoveHorizontal } from "lucide-react";

interface CustomWidgetBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (widget: CustomWidgetDefinition) => void;
  initialWidget?: CustomWidgetDefinition;
}

const AVAILABLE_ATOMIC_ELEMENTS: { type: AtomicElementType; label: string; desc: string }[] = [
  { type: "PLAYER_NAME", label: "Player Name", desc: "Hero display name text" },
  { type: "PLAYER_TITLE", label: "Racial / Class Title", desc: "E.g. Lilim Infiltrator, Felis Rogue" },
  { type: "PLAYER_RACE_GENDER", label: "Gender & Race", desc: "Gender archetype and dominant species" },
  { type: "HEALTH_BAR", label: "Health Bar (HP)", desc: "HP progress gauge" },
  { type: "MANA_BAR", label: "Mana Bar (MP)", desc: "Mana energy gauge" },
  { type: "LUST_BAR", label: "Lust / Arousal Gauge", desc: "Lust / Arousal progress gauge" },
  { type: "DOMINANCE_BAR", label: "Dominance Continuum", desc: "Dominant vs Submissive slider" },
  { type: "STAT_ATTRIBUTES_LIST", label: "Attributes Table", desc: "Physique, Agility, Arcane, Corruption" },
  { type: "ANATOMY_FLUID_SUMMARY", label: "Anatomy & Fluid Levels", desc: "Breasts, Groin, Milk & Cum levels" },
  { type: "PAPERDOLL_EQUIPMENT_GRID", label: "Paperdoll Gear Grid", desc: "35 clothing and jewelry sockets" },
  { type: "MINIMAP_RADAR", label: "9x9 World Map Grid", desc: "Overworld tile radar with player cursor" },
  { type: "TARGET_INSPECTOR", label: "Target NPC Card", desc: "Proximity NPC name, level & HP" },
  { type: "CYOA_STORY_VIEW", label: "Narrative Dialogue Text", desc: "Speaker header & scene story body" },
  { type: "CYOA_SEX_LOG", label: "Erotic Encounter Log", desc: "Turn-by-turn sex narrative text" },
  { type: "COMBAT_PARTY_STATUS", label: "Player Combat Party", desc: "Player + companion status bars" },
  { type: "COMBAT_ENEMY_STATUS", label: "Enemy Combat Party", desc: "Hostile opponent health meters" },
  { type: "COMBAT_LOG_STREAM", label: "Tactical Combat Log", desc: "Combat damage & spell roll feed" },
  { type: "INVENTORY_BACKPACK_LIST", label: "Player Backpack List", desc: "Dual inventory side 0" },
  { type: "INVENTORY_GROUND_CONTAINER", label: "Ground / Chest Container", desc: "Dual inventory side 1" },
  { type: "ACTION_COMMANDS_GRID", label: "Action Commands Grid", desc: "5x2 Grid with pagination" },
  { type: "TIME_DATE_BANNER", label: "Time & Date Clock", desc: "Formatted time, date and phase" },
  { type: "CURRENCY_GOLD_COUNTER", label: "Gold / Currency Badge", desc: "Current gold display" },
  { type: "LOCATION_MAP_BADGE", label: "Active Location Name", desc: "Current map district name" },
  { type: "CUSTOM_TEXT_LABEL", label: "Custom Static Text", desc: "Arbitrary decorative text or separator" },
];

export const CustomWidgetBuilderModal: React.FC<CustomWidgetBuilderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialWidget,
}) => {
  const [name, setName] = useState(initialWidget?.name || "New Custom Widget");
  const [description, setDescription] = useState(initialWidget?.description || "User-composed modular widget");
  const [direction, setDirection] = useState<"VERTICAL" | "HORIZONTAL">(
    initialWidget?.layoutDirection || "VERTICAL"
  );
  const [gap, setGap] = useState(initialWidget?.gap ?? 6);
  const [padding, setPadding] = useState(initialWidget?.padding ?? 6);
  const [elements, setElements] = useState<AtomicElementConfig[]>(initialWidget?.elements || []);

  if (!isOpen) return null;

  const addElement = (type: AtomicElementType, label: string) => {
    const newEl: AtomicElementConfig = {
      id: `el_${Date.now() % 10000}`,
      type,
      label,
    };
    setElements([...elements, newEl]);
  };

  const removeElement = (index: number) => {
    setElements(elements.filter((_, i) => i !== index));
  };

  const moveElement = (index: number, up: boolean) => {
    const target = up ? index - 1 : index + 1;
    if (target < 0 || target >= elements.length) return;
    const next = [...elements];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setElements(next);
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert("Please provide a widget name.");
      return;
    }
    const widget: CustomWidgetDefinition = {
      id: initialWidget?.id || `custom_widget_${Date.now()}`,
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
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-6 select-none font-sans">
      <div className="bg-[#1c1a24] w-[900px] max-h-[85vh] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#252230] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-100">Custom Widget Composer</h2>
              <p className="text-xs text-purple-400">Combine atomic UI elements into reusable widgets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-white/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body (2 Columns: Config + Palette / Preview) */}
        <div className="flex-1 flex overflow-hidden p-6 gap-6">
          {/* Left Column: Properties & Element List */}
          <div className="w-[420px] flex flex-col space-y-4 overflow-y-auto pr-2">
            <div className="space-y-3 bg-black/30 p-4 rounded-xl border border-white/5">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Widget Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded text-xs text-slate-100 font-medium"
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

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Direction</label>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setDirection("VERTICAL")}
                      className={`flex-1 flex items-center justify-center p-1.5 rounded border text-xs ${
                        direction === "VERTICAL"
                          ? "bg-purple-600 border-purple-400 text-white"
                          : "bg-black/40 border-white/10 text-slate-400"
                      }`}
                      title="Vertical Stacking"
                    >
                      <MoveVertical className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDirection("HORIZONTAL")}
                      className={`flex-1 flex items-center justify-center p-1.5 rounded border text-xs ${
                        direction === "HORIZONTAL"
                          ? "bg-purple-600 border-purple-400 text-white"
                          : "bg-black/40 border-white/10 text-slate-400"
                      }`}
                      title="Horizontal Snapping"
                    >
                      <MoveHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Gap (px)</label>
                  <input
                    type="number"
                    value={gap}
                    min="0"
                    max="24"
                    onChange={(e) => setGap(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-black/40 border border-white/10 rounded text-xs text-slate-100 font-mono"
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
                    className="w-full px-2 py-1 bg-black/40 border border-white/10 rounded text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Elements In This Widget */}
            <div className="flex-1 flex flex-col space-y-2">
              <span className="text-xs font-semibold text-purple-300">
                Arranged Elements ({elements.length}):
              </span>
              {elements.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-white/10 text-center text-xs text-slate-500">
                  No elements added yet. Click an atomic element from the palette on the right to add it.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {elements.map((el, i) => (
                    <div
                      key={el.id}
                      className="flex items-center justify-between px-3 py-2 bg-black/30 border border-white/5 rounded-lg text-xs"
                    >
                      <span className="font-medium text-slate-200">{el.label || el.type}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveElement(i, true)}
                          disabled={i === 0}
                          className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-white disabled:opacity-30"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveElement(i, false)}
                          disabled={i === elements.length - 1}
                          className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-white disabled:opacity-30"
                        >
                          ▼
                        </button>
                        <button
                          onClick={() => removeElement(i)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Atomic Elements Palette */}
          <div className="flex-1 flex flex-col space-y-3 overflow-hidden">
            <span className="text-xs font-semibold text-purple-300">
              Click to Add Atomic Elements to Widget:
            </span>
            <div className="flex-1 grid grid-cols-2 gap-2 overflow-y-auto pr-2">
              {AVAILABLE_ATOMIC_ELEMENTS.map((elem) => (
                <button
                  key={elem.type}
                  onClick={() => addElement(elem.type, elem.label)}
                  className="flex flex-col p-2.5 rounded-xl bg-black/30 border border-white/5 hover:border-purple-500/50 hover:bg-purple-950/20 text-left transition group"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-semibold text-xs text-slate-200 group-hover:text-purple-300">
                      {elem.label}
                    </span>
                    <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400" />
                  </div>
                  <span className="text-[11px] text-slate-400 leading-tight">{elem.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#252230] border-t border-white/10 flex items-center justify-end gap-3">
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
            Save Custom Widget
          </button>
        </div>
      </div>
    </div>
  );
};
