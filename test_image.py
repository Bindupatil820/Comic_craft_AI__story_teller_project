import httpx
import uuid
import os
import asyncio

async def test():
    # Try using the direct pollinations URL with seed parameter
    prompt = "a brave princess in a castle, comic book style"
    
    # Try different approaches for image generation
    urls_to_try = [
        f"https://image.pollinations.ai/prompt/{prompt.replace(' ', '%20')}?width=512&height=512&nologo=true",
        f"https://pollinations.ai/{prompt.replace(' ', '-').lower()}.png",
        f"https://image.pollinations.ai/prompt/{quote(prompt)}?width=512&height=512&seed={uuid.uuid4().hex}"
    ]
    
    for i, url in enumerate(urls_to_try):
        print(f"\nTrying method {i+1}:")
        print(f"URL: {url[:100]}...")
        
        async with httpx.AsyncClient(follow_redirects=True) as client:
            try:
                response = await client.get(url, timeout=30.0)
                print(f"Status: {response.status_code}")
                
                if response.status_code == 200 and len(response.content) > 5000:
                    filename = f"test_{i+1}_{uuid.uuid4().hex[:8]}.png"
                    filepath = os.path.join("static/images", filename)
                    os.makedirs("static/images", exist_ok=True)
                    
                    with open(filepath, 'wb') as f:
                        f.write(response.content)
                    
                    print(f"SUCCESS! Saved to: {filepath}")
                    return True
                else:
                    content_preview = response.text[:200] if len(response.text) < 200 else "short content"
                    print(f"Not valid image. Content preview: {content_preview}")
            except Exception as e:
                print(f"Error: {e}")
    
    return False

from urllib.parse import quote

asyncio.run(test())
