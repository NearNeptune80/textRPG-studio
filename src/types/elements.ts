export type AtomicElementType =
  | "PLAYER_NAME"
  | "PLAYER_TITLE"
  | "PLAYER_RACE_GENDER"
  | "HEALTH_BAR"
  | "MANA_BAR"
  | "LUST_BAR"
  | "DOMINANCE_BAR"
  | "STAT_ATTRIBUTES_LIST"
  | "ANATOMY_FLUID_SUMMARY"
  | "PAPERDOLL_EQUIPMENT_GRID"
  | "MINIMAP_RADAR"
  | "TARGET_INSPECTOR"
  | "CYOA_STORY_VIEW"
  | "CYOA_SEX_LOG"
  | "COMBAT_PARTY_STATUS"
  | "COMBAT_ENEMY_STATUS"
  | "COMBAT_LOG_STREAM"
  | "RESOLUTION_MERCY_LIST"
  | "INVENTORY_BACKPACK_LIST"
  | "INVENTORY_GROUND_CONTAINER"
  | "ACTION_COMMANDS_GRID"
  | "TIME_DATE_BANNER"
  | "CURRENCY_GOLD_COUNTER"
  | "LOCATION_MAP_BADGE"
  | "CUSTOM_TEXT_LABEL";

export interface AtomicElementConfig {
  id: string;
  type: AtomicElementType;
  label?: string;
  customText?: string;
  flex?: number;
  width?: number | string;
  height?: number | string;
}

export interface CustomWidgetDefinition {
  id: string;
  name: string;
  description: string;
  isPremade?: boolean;
  layoutDirection: "VERTICAL" | "HORIZONTAL";
  gap: number;
  padding: number;
  elements: AtomicElementConfig[];
}

export const PREMADE_WIDGETS: CustomWidgetDefinition[] = [
  {
    id: "widget_top_bar_full",
    name: "Top Status Bar",
    description: "Title, Time, Date, Gold, and Active Map location badge",
    isPremade: true,
    layoutDirection: "HORIZONTAL",
    gap: 8,
    padding: 6,
    elements: [
      { id: "e_time", type: "TIME_DATE_BANNER" },
      { id: "e_gold", type: "CURRENCY_GOLD_COUNTER" },
      { id: "e_loc", type: "LOCATION_MAP_BADGE" },
    ],
  },
  {
    id: "widget_char_overview",
    name: "Character Overview & Bio",
    description: "Name, Racial Title, Archetype, and dominant species",
    isPremade: true,
    layoutDirection: "VERTICAL",
    gap: 4,
    padding: 6,
    elements: [
      { id: "e_name", type: "PLAYER_NAME" },
      { id: "e_title", type: "PLAYER_TITLE" },
      { id: "e_rg", type: "PLAYER_RACE_GENDER" },
    ],
  },
  {
    id: "widget_vitals_gauges",
    name: "Vital Resource Bars",
    description: "Health, Mana, and Lust / Arousal progress gauges",
    isPremade: true,
    layoutDirection: "VERTICAL",
    gap: 6,
    padding: 6,
    elements: [
      { id: "e_hp", type: "HEALTH_BAR" },
      { id: "e_mp", type: "MANA_BAR" },
      { id: "e_lust", type: "LUST_BAR" },
    ],
  },
  {
    id: "widget_attributes_table",
    name: "Core Attributes Table",
    description: "Physique, Agility, Arcane, and Corruption stats",
    isPremade: true,
    layoutDirection: "VERTICAL",
    gap: 4,
    padding: 6,
    elements: [{ id: "e_attr", type: "STAT_ATTRIBUTES_LIST" }],
  },
  {
    id: "widget_anatomy_fluids",
    name: "Anatomy & Body Fluids",
    description: "Breasts, Groin, Milk & Cum storage tracking",
    isPremade: true,
    layoutDirection: "VERTICAL",
    gap: 4,
    padding: 6,
    elements: [{ id: "e_anat", type: "ANATOMY_FLUID_SUMMARY" }],
  },
  {
    id: "widget_minimap_radar",
    name: "9x9 World Map Radar",
    description: "Tile grid showing player position, walls, doors, and warps",
    isPremade: true,
    layoutDirection: "VERTICAL",
    gap: 6,
    padding: 6,
    elements: [
      { id: "e_map", type: "MINIMAP_RADAR" },
      { id: "e_target", type: "TARGET_INSPECTOR" },
    ],
  },
  {
    id: "widget_narrative_story",
    name: "CYOA Narrative Scene",
    description: "Speaker header, dialogue body text, and story choices",
    isPremade: true,
    layoutDirection: "VERTICAL",
    gap: 6,
    padding: 8,
    elements: [{ id: "e_story", type: "CYOA_STORY_VIEW" }],
  },
  {
    id: "widget_erotic_encounter",
    name: "Interactive Sex View",
    description: "Arousal meters, Dominance continuum, and narrative log",
    isPremade: true,
    layoutDirection: "VERTICAL",
    gap: 6,
    padding: 8,
    elements: [
      { id: "e_lust_pair", type: "LUST_BAR" },
      { id: "e_dom", type: "DOMINANCE_BAR" },
      { id: "e_sex_log", type: "CYOA_SEX_LOG" },
    ],
  },
  {
    id: "widget_tactical_combat",
    name: "Tactical Combat Arena",
    description: "Party status, enemy status gauges, and combat event log",
    isPremade: true,
    layoutDirection: "VERTICAL",
    gap: 6,
    padding: 8,
    elements: [
      { id: "e_party", type: "COMBAT_PARTY_STATUS" },
      { id: "e_enemy", type: "COMBAT_ENEMY_STATUS" },
      { id: "e_combat_log", type: "COMBAT_LOG_STREAM" },
    ],
  },
  {
    id: "widget_inventory_dual",
    name: "Dual Inventory & Ground",
    description: "Player backpack (Side 0) and container/ground (Side 1)",
    isPremade: true,
    layoutDirection: "HORIZONTAL",
    gap: 8,
    padding: 6,
    elements: [
      { id: "e_bp", type: "INVENTORY_BACKPACK_LIST" },
      { id: "e_ground", type: "INVENTORY_GROUND_CONTAINER" },
    ],
  },
  {
    id: "widget_action_commands",
    name: "Action Command Grid",
    description: "5x2 Command action buttons with pagination controls",
    isPremade: true,
    layoutDirection: "VERTICAL",
    gap: 4,
    padding: 6,
    elements: [{ id: "e_actions", type: "ACTION_COMMANDS_GRID" }],
  },
];
