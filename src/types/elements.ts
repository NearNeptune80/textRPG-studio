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
  | "ITEM_DETAILS_INSPECTOR"
  | "INVENTORY_FILTER_TABS"
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
  | "MAIN_MENU_HERO"
  | "MAIN_MENU_ACTIONS"
  | "SAVE_SLOTS_BROWSER"
  | "OPTIONS_CONTENT_TOGGLES"
  | "OPTIONS_DEMOGRAPHICS_SLIDERS"
  | "OPTIONS_AUDIO_DISPLAY"
  | "BODY_MUTATIONS_TREE"
  | "ACTIVE_ENCHANTMENTS_LIST"
  | "ENCHANTING_ALTAR_GRID"
  | "MERCHANT_PORTRAIT_DIALOG"
  | "MERCHANT_SHOP_CATALOG"
  | "PLAYER_SELL_GRID"
  | "TRANSACTION_CART_SUMMARY"
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
    name: "7x7 World Map Radar",
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
    id: "widget_paperdoll_equipment",
    name: "Paperdoll Equipment Grid",
    description: "Interactive equipment slots for head, chest, weapons, accessories",
    isPremade: true,
    layoutDirection: "VERTICAL",
    gap: 6,
    padding: 6,
    elements: [{ id: "e_paperdoll", type: "PAPERDOLL_EQUIPMENT_GRID" }],
  },
  {
    id: "widget_item_details_inspector",
    name: "Item Details & Lore Inspector",
    description: "Item name, type, stats, description, and action commands",
    isPremade: true,
    layoutDirection: "VERTICAL",
    gap: 6,
    padding: 6,
    elements: [{ id: "e_item_info", type: "ITEM_DETAILS_INSPECTOR" }],
  },
  {
    id: "widget_inventory_filters",
    name: "Inventory Category Tabs",
    description: "Filter items by All, Weapons, Armor, Usable, TF, and Quest items",
    isPremade: true,
    layoutDirection: "HORIZONTAL",
    gap: 4,
    padding: 4,
    elements: [{ id: "e_inv_filters", type: "INVENTORY_FILTER_TABS" }],
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
  {
    id: "widget_main_menu_hero",
    name: "Main Menu Title & Hero Banner",
    description: "Game title, stylized subtitle, version, and background aesthetic",
    isPremade: true,
    layoutDirection: "VERTICAL",
    gap: 8,
    padding: 12,
    elements: [{ id: "e_mm_hero", type: "MAIN_MENU_HERO" }],
  },
  {
    id: "widget_main_menu_actions",
    name: "Main Menu Action Buttons",
    description: "New Game, Continue, Load Save, Settings, and Quit",
    isPremade: true,
    layoutDirection: "VERTICAL",
    gap: 6,
    padding: 8,
    elements: [{ id: "e_mm_actions", type: "MAIN_MENU_ACTIONS" }],
  },
  {
    id: "widget_save_slot_list",
    name: "Save Slots & Profiles Browser",
    description: "Interactive save files list with character level, area, and timestamp",
    isPremade: true,
    layoutDirection: "VERTICAL",
    gap: 6,
    padding: 8,
    elements: [{ id: "e_saves", type: "SAVE_SLOTS_BROWSER" }],
  },
  {
    id: "widget_options_content",
    name: "Content & Kink Configuration",
    description: "Pregnancy, Lactation, Fluid Multipliers, and Transformation speed toggles",
    isPremade: true,
    layoutDirection: "VERTICAL",
    gap: 6,
    padding: 8,
    elements: [{ id: "e_opt_content", type: "OPTIONS_CONTENT_TOGGLES" }],
  },
  {
    id: "widget_options_demographics",
    name: "Demographics & Sexuality Sliders",
    description: "World population gender and orientation percentage sliders",
    isPremade: true,
    layoutDirection: "VERTICAL",
    gap: 6,
    padding: 8,
    elements: [{ id: "e_opt_demo", type: "OPTIONS_DEMOGRAPHICS_SLIDERS" }],
  },
  {
    id: "widget_options_display_audio",
    name: "Display & Audio Settings",
    description: "Active Theme, Active Layout selector, and volume controls",
    isPremade: true,
    layoutDirection: "VERTICAL",
    gap: 6,
    padding: 8,
    elements: [{ id: "e_opt_display", type: "OPTIONS_AUDIO_DISPLAY" }],
  },
  {
    id: "widget_body_mutations_tree",
    name: "Body Mutations & Anatomy Tree",
    description: "Interactive mutation tree showing horns, wings, tail, genitals, and corruptions",
    isPremade: true,
    layoutDirection: "VERTICAL",
    gap: 6,
    padding: 8,
    elements: [{ id: "e_tf_tree", type: "BODY_MUTATIONS_TREE" }],
  },
  {
    id: "widget_active_enchantments_list",
    name: "Active Enchantments & Blessings",
    description: "List of active magical enchantments, runic infusions, and corruption curses",
    isPremade: true,
    layoutDirection: "VERTICAL",
    gap: 6,
    padding: 6,
    elements: [{ id: "e_tf_ench", type: "ACTIVE_ENCHANTMENTS_LIST" }],
  },
  {
    id: "widget_enchanting_altar",
    name: "Runic Enchanting Altar",
    description: "Infuse equipment with mystical essences, runes, and transformative gems",
    isPremade: true,
    layoutDirection: "VERTICAL",
    gap: 6,
    padding: 8,
    elements: [{ id: "e_altar", type: "ENCHANTING_ALTAR_GRID" }],
  },
  {
    id: "widget_merchant_dialog",
    name: "Merchant Greeting & Dialog",
    description: "Merchant NPC portrait, name, disposition, and flavor dialogue",
    isPremade: true,
    layoutDirection: "VERTICAL",
    gap: 6,
    padding: 8,
    elements: [{ id: "e_shop_dialog", type: "MERCHANT_PORTRAIT_DIALOG" }],
  },
  {
    id: "widget_merchant_catalog",
    name: "Merchant Goods Catalog",
    description: "List of items for sale with prices, stock count, and buy buttons",
    isPremade: true,
    layoutDirection: "VERTICAL",
    gap: 6,
    padding: 6,
    elements: [{ id: "e_shop_catalog", type: "MERCHANT_SHOP_CATALOG" }],
  },
  {
    id: "widget_player_sell_grid",
    name: "Player Selling Grid",
    description: "Player backpack items with sell values and quick-sell buttons",
    isPremade: true,
    layoutDirection: "VERTICAL",
    gap: 6,
    padding: 6,
    elements: [{ id: "e_shop_sell", type: "PLAYER_SELL_GRID" }],
  },
  {
    id: "widget_transaction_cart",
    name: "Shopping Cart & Checkout",
    description: "Summary of items to buy/sell, net gold change, and confirm checkout button",
    isPremade: true,
    layoutDirection: "VERTICAL",
    gap: 6,
    padding: 8,
    elements: [{ id: "e_shop_cart", type: "TRANSACTION_CART_SUMMARY" }],
  },
];
