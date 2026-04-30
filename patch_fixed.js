const fs = require('fs');

console.log('Loading colab_backend.ipynb...');
const data = fs.readFileSync('colab_backend.ipynb', 'utf8');
let nb = JSON.parse(data);

// ─────────────────────────────────────────────────────────────────────────────
// CELL 1: Dependencies
// ─────────────────────────────────────────────────────────────────────────────
const cell1 = `# Cell 1: Install dependencies
!pip install -q fastapi uvicorn pyngrok pillow nest_asyncio
!pip install -q torch torchvision --extra-index-url https://download.pytorch.org/whl/cu118
!pip install -q diffusers transformers accelerate safetensors
!pip install -q opencv-python-headless
!pip install -q segment-anything
print('[OK] All dependencies installed!')`;

nb.cells[1].source = cell1.split(/\n/).map((l, i, arr) => i < arr.length - 1 ? l + '\n' : l) || [cell1];

// ─────────────────────────────────────────────────────────────────────────────
// CELL 2: SDXL Model Loading
// ─────────────────────────────────────────────────────────────────────────────
const cell2 = `# Cell 2: Load SDXL models with T4-safe memory optimisations
import torch
from diffusers import StableDiffusionXLImg2ImgPipeline, StableDiffusionXLInpaintPipeline
from PIL import Image
import numpy as np
import io, base64, time

DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'
DTYPE  = torch.float16 if torch.cuda.is_available() else torch.float32

print(f'Device: {DEVICE}')
if torch.cuda.is_available():
    vram = torch.cuda.get_device_properties(0).total_memory / 1e9
    print(f'GPU VRAM: {vram:.1f} GB')

# ── 1. Juggernaut XL  (img2img / style-transfer / text-to-edit) ──────────────
print('\\nLoading Juggernaut-XL img2img pipeline...')
img2img_pipe = StableDiffusionXLImg2ImgPipeline.from_pretrained(
    'RunDiffusion/Juggernaut-XL-v9',
    torch_dtype=DTYPE,
    variant='fp16',
    use_safetensors=True,
)
img2img_pipe.enable_model_cpu_offload()
img2img_pipe.enable_vae_slicing()
print('[OK] Juggernaut-XL img2img loaded')

# ── 2. SDXL Inpaint  (precision-edit / remove-object) ────────────────────────
print('\\nLoading SDXL Inpainting pipeline...')
inpaint_pipe = StableDiffusionXLInpaintPipeline.from_pretrained(
    'diffusers/stable-diffusion-xl-1.0-inpainting-0.1',
    torch_dtype=DTYPE,
    variant='fp16',
    use_safetensors=True,
)
inpaint_pipe.enable_model_cpu_offload()
inpaint_pipe.enable_vae_slicing()
print('[OK] SDXL Inpainting loaded')

# ── 3. Segment Anything Model (SAM vit_h) ────────────────────────────────────
print('\\nLoading SAM predictor...')
import urllib.request, os
SAM_CKPT = '/content/sam_vit_h_4b8939.pth'
if not os.path.exists(SAM_CKPT):
    print('  Downloading SAM checkpoint (~2.5 GB)...')
    urllib.request.urlretrieve(
        'https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth',
        SAM_CKPT
    )
from segment_anything import sam_model_registry, SamPredictor
sam_model = sam_model_registry['vit_h'](checkpoint=SAM_CKPT)
sam_model.to(DEVICE)
sam_predictor = SamPredictor(sam_model)
print('[OK] SAM vit_h loaded')

print('\\n[OK] All SDXL models loaded successfully!')`;

nb.cells[2].source = cell2.split(/\n/).map((l, i, arr) => i < arr.length - 1 ? l + '\n' : l) || [cell2];

