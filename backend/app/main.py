from fastapi import FastAPI

app = FastAPI(title="Manchester API")

@app.get("/health")
def health():
    return {"status": "ok"}
