import React, { useState } from "react";
import { ThemeFile, colorToCss } from "../types/theme";
import { LayoutFile } from "../types/layout";
import { MapPin, Coins } from "lucide-react";

interface GamePreviewViewportProps {
  theme: ThemeFile;
  layout: LayoutFile;
}

type PreviewState = "EXPLORATION" | "SCENE" | "SEX" | "COMBAT" | "INVENTORY";

export const GamePreviewViewport: React.FC<GamePreviewViewportProps> = ({ theme, layout }) => {
  const [activeState, setActiveState] = useState<PreviewState>("EXPLORATION");
  const [resolution, setResolution] = useState<"HD" | "FHD" | "ULTRAWIDE">("HD");

  const colors = theme.colors;

  // Resolve Panel Dimensions from layout
  const topPanel = layout.panels.find((p) => p.anchor === "TOP_BAR");
  const bottomPanel = layout.panels.find((p) => p.anchor === "BOTTOM_BAR");
  const leftPanel = layout.panels.find((p) => p.anchor === "LEFT_SIDEBAR");
  const rightPanel = layout.panels.find((p) => p.anchor === "RIGHT_SIDEBAR");
  const centerPanel = layout.panels.find((p) => p.anchor === "CENTER_FLEX");

  const topHeight = topPanel?.fixedHeight || 38;
  const bottomHeight = bottomPanel?.fixedHeight || 140;
  const leftWidth = leftPanel?.fixedWidth || 300;
  const rightWidth = rightPanel?.fixedWidth || 280;

  return (
    <div className="h-full flex flex-col space-y-3">
      {/* Viewport Toolbar */}
      <div className="flex items-center justify-between bg-[#1c1a24] px-4 py-2 rounded-xl border border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Simulation State:</span>
          {(["EXPLORATION", "SCENE", "SEX", "COMBAT", "INVENTORY"] as PreviewState[]).map((st) => (
            <button
              key={st}
              onClick={() => setActiveState(st)}
              className={`px-2.5 py-1 rounded transition font-medium ${
                activeState === st
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-black/30 text-slate-400 hover:text-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
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
            21:9 Ultrawide
          </button>
        </div>
      </div>

      {/* Live Game Frame Mockup */}
      <div
        className="flex-1 w-full rounded-xl overflow-hidden border shadow-2xl flex flex-col p-2 relative select-none font-sans"
        style={{
          backgroundColor: colorToCss(colors.bgDark),
          borderColor: colorToCss(colors.borderNormal),
        }}
      >
        {/* Top Status Bar */}
        {topPanel && (
          <div
            className="w-full flex items-center justify-between px-3 rounded border text-xs mb-1.5"
            style={{
              height: `${topHeight}px`,
              backgroundColor: colorToCss(colors.bgHeader),
              borderColor: colorToCss(colors.borderNormal),
              color: colorToCss(colors.textPrimary),
            }}
          >
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wide" style={{ color: colorToCss(colors.textGold) }}>
                textRPG Engine
              </span>
              <span className="text-[11px]" style={{ color: colorToCss(colors.textSecondary) }}>
                (C++26 Simulation)
              </span>
            </div>

            <div className="text-[11px]" style={{ color: colorToCss(colors.textSecondary) }}>
              08:30 AM | Day 1, Early Morning
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1" style={{ color: colorToCss(colors.currency) }}>
                <Coins className="w-3.5 h-3.5" /> 150¤
              </span>
              <span className="flex items-center gap-1 font-medium" style={{ color: colorToCss(colors.textAccent) }}>
                <MapPin className="w-3.5 h-3.5" /> Town Square
              </span>
            </div>
          </div>
        )}

        {/* Middle Main Content Area (Left Sidebar + Center Flex + Right Sidebar) */}
        <div className="flex-1 flex gap-1.5 min-h-0">
          {/* Left Sidebar (Character & Stats) */}
          {leftPanel && (
            <div
              className="rounded border p-3 flex flex-col space-y-3 overflow-y-auto"
              style={{
                width: `${leftWidth}px`,
                backgroundColor: colorToCss(colors.bgPanel),
                borderColor: colorToCss(colors.borderNormal),
              }}
            >
              {/* Header */}
              <div
                className="px-2.5 py-1 rounded border text-xs font-bold tracking-wider"
                style={{
                  backgroundColor: colorToCss(colors.bgHeader),
                  borderColor: colorToCss(colors.borderNormal),
                  color: colorToCss(colors.textGold),
                }}
              >
                CHARACTER STATUS
              </div>

              {/* Bio */}
              <div className="text-xs space-y-1">
                <div style={{ color: colorToCss(colors.textPrimary) }}>
                  Name: <span className="font-semibold">Vesper</span>
                </div>
                <div style={{ color: colorToCss(colors.textAccent) }}>
                  Title: <span className="font-semibold">Lilim Infiltrator</span>
                </div>
                <div style={{ color: colorToCss(colors.textSecondary) }}>
                  Gender: <span className="font-semibold">Hermaphrodite</span>
                </div>
              </div>

              {/* Resource Bars */}
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] mb-0.5" style={{ color: colorToCss(colors.textSecondary) }}>
                    <span>HP</span>
                    <span>100 / 100</span>
                  </div>
                  <div className="h-3.5 rounded-sm bg-black/40 overflow-hidden p-0.5 border border-white/5">
                    <div
                      className="h-full rounded-sm transition-all"
                      style={{ width: "100%", backgroundColor: colorToCss(colors.health) }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-0.5" style={{ color: colorToCss(colors.textSecondary) }}>
                    <span>Mana</span>
                    <span>45 / 50</span>
                  </div>
                  <div className="h-3.5 rounded-sm bg-black/40 overflow-hidden p-0.5 border border-white/5">
                    <div
                      className="h-full rounded-sm transition-all"
                      style={{ width: "90%", backgroundColor: colorToCss(colors.mana) }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-0.5" style={{ color: colorToCss(colors.textSecondary) }}>
                    <span>Lust</span>
                    <span>35 / 100</span>
                  </div>
                  <div className="h-3.5 rounded-sm bg-black/40 overflow-hidden p-0.5 border border-white/5">
                    <div
                      className="h-full rounded-sm transition-all"
                      style={{ width: "35%", backgroundColor: colorToCss(colors.lust) }}
                    />
                  </div>
                </div>
              </div>

              {/* Attributes */}
              <div className="pt-2 border-t border-white/5 text-xs space-y-1">
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

              {/* Anatomy */}
              <div className="pt-2 border-t border-white/5 text-xs space-y-1">
                <div className="font-semibold text-[11px] tracking-wider" style={{ color: colorToCss(colors.textGold) }}>
                  ANATOMY & FLUIDS
                </div>
                <div className="text-[11px]" style={{ color: colorToCss(colors.textSecondary) }}>
                  Breasts: D-Cup (150/300ml milk)
                </div>
                <div className="text-[11px]" style={{ color: colorToCss(colors.textSecondary) }}>
                  Penis: 20.0cm x 4.5cm (25/50ml cum)
                </div>
              </div>
            </div>
          )}

          {/* Center Flex Panel (Active Simulation View) */}
          {centerPanel && (
            <div
              className="flex-1 rounded border p-4 flex flex-col space-y-3 overflow-y-auto"
              style={{
                backgroundColor: colorToCss(colors.bgPanel),
                borderColor: colorToCss(colors.borderNormal),
              }}
            >
              {/* Scene View */}
              {activeState === "EXPLORATION" && (
                <>
                  <div
                    className="px-3 py-1.5 rounded border text-xs font-bold tracking-wider"
                    style={{
                      backgroundColor: colorToCss(colors.bgHeader),
                      borderColor: colorToCss(colors.borderNormal),
                      color: colorToCss(colors.textGold),
                    }}
                  >
                    OVERWORLD EXPLORATION
                  </div>
                  <div className="text-xs leading-relaxed space-y-2" style={{ color: colorToCss(colors.textPrimary) }}>
                    <p className="font-semibold" style={{ color: colorToCss(colors.textAccent) }}>
                      Current Location: Grand Bazaar at [12, 8]
                    </p>
                    <p>
                      You step into the lively Grand Bazaar of Lilith's Plaza. Colorful velvet stalls line the cobblestone
                      avenue, bathed in the soft glow of arcane lanterns. Merchants hawk enchanted wares, exquisite garments,
                      and exotic alchemical reagents.
                    </p>
                    <p style={{ color: colorToCss(colors.textSecondary) }}>
                      A statuesque Felis merchant watches your approach with keen, golden eyes, her tail curling lazily behind her.
                    </p>
                  </div>
                </>
              )}

              {activeState === "SCENE" && (
                <>
                  <div
                    className="px-3 py-1.5 rounded border text-xs font-bold tracking-wider"
                    style={{
                      backgroundColor: colorToCss(colors.bgHeader),
                      borderColor: colorToCss(colors.borderNormal),
                      color: colorToCss(colors.textGold),
                    }}
                  >
                    TALKING WITH AMIRA (FELIS MERCHANT)
                  </div>
                  <div className="text-xs leading-relaxed space-y-3" style={{ color: colorToCss(colors.textPrimary) }}>
                    <p className="italic" style={{ color: colorToCss(colors.textAccent) }}>
                      "Well, well... What brings a creature like you to my establishment today?"
                    </p>
                    <p>
                      She leans over the polished mahogany counter, her ears twitching with curiosity. The scent of sweet jasmine
                      and spiced lotus blossoms wafts from her fine silk garments.
                    </p>
                  </div>
                </>
              )}

              {activeState === "SEX" && (
                <>
                  <div
                    className="px-3 py-1.5 rounded border text-xs font-bold tracking-wider"
                    style={{
                      backgroundColor: colorToCss(colors.bgHeader),
                      borderColor: colorToCss(colors.borderNormal),
                      color: colorToCss(colors.lust),
                    }}
                  >
                    INTERACTIVE CYOA EROTIC ENCOUNTER
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="flex justify-between mb-1" style={{ color: colorToCss(colors.textGold) }}>
                        <span>Your Arousal</span>
                        <span>65/100</span>
                      </div>
                      <div className="h-3 bg-black/40 rounded overflow-hidden">
                        <div className="h-full" style={{ width: "65%", backgroundColor: colorToCss(colors.lust) }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1" style={{ color: colorToCss(colors.textGold) }}>
                        <span>Partner Arousal</span>
                        <span>80/100</span>
                      </div>
                      <div className="h-3 bg-black/40 rounded overflow-hidden">
                        <div className="h-full" style={{ width: "80%", backgroundColor: colorToCss(colors.lust) }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-xs leading-relaxed p-3 rounded bg-black/30 border border-white/5" style={{ color: colorToCss(colors.textSecondary) }}>
                    You pin Amira against the plush velvet divan, guiding her hands as soft purrs escape her parted lips...
                  </div>
                </>
              )}

              {activeState === "COMBAT" && (
                <>
                  <div
                    className="px-3 py-1.5 rounded border text-xs font-bold tracking-wider"
                    style={{
                      backgroundColor: colorToCss(colors.bgHeader),
                      borderColor: colorToCss(colors.borderNormal),
                      color: colorToCss(colors.enemy),
                    }}
                  >
                    TACTICAL COMBAT (Round 2)
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2 rounded bg-black/30 border border-white/5 space-y-1">
                      <span className="font-semibold" style={{ color: colorToCss(colors.friendly) }}>Vesper (You)</span>
                      <div className="h-3 bg-black/40 rounded overflow-hidden">
                        <div className="h-full" style={{ width: "100%", backgroundColor: colorToCss(colors.health) }} />
                      </div>
                    </div>
                    <div className="p-2 rounded bg-black/30 border border-white/5 space-y-1">
                      <span className="font-semibold" style={{ color: colorToCss(colors.enemy) }}>Rogue Bandit</span>
                      <div className="h-3 bg-black/40 rounded overflow-hidden">
                        <div className="h-full" style={{ width: "45%", backgroundColor: colorToCss(colors.enemy) }} />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Right Sidebar (Map & Target Inspector) */}
          {rightPanel && (
            <div
              className="rounded border p-3 flex flex-col space-y-3 overflow-y-auto"
              style={{
                width: `${rightWidth}px`,
                backgroundColor: colorToCss(colors.bgPanel),
                borderColor: colorToCss(colors.borderNormal),
              }}
            >
              <div
                className="px-2.5 py-1 rounded border text-xs font-bold tracking-wider"
                style={{
                  backgroundColor: colorToCss(colors.bgHeader),
                  borderColor: colorToCss(colors.borderNormal),
                  color: colorToCss(colors.textGold),
                }}
              >
                WORLD MAP & RADAR
              </div>

              {/* 9x9 Minimap Grid */}
              <div className="grid grid-cols-7 gap-1 p-2 bg-black/40 rounded border border-white/5 aspect-square max-w-[200px] mx-auto">
                {Array.from({ length: 49 }).map((_, i) => {
                  const isPlayer = i === 24;
                  const isWall = i % 7 === 0 || i < 7 || i > 41;
                  return (
                    <div
                      key={i}
                      className="rounded-sm flex items-center justify-center text-[10px] font-bold"
                      style={{
                        backgroundColor: isPlayer
                          ? colorToCss(colors.borderButton)
                          : isWall
                          ? colorToCss(colors.bgHeader)
                          : colorToCss(colors.bgSlot),
                        color: isPlayer ? colorToCss(colors.textGold) : "transparent",
                      }}
                    >
                      {isPlayer ? "@" : ""}
                    </div>
                  );
                })}
              </div>

              {/* Target Inspector */}
              <div className="pt-2 border-t border-white/5 text-xs space-y-1">
                <div className="font-semibold text-[11px] tracking-wider" style={{ color: colorToCss(colors.textGold) }}>
                  PROXIMITY TARGET
                </div>
                <div style={{ color: colorToCss(colors.textPrimary) }}>Name: Amira</div>
                <div style={{ color: colorToCss(colors.textSecondary) }}>Level 5 | Felis Merchant</div>
                <div className="h-3 bg-black/40 rounded overflow-hidden mt-1">
                  <div className="h-full" style={{ width: "80%", backgroundColor: colorToCss(colors.friendly) }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Commands Grid */}
        {bottomPanel && (
          <div
            className="w-full rounded border p-2 flex flex-col justify-between mt-1.5"
            style={{
              height: `${bottomHeight}px`,
              backgroundColor: colorToCss(colors.bgPanel),
              borderColor: colorToCss(colors.borderNormal),
            }}
          >
            <div className="flex justify-between items-center px-1 mb-1 text-xs">
              <span className="font-bold tracking-wider" style={{ color: colorToCss(colors.textGold) }}>
                ACTION COMMANDS
              </span>
              <span className="text-[10px]" style={{ color: colorToCss(colors.textMuted) }}>
                Page 1 / 1
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 flex-1">
              {[
                { label: "Talk", enabled: true },
                { label: "Browse Shop", enabled: true },
                { label: "Flirt", enabled: true },
                { label: "Inventory", enabled: true },
                { label: "Rest", enabled: true },
                { label: "North", enabled: true },
                { label: "South", enabled: true },
                { label: "East", enabled: true },
                { label: "West", enabled: true },
                { label: "Pass Turn", enabled: true },
              ].map((btn, idx) => (
                <button
                  key={idx}
                  className="rounded border text-xs font-semibold flex items-center justify-center transition shadow-sm"
                  style={{
                    backgroundColor: colorToCss(colors.bgButton),
                    borderColor: colorToCss(colors.borderButton),
                    color: colorToCss(colors.textPrimary),
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
