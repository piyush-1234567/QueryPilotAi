# QueryPilot AI — Development Log

## Day 1: Backend Setup

---

### 1. Navigate to Project
`cd ~/Documents/WorkingProjects/QueryPilotAI`

- `cd` means change directory.
- Opens the project folder in the terminal.

### 2. Create Backend Folder
`mkdir backend`

- `mkdir` creates a directory.
- Keeps backend code separate from other files.

### 3. Enter Backend Folder
`cd backend`

- Moves into the backend directory.

### 4. Create Virtual Environment
`python -m venv venv`

- `-m venv` runs Python's virtual environment module.
- The final `venv` is the environment folder name.
- Isolates project dependencies.

### 5. Activate Virtual Environment
`source venv/bin/activate`

- Activates the environment on Linux.
- `(venv)` appears in the terminal prompt.

### 6. Install Dependencies
`pip install fastapi uvicorn`

- **FastAPI:** Builds backend APIs.
- **Uvicorn:** Runs the FastAPI application.

---

## Current Progress

- [x] Repository cloned
- [x] README created
- [x] Architecture diagram created
- [x] Backend folder created
- [x] Virtual environment created
- [ ] Install dependencies
- [ ] Create `main.py`
- [ ] Connect PostgreSQL

## Next Step

Create `main.py` and run the first FastAPI endpoint.