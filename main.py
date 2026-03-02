from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from models import Base
from database import engine
from routers import auth, todos, admin, users
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse

app = FastAPI()

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"Validation Error: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )

Base.metadata.create_all(bind=engine)

app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def test(request: Request):
    return RedirectResponse(url="/auth/login-page", status_code=status.HTTP_302_FOUND)


@app.get("/healthy")
def health_check():
    return {"status": "Healthy"}


app.include_router(auth.router)
app.include_router(todos.router)
app.include_router(admin.router)
app.include_router(users.router)
