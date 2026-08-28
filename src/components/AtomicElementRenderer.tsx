import React from "react";
import { AtomicElementConfig } from "../types/elements";
import { ThemeFile, colorToCss } from "../types/theme";
import { MapPin, Coins } from "lucide-react";

interface AtomicElementRendererProps {
  element: AtomicElementConfig;
  theme: ThemeFile;
  activeState: "EXPLORATION" | "SCENE" | "SEX" | "COMBAT" | "INVENTORY";
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
            className="grid grid-cols-7 gap-1 p-2 bg-black/40 border border-white/5 aspect-square w-full max-w-[200px]"
            style={{ borderRadius: radius }}
          >
            {Array.from({ length: 49 }).map((_, i) => {
              const isPlayer = i === 24;
              const isWall = i % 7 === 0 || i < 7 || i > 41;
              return (
                <div
                  key={i}
                  className="flex items-center justify-center text-[10px] font-bold"
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
