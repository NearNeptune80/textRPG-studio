export type PanelAnchorType =
  | "TOP_BAR"
  | "BOTTOM_BAR"
  | "LEFT_SIDEBAR"
  | "RIGHT_SIDEBAR"
  | "CENTER_FLEX"
  | "FLOATING_RECT";

export type WidgetType =
  | "TOP_STATUS_BAR"
  | "CHARACTER_OVERVIEW"
  | "STAT_BARS"
  | "PAPERDOLL_SOCKETS"
  | "EQUIPMENT_GRID"
  | "BACKPACK_INVENTORY"
  | "SCENE_NARRATIVE"
  | "INTERACTIVE_SEX"
  | "COMBAT_VIEW"
  | "RESOLUTION_HUB"
  | "MINIMAP_RADAR"
  | "TARGET_INSPECTOR"
  | "ACTION_GRID";

export interface PanelDefinition {
  id: string;
  anchor: PanelAnchorType;
  fixedWidth?: number;
  fixedHeight?: number;
  minWidth?: number;
  maxWidth?: number;
  backgroundColor?: string;
  borderColor?: string;
  widgets: WidgetType[];
  visibleInStates?: string[];
}

export interface LayoutFile {
  layoutName: string;
  margin: number;
  panels: PanelDefinition[];
}

export const DEFAULT_LAYOUT: LayoutFile = {
  layoutName: "Default Responsive 5-Pane",
  margin: 6.0,
  panels: [
    {
      id: "top_bar",
      anchor: "TOP_BAR",
      fixedHeight: 38.0,
      backgroundColor: "bgHeader",
      borderColor: "borderNormal",
      widgets: ["TOP_STATUS_BAR"],
    },
    {
      id: "left_pane",
      anchor: "LEFT_SIDEBAR",
      fixedWidth: 320.0,
      minWidth: 260.0,
      maxWidth: 450.0,
      backgroundColor: "bgPanel",
      borderColor: "borderNormal",
      widgets: ["CHARACTER_OVERVIEW", "STAT_BARS", "PAPERDOLL_SOCKETS"],
    },
    {
      id: "center_pane",
      anchor: "CENTER_FLEX",
      backgroundColor: "bgPanel",
      borderColor: "borderNormal",
      widgets: [
        "SCENE_NARRATIVE",
        "INTERACTIVE_SEX",
        "COMBAT_VIEW",
        "BACKPACK_INVENTORY",
        "RESOLUTION_HUB",
      ],
    },
    {
      id: "right_pane",
      anchor: "RIGHT_SIDEBAR",
      fixedWidth: 300.0,
      minWidth: 240.0,
      maxWidth: 400.0,
      backgroundColor: "bgPanel",
      borderColor: "borderNormal",
      widgets: ["MINIMAP_RADAR", "TARGET_INSPECTOR"],
    },
    {
      id: "bottom_action_grid",
      anchor: "BOTTOM_BAR",
      fixedHeight: 140.0,
      backgroundColor: "bgPanel",
      borderColor: "borderNormal",
      widgets: ["ACTION_GRID"],
    },
  ],
};
