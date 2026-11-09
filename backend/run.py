import os
import sys

# Ensure backend directory is in sys.path and PYTHONPATH environment variable
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Ensure working directory is backend so imports like `app.main` work reliably
os.chdir(backend_dir)

# Pass PYTHONPATH to any spawned reload processes
existing_pythonpath = os.environ.get("PYTHONPATH", "")
os.environ["PYTHONPATH"] = f"{backend_dir}{os.pathsep}{existing_pythonpath}" if existing_pythonpath else backend_dir

import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8001))
    host = os.environ.get("HOST", "0.0.0.0")
    print("================================================================")
    print(f"  🚀 Starting BookReads FastAPI Backend on http://{host}:{port}")
    print(f"  📖 Swagger API Documentation:   http://{host}:{port}/docs")
    print("  🗄️ Database Connected")
    print("================================================================")
    uvicorn.run("app.main:app", host=host, port=port, reload=(os.environ.get("ENVIRONMENT") != "production"))

