# Contributing to Labely

Thank you for your interest in contributing to **Labely**! We welcome bug fixes, performance improvements, new export formats, and documentation enhancements from the open-source community.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20 or higher (Node 22+ recommended)
- **npm**: v10 or higher

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/zorthana/labely.git
   cd labely
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local Vite development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Test the desktop build locally:**
   ```bash
   npm run desktop
   ```

---

## 🛠️ Project Architecture

```
labely/
├── src/
│   ├── assets/           # Sample datasets (autonomous driving, aerial drone, retail)
│   ├── components/       # UI components & HTML5 Canvas Engine
│   │   ├── AnnotationCanvas.tsx  # High-performance 60fps canvas renderer & interaction loop
│   │   ├── Header.tsx            # Navigation, analytics, and export controls
│   │   ├── LandingPage.tsx       # Homepage for labely.org
│   │   ├── SidebarLeft.tsx       # Geometry tools (Rect, Poly, OBB, Point, Line, Wand)
│   │   ├── SidebarRight.tsx      # Classes manager, layers, tags, and splits
│   │   ├── ImageGallery.tsx      # Dataset thumbnail drawer with status filters
│   │   ├── ExportModal.tsx       # YOLO, COCO, VOC, Labelme, CSV exporter
│   │   └── DatasetStatsModal.tsx # Class imbalance & dataset health analytics
│   ├── types/            # TypeScript interfaces & definitions
│   └── utils/            # Math, geometry, format parsers & exporters
├── electron/             # Native desktop main & preload scripts
├── public/               # Static assets, CNAME (labely.org), manifest.json
└── .github/              # Automated CI/CD for web deploy and desktop release
```

---

## 🧪 Testing & Verification

Before submitting a pull request, verify that the project builds cleanly:

```bash
npm run build
```

This validates both TypeScript typings (`tsc -b`) and the production bundle packaging.

---

## 📦 Building Native Desktop Packages

To test creating native binaries for Windows or Linux:

- **Windows (.exe / portable):**
  ```bash
  npm run electron:build:win
  ```
- **Linux (.AppImage / .deb):**
  ```bash
  npm run electron:build:linux
  ```

---

## 🤝 Pull Request Workflow

1. Fork the repository and create your branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes and commit with clear, descriptive commit messages.
3. Ensure `npm run build` succeeds without errors.
4. Open a Pull Request referencing any related issues.

Thank you for helping make open-source computer vision faster, private, and accessible to everyone!