// ─────────────────────────────────────────────────────────────────────────────
// CELL 4: FastAPI Server (complete rewrite)
// ─────────────────────────────────────────────────────────────────────────────
const cell4 = `# Cell 4: FastAPI server — SDXL architecture
import asyncio, io, base64, time
from datetime import datetime
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import nest_asyncio
nest_asyncio.apply()

app = FastAPI(title='PixelMind AI — SDXL Backend')

TIMEOUT_SECONDS = 180

SDXL_NEGATIVE = (
    "(worst quality, low quality, normal quality, lowres, low details, oversaturated, "
    "undersaturated, overexposed, underexposed, grayscale, bw, bad photo, bad photography, "
    "bad art:1.4), (watermark, signature, text font, username, error, logo, words, letters, "
    "digits, autograph, trademark, name:1.2), (blur, blurry, grainy), morbid, ugly, "
    "asymmetrical, mutated malformed, mutilated, poorly lit, bad shadow, draft, cropped, "
    "out of frame, cut off, censored, jpeg artifacts, out of focus, glitch, duplicate"
)

VALID_OPERATIONS = [
    'style-transfer', 'face-restoration', 'upscale',
    'remove-background', 'color-enhance', 'text-to-edit', 'precision-edit'
]

STYLE_PROMPTS = {
    'anime':       'anime style, Studio Ghibli, vibrant colors, cel shading',
    'cyberpunk':   'cyberpunk neon city, futuristic, high contrast, cinematic',
    'oil-painting':'oil painting, thick brush strokes, Rembrandt lighting, fine art',
    'watercolor':  'watercolor painting, soft washes, delicate details',
    'sketch':      'pencil sketch, detailed crosshatching, fine lines',
    'neon':        'neon glow, vibrant neon lights, dark background, synthwave',
    'vintage':     'vintage photo, film grain, faded colors, retro aesthetic',
}


class ProcessRequest(BaseModel):
    image_base64: str
    operation: str
    params: Optional[Dict[str, Any]] = {}
    mask_base64: Optional[str] = None


def base64_to_pil(b64: str) -> Image.Image:
    if ',' in b64:
        b64 = b64.split(',')[1]
    return Image.open(io.BytesIO(base64.b64decode(b64))).convert('RGB')


def pil_to_base64(img: Image.Image) -> str:
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    return 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()


def resize_sdxl(img: Image.Image, target: int = 1024) -> Image.Image:
    w, h = img.size
    ratio = target / max(w, h)
    nw, nh = int(w * ratio), int(h * ratio)
    nw = (nw // 8) * 8 or 8
    nh = (nh // 8) * 8 or 8
    return img.resize((nw, nh), Image.LANCZOS)


def apply_color_enhance(img, brightness=0, contrast=0, saturation=0, temperature=0):
    import cv2
    arr = np.array(img).astype(np.float32)
    arr = np.clip(arr * (1 + brightness / 100), 0, 255)
    mean = arr.mean()
    arr = np.clip((arr - mean) * (1 + contrast / 100) + mean, 0, 255)
    hsv = cv2.cvtColor(arr.astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
    hsv[:,:,1] = np.clip(hsv[:,:,1] * (1 + saturation / 100), 0, 255)
    arr = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB).astype(np.float32)
    arr[:,:,0] = np.clip(arr[:,:,0] + temperature * 0.5, 0, 255)
    arr[:,:,2] = np.clip(arr[:,:,2] - temperature * 0.5, 0, 255)
    return Image.fromarray(arr.astype(np.uint8))


def sam_automask(img_np: np.ndarray) -> np.ndarray:
    """Use SAM to segment the dominant foreground object and return a uint8 mask."""
    sam_predictor.set_image(img_np)
    h, w = img_np.shape[:2]
    cx, cy = w // 2, h // 2
    input_point = np.array([[cx, cy]])
    input_label = np.array([1])
    masks, scores, _ = sam_predictor.predict(
        point_coords=input_point,
        point_labels=input_label,
        multimask_output=True,
    )
    best_mask = masks[np.argmax(scores)]
    return (best_mask * 255).astype(np.uint8)


# ── Operation runners ──────────────────────────────────────────────────────────

def run_style_transfer(img, params):
    style = params.get('style', 'anime')
    strength = float(params.get('strength', 0.5))
    prompt = STYLE_PROMPTS.get(style, STYLE_PROMPTS['anime'])
    print(f'[2/4] Style transfer: {style} (strength={strength})')
    orig_size = img.size
    img_r = resize_sdxl(img)
    with torch.no_grad():
        result = img2img_pipe(
            prompt=prompt,
            negative_prompt=SDXL_NEGATIVE,
            image=img_r,
            strength=strength,
            guidance_scale=7.0,
            num_inference_steps=40,
        ).images[0]
    torch.cuda.empty_cache()
    return result.resize(orig_size, Image.LANCZOS)


def run_text_to_edit(img, params):
    prompt = params.get('prompt', 'enhance the image realistically')
    strength = float(params.get('strength', 0.55))
    user_neg = params.get('negativePrompt', '')
    full_neg = SDXL_NEGATIVE + (', ' + user_neg if user_neg else '')
    print(f'[2/4] Text-to-edit: "{prompt[:60]}" (strength={strength})')
    orig_size = img.size
    img_r = resize_sdxl(img)
    with torch.no_grad():
        result = img2img_pipe(
            prompt=prompt,
            negative_prompt=full_neg,
            image=img_r,
            strength=strength,
            guidance_scale=7.0,
            num_inference_steps=40,
        ).images[0]
    torch.cuda.empty_cache()
    return result.resize(orig_size, Image.LANCZOS)


def run_precision_edit(img, params, mask_img=None):
    prompt = params.get('prompt', 'high quality, realistic')
    user_neg = params.get('negativePrompt', '')
    full_neg = SDXL_NEGATIVE + (', ' + user_neg if user_neg else '')
    print(f'[2/4] Precision edit: "{prompt[:60]}"')

    orig_size = img.size
    img_r = resize_sdxl(img, 1024)
    img_np = np.array(img_r)

    if mask_img is not None:
        mask_r = mask_img.resize(img_r.size, Image.NEAREST).convert('L')
        mask_np = np.array(mask_r)
        mask_pil = Image.fromarray(mask_np)
    else:
        print('  No mask provided — using SAM auto-mask on center object')
        mask_np = sam_automask(img_np)
        mask_pil = Image.fromarray(mask_np)

    with torch.no_grad():
        result = inpaint_pipe(
            prompt=prompt,
            negative_prompt=full_neg,
            image=img_r,
            mask_image=mask_pil,
            guidance_scale=7.0,
            num_inference_steps=40,
            strength=0.99,
        ).images[0]
    torch.cuda.empty_cache()
    return result.resize(orig_size, Image.LANCZOS)


def run_upscale(img, params):
    factor = int(params.get('upscaleFactor', 2))
    print(f'[2/4] Lanczos {factor}x upscale (no ESRGAN — SDXL edition)')
    w, h = img.size
    return img.resize((w * factor, h * factor), Image.LANCZOS)


def run_remove_background(img, params):
    print('[2/4] Running background removal (GrabCut)...')
    import cv2
    arr = np.array(img)
    mask = np.zeros(arr.shape[:2], np.uint8)
    bgd = np.zeros((1, 65), np.float64)
    fgd = np.zeros((1, 65), np.float64)
    h, w = arr.shape[:2]
    rect = (int(w*0.05), int(h*0.05), int(w*0.9), int(h*0.9))
    cv2.grabCut(arr, mask, rect, bgd, fgd, 5, cv2.GC_INIT_WITH_RECT)
    result_mask = np.where((mask==2)|(mask==0), 0, 255).astype(np.uint8)
    rgba = np.dstack([arr, result_mask])
    return Image.fromarray(rgba, 'RGBA')


def run_color_enhance(img, params):
    print('[2/4] Color enhance...')
    return apply_color_enhance(
        img,
        brightness=params.get('brightness', 0),
        contrast=params.get('contrast', 0),
        saturation=params.get('saturation', 0),
        temperature=params.get('temperature', 0),
    )


def run_face_restoration(img, params):
    print('[2/4] Face restoration — using SDXL face-detail pass...')
    orig_size = img.size
    img_r = resize_sdxl(img, 1024)
    prompt = ('ultra detailed face, perfect eyes, perfect skin, photorealistic portrait, '
              '8k uhd, sharp focus, studio lighting, high quality')
    with torch.no_grad():
        result = img2img_pipe(
            prompt=prompt,
            negative_prompt=SDXL_NEGATIVE,
            image=img_r,
            strength=0.35,
            guidance_scale=7.0,
            num_inference_steps=40,
        ).images[0]
    torch.cuda.empty_cache()
    return result.resize(orig_size, Image.LANCZOS)


# ── Endpoints ──────────────────────────────────────────────────────────────────

@app.get('/')
def root():
    return {'message': 'PixelMind AI — SDXL Backend', 'status': 'online'}


@app.get('/health')
def health():
    return {
        'status': 'online',
        'device': DEVICE,
        'models_loaded': True,
        'timestamp': datetime.utcnow().isoformat(),
    }


@app.post('/process')
async def process(req: ProcessRequest):
    start = time.time()
    print(f'\\n[START] op={req.operation}')

    if not req.image_base64:
        raise HTTPException(400, 'No image provided')
    if req.operation not in VALID_OPERATIONS:
        raise HTTPException(400, f'Unknown operation: {req.operation}')

    params = req.params or {}

    try:
        print('[1/4] Decoding image...')
        img = base64_to_pil(req.image_base64)

        async def run_with_timeout():
            loop = asyncio.get_event_loop()
            if req.operation == 'style-transfer':
                return await loop.run_in_executor(None, run_style_transfer, img, params)
            elif req.operation == 'text-to-edit':
                return await loop.run_in_executor(None, run_text_to_edit, img, params)
            elif req.operation == 'precision-edit':
                mask = base64_to_pil(req.mask_base64).convert('L') if req.mask_base64 else None
                return await loop.run_in_executor(None, run_precision_edit, img, params, mask)
            elif req.operation == 'face-restoration':
                return await loop.run_in_executor(None, run_face_restoration, img, params)
            elif req.operation == 'upscale':
                return await loop.run_in_executor(None, run_upscale, img, params)
            elif req.operation == 'remove-background':
                return await loop.run_in_executor(None, run_remove_background, img, params)
            elif req.operation == 'color-enhance':
                return await loop.run_in_executor(None, run_color_enhance, img, params)

        result = await asyncio.wait_for(run_with_timeout(), timeout=TIMEOUT_SECONDS)

        print('[3/4] Encoding result...')
        result_b64 = pil_to_base64(result)
        elapsed = time.time() - start
        print(f'[4/4] Done — {elapsed:.1f}s')

        return {
            'success': True,
            'result_base64': result_b64,
            'processing_time': round(elapsed * 1000),
        }

    except asyncio.TimeoutError:
        torch.cuda.empty_cache()
        raise HTTPException(408, 'Processing timed out')
    except HTTPException:
        raise
    except Exception as e:
        torch.cuda.empty_cache()
        print(f'[ERROR] {e}')
        raise HTTPException(500, str(e))

print('[OK] FastAPI SDXL app ready')`;

nb.cells[4].source = cell4.split(/\n/).map((l, i, arr) => i < arr.length - 1 ? l + '\n' : l) || [cell4];

fs.writeFileSync('colab_backend.ipynb', JSON.stringify(nb, null, 1), 'utf8');
console.log('Successfully patched colab_backend.ipynb with full SDXL overhaul!');
