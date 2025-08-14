from fastapi import FastAPI
from datetime import datetime

app = FastAPI()

@app.get("/health")
def health():
    return {"ok": True, "at": datetime.utcnow().isoformat() + "Z"}