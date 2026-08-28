import React from "react";
import { AtomicElementConfig } from "../types/elements";
import { ThemeFile, colorToCss } from "../types/theme";
import { GameSimulationState } from "../types/layout";
import { MapPin, Coins } from "lucide-react";

interface AtomicElementRendererProps {
  element: AtomicElementConfig;
  theme: ThemeFile;
  activeState: GameSimulationState;
}

export const AtomicElementRenderer: React.FC<AtomicElementRendererProps> = ({
  element,
  theme,
  activeState,
}) => {
  const colors = theme.colors;
  const radius = `${theme.borderRadius}px`;
  const gaugeStyle = theme.gaugeStyle;

  switch (element.type) {
    case "TIME_DATE_BANNER":
      return (
        <div className="text-[11px]" style={{ color: colorToCss(colors.textSecondary) }}>
          08:30 AM | Day 1, Early Morning
        </div>
      );

    case "CURRENCY_GOLD_COUNTER":
      return (
        <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: colorToCss(colors.currency) }}>
          <Coins className="w-3.5 h-3.5" /> 150¤
        </span>
      );

    case "LOCATION_MAP_BADGE":
      return (
        <span className="flex items-center gap-1 text-[11px] font-medium" style={{ color: colorToCss(colors.textAccent) }}>
          <MapPin className="w-3.5 h-3.5" /> Grand Bazaar
        </span>
      );

    case "PLAYER_NAME":
      return (
        <div className="text-xs" style={{ color: colorToCss(colors.textPrimary) }}>
          Name: <span className="font-semibold text-slate-100">Vesper</span>
        </div>
      );

    case "PLAYER_TITLE":
      return (
        <div className="text-xs" style={{ color: colorToCss(colors.textAccent) }}>
          Title: <span className="font-semibold">Lilim Infiltrator</span>
        </div>
      );

    case "PLAYER_RACE_GENDER":
      return (
        <div className="text-xs" style={{ color: colorToCss(colors.textSecondary) }}>
          Gender: <span className="font-semibold">Hermaphrodite</span>
        </div>
      );

    case "HEALTH_BAR":
      return (
        <div className="w-full">
          <div className="flex justify-between text-[11px] mb-0.5" style={{ color: colorToCss(colors.textSecondary) }}>
            <span>Health</span>
            <span>100 / 100</span>
          </div>
          <div
            className="h-3.5 w-full bg-black/40 overflow-hidden p-0.5 border border-white/5"
            style={{ borderRadius: radius }}
          >
            <div
              className={`h-full transition-all ${
                gaugeStyle === "STRIPED" ? "bg-stripes" : gaugeStyle === "GLOW" ? "shadow-md" : ""
              }`}
              style={{
                width: "100%",
                backgroundColor: colorToCss(colors.health),
                borderRadius: radius,
              }}
            />
          </div>
        </div>
      );

    case "MANA_BAR":
      return (
        <div className="w-full">
          <div className="flex justify-between text-[11px] mb-0.5" style={{ color: colorToCss(colors.textSecondary) }}>
            <span>Mana</span>
            <span>45 / 50</span>
          </div>
          <div
            className="h-3.5 w-full bg-black/40 overflow-hidden p-0.5 border border-white/5"
            style={{ borderRadius: radius }}
          >
            <div
              className="h-full transition-all"
              style={{
                width: "90%",
                backgroundColor: colorToCss(colors.mana),
                borderRadius: radius,
              }}
            />
          </div>
        </div>
      );

    case "LUST_BAR":
      return (
        <div className="w-full">
          <div className="flex justify-between text-[11px] mb-0.5" style={{ color: colorToCss(colors.textSecondary) }}>
            <span>Lust / Arousal</span>
            <span>35 / 100</span>
          </div>
          <div
            className="h-3.5 w-full bg-black/40 overflow-hidden p-0.5 border border-white/5"
            style={{ borderRadius: radius }}
          >
            <div
              className="h-full transition-all"
              style={{
                width: "35%",
                backgroundColor: colorToCss(colors.lust),
                borderRadius: radius,
              }}
            />
          </div>
        </div>
      );

    case "DOMINANCE_BAR":
      return (
        <div className="w-full">
          <div className="flex justify-between text-[11px] mb-0.5" style={{ color: colorToCss(colors.textGold) }}>
            <span>Dominance Continuum</span>
            <span style={{ color: colorToCss(colors.textAccent) }}>Dominant (+30)</span>
          </div>
          <div
            className="h-3.5 w-full bg-black/40 overflow-hidden p-0.5 border border-white/5"
            style={{ borderRadius: radius }}
          >
            <div
              className="h-full transition-all"
              style={{
                width: "65%",
                backgroundColor: colorToCss(colors.textAccent),
                borderRadius: radius,
              }}
            />
          </div>
        </div>
      );

    case "STAT_ATTRIBUTES_LIST":
      return (
        <div className="w-full pt-1 text-xs space-y-1">
          <div className="font-semibold text-[11px] tracking-wider" style={{ color: colorToCss(colors.textGold) }}>
            ATTRIBUTES
          </div>
          <div className="flex justify-between" style={{ color: colorToCss(colors.physique) }}>
            <span>Physique</span>
            <span className="font-mono">14</span>
          </div>
          <div className="flex justify-between" style={{ color: colorToCss(colors.textSecondary) }}>
            <span>Agility</span>
            <span className="font-mono">18</span>
          </div>
          <div className="flex justify-between" style={{ color: colorToCss(colors.arcane) }}>
            <span>Arcane</span>
            <span className="font-mono">22</span>
          </div>
          <div className="flex justify-between" style={{ color: colorToCss(colors.corruption) }}>
            <span>Corruption</span>
            <span className="font-mono">40</span>
          </div>
        </div>
      );

    case "ANATOMY_FLUID_SUMMARY":
      return (
        <div className="w-full pt-1 text-xs space-y-1">
          <div className="font-semibold text-[11px] tracking-wider" style={{ color: colorToCss(colors.textGold) }}>
            ANATOMY & FLUIDS
          </div>
          <div className="text-[11px]" style={{ color: colorToCss(colors.textSecondary) }}>
            Height: 1.78m (Lilim demon)
          </div>
          <div className="text-[11px]" style={{ color: colorToCss(colors.textSecondary) }}>
            Breasts: D-Cup (150/300ml milk)
          </div>
          <div className="text-[11px]" style={{ color: colorToCss(colors.textSecondary) }}>
            Penis: 20.0cm x 4.5cm (25/50ml cum)
          </div>
        </div>
      );

    case "MINIMAP_RADAR":
      return (
        <div className="w-full flex flex-col items-center">
          <div
            className="grid grid-cols-7 gap-1 p-2 bg-black/40 border border-white/5 w-full max-w-[210px]"
            style={{ borderRadius: radius }}
          >
            {Array.from({ length: 49 }).map((_, i) => {
              const isPlayer = i === 24;
              const isWall = i % 7 === 0 || i < 7 || i > 41;
              return (
                <div
                  key={i}
                  className="aspect-square w-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    backgroundColor: isPlayer
                      ? colorToCss(colors.borderButton)
                      : isWall
                      ? colorToCss(colors.bgHeader)
                      : colorToCss(colors.bgSlot),
                    color: isPlayer ? colorToCss(colors.textGold) : "transparent",
                    borderRadius: `${Math.max(1, theme.borderRadius / 2)}px`,
                  }}
                >
                  {isPlayer ? "@" : ""}
                </div>
              );
            })}
          </div>
        </div>
      );

    case "TARGET_INSPECTOR":
      return (
        <div className="w-full pt-1 text-xs space-y-1">
          <div className="font-semibold text-[11px] tracking-wider" style={{ color: colorToCss(colors.textGold) }}>
            PROXIMITY TARGET
          </div>
          <div style={{ color: colorToCss(colors.textPrimary) }}>Name: Amira</div>
          <div style={{ color: colorToCss(colors.textSecondary) }}>Level 5 | Felis Merchant</div>
          <div
            className="h-3 bg-black/40 overflow-hidden mt-1"
            style={{ borderRadius: radius }}
          >
            <div
              className="h-full"
              style={{ width: "80%", backgroundColor: colorToCss(colors.friendly), borderRadius: radius }}
            />
          </div>
        </div>
      );

    case "CYOA_STORY_VIEW":
      return (
        <div className="w-full space-y-2 text-xs leading-relaxed" style={{ color: colorToCss(colors.textPrimary) }}>
          <div
            className="px-3 py-1.5 font-bold tracking-wider text-xs border"
            style={{
              backgroundColor: colorToCss(colors.bgHeader),
              borderColor: colorToCss(colors.borderNormal),
              color: colorToCss(colors.textGold),
              borderRadius: radius,
            }}
          >
            {activeState === "SCENE" ? "TALKING WITH AMIRA" : "OVERWORLD EXPLORATION"}
          </div>
          <p>
            You explore the cobblestone courtyard of Lilith's District. Arcane street lamps flicker with lavender
            magical light. Merchants, succubi, and travelers wander the lively avenue.
          </p>
        </div>
      );

    case "CYOA_SEX_LOG":
      return (
        <div
          className="w-full p-3 bg-black/30 border border-white/5 text-xs leading-relaxed"
          style={{ color: colorToCss(colors.textSecondary), borderRadius: radius }}
        >
          You lean closer, brushing a tender hand against her feline ears. A deep, satisfied purr resonates through the room...
        </div>
      );

    case "COMBAT_PARTY_STATUS":
      return (
        <div className="w-full space-y-1">
          <div className="font-semibold text-xs" style={{ color: colorToCss(colors.friendly) }}>
            Player Party: Vesper (AP: 3)
          </div>
          <div className="h-3 bg-black/40 rounded overflow-hidden">
            <div className="h-full" style={{ width: "100%", backgroundColor: colorToCss(colors.health) }} />
          </div>
        </div>
      );

    case "COMBAT_ENEMY_STATUS":
      return (
        <div className="w-full space-y-1">
          <div className="font-semibold text-xs" style={{ color: colorToCss(colors.enemy) }}>
            Hostile: Rogue Bandit (AP: 2)
          </div>
          <div className="h-3 bg-black/40 rounded overflow-hidden">
            <div className="h-full" style={{ width: "55%", backgroundColor: colorToCss(colors.enemy) }} />
          </div>
        </div>
      );

    case "COMBAT_LOG_STREAM":
      return (
        <div
          className="w-full p-2.5 bg-black/30 border border-white/5 text-[11px] font-mono space-y-1"
          style={{ color: colorToCss(colors.textSecondary), borderRadius: radius }}
        >
          <div>[Round 1] Vesper casts Arcane Bolt → 24 Magic Dmg!</div>
          <div>[Round 1] Bandit attacks with Dagger → 12 Phys Dmg.</div>
        </div>
      );

    case "INVENTORY_BACKPACK_LIST":
      return (
        <div className="w-full space-y-1 text-xs">
          <span className="font-semibold" style={{ color: colorToCss(colors.textGold) }}>
            Player Backpack (Side 0):
          </span>
          <div className="space-y-1">
            {["[0] Iron Dagger (x1)", "[1] Health Potion (x3)", "[2] Silk Robes (x1)"].map((item, idx) => (
              <div
                key={idx}
                className="p-1.5 bg-black/20 border border-white/5 rounded text-[11px]"
                style={{ color: colorToCss(colors.textPrimary) }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      );

    case "INVENTORY_GROUND_CONTAINER":
      return (
        <div className="w-full space-y-1 text-xs">
          <span className="font-semibold" style={{ color: colorToCss(colors.textGold) }}>
            Ground Container (Side 1):
          </span>
          <div className="space-y-1">
            {["[0] Gold Coin Sack (x50)", "[1] Ancient Grimoire (x1)"].map((item, idx) => (
              <div
                key={idx}
                className="p-1.5 bg-black/20 border border-white/5 rounded text-[11px]"
                style={{ color: colorToCss(colors.textSecondary) }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      );

    case "ACTION_COMMANDS_GRID":
      return (
        <div className="w-full grid grid-cols-5 gap-2">
          {["North", "South", "East", "West", "Rest", "Talk", "Inventory", "Shop", "Spells", "Pass"].map(
            (cmd, idx) => (
              <button
                key={idx}
                className="py-2 px-1 rounded text-xs font-semibold flex items-center justify-center transition border shadow-sm"
                style={{
                  backgroundColor: colorToCss(colors.bgButton),
                  borderColor: colorToCss(colors.borderButton),
                  color: colorToCss(colors.textPrimary),
                  borderRadius: radius,
                }}
              >
                {cmd}
              </button>
            )
          )}
        </div>
      );

    case "PAPERDOLL_EQUIPMENT_GRID":
      return (
        <div className="w-full space-y-2">
          <div className="text-xs font-semibold" style={{ color: colorToCss(colors.textGold) }}>
            EQUIPPED GEAR (Paperdoll):
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { slot: "Head", item: "Mage Hood (+5 Arc)" },
              { slot: "Chest", item: "Silk Robes (+12 Def)" },
              { slot: "Hands", item: "Leather Gloves" },
              { slot: "Mainhand", item: "Runic Staff (+18 Arc)" },
              { slot: "Offhand", item: "Spell Orb (+8 MP)" },
              { slot: "Legs", item: "Cloth Pants" },
              { slot: "Feet", item: "Boots of Swiftness" },
              { slot: "Neck", item: "Amulet of Lust (+10 Lust)" },
              { slot: "Ring", item: "Ring of Corruption" },
            ].map((s, idx) => (
              <div
                key={idx}
                className="p-1.5 bg-black/30 border border-white/10 rounded flex flex-col justify-between text-[10px]"
                style={{ borderRadius: radius }}
              >
                <span className="font-semibold text-[9px] uppercase tracking-wider" style={{ color: colorToCss(colors.textSecondary) }}>
                  {s.slot}
                </span>
                <span className="truncate font-medium" style={{ color: colorToCss(colors.textPrimary) }}>
                  {s.item}
                </span>
              </div>
            ))}
          </div>
        </div>
      );

    case "ITEM_DETAILS_INSPECTOR":
      return (
        <div
          className="w-full p-3 bg-black/40 border border-white/10 rounded space-y-2 text-xs"
          style={{ borderRadius: radius }}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm" style={{ color: colorToCss(colors.textGold) }}>
              Runic Enchanted Staff
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold">
              Rare Weapon
            </span>
          </div>
          <div className="text-[11px]" style={{ color: colorToCss(colors.textSecondary) }}>
            Type: Two-Handed Magic Focus | Slot: Main Hand | Value: 240¤
          </div>
          <div className="p-2 bg-black/30 rounded border border-white/5 text-[11px] space-y-0.5" style={{ color: colorToCss(colors.textAccent) }}>
            <div>+18 Arcane Magic Power</div>
            <div>+10% Mana Regeneration</div>
            <div>Infusion: Lust Siphon (Restores 5 MP on Lust attack)</div>
          </div>
          <div className="text-[11px] italic" style={{ color: colorToCss(colors.textMuted) }}>
            "A polished birch staff inscribed with shimmering Lilim glyphs."
          </div>
          <div className="flex gap-2 pt-1">
            {["Equip", "Infuse", "Drop"].map((act, idx) => (
              <button
                key={idx}
                className="px-2.5 py-1 text-[11px] font-semibold bg-white/10 hover:bg-white/20 rounded border border-white/10"
                style={{ color: colorToCss(colors.textPrimary), borderRadius: radius }}
              >
                {act}
              </button>
            ))}
          </div>
        </div>
      );

    case "INVENTORY_FILTER_TABS":
      return (
        <div className="w-full flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
          {["All Items", "Weapons", "Armor", "Usable", "Transformative", "Quest"].map((tab, idx) => (
            <button
              key={idx}
              className={`px-2.5 py-1 rounded font-medium shrink-0 transition border ${
                idx === 0
                  ? "bg-purple-600 text-white border-purple-400"
                  : "bg-black/30 text-slate-400 border-white/5 hover:text-white"
              }`}
              style={{ borderRadius: radius }}
            >
              {tab}
            </button>
          ))}
        </div>
      );

    case "MAIN_MENU_HERO":
      return (
        <div className="w-full text-center py-6 space-y-2">
          <h1 className="text-3xl font-extrabold tracking-wider bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
            textRPG
          </h1>
          <p className="text-xs tracking-widest uppercase font-semibold" style={{ color: colorToCss(colors.textGold) }}>
            Chronicles of Lilith & Corruption
          </p>
          <div className="text-[10px] tracking-wide" style={{ color: colorToCss(colors.textMuted) }}>
            Version v0.4.0-DEV • Standalone Studio Build
          </div>
        </div>
      );

    case "MAIN_MENU_ACTIONS":
      return (
        <div className="w-full max-w-sm mx-auto space-y-2 text-center">
          {["New Game", "Continue Journey", "Load Save File", "Settings & Preferences", "Exit Game"].map(
            (action, idx) => (
              <button
                key={idx}
                className={`w-full py-2 px-4 rounded text-xs font-bold transition border shadow ${
                  idx === 0
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400"
                    : "bg-black/40 hover:bg-white/10 text-slate-200 border-white/10"
                }`}
                style={{ borderRadius: radius }}
              >
                {action}
              </button>
            )
          )}
        </div>
      );

    case "SAVE_SLOTS_BROWSER":
      return (
        <div className="w-full space-y-2 text-xs">
          <div className="font-semibold text-xs" style={{ color: colorToCss(colors.textGold) }}>
            SAVE FILES / PROFILES:
          </div>
          {[
            { slot: 1, name: "Vesper (Level 12 Infiltrator)", loc: "Grand Bazaar", time: "2026-08-28 02:45" },
            { slot: 2, name: "Lilith (Level 24 Archon)", loc: "Corrupted Cathedral", time: "2026-08-27 18:20" },
            { slot: 3, name: "Empty Save Slot", loc: "---", time: "---" },
          ].map((s, idx) => (
            <div
              key={idx}
              className="p-2.5 bg-black/30 border border-white/10 rounded flex items-center justify-between"
              style={{ borderRadius: radius }}
            >
              <div>
                <div className="font-semibold text-xs" style={{ color: colorToCss(colors.textPrimary) }}>
                  Slot {s.slot}: {s.name}
                </div>
                <div className="text-[10px]" style={{ color: colorToCss(colors.textSecondary) }}>
                  Area: {s.loc} • Saved: {s.time}
                </div>
              </div>
              <button
                className="px-2.5 py-1 text-[10px] font-semibold bg-white/10 hover:bg-purple-600 hover:text-white rounded border border-white/10 transition"
                style={{ borderRadius: radius }}
              >
                Load
              </button>
            </div>
          ))}
        </div>
      );

    case "OPTIONS_CONTENT_TOGGLES":
      return (
        <div className="w-full space-y-2 text-xs">
          <div className="font-semibold text-xs" style={{ color: colorToCss(colors.textGold) }}>
            CONTENT & KINK CONFIGURATION:
          </div>
          {[
            { label: "Pregnancy Mechanics", desc: "Allow impregnation and gestation timers", enabled: true },
            { label: "Lactation System", desc: "Enable milk storage and lactation events", enabled: true },
            { label: "Body Transformation Acceleration", desc: "Multiplier: 1.0x (Standard)", enabled: true },
            { label: "Fluid Multiplier", desc: "Scale cum/milk production: 1.0x", enabled: true },
          ].map((opt, idx) => (
            <div
              key={idx}
              className="p-2 bg-black/30 border border-white/10 rounded flex items-center justify-between"
              style={{ borderRadius: radius }}
            >
              <div>
                <div className="font-medium text-[11px]" style={{ color: colorToCss(colors.textPrimary) }}>
                  {opt.label}
                </div>
                <div className="text-[10px]" style={{ color: colorToCss(colors.textMuted) }}>
                  {opt.desc}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ENABLED
              </span>
            </div>
          ))}
        </div>
      );

    case "OPTIONS_DEMOGRAPHICS_SLIDERS":
      return (
        <div className="w-full space-y-2 text-xs">
          <div className="font-semibold text-xs" style={{ color: colorToCss(colors.textGold) }}>
            WORLD POPULATION DEMOGRAPHICS:
          </div>
          {[
            { label: "Female Population", val: "40%" },
            { label: "Male Population", val: "30%" },
            { label: "Hermaphrodite Population", val: "15%" },
            { label: "Gynomorph / Andromorph", val: "12%" },
          ].map((slider, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span style={{ color: colorToCss(colors.textSecondary) }}>{slider.label}</span>
                <span className="font-semibold" style={{ color: colorToCss(colors.textGold) }}>{slider.val}</span>
              </div>
              <div className="h-2 bg-black/40 rounded overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: slider.val }} />
              </div>
            </div>
          ))}
        </div>
      );

    case "OPTIONS_AUDIO_DISPLAY":
      return (
        <div className="w-full space-y-2 text-xs">
          <div className="font-semibold text-xs" style={{ color: colorToCss(colors.textGold) }}>
            DISPLAY & THEME PREFERENCES:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-black/30 rounded border border-white/10">
              <span className="text-[10px] block" style={{ color: colorToCss(colors.textMuted) }}>Active Palette</span>
              <span className="font-semibold text-xs" style={{ color: colorToCss(colors.textAccent) }}>Dark Fantasy Violet</span>
            </div>
            <div className="p-2 bg-black/30 rounded border border-white/10">
              <span className="text-[10px] block" style={{ color: colorToCss(colors.textMuted) }}>Active Layout</span>
              <span className="font-semibold text-xs" style={{ color: colorToCss(colors.textGold) }}>Custom Tile Layout</span>
            </div>
          </div>
        </div>
      );

    case "BODY_MUTATIONS_TREE":
      return (
        <div className="w-full space-y-2 text-xs">
          <div className="font-semibold text-xs" style={{ color: colorToCss(colors.textGold) }}>
            BODY ANATOMY & MUTATIONS:
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            {[
              { part: "Horns", val: "Demonic Curved Horns (Tier 2)" },
              { part: "Wings", val: "Bat/Succubus Leathery Wings" },
              { part: "Tail", val: "Prehensile Spade Tail (Active)" },
              { part: "Ears", val: "Elven Pointed Ears" },
              { part: "Skin", val: "Smooth Pale Lavender" },
              { part: "Genitals", val: "Hermaphrodite (16cm Cock / Vagina)" },
            ].map((m, idx) => (
              <div
                key={idx}
                className="p-1.5 bg-black/30 border border-white/10 rounded flex flex-col justify-between"
                style={{ borderRadius: radius }}
              >
                <span className="text-[9px] uppercase font-semibold" style={{ color: colorToCss(colors.textSecondary) }}>
                  {m.part}
                </span>
                <span className="font-medium" style={{ color: colorToCss(colors.textAccent) }}>
                  {m.val}
                </span>
              </div>
            ))}
          </div>
        </div>
      );

    case "ACTIVE_ENCHANTMENTS_LIST":
      return (
        <div className="w-full space-y-2 text-xs">
          <div className="font-semibold text-xs" style={{ color: colorToCss(colors.textGold) }}>
            ACTIVE ENCHANTMENTS & BLESSINGS:
          </div>
          {[
            { name: "Lilith's Allure", effect: "+20 Max Lust, +15% Persuasion Success", type: "Blessing" },
            { name: "Arcane Resonance", effect: "+10 Arcane Power, -5% Spell Cost", type: "Enchantment" },
            { name: "Corrupted Essence", effect: "+15% Dark Dmg, slowly accumulates corruption", type: "Curse" },
          ].map((ench, idx) => (
            <div
              key={idx}
              className="p-2 bg-black/30 border border-white/10 rounded flex items-center justify-between"
              style={{ borderRadius: radius }}
            >
              <div>
                <div className="font-bold text-[11px]" style={{ color: colorToCss(colors.textGold) }}>
                  {ench.name}
                </div>
                <div className="text-[10px]" style={{ color: colorToCss(colors.textSecondary) }}>
                  {ench.effect}
                </div>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {ench.type}
              </span>
            </div>
          ))}
        </div>
      );

    case "ENCHANTING_ALTAR_GRID":
      return (
        <div className="w-full p-2.5 bg-black/30 border border-white/10 rounded space-y-2 text-xs" style={{ borderRadius: radius }}>
          <div className="font-semibold text-xs" style={{ color: colorToCss(colors.textGold) }}>
            RUNIC ENCHANTING ALTAR:
          </div>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-black/50 border border-purple-500/40 rounded flex flex-col items-center justify-center text-[10px] text-center p-1 font-semibold text-purple-300">
              Target Item (Staff)
            </div>
            <div className="text-xl font-bold text-slate-500">+</div>
            <div className="w-16 h-16 bg-black/50 border border-pink-500/40 rounded flex flex-col items-center justify-center text-[10px] text-center p-1 font-semibold text-pink-300">
              Essence (Succubus)
            </div>
            <div className="text-xl font-bold text-slate-500">=</div>
            <div className="flex-1 p-2 bg-purple-950/40 border border-purple-500/40 rounded text-[11px]">
              <span className="font-bold block text-amber-300">Result: Runic Lust Staff</span>
              <span className="text-[10px] text-purple-200">Cost: 150¤ • 100% Success</span>
            </div>
          </div>
          <button className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded transition border border-purple-400">
            Perform Infusion
          </button>
        </div>
      );

    case "MERCHANT_PORTRAIT_DIALOG":
      return (
        <div className="w-full p-3 bg-black/30 border border-white/10 rounded flex items-center gap-3" style={{ borderRadius: radius }}>
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 border border-amber-300/50 flex items-center justify-center font-bold text-black text-sm shrink-0 shadow">
            NPC
          </div>
          <div>
            <div className="font-bold text-xs" style={{ color: colorToCss(colors.textGold) }}>
              Madame Selene (Enchanted Apothecary)
            </div>
            <div className="text-[11px] italic" style={{ color: colorToCss(colors.textSecondary) }}>
              "Welcome, traveler. Looking for exotic potions, binding runes, or perhaps something more transformative?"
            </div>
          </div>
        </div>
      );

    case "MERCHANT_SHOP_CATALOG":
      return (
        <div className="w-full space-y-1.5 text-xs">
          <div className="font-semibold text-xs" style={{ color: colorToCss(colors.textGold) }}>
            MERCHANT'S WARES:
          </div>
          {[
            { name: "Greater Health Elixir", type: "Consumable", price: 45, stock: 8 },
            { name: "Succubus Milk Extract", type: "Transformative", price: 120, stock: 3 },
            { name: "Runic Ward Armor", type: "Equipment", price: 350, stock: 1 },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-2 bg-black/30 border border-white/10 rounded flex items-center justify-between"
              style={{ borderRadius: radius }}
            >
              <div>
                <div className="font-semibold text-[11px]" style={{ color: colorToCss(colors.textPrimary) }}>
                  {item.name}
                </div>
                <div className="text-[10px]" style={{ color: colorToCss(colors.textMuted) }}>
                  {item.type} • Stock: {item.stock}
                </div>
              </div>
              <button
                className="px-2.5 py-1 text-[11px] font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black rounded border border-amber-500/40 transition"
                style={{ borderRadius: radius }}
              >
                Buy ({item.price}¤)
              </button>
            </div>
          ))}
        </div>
      );

    case "PLAYER_SELL_GRID":
      return (
        <div className="w-full space-y-1.5 text-xs">
          <div className="font-semibold text-xs" style={{ color: colorToCss(colors.textGold) }}>
            YOUR INVENTORY (Click to Sell):
          </div>
          {[
            { name: "Iron Dagger", val: 15, count: 1 },
            { name: "Lesser Health Potion", val: 10, count: 4 },
            { name: "Goblin Ears", val: 5, count: 12 },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-2 bg-black/30 border border-white/10 rounded flex items-center justify-between"
              style={{ borderRadius: radius }}
            >
              <div className="text-[11px]" style={{ color: colorToCss(colors.textPrimary) }}>
                {item.name} (x{item.count})
              </div>
              <button
                className="px-2 py-0.5 text-[10px] font-semibold bg-white/10 hover:bg-emerald-600 hover:text-white rounded border border-white/10 transition"
                style={{ borderRadius: radius }}
              >
                Sell (+{item.val}¤)
              </button>
            </div>
          ))}
        </div>
      );

    case "TRANSACTION_CART_SUMMARY":
      return (
        <div className="w-full p-3 bg-black/40 border border-white/10 rounded space-y-2 text-xs" style={{ borderRadius: radius }}>
          <div className="flex justify-between font-semibold">
            <span style={{ color: colorToCss(colors.textSecondary) }}>Net Transaction Cost:</span>
            <span className="font-bold" style={{ color: colorToCss(colors.textGold) }}>120¤</span>
          </div>
          <div className="flex justify-between text-[11px]" style={{ color: colorToCss(colors.textMuted) }}>
            <span>Your Gold After Purchase:</span>
            <span>30¤</span>
          </div>
          <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded transition border border-emerald-400 shadow">
            Confirm Checkout & Trade
          </button>
        </div>
      );

    case "CUSTOM_TEXT_LABEL":
      return (
        <div className="text-xs" style={{ color: colorToCss(colors.textPrimary) }}>
          {element.customText || element.label || "Custom Text Label"}
        </div>
      );

    default:
      return null;
  }
};
