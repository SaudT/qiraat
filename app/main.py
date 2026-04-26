from fastapi import FastAPI


app = FastAPI(
    title="Qiraat Backend",
    description="Backend API for the Qiraat Quran recitations platform.",
    version="0.1.0",
)


@app.get("/health", tags=["Health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
