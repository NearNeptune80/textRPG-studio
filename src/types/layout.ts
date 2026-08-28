export type GameSimulationState =
  | "UNIVERSAL"
  | "EXPLORATION"
  | "SCENE"
  | "SEX"
  | "COMBAT"
  | "INVENTORY";

/**
 * 2D Responsive Freeform Panel Box.
 * Positions and dimensions are stored in percentage (0 to 100%) so layouts
 * adapt fluidly across any resolution (HD, FHD, 4K, Ultrawide).
 */
export interface PanelDefinition {
  id: string;
  name: string;
  x: number;      // % (0 to 100)
  y: number;      // % (0 to 100)
  width: number;  // % (0 to 100)
  height: number; // % (0 to 100)
  layoutDirection?: "VERTICAL" | "HORIZONTAL";
  gap?: number;
  padding?: number;
  widgets: string[]; // List of Widget IDs
}

export interface LayoutFile {
  layoutName: string;
  margin: number;
  panels: PanelDefinition[];
  stateOverrides?: Partial<Record<GameSimulationState, { enabled: boolean; panels: PanelDefinition[] }>>;
}

/**
 * Clean, empty blank layout template as requested by the user.
 */
export const BLANK_LAYOUT: LayoutFile = {
  layoutName: "Custom Blank Layout",
  margin: 6.0,
  panels: [],
  stateOverrides: {
    EXPLORATION: { enabled: false, panels: [] },
    SCENE: { enabled: false, panels: [] },
    SEX: { enabled: false, panels: [] },
    COMBAT: { enabled: false, panels: [] },
    INVENTORY: { enabled: false, panels: [] },
  },
};

/**
 * Default Populated Lilith textRPG Preset
 */
export const PRESET_DEFAULT_POPULATED_LAYOUT: LayoutFile = {
  layoutName: "Default Lilith RPG Layout",
  margin: 6.0,
  panels: [
    {
      id: "top_bar",
      name: "Top Status Bar",
      x: 0.5,
      y: 0.5,
      width: 99,
      height: 8,
      layoutDirection: "HORIZONTAL",
      gap: 8,
      padding: 6,
      widgets: ["widget_top_bar_full"],
    },
    {
      id: "left_pane",
      name: "Left Sidebar",
      x: 0.5,
      y: 9.5,
      width: 25,
      height: 70,
      layoutDirection: "VERTICAL",
      gap: 6,
      padding: 6,
      widgets: [
        "widget_char_overview",
        "widget_vitals_gauges",
        "widget_attributes_table",
        "widget_anatomy_fluids",
      ],
    },
    {
      id: "center_pane",
      name: "Center Story & Narrative",
      x: 26,
      y: 9.5,
      width: 48,
      height: 70,
      layoutDirection: "VERTICAL",
      gap: 8,
      padding: 8,
      widgets: [
        "widget_narrative_story",
        "widget_erotic_encounter",
        "widget_tactical_combat",
        "widget_inventory_dual",
      ],
    },
    {
      id: "right_pane",
      name: "Right World & Radar",
      x: 74.5,
      y: 9.5,
      width: 25,
      height: 70,
      layoutDirection: "VERTICAL",
      gap: 6,
      padding: 6,
      widgets: ["widget_minimap_radar"],
    },
    {
      id: "bottom_action_grid",
      name: "Bottom Action Commands",
      x: 0.5,
      y: 80.5,
      width: 99,
      height: 19,
      layoutDirection: "VERTICAL",
      gap: 4,
      padding: 6,
      widgets: ["widget_action_commands"],
    },
  ],
};
