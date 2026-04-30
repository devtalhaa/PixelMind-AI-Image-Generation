# PixelMind AI

A professional, full-stack AI-powered image editor built with **Next.js 14** and a **Python FastAPI** backend running on Google Colab (free GPU).

## Features

| Operation | Model | Time |
|-----------|-------|------|
| Remove Object/Person | Stable Diffusion Inpainting | ~25s |
| Style Transfer | Stable Diffusion Img2Img | ~35s |
| Face Restoration | GFPGAN | ~15s |
| Image Upscale 2×/4× | Real-ESRGAN | ~12s |
| Remove Background | GrabCut / remove.bg | ~5s |
| Color Enhancement | PIL/OpenCV | <2s |
| Text-to-Edit | Stable Diffusion Img2Img | ~30s |

## Prerequisites

- Node.js 18+
- Google account (for Colab)
- (Optional) [remove.bg](https://remove.bg) API key

## Quick Start

### 1. Install frontend

```bash
cd pixelmind-ai
npm install
```

### 2. Set up environment

```bash
cp .env.example .env.local
# Edit .env.local — add REMOVEBG_API_KEY if you have one
```

### 3. Start Colab backend

See [SETUP_COLAB.md](./SETUP_COLAB.md) for full instructions.

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Connect backend

- Paste the ngrok URL from Colab into the sidebar "Backend (Colab)" field
- Click **Test** to verify connection
- Start editing!

## Folder Structure

```
pixelmind-ai/
├── app/               ← Next.js App Router pages + API routes
├── components/        ← All UI — every component is a folder/index.tsx
├── hooks/             ← Custom React hooks
├── lib/               ← API calls, utils, constants
├── store/             ← Zustand global state
├── types/             ← TypeScript interfaces
└── colab_backend.ipynb ← Python FastAPI backend (run in Google Colab)
```

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **State**: Zustand (with localStorage persistence)
- **Backend**: Python FastAPI, ngrok tunnel
- **AI Models**: Stable Diffusion 1.5, LaMa, GFPGAN, Real-ESRGAN
- **GPU**: Google Colab T4 (free)
