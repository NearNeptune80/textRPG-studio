export type GameSimulationState =
  | "UNIVERSAL"
  | "EXPLORATION"
  | "SCENE"
  | "SEX"
  | "COMBAT"
  | "INVENTORY";

export type ContainerDirection = "ROW" | "COLUMN";

/**
 * N-Way Multi-Child Layout Node.
 * - LEAF: A single box containing widgets.
 * - CONTAINER: An array of child nodes (either ROW = horizontal columns, or COLUMN = vertical rows)
 *   with an array of percentage sizes (summing to 100%).
 */
export interface LayoutNode {
  id: string;
  type: "CONTAINER" | "LEAF";
  name?: string;
  direction?: ContainerDirection; // ROW = horizontal sequence of boxes, COLUMN = vertical sequence of boxes
  sizes?: number[];              // Percentage sizes of each child (e.g. [20, 60, 20], sums to 100)
  children?: LayoutNode[];
  widgets?: string[];            // List of widget IDs inside this leaf box
}

export interface LayoutFile {
  layoutName: string;
  margin: number;
  rootNode: LayoutNode;
  stateOverrides?: Partial<Record<GameSimulationState, { enabled: boolean; rootNode: LayoutNode }>>;
}

/**
 * Clean, single large box blank layout template as requested by the user.
 */
export const BLANK_LAYOUT: LayoutFile = {
  layoutName: "Custom Tile Layout",
  margin: 6.0,
  rootNode: {
    id: "box_main",
    type: "LEAF",
    name: "Main Canvas Box",
    widgets: [],
  },
  stateOverrides: {
    EXPLORATION: { enabled: false, rootNode: { id: "box_exp", type: "LEAF", widgets: [] } },
    SCENE: { enabled: false, rootNode: { id: "box_scene", type: "LEAF", widgets: [] } },
    SEX: { enabled: false, rootNode: { id: "box_sex", type: "LEAF", widgets: [] } },
    COMBAT: { enabled: false, rootNode: { id: "box_combat", type: "LEAF", widgets: [] } },
    INVENTORY: { enabled: false, rootNode: { id: "box_inv", type: "LEAF", widgets: [] } },
  },
};

/**
 * Default Populated Lilith textRPG Preset
 */
export const PRESET_DEFAULT_POPULATED_LAYOUT: LayoutFile = {
  layoutName: "Default Lilith RPG Layout",
  margin: 6.0,
  rootNode: {
    id: "root_column",
    type: "CONTAINER",
    direction: "COLUMN",
    sizes: [8, 72, 20],
    children: [
      {
        id: "top_bar",
        type: "LEAF",
        name: "Top Status Bar",
        widgets: ["widget_top_bar_full"],
      },
      {
        id: "middle_row",
        type: "CONTAINER",
        direction: "ROW",
        sizes: [25, 50, 25],
        children: [
          {
            id: "left_sidebar",
            type: "LEAF",
            name: "Left Sidebar",
            widgets: [
              "widget_char_overview",
              "widget_vitals_gauges",
              "widget_attributes_table",
              "widget_anatomy_fluids",
            ],
          },
          {
            id: "center_story",
            type: "LEAF",
            name: "Center Story & Narrative",
            widgets: [
              "widget_narrative_story",
              "widget_erotic_encounter",
              "widget_tactical_combat",
              "widget_inventory_dual",
            ],
          },
          {
            id: "right_sidebar",
            type: "LEAF",
            name: "Right World & Radar",
            widgets: ["widget_minimap_radar"],
          },
        ],
      },
      {
        id: "bottom_actions",
        type: "LEAF",
        name: "Bottom Action Commands",
        widgets: ["widget_action_commands"],
      },
    ],
  },
};
