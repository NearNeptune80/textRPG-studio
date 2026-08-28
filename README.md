# textRPG Studio 🎨

Visual theme palette designer, drag-and-drop responsive layout builder, and content authoring studio for **textRPG**.

---

## Features

- **Theme Palette Designer**:
  - Full real-time RGBA and Hex visual color pickers for all 24 theme variables.
  - Vital gauges (Health, Mana, Lust), Attributes (Physique, Arcane, Corruption), Surfaces, and Borders.
  - Custom font path configuration with point-size calibration.
  - 1-Click Export to `data/themes/theme_<name>.json`.

- **Responsive Layout Builder**:
  - Flexible multi-pane anchor calculator (`TOP_BAR`, `BOTTOM_BAR`, `LEFT_SIDEBAR`, `RIGHT_SIDEBAR`, `CENTER_FLEX`).
  - Drag-and-drop widget assignment (`[Stat Bars]`, `[Paperdoll]`, `[Minimap Radar]`, `[Narrative View]`, `[Action Grid]`).
  - Min/Max pixel constraints and gap margins.
  - 1-Click Export to `data/layouts/default_layout.json` or custom skin bundles.

- **Live Simulation Viewport**:
  - Instant 60fps game mockup rendering changes in real-time.
  - Simulation state preview switcher (`Exploration`, `Narrative Scene`, `Interactive Sex`, `Combat`, `Inventory`).
  - Multi-resolution scaling previews (HD, Full HD, 21:9 Ultrawide).

---

## Development

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Build production bundle
npm run build
```
