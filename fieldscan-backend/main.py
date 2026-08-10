from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import json
from openai import OpenAI, APITimeoutError, APIError, APIConnectionError
from dotenv import load_dotenv
import os

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

groq_client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
)

GROQ_MODEL = "llama-3.3-70b-versatile"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://fieldscan.vercel.app",
    ],
    allow_origin_regex=r"https://fieldscan.*\.vercel\.app",
    allow_methods=["*"],
    allow_headers=["*"],
)

model = tf.keras.models.load_model("model/fieldscan_model.keras")
with open("model/class_names.json") as f:
    class_names = json.load(f)

def format_disease_name(raw_name: str) -> str:
    name = raw_name.replace("___", " ").replace("__", " ").replace("_", " ")
    return " ".join(name.split())

def generate_advisory(disease_name: str, confidence: float) -> str:
    if not GROQ_API_KEY:
        print("ADVISORY ERROR: GROQ_API_KEY not found in .env file")
        return "Treatment advisory unavailable — API key not configured. Please consult a local agricultural extension officer."

    prompt = f"""You are an agricultural advisor. A crop disease detection model found:
Disease: {disease_name}
Confidence: {round(confidence * 100, 1)}%

Give a short, practical treatment plan in 3-4 sentences: what to do immediately,
what product/method to use, and how often to repeat. Keep it simple for a farmer to follow."""

    try:
        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_tokens=300,
            timeout=15,
        )
        advisory_text = response.choices[0].message.content.strip()

        if not advisory_text:
            raise ValueError("Empty response from model")

        return advisory_text

    except APITimeoutError:
        print("ADVISORY ERROR: Groq request timed out")
        return "Treatment advisory temporarily unavailable (server took too long to respond). Please consult a local agricultural extension officer."

    except APIConnectionError as e:
        print("ADVISORY ERROR: Connection failed:", repr(e))
        return "Treatment advisory temporarily unavailable (couldn't reach the AI service). Please consult a local agricultural extension officer."

    except APIError as e:
        print("ADVISORY ERROR: Groq API error:", repr(e))
        return "Treatment advisory temporarily unavailable (AI service returned an error). Please consult a local agricultural extension officer."

    except Exception as e:
        print("ADVISORY ERROR: Unexpected error:", repr(e))
        return "Treatment advisory temporarily unavailable. Please consult a local agricultural extension officer."

@app.get("/")
def root():
    return {"status": "FieldScan API is running"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        image = image.resize((224, 224))
    except Exception as e:
        print("IMAGE ERROR:", repr(e))
        return {"error": "Could not read the uploaded image. Please try a different file."}

    img_array = np.array(image)
    img_array = np.expand_dims(img_array, axis=0)

    predictions = model.predict(img_array)
    predicted_index = int(np.argmax(predictions[0]))
    confidence = float(np.max(predictions[0]))
    raw_label = class_names[predicted_index]

    is_healthy = "healthy" in raw_label.lower()

    if confidence > 0.85:
        severity = "mild"
    elif confidence > 0.6:
        severity = "moderate"
    else:
        severity = "severe"

    if not is_healthy:
        advisory_text = generate_advisory(format_disease_name(raw_label), confidence)
    else:
        advisory_text = "No treatment needed — this leaf shows no signs of disease. Keep monitoring regularly."

    return {
        "disease": format_disease_name(raw_label),
        "raw_label": raw_label,
        "confidence": round(confidence * 100, 1),
        "severity": "healthy" if is_healthy else severity,
        "healthy": is_healthy,
        "advisory": advisory_text
    }
