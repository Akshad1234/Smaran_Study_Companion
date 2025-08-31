import os
import tempfile
import json
import aiofiles
import google.generativeai as genai
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from PyPDF2 import PdfReader
import docx
import pytesseract
from PIL import Image
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Gemini setup
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Path to Tesseract (update if needed)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Initialize FastAPI
app = FastAPI()

# Allow frontend (Next.js)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # update for prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------- File Text Extractors -------- #
def extract_text_from_pdf(file_path):
    reader = PdfReader(file_path)
    return " ".join([page.extract_text() or "" for page in reader.pages])

def extract_text_from_docx(file_path):
    doc = docx.Document(file_path)
    return " ".join([para.text for para in doc.paragraphs])

def extract_text_from_txt(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()

def extract_text_from_image(file_path):
    image = Image.open(file_path)
    return pytesseract.image_to_string(image)

# -------- API Route: Upload & Extract -------- #
@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    try:
        suffix = os.path.splitext(file.filename)[-1].lower()
        print("📂 Uploaded file:", file.filename, "Suffix:", suffix)

        tmp_dir = tempfile.mkdtemp()
        file_path = os.path.join(tmp_dir, file.filename)

        async with aiofiles.open(file_path, "wb") as out_file:
            content = await file.read()
            await out_file.write(content)

        print("✅ File saved at:", file_path)

        if suffix == ".pdf":
            extracted_text = extract_text_from_pdf(file_path)
        elif suffix == ".docx":
            extracted_text = extract_text_from_docx(file_path)
        elif suffix == ".txt":
            extracted_text = extract_text_from_txt(file_path)
        elif suffix in [".jpg", ".jpeg", ".png"]:
            extracted_text = extract_text_from_image(file_path)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")

        print("📝 Extracted text (preview):", extracted_text[:200])

        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="No readable text found in file")

        # Ensure safe return with proper Unicode handling
        safe_text = extracted_text.encode("utf-8", "replace").decode("utf-8")
        return JSONResponse(content={"text": extracted_text})


    except Exception as e:
        print("❌ Error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

# -------- API Route: Preprocess with Gemini -------- #
class TextPayload(BaseModel):
    text: str

@app.post("/preprocess/")
async def preprocess_text(payload: TextPayload):
    try:
        user_text = payload.text.strip()
        if not user_text:
            raise HTTPException(status_code=400, detail="No text provided")

        exam_prompt = """
You are an exam-focused AI tutor helping students revise.
Carefully read the provided notes line by line.

Your task:
1. Identify ONLY exam-relevant content:
   - Core concepts
   - Definitions
   - Key formulas
   - High-yield facts
2. Ignore:
   - Filler, long stories, or low-importance details
   - Redundant repetition
3. Transform important content into a **clear lecture script** that feels like a teacher explaining to students before an exam.

VERY IMPORTANT: The lecture script should be long enough so the total podcast duration is **20 to 30 minutes**. 
Expand explanations with examples, comparisons, and short clarifications when needed to reach this duration, while still staying exam-focused.

Output format (STRICT JSON only, no extra text outside JSON):
[
  {
    "title": "Topic Name",
    "content": "Lecture-style explanation of exam-relevant points, written in a natural spoken style.",
    "importance": "high" | "medium",
    "duration": <estimated time in seconds to read aloud>
  }
]

Guidelines:
- Split into multiple sections (one section per concept/topic).
- Each section must feel like a **mini lecture** (not just bullet points).
- Keep "content" natural, like spoken teaching (e.g., “Now let’s look at…”).
- Ensure enough depth/detail to make the **whole lecture 20–30 minutes** when read aloud.
- Estimate duration realistically (average ~120 words ≈ 60 seconds).
- Distribute time across sections (some topics may need more, some less).
        """

        model = genai.GenerativeModel("gemini-1.5-flash")

        response = model.generate_content(
            exam_prompt + "\n\nNotes:\n" + user_text,
            generation_config={"response_mime_type": "application/json"}
        )

        # Validate JSON safely
        try:
            segments = json.loads(response.text)
        except Exception as parse_err:
            print("❌ JSON Parse Error:", response.text[:500])
            raise HTTPException(status_code=500, detail="Invalid JSON from Gemini")

        return JSONResponse(content={"status": "success", "segments": segments}, ensure_ascii=False)

    except Exception as e:
        print("❌ AI Error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
