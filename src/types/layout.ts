export type PanelAnchorType =
  | "TOP_BAR"
  | "BOTTOM_BAR"
  | "LEFT_SIDEBAR"
  | "RIGHT_SIDEBAR"
  | "CENTER_FLEX"
  | "FLOATING_RECT";

export type GameSimulationState =
  | "UNIVERSAL"
  | "EXPLORATION"
  | "SCENE"
  | "SEX"
  | "COMBAT"
  | "INVENTORY";

export interface PanelDefinition {
  id: string;
  name?: string;
  anchor: PanelAnchorType;
  fixedWidth?: number;
  fixedHeight?: number;
  minWidth?: number;
  maxWidth?: number;
  backgroundColor?: string;
  borderColor?: string;
  layoutDirection?: "VERTICAL" | "HORIZONTAL";
  gap?: number;
  padding?: number;
  widgets: string[]; // List of Widget IDs (premade or custom)
}

export interface LayoutFile {
  layoutName: string;
  margin: number;
  panels: PanelDefinition[];
  stateOverrides?: Partial<Record<GameSimulationState, { enabled: boolean; panels: PanelDefinition[] }>>;
}

export const DEFAULT_LAYOUT: LayoutFile = {
  layoutName: "Default Responsive 5-Pane",
  margin: 6.0,
  panels: [
    {
      id: "top_bar",
      name: "Top Navigation Bar",
      anchor: "TOP_BAR",
      fixedHeight: 38.0,
      backgroundColor: "bgHeader",
      borderColor: "borderNormal",
      layoutDirection: "HORIZONTAL",
      gap: 8,
      padding: 6,
      widgets: ["widget_top_bar_full"],
    },
    {
      id: "left_pane",
      name: "Left Character Sheet",
      anchor: "LEFT_SIDEBAR",
      fixedWidth: 320.0,
      minWidth: 260.0,
      maxWidth: 450.0,
      backgroundColor: "bgPanel",
      borderColor: "borderNormal",
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
      name: "Center Active View",
      anchor: "CENTER_FLEX",
      backgroundColor: "bgPanel",
      borderColor: "borderNormal",
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
      name: "Right World & Target",
      anchor: "RIGHT_SIDEBAR",
      fixedWidth: 300.0,
      minWidth: 240.0,
      maxWidth: 400.0,
      backgroundColor: "bgPanel",
      borderColor: "borderNormal",
      layoutDirection: "VERTICAL",
      gap: 6,
      padding: 6,
      widgets: ["widget_minimap_radar"],
    },
    {
      id: "bottom_action_grid",
      name: "Bottom Action Commands",
      anchor: "BOTTOM_BAR",
      fixedHeight: 140.0,
      backgroundColor: "bgPanel",
      borderColor: "borderNormal",
      layoutDirection: "VERTICAL",
      gap: 4,
      padding: 6,
      widgets: ["widget_action_commands"],
    },
  ],
  stateOverrides: {
    EXPLORATION: { enabled: false, panels: [] },
    SCENE: { enabled: false, panels: [] },
    SEX: { enabled: false, panels: [] },
    COMBAT: { enabled: false, panels: [] },
    INVENTORY: { enabled: false, panels: [] },
  },
};
