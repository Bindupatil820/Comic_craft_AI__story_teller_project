from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List
import os
import uuid
import httpx
from dotenv import load_dotenv
from professional_ai import ProfessionalStoryGenerator

load_dotenv()

app = FastAPI(title="Comic Craft AI Storyteller")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("static/images", exist_ok=True)
os.makedirs("static/pdfs", exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/frontend", StaticFiles(directory="frontend", html=True), name="frontend")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_API_KEY_HERE")
story_generator = ProfessionalStoryGenerator(GEMINI_API_KEY)

class StoryRequest(BaseModel):
    genre: str
    user_prompt: str
    num_panels: int = 5

class StoryResponse(BaseModel):
    title: str
    summary: str
    moral: str
    realLifeLesson: str
    characters: List[dict]
    panels: List[dict]

class FreeImageGenerator:
    async def generate_image(self, prompt: str, panel_num: int) -> str:
        try:
            enhanced_prompt = f"comic style colorful illustration {prompt} for children storybook"
            url = f"https://pollinations.ai/{enhanced_prompt.replace(' ', '-').lower()}.png?width=512&height=512"
            
            print(f"Generating image for panel {panel_num}: {url[:80]}...")
            
            async with httpx.AsyncClient(follow_redirects=True) as client:
                response = await client.get(url, timeout=60.0)
                if response.status_code == 200 and len(response.content) > 5000:
                    filename = f"panel_{panel_num}_{uuid.uuid4().hex[:8]}.png"
                    filepath = os.path.join("static/images", filename)
                    with open(filepath, 'wb') as f:
                        f.write(response.content)
                    return f"/static/images/{filename}"
        except Exception as e:
            print(f"Image error: {e}")
        return None

image_generator = FreeImageGenerator()

@app.get("/")
async def root():
    return {"message": "Comic Craft AI Storyteller - Professional Edition"}

@app.get("/genres")
async def get_genres():
    return ["fantasy", "mythology", "sci_fi", "adventure", "mystery", "friendship", "fairy_tale"]

@app.post("/generate", response_model=StoryResponse)
async def generate_story(request: StoryRequest):
    try:
        print(f"\n{'='*50}")
        print(f"Generating story for: {request.user_prompt}")
        print(f"Genre: {request.genre}")
        print(f"Panels: {request.num_panels}")
        print(f"{'='*50}\n")
        
        story = story_generator.generate_story(
            request.user_prompt,
            request.genre,
            request.num_panels
        )
        
        for panel in story['panels']:
            image_url = await image_generator.generate_image(
                panel['scene'],
                panel['panel_number']
            )
            panel['image_url'] = image_url
        
        print(f"Story generated: {story['title']}")
        return story
        
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
