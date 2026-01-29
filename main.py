from fastapi import FastAPI
from app.routers import users

app = FastAPI(title="Art Recommendation System")

app.include_router(users.router)

@app.get("/")
def root():
    return {"message": "Art Recommendation System API", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
