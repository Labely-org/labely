import React from 'react';
import {
  Layers,
  ShieldCheck,
  Zap,
  Download,
  Monitor,
  ArrowRight,
  Terminal,
  Cpu,
  Sparkles,
  Box,
  FileCode,
  FolderDown,
  Laptop,
} from 'lucide-react';
import { GithubIcon } from './GithubIcon';

interface LandingPageProps {
  onLaunchStudio: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchStudio }) => {
  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#070a13]/85 border-b border-slate-800/80 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Layers className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-white">Labely</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
              v1.0 Open Source
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm text-slate-300 font-medium">
          <a href="#features" className="hover:text-blue-400 transition-colors">
            Features
          </a>
          <a href="#comparison" className="hover:text-blue-400 transition-colors">
            Comparison
          </a>
          <a href="#desktop" className="hover:text-blue-400 transition-colors">
            Desktop (Mac, Win, Linux)
          </a>
          <a href="#code" className="hover:text-blue-400 transition-colors">
            Quickstart
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/zorthana/labely"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700/80 bg-slate-900/60 hover:bg-slate-800 text-xs font-medium text-slate-200 transition-all"
          >
            <GithubIcon className="w-4 h-4" />
            <span>GitHub</span>
          </a>
          <button
            onClick={onLaunchStudio}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-20 pb-24 px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-purple-600/15 blur-[100px] rounded-full pointer-events-none" />

        {/* Top Tagline */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 text-xs font-medium text-slate-300 mb-6 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Zero-Setup • 100% Privacy-First • Native macOS, Windows & Linux</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.12] mb-6">
          The Open Source Annotation Studio for{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            Computer Vision
          </span>
        </h1>

        {/* Subhead */}
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed mb-10">
          No 8-container Docker cluster. No broken Python PyQt dependencies. Annotate Bounding
          Boxes, Polygons, Oriented Bounding Boxes (OBB), and Keypoints directly in your browser or
          on desktop. Export clean YOLOv8/v11, COCO, and VOC datasets in 1-click.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-14 w-full sm:w-auto">
          <button
            onClick={onLaunchStudio}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 transition-all hover:scale-105"
          >
            <Layers className="w-4 h-4" />
            <span>Launch Web Studio (Free)</span>
          </button>
          <a
            href="#desktop"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm transition-all"
          >
            <Monitor className="w-4 h-4 text-slate-400" />
            <span>Get Desktop App (Mac, Win, Linux)</span>
          </a>
        </div>

        {/* Live Interactive Hero Mockup */}
        <div className="w-full max-w-4xl rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-950 p-1.5 shadow-2xl border border-slate-700/80 relative group">
          <div className="rounded-xl bg-[#090d16] overflow-hidden border border-slate-800">
            {/* Mock Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#0d121f] border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 font-mono text-slate-400">labely.org/studio — urban_traffic_01.png</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 font-mono text-[11px]">
                  YOLOv11 Ready
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-600/20 text-emerald-400 font-mono text-[11px]">
                  100% Client-Side
                </span>
              </div>
            </div>

            {/* Mock Canvas Area */}
            <div className="relative h-80 sm:h-96 bg-gradient-to-br from-slate-950 via-[#0b0f19] to-slate-900 flex items-center justify-center p-6 overflow-hidden">
              {/* Synthetic Road View */}
              <div className="absolute inset-0 opacity-40">
                <div className="w-full h-full bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px]" />
              </div>

              {/* Sample Bounding Box 1 */}
              <div className="absolute top-20 left-16 sm:left-32 w-48 h-36 border-2 border-blue-500 bg-blue-500/20 rounded shadow-lg flex flex-col justify-between p-1.5 pointer-events-none animate-pulse">
                <span className="text-[11px] font-mono font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded self-start">
                  Car (98%)
                </span>
                <div className="flex justify-between w-full">
                  <div className="w-2 h-2 bg-white border border-blue-600 rounded-sm" />
                  <div className="w-2 h-2 bg-white border border-blue-600 rounded-sm" />
                </div>
              </div>

              {/* Sample Polygon 2 */}
              <div className="absolute bottom-16 right-20 sm:right-40 w-44 h-28 border-2 border-emerald-500 bg-emerald-500/25 rounded-xl shadow-lg flex flex-col justify-start p-1.5 pointer-events-none">
                <span className="text-[11px] font-mono font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded self-start">
                  Building (Poly)
                </span>
              </div>

              {/* Sample OBB 3 */}
              <div className="absolute top-24 right-16 sm:right-32 w-32 h-16 border-2 border-purple-500 bg-purple-500/20 rounded shadow-lg rotate-12 flex flex-col justify-start p-1 pointer-events-none">
                <span className="text-[10px] font-mono font-bold bg-purple-600 text-white px-1 py-0.2 rounded self-start">
                  Drone OBB (28°)
                </span>
              </div>

              <div className="z-10 flex flex-col items-center">
                <button
                  onClick={onLaunchStudio}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/40 transition-all hover:scale-105 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Try Interactive Annotator Live</span>
                </button>
                <span className="text-xs text-slate-400 mt-2 font-mono">
                  No sign up required. No data collected.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Grid */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3">
            Built for Modern AI & Robotics Teams
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Every feature designed to eliminate the friction between capturing raw images and training
            production-grade neural networks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">100% Client-Side Privacy</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your proprietary images never leave your computer. Everything runs in-memory using the
              HTML5 Canvas and File API. GDPR, HIPAA, and NDA fully compliant by design.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <Box className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Multi-Geometry Annotations</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bounding Boxes for YOLO detection, Polygons for instance segmentation, Oriented Bounding
              Boxes (OBB) for aerial/satellite imaging, Keypoints for pose estimation, and Lanes.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <FolderDown className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Ultralytics & COCO Export</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Exports ready-to-train datasets with automated Train/Val/Test partitioning, normalized
              coordinates, and generated <code className="text-blue-300">data.yaml</code> configuration files.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Smart Contour & Magic Wand</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click an object and let intelligent client-side contrast heuristics automatically fit a
              tight bounding box or polygon around it, saving thousands of manual drag actions.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Blazing Fast Canvas Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sub-millisecond latency with smooth 60fps pan/zoom from 10% to 3200%. Full keyboard
              shortcuts workflow (B, P, O, K, D, A) built for rapid dataset labeling sprints.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-pink-600/20 text-pink-400 flex items-center justify-center">
              <Monitor className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Desktop & Offline Ready</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Run on Windows, Linux, or macOS as a native Electron desktop executable, or install as an
              offline Progressive Web App (PWA) directly from <code className="text-pink-300">labely.org</code>.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Honest Comparison Table */}
      <section id="comparison" className="py-20 px-6 max-w-5xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3">
            The Honest Comparison
          </h2>
          <p className="text-slate-400 text-sm">
            How Labely compares against the legacy and heavy annotation tools in 2026.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Feature</th>
                <th className="p-4 text-blue-400 font-bold text-sm bg-blue-950/20">Labely</th>
                <th className="p-4">CVAT</th>
                <th className="p-4">Labelme / LabelImg</th>
                <th className="p-4">Roboflow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="p-4 font-medium text-white">Setup Time</td>
                <td className="p-4 font-bold text-emerald-400 bg-blue-950/20">0 seconds (Browser)</td>
                <td className="p-4 text-amber-400">45 mins (Docker compose)</td>
                <td className="p-4 text-rose-400">Broken pip / PyQt5 build</td>
                <td className="p-4 text-slate-400">Account signup required</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Data Privacy</td>
                <td className="p-4 font-bold text-emerald-400 bg-blue-950/20">100% Local / In-Memory</td>
                <td className="p-4 text-slate-300">Self-hosted server</td>
                <td className="p-4 text-emerald-400">Local files</td>
                <td className="p-4 text-rose-400">Cloud upload (Free tier limits)</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Oriented Bbox (OBB)</td>
                <td className="p-4 font-bold text-emerald-400 bg-blue-950/20">Yes (Built-in)</td>
                <td className="p-4 text-emerald-400">Yes</td>
                <td className="p-4 text-rose-400">No</td>
                <td className="p-4 text-emerald-400">Yes (Paid)</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">YOLO Split & YAML</td>
                <td className="p-4 font-bold text-emerald-400 bg-blue-950/20">1-Click Automated Zip</td>
                <td className="p-4 text-slate-400">Manual dump</td>
                <td className="p-4 text-rose-400">Requires Python script</td>
                <td className="p-4 text-emerald-400">Yes</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Cost & License</td>
                <td className="p-4 font-bold text-emerald-400 bg-blue-950/20">100% Free & Open Source (MIT)</td>
                <td className="p-4 text-slate-300">Open Core / Cloud pricing</td>
                <td className="p-4 text-emerald-400">GPL / Unmaintained</td>
                <td className="p-4 text-rose-400">$250+/month enterprise</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Desktop Downloads & Self Hosting */}
      <section id="desktop" className="py-20 px-6 max-w-5xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3">
            Deploy Anywhere: Web, Desktop & Docker
          </h2>
          <p className="text-slate-400 text-sm">
            Run on air-gapped workstations or access instantly at <strong className="text-blue-400">labely.org</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* macOS */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                <Laptop className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-bold text-white">macOS</h3>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                  Apple Silicon / Intel
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Native macOS DMG and ZIP builds. Optimized for M1/M2/M3/M4 chips with Metal hardware acceleration.
              </p>
              <div className="bg-slate-950 p-2 rounded-lg font-mono text-[10px] text-purple-300 border border-slate-800">
                npm run electron:build -- --mac
              </div>
            </div>
            <button
              onClick={onLaunchStudio}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
            >
              Build DMG / Open Web
            </button>
          </div>

          {/* Windows */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                <Monitor className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Windows</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Standalone 64-bit installer (.exe) and portable package. Works on Windows 10 & 11 with
                hardware acceleration.
              </p>
              <div className="bg-slate-950 p-2 rounded-lg font-mono text-[10px] text-blue-300 border border-slate-800">
                npm run electron:build -- --win
              </div>
            </div>
            <button
              onClick={onLaunchStudio}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
            >
              Build EXE / Open Web
            </button>
          </div>

          {/* Linux */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Linux</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Pre-packaged .AppImage and Debian (.deb) package. Works on Ubuntu,
                Fedora, Arch, and Debian.
              </p>
              <div className="bg-slate-950 p-2 rounded-lg font-mono text-[10px] text-emerald-300 border border-slate-800">
                npm run electron:build -- --linux
              </div>
            </div>
            <button
              onClick={onLaunchStudio}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
            >
              Build AppImage / Open Web
            </button>
          </div>

          {/* Docker */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Docker Self-Hosted</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Deploy inside your enterprise intranet or private air-gapped cloud with a single
                Docker command.
              </p>
              <div className="bg-slate-950 p-2 rounded-lg font-mono text-[10px] text-cyan-300 border border-slate-800">
                docker compose up -d
              </div>
            </div>
            <button
              onClick={onLaunchStudio}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
            >
              Docker Config Included
            </button>
          </div>
        </div>
      </section>

      {/* 6. Quickstart Code Snippet */}
      <section id="code" className="py-16 px-6 max-w-4xl mx-auto border-t border-slate-800/80">
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Train Ultralytics YOLO with Labely Dataset
              </span>
            </div>
            <span className="text-xs font-mono text-emerald-400">Python 3.10+</span>
          </div>

          <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto border border-slate-800/80 leading-relaxed">
            <code>{`# 1. Export zip from Labely Studio and extract into your project:
#    unzip labely_yolo_dataset.zip -d ./dataset

# 2. Train YOLOv8 or YOLOv11 with 3 lines of Python:
from ultralytics import YOLO

# Load pre-trained model checkpoint
model = YOLO("yolov8n.pt") 

# Train on Labely generated dataset configuration
results = model.train(data="./dataset/data.yaml", epochs=50, imgsz=640)`}</code>
          </pre>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#060810] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-sm">Labely</span>
            <span>• Open Source Annotation Suite</span>
            <span>• labely.org</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={onLaunchStudio} className="hover:text-white transition-colors">
              Studio
            </button>
            <a href="https://github.com/zorthana/labely" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              GitHub Repo
            </a>
            <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              MIT License
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
