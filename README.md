# Vector Hub (ვექტორ ჰაბი)

> **Precision Architectural Signage & Outdoor Advertising Engineering**  
> არქიტექტურული აბრები და გარე რეკლამა — თბილისი, საქართველო

Vector Hub is an interactive platform showcasing architectural signage production, 3D channel letters, large-scale outdoor advertising, LED digital billboards, and precision CAD vector workflows.

---

## ⚡ Features

- **Interactive CAD Vector Workbench**: Live font outline extraction, bezier anchor visualization, kerning, extrusion, and CNC/Laser export simulation.
- **Dynamic Mathematical Vector Field**: Interactive physics-inspired background canvas responding to cursor movements.
- **Precision Vector Cursor**: Dynamic crosshair and coordinate HUD.
- **Bilingual Support (ქართული / English)**: Full Georgian localization with custom typography (`TG Square Regular`) and English fallback.
- **Theme Switching**: Light & Dark mode engineered for high-contrast precision.
- **Interactive Spec Transfer**: Direct handoff from CAD workbench simulator to technical inquiry quote form.
- **Modern Responsive Design**: Fluid layouts optimized for desktop workstations, tablets, and mobile devices.

---

## 🛠 Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vite.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Typography & Font Parsing**: [opentype.js](https://opentype.js.org/) for vector glyph extraction
- **Styling**: Modern CSS variables, glassmorphism, mathematical grids, responsive design
- **Deployment**: [Vercel](https://vercel.com/) ready

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

### 4. Preview Production Build
```bash
npm run preview
```

---

## 🌐 Deploying to Vercel

This project is pre-configured for seamless zero-config deployment on [Vercel](https://vercel.com).

### Option A: Via Vercel Web Dashboard (Recommended)
1. Push this repository to GitHub (see instructions below).
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import your GitHub repository.
4. Vercel automatically detects **Vite** settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**.

### Option B: Via Vercel CLI
```bash
npx vercel
# For production:
npx vercel --prod
```

---

## 📦 Pushing to GitHub

To link and push this project to your GitHub account:

```bash
# 1. Create a new repository on GitHub (e.g. at https://github.com/new)
# 2. Add your remote URL (replace with your repo URL):
git remote add origin https://github.com/<your-username>/vector.git
# Or using SSH:
# git remote add origin git@github.com:<your-username>/vector.git

# 3. Push to main branch:
git push -u origin main
```

*(If you use GitHub CLI `gh`, run `gh auth login` and then `gh repo create vector --public --source=. --push`)*
