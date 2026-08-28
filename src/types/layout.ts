export type GameSimulationState =
  | "UNIVERSAL"
  | "EXPLORATION"
  | "SCENE"
  | "SEX"
  | "COMBAT"
  | "INVENTORY";

export type SplitDirection = "HORIZONTAL" | "VERTICAL";

/**
 * Binary Space Partitioning (BSP) Tile Node.
 * A node is either a LEAF (contains widgets) or a SPLIT (contains 2 children split horizontally or vertically).
 */
export interface LayoutNode {
  id: string;
  type: "SPLIT" | "LEAF";
  name?: string;
  direction?: SplitDirection; // HORIZONTAL = Left/Right columns, VERTICAL = Top/Bottom rows
  splitRatio?: number;        // Fraction from 0.05 to 0.95 (default 0.5)
  children?: [LayoutNode, LayoutNode];
  widgets?: string[];         // List of widget IDs inside this leaf box
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
 * Default Populated Lilith textRPG BSP Tile Preset
 */
export const PRESET_DEFAULT_POPULATED_LAYOUT: LayoutFile = {
  layoutName: "Default Lilith RPG Layout",
  margin: 6.0,
  rootNode: {
    id: "root_split_v",
    type: "SPLIT",
    direction: "VERTICAL", // Top Bar vs Body + Bottom Action
    splitRatio: 0.07,
    children: [
      {
        id: "top_bar",
        type: "LEAF",
        name: "Top Status Bar",
        widgets: ["widget_top_bar_full"],
      },
      {
        id: "body_and_bottom_split",
        type: "SPLIT",
        direction: "VERTICAL",
        splitRatio: 0.78,
        children: [
          {
            id: "middle_columns_split",
            type: "SPLIT",
            direction: "HORIZONTAL", // Left Sidebar vs Center & Right
            splitRatio: 0.25,
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
                id: "center_and_right_split",
                type: "SPLIT",
                direction: "HORIZONTAL", // Center Story vs Right Radar
                splitRatio: 0.66,
                children: [
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
    ],
  },
};
