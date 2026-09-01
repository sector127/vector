# Vector Hub (ვექტორ ჰაბი)

> **Precision Architectural Signage & Outdoor Advertising Engineering**  
> არქიტექტურული აბრები და გარე რეკლამა — თბილისი, საქართველო

Vector Hub is an interactive platform showcasing architectural signage production, 3D channel letters, large-scale outdoor advertising, LED digital billboards, and precision CAD vector workflows.

---

## ⚡ Features

- **Interactive CAD Vector Workbench**: Live font outline extraction, bezier anchor visualization, kerning, extrusion, and CNC/Laser export simulation.
- **Custom SVG Vector Ingestion**: Upload custom `.svg` vector logos and blueprints with real-time cutting toolpath (mm) and contour calculations.
- **Official A4 Engineering PDF Blueprint**: Instant client-side export of ISO/DIN compliant technical specification sheets with engineering seals.
- **Telegram Bot Instant Alerts**: Automated real-time quote transmission directly to the engineering and sales team Telegram group.
- **Dynamic Mathematical Vector Field**: Interactive physics-inspired background canvas responding to cursor movements.
- **Precision Vector Cursor**: Dynamic crosshair and coordinate HUD.
- **Trilingual Support (ქართული / English / Русский)**: Full Georgian localization with custom typography (`TG Square Regular`), English, and Russian language support.
- **Theme Switching**: Light & Dark mode engineered for high-contrast precision.
- **Interactive Spec Transfer**: Direct handoff from CAD workbench simulator to technical inquiry quote form.
- **Modern Responsive Design**: Fluid layouts optimized for desktop workstations, tablets, and mobile devices.

---

## 🤖 Telegram Bot Configuration

To receive live quote notifications and CAD parameters directly in your Telegram group or channel:

1. **Create a Telegram Bot**:
   - Open Telegram and message [@BotFather](https://t.me/BotFather).
   - Type `/newbot` and follow instructions to get your `API Token` (e.g. `789123456:AAFl...`).

2. **Get your Chat ID**:
   - Create a Telegram group for your team, add your newly created bot to the group as an admin.
   - Send a test message in the group.
   - Visit `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates` to find the `"id"` under `"chat"` (e.g. `-1001234567890`).

3. **Set Environment Variables**:
   - For local development, create `.env.local`:
     ```bash
     VITE_TELEGRAM_BOT_TOKEN=your_bot_token
     VITE_TELEGRAM_CHAT_ID=your_chat_id
     ```
   - For **Vercel** deployment:
     - Go to your Project Dashboard -> **Settings** -> **Environment Variables**.
     - Add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`.

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
