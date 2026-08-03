from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import json

app = FastAPI()

# Allow the Next.js frontend to call this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained model and class names once, when the server starts
model = tf.keras.models.load_model("../model/fieldscan_model.keras")
with open("../model/class_names.json") as f:
    class_names = json.load(f)

def format_disease_name(raw_name: str) -> str:
    """Turn 'Tomato_Early_blight' into 'Tomato — Early blight'."""
    parts = raw_name.replace("__", "_").split("_")
    return " ".join(parts)

@app.get("/")
def root():
    return {"status": "FieldScan API is running"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    image = image.resize((224, 224))

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

    return {
        "disease": format_disease_name(raw_label),
        "raw_label": raw_label,
        "confidence": round(confidence * 100, 1),
        "severity": "healthy" if is_healthy else severity,
        "healthy": is_healthy
    }