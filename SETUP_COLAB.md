# Setting Up the Colab Backend

This guide walks you through running the PixelMind AI backend on Google Colab's free GPU.

## Step 1: Open Google Colab

Go to [colab.research.google.com](https://colab.research.google.com)

## Step 2: Upload the Notebook

1. Click **File → Upload notebook**
2. Select `colab_backend.ipynb` from this project folder
3. The notebook will open in Colab

## Step 3: Enable GPU Runtime

1. Click **Runtime → Change runtime type**
2. Set **Hardware accelerator** to **T4 GPU**
3. Click **Save**

## Step 4: Run All Cells

Run each cell in order by clicking the ▶ button or pressing `Shift+Enter`:

| Cell | Content | Wait time |
|------|---------|-----------|
| 1 | Install dependencies | ~3-5 min |
| 2 | Load AI models | ~5-10 min |
| 3 | Helper functions | Instant |
| 4 | FastAPI server | Instant |
| 5 | Start + ngrok | ~10 sec |

## Step 5: Enter Ngrok Authtoken

Recent updates to `ngrok` require a free account to expose local servers to the internet:
1. Create a free account at [dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup)
2. Get your Authtoken at [dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)
3. When Cell 5 runs, a prompt will appear asking for your token. Paste it and press Enter.

## Step 6: Copy the ngrok URL

After Cell 5 runs, you will see output like:

```
============================================================
✅ PixelMind AI Backend is LIVE!
📡 Backend URL: https://xxxx-xx-xx-xxx-xxx.ngrok-free.app
============================================================
```

**Copy the full URL** (starting with `https://`)

## Step 6: Connect in the App

1. Open PixelMind AI at [http://localhost:3000/editor](http://localhost:3000/editor)
2. In the left sidebar under **Backend (Colab)**, paste the URL
3. Click **Test** — the dot should turn green
4. Start editing!

## Important Notes

- **Keep the Colab tab open** — closing it stops the backend
- **Session limits**: Colab free tier runs for ~12 hours per session
- **Cold start**: First operation may be slower as models warm up
- **GPU memory**: If you see OOM errors, restart the runtime and run Cell 2 again

## Troubleshooting

| Problem | Solution |
|---------|----------|
| ngrok URL not working | Re-run Cell 5 to get a new URL |
| Model loading fails | Check that GPU is enabled in runtime settings |
| Slow responses | Colab may have given you a slower GPU — try reconnecting |
| "Backend Offline" in app | Re-paste the URL and click Test |
