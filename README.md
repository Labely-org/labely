<div align="center">

# 🏷️ Labely

### The Privacy-First, Zero-Setup Annotation Studio for Computer Vision

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Website](https://img.shields.io/badge/Web-labely.org-3b82f6?style=flat&logo=googlechrome&logoColor=white)](https://labely.org)
[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Linux%20%7C%20Web%20%7C%20Docker-6366f1.svg)](#-deployment--installations)
[![YOLO Compatible](https://img.shields.io/badge/YOLO-v5%20%7C%20v8%20%7C%20v11%20Ready-00D4AA.svg)](https://github.com/ultralytics/ultralytics)
[![COCO Compatible](https://img.shields.io/badge/COCO-JSON%20Standard-f59e0b.svg)](https://cocodataset.org)

**Labely** is a high-performance, open-source computer vision annotation tool designed to eliminate the setup nightmare of legacy data labeling tools. It runs **100% client-side in your browser** at [labely.org](https://labely.org), or as a **native standalone desktop application on macOS, Windows & Linux**.

[**Try Live Demo at labely.org →**](https://labely.org)

</div>

---

## ⚡ The Unfiltered Truth: Why Labely?

| Pain Point in Other Tools | How Legacy Tools Fail | How Labely Solves It |
| :--- | :--- | :--- |
| **CVAT** | Requires an 8-container Docker cluster (Postgres, Redis, Clickhouse), consumes 8GB+ RAM, and takes 45 minutes to troubleshoot networking. | **Zero setup.** Open [labely.org](https://labely.org) or double-click the desktop binary. Loads in under 200ms. |
| **Labelme / LabelImg** | Built on legacy Python/Qt. Build breaks on Python 3.12+ due to PyQt/SIP wheel incompatibility. Clunky polygon creation. | **Modern Canvas Engine.** Smooth 60fps pan/zoom up to 3200%, 8-handle box manipulation, and instant polygon closure. |
| **Cloud SaaS (Roboflow, etc.)** | Forces uploading proprietary images to 3rd-party servers. Free tiers cap datasets at 1,000 images; plans jump to $250+/mo. | **100% Client-Side Privacy.** Images **NEVER** leave your machine. Zero cloud storage, fully compliant with HIPAA, GDPR, and strict NDAs. |
| **OBB (Oriented Bounding Boxes)** | Missing in Labelme; locked behind enterprise paywalls in commercial tools. | **Built-in OBB tool** with live angle stalk for drone, aerial, and satellite datasets (DOTA, YOLOv8-OBB). |
| **Ultralytics YOLO Export** | Legacy tools require custom Python scripts to format `data.yaml` and split directories. | **1-Click Ultralytics Zip**: Auto-generates `images/train`, `labels/train`, `images/val`, and `data.yaml`. |

---

## ✨ Key Features

- **🎯 Comprehensive Geometry Suite**:
  - **Bounding Box (`Rect`)**: 8-handle resize, corner snap, class-colored tags.
  - **Polygon Segmentation**: Click-to-add vertices, live edge rubberband, auto-close with `Enter` or start-point snap.
  - **Oriented Bounding Box (`OBB`)**: Angle-rotated bounding boxes with rotation handle for aerial and text detection.
  - **Keypoint / Point**: Precise single-pixel landmark placement for pose estimation and counting.
  - **Polyline**: Multi-segment curves for road lanes, wires, and trajectory lines.
  - **Image-Level Tags**: Multi-class & multi-label scene tagging (e.g. `#night`, `#rainy`).

- **🪄 Client-Side Smart Contour & Magic Wand**:
  - Click on an object and intelligent local contrast algorithms auto-fit tight bounding boxes and contour boundaries without remote AI dependencies.

- **📊 Dataset Health & Class Imbalance Analytics**:
  - Built-in distribution histogram alerting you if classes are severely skewed (preventing trained model degradation).

- **🔄 Universal Format Export & Import**:
  - **YOLOv8 / YOLOv11**: Normalized `class x_center y_center w h` text files, `data.yaml`, and partitioned directories.
  - **COCO JSON**: `instances_default.json` with categories, images, and polygon segmentations.
  - **Pascal VOC XML**: Individual `<annotation>` XML files with `<bndbox>` tags.
  - **Labelme JSON**: 1-to-1 compatible with the MIT Labelme format.
  - **CSV Tabular**: Spreadsheet and Pandas DataFrame ready.
  - **Labely Backup**: Complete lossless JSON project snapshot.

- **🚀 Automated Train / Val / Test Splitter**:
  - Configurable split sliders (e.g. 70% Train, 20% Val, 10% Test) packed into standard folder hierarchy.

---

## 🖥️ Deployment & Installations

### 1. Web Hosted (Zero Install)
Access the live studio instantly on any modern browser:
👉 **[https://labely.org](https://labely.org)**

### 2. Standalone Desktop App (macOS, Windows & Linux)
Labely can be packaged as a lightweight native desktop application:

```bash
# Clone the repository
git clone https://github.com/zorthana/labely.git
cd labely

# Install dependencies
npm install

# Run in desktop window locally
npm run desktop

# Build macOS DMG & ZIP (Apple Silicon M-Series & Intel)
npm run electron:build:mac

# Build Windows 64-bit installer (.exe & portable)
npm run electron:build:win

# Build Linux packages (.AppImage & .deb)
npm run electron:build:linux
```
The output executables (`.dmg`, `.exe`, `.AppImage`) will be generated in `./release/`.

### 3. Docker Self-Hosting (Air-Gapped Intranet)
Deploy Labely inside your private cluster or local workstation with a single command:

```bash
docker compose up -d
```
Open `http://localhost:8080` in your browser.

---

## ⌨️ Keyboard Shortcuts Reference

Designed for fast labeling workflows:

| Shortcut | Action |
| :--- | :--- |
| `V` | **Select & Move** tool |
| `B` | **Bounding Box** tool |
| `P` | **Polygon** segmentation tool |
| `O` | **Oriented Bounding Box (OBB)** tool |
| `K` | **Keypoint / Point** tool |
| `L` | **Polyline / Lane** tool |
| `W` | **Magic Wand** auto-contour tool |
| `1` - `9` | **Quick Switch Active Class** |
| `D` or `→` | **Next image** in dataset |
| `A` or `←` | **Previous image** in dataset |
| `Space + Drag` | **Pan canvas** |
| `Mouse Wheel` | **Zoom in / out** centered at cursor |
| `F` | **Fit image to screen** |
| `Enter` | **Close polygon or finish line** |
| `Escape` | **Cancel current drawing or deselect** |
| `Del` / `Backspace` | **Delete selected annotation** |
| `Ctrl + Z` / `Cmd + Z` | **Undo** last edit |
| `Ctrl + Y` / `Cmd + Shift + Z` | **Redo** last edit |
| `?` | **Open Keyboard Shortcuts Cheat Sheet** |

---

## 🧠 Train Ultralytics YOLO with 3 Lines of Python

Export your dataset from Labely (`labely_yolo_dataset.zip`), extract it, and train immediately:

```python
from ultralytics import YOLO

# 1. Load pre-trained model (e.g. YOLOv8 nano or YOLOv11)
model = YOLO("yolov8n.pt")

# 2. Train with the data.yaml generated by Labely
results = model.train(
    data="./dataset/data.yaml",
    epochs=50,
    imgsz=640,
    batch=16,
    device=0 # GPU
)
```

---

## 🌐 Connecting Custom Domain `labely.org`

When you push this repository to GitHub:

1. **Create Repository**:
   ```bash
   git init
   git add .
   git commit -m "feat: initial open source release of Labely"
   git remote add origin https://github.com/zorthana/labely.git
   git branch -M main
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository **Settings** → **Pages**.
   - Under **Build and deployment**, set **Source** to **GitHub Actions**.
   - The included `.github/workflows/deploy.yml` will automatically build and publish to `labely.org`.

3. **DNS Configuration for `labely.org`**:
   Point your domain DNS records at your registrar (Cloudflare, Namecheap, GoDaddy):
   - **Apex Domain (`labely.org`) A Records**:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - **`www` Subdomain CNAME Record**: `zorthana.github.io`
   - The `public/CNAME` file included in this repository already contains `labely.org`.

---

## 🏗️ Tech Stack

- **Frontend Core**: React 19, TypeScript
- **Bundler & Tooling**: Vite 8
- **Styling**: Tailwind CSS v4, Lucide Icons
- **Canvas Rendering Engine**: Raw HTML5 Canvas 2D with High-DPI hardware acceleration
- **Packaging & Compression**: JSZip
- **Desktop Runtime**: Electron 44, Electron Builder
- **Deployment**: Docker (Nginx Alpine), GitHub Pages CI/CD

---

## 🤝 Contributing

We welcome contributions! Please read our [CONTRIBUTING.md](./CONTRIBUTING.md) guide before submitting pull requests.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.
