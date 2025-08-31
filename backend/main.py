import os
import tempfile
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PyPDF2 import PdfReader
import docx
import pytesseract
from PIL import Image
import aiofiles

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
# Initialize FastAPI app
app = FastAPI()

# Allow frontend (Next.js) to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # In production: restrict to your frontend domain
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

# -------- API Route -------- #
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

        print("📝 Extracted text:", extracted_text[:200])  # only preview

        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="No readable text found in file")

        return {"status": "success", "text": extracted_text}

    except Exception as e:
        print("❌ Error:", str(e))   # Debug line
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)