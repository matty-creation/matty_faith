# TimeTracker Admin

## Run the backend

Set the existing database variables before starting FastAPI:

```powershell
$env:DB_HOST = "127.0.0.1"
$env:DB_PORT = "3306"
$env:DB_NAME = "timetracker"
$env:DB_USER = "root"
$env:DB_PASSWORD = "your-password"
python back_end/run.py
```

An administrator account must have `position` set to `Admin`, `Administrator`, or `System Administrator`.

## Run the React admin client

```powershell
cd front_end/admin-react
npm install
npm run dev
```

The client uses `http://127.0.0.1:8000` by default. Set `VITE_API_URL` before `npm run dev` if the API is hosted elsewhere.