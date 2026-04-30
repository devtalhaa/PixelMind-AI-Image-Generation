import json
import re

print('Loading colab_backend.ipynb...')
with open('colab_backend.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Update models
source_2 = "".join(nb['cells'][2]['source'])
source_2 = source_2.replace("'runwayml/stable-diffusion-inpainting'", "'SG161222/Realistic_Vision_V5.1_noVAE-inpainting'")
source_2 = source_2.replace("'runwayml/stable-diffusion-v1-5'", "'SG161222/Realistic_Vision_V5.1_noVAE'")

nb['cells'][2]['source'] = [line for match in re.finditer(r'.*?\n|.+', source_2) for line in [match.group(0)]]

# Update logic
source_4 = "".join(nb['cells'][4]['source'])

remove_orig = """def run_remove_object(img, mask_img, params):
    print('[2/4] Running inpainting...')
    img_r = resize_for_model(img)
    mask_r = resize_for_model(mask_img).convert('L')
    prompt = 'background, seamless fill, natural continuation, photorealistic'
    with torch.no_grad():
        result = inpaint_pipe(
            prompt=prompt,
            image=img_r,
            mask_image=mask_r,
            num_inference_steps=30,
            guidance_scale=7.5,
        ).images[0]
    torch.cuda.empty_cache()
    return result.resize(img.size, Image.LANCZOS)
"""

remove_new = """def run_remove_object(img, mask_img, params):
    print('[2/4] Running object removal inpaint...')
    img_r = resize_for_model(img)
    mask_r = resize_for_model(mask_img).convert('L')
    
    user_neg = params.get('negativePrompt', '')
    pos_prefix = "RAW photo, ultra-realistic, 8k uhd, dslr, soft lighting, high quality, film grain, Fujifilm XT4 "
    full_prompt = pos_prefix + "background, seamless fill, natural continuation, photorealistic"
    
    neg_base = "(deformed iris, deformed pupils, semi-realistic, cgi, 3d, render, sketch, cartoon, drawing, anime:1.4), text, close up, cropped, out of frame, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, "
    full_neg = neg_base + user_neg

    with torch.no_grad():
        result = inpaint_pipe(
            prompt=full_prompt,
            negative_prompt=full_neg,
            image=img_r,
            mask_image=mask_r,
            num_inference_steps=30,
            guidance_scale=7.5,
        ).images[0]
    torch.cuda.empty_cache()
    return result.resize(img.size, Image.LANCZOS)
"""

text_orig = """def run_text_to_edit(img, params):
    prompt = params.get('prompt', 'enhance the image')
    print(f'[2/4] Running text-to-edit: "{prompt[:50]}..."')
    orig_size = img.size
    img_r = resize_for_model(img)
    with torch.no_grad():
        result = img2img_pipe(
            prompt=prompt,
            image=img_r,
            strength=0.7,
            guidance_scale=7.5,
            num_inference_steps=30,
        ).images[0]
    torch.cuda.empty_cache()
    return result.resize(orig_size, Image.LANCZOS)
"""

text_new = """def run_text_to_edit(img, params):
    user_prompt = params.get('prompt', 'enhance the image')
    user_neg = params.get('negativePrompt', '')
    
    pos_prefix = "RAW photo, ultra-realistic, 8k uhd, dslr, soft lighting, high quality, film grain, Fujifilm XT4 "
    full_prompt = pos_prefix + user_prompt
    
    neg_base = "(deformed iris, deformed pupils, semi-realistic, cgi, 3d, render, sketch, cartoon, drawing, anime:1.4), text, close up, cropped, out of frame, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, "
    full_neg = neg_base + user_neg

    print(f'[2/4] Running text-to-edit: "{full_prompt[:50]}..."')
    orig_size = img.size
    img_r = resize_for_model(img)
    with torch.no_grad():
        result = img2img_pipe(
            prompt=full_prompt,
            negative_prompt=full_neg,
            image=img_r,
            strength=0.7,
            guidance_scale=7.5,
            num_inference_steps=30,
        ).images[0]
    torch.cuda.empty_cache()
    return result.resize(orig_size, Image.LANCZOS)
"""

source_4 = source_4.replace(remove_orig, remove_new)
source_4 = source_4.replace(text_orig, text_new)

nb['cells'][4]['source'] = [line for match in re.finditer(r'.*?\n|.+', source_4) for line in [match.group(0)]]

with open('colab_backend.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print('Successfully patched colab_backend.ipynb')
