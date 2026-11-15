# Pixel Pet

A tiny, charming pixel-art companion that lives on your Windows 10/11 desktop.

[![Website](https://img.shields.io/badge/Website-pixelpet-F2C66D?style=for-the-badge&logo=googlechrome&logoColor=11100E)](https://kiranraj017.github.io/pixelpet/)
[![Download](https://img.shields.io/badge/Download-Windows_Installer-4ade80?style=for-the-badge&logo=windows&logoColor=11100E)](https://github.com/KIRANRAJ017/pixelpet/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-c084fc?style=for-the-badge)](LICENSE)

🌐 **Live Website**: [https://kiranraj017.github.io/pixelpet/](https://kiranraj017.github.io/pixelpet/)  
💾 **Latest Release**: [Download Pixel Pet Setup (.exe)](https://github.com/KIRANRAJ017/pixelpet/releases/latest)

![Pixel Pet Icon](assets/app-icon.png)

## Overview

Pixel Pet is a lightweight desktop companion application built with Electron, React, TypeScript, and custom pixel-art spritesheets. It sits unobtrusively on your desktop, reacting gently to clicks, drag-and-drops, snacks, and ambient idle time.

### Characters

- **Mochi**: Round mint-green blob, tiny feet, simple dark eyes, friendly and curious with a sprout on top.
- **Neko**: Small cream-colored cat, triangular ears, tiny front paws, playful and sleepy.
- **Boo**: Small lavender ghost, rounded floating body, friendly face, slightly mischievous.

### Customization Limits (3 in each category)

- **Characters**: Mochi, Neko, Boo
- **Color Palettes**: Mint, Lavender, Peach
- **Sizes**: Small (64px tall), Normal (96px tall), Large (128px tall)
- **Accessories**: None, Beanie, Party Hat
- **Pet Name**: Rename your pet freely with immediate live preview

### 11 Real Animation States

Every character features a complete, hand-crafted 32×32 pixel spritesheet covering 11 explicit animation states:
1. `idle`: Subtle breathing / bobbing cycle
2. `blink`: Periodic eye blinking
3. `curious`: Inquisitive glance side-to-side
4. `happy`: Bouncing cheerfully with curved eyes and brighter blush
5. `walk`: Autonomous stepping motion across the desktop work area
6. `eat`: Chomping down on a fresh snack with puffed cheeks
7. `sleep`: Resting peacefully with animated `z Z` particles
8. `wake`: Gentle morning stretch and eye flutter
9. `surprised`: Wide eyes and alert leap
10. `dragged`: Dangling limbs while moving with the mouse cursor
11. `land`: Satisfying squash-and-stretch upon mouse release

### Interactions & Controls

- **Left-Click**: Interacts with pet (triggers happy or surprised reaction, or wakes sleeping pet)
- **Left Click + Drag**: Picks up the pet and allows repositioning anywhere within usable screen boundaries
- **Right-Click**: Opens a compact context menu:
  - **Feed**: Drops a snack and plays the eating animation
  - **Pet / Interact**: Plays interaction animation and soft audio chime
  - **Customize**: Opens Pet Studio
  - **Sleep / Wake**: Manually toggles nap time
  - **Settings**: Opens Pet Studio
  - **Hide Pet**: Hides the desktop pet while keeping the tray icon active
  - **Quit Pixel Pet**: Exits the application and cleans up all processes
- **System Tray**: Windows taskbar notification tray icon with options to Show/Hide Pet, Open Pet Studio, and Quit.

---

## Development Setup

### Prerequisites

- Node.js 18+ (tested on Node.js 20+)
- npm 9+
- Windows 10 or 11

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/pixel-pet.git
cd "pixel-pet"
npm install
```

### Running Locally

To run the application in development mode:

```bash
# 1. Compile renderer and electron
npm run build

# 2. Launch Electron
npm run dev:electron
```

Or run Vite dev server with hot reload:

```bash
npm run dev
```

### Running Tests

Run the Vitest unit test suite (covering state machine transitions, timers, and local JSON persistence):

```bash
npm run test
```

---

## Building the Windows Installer

Pixel Pet uses `electron-builder` configured for Windows NSIS packaging.

### Build Command

```bash
npm run dist
```

### Installer Output

Upon completion, the installer executable is generated in the `release/` directory:

```
release/
├── Pixel Pet Setup 1.0.0.exe   <-- Distributable Windows Installer
└── win-unpacked/               <-- Portable standalone executable directory
```

The installer:
- Installs per-user without requiring administrator privileges
- Creates Start Menu and Desktop shortcuts
- Provides a clean uninstaller in Windows Settings / Control Panel

---

## Publishing and Distribution

### 1. GitHub Releases

To publish a release on GitHub:

1. Tag the release commit:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
2. In GitHub, navigate to **Releases** → **Draft a new release**.
3. Select `v1.0.0` as the tag version.
4. Upload `release/Pixel Pet Setup 1.0.0.exe` as the binary release asset.
5. Publish the release.

### 2. Website Download Direct Link

Any personal or product website can link directly to the latest installer release using GitHub's persistent download redirect URL:

```html
<a href="https://github.com/<owner>/<repo>/releases/latest/download/Pixel.Pet.Setup.1.0.0.exe" class="download-button">
  Download Pixel Pet for Windows (64-bit)
</a>
```

---

## Architecture & Security

- **Process Isolation**: Context isolation is strictly enabled (`contextIsolation: true`).
- **No Node Integration**: `nodeIntegration: false` and `sandbox: true` are enforced for all renderers.
- **Narrow IPC**: Preload script exposes a tightly scoped `window.pixelPetAPI` with validated arguments.
- **Persistence**: Configuration is stored in `%APPDATA%/pixel-pet/config.json` with schema validation and automatic fallback recovery on corrupted data.
- **Focus Safety**: The pet window uses `focusable: false` to ensure clicking the pet never interrupts the user's active workflow or steals keyboard focus.
- **Performance**: Zero external network requests, zero telemetry, deterministic frame intervals, and minimal idle CPU footprint (< 0.1% CPU).

---

## License

MIT License. See [LICENSE](LICENSE) for details.
