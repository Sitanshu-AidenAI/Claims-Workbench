import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, policies, claims, sub_claims, ai, manager

app = FastAPI(title="Claims Workbench API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(policies.router)
app.include_router(claims.router)
app.include_router(sub_claims.router)
app.include_router(ai.router)
app.include_router(manager.router)


@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "Claims Workbench API", "docs": "/docs"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8086, reload=True)
