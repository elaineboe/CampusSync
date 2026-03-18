# CampusSync

CampusSync is a web-based academic scheduling and coordination system designed for university environments. This project is developed through a series of timeboxes.

## Current State: Timebox 1
The current completion covers Timebox 1, initializing the system foundation.

### Frontend
- Located in `/frontend`
- React + Vite stack
- Build using `npm install` and `npm run build`

### Backend
- Located in `/backend`
- PHP REST API
- Designed to run on Nuwebspace hosting
- Database configuration in `/backend/config/database.php`

### Database Schema
- Located in `/database/schema.sql`
- Contains RBAC roles for students, lecturers, and admins.
- Seed data available in `/database/seed_data.sql`

## How to Deploy to Nuwebspace via WinSCP

To get the application running live on `http://w25037992.nuwebspace.co.uk`, you need to upload the backend files and the compiled frontend files using a FTP client like WinSCP. 

### Step 1: Build the Frontend
Nuwebspace only serves static files (HTML/CSS/JS) and PHP. You cannot run `npm start` on Nuwebspace. You must compile the React app into static files first.
1. Open a terminal or command prompt on your **local computer**.
2. Navigate to the frontend folder: `cd path/to/Campussync/frontend`
3. Run `npm install` to ensure dependencies are loaded.
4. Run `npm run build`.
   * This will create a new folder named `dist` inside the `/frontend` directory containing the compiled static website files.

### Step 2: Upload Files via WinSCP
1. Open **WinSCP** and connect to your Nuwebspace server using your university credentials (Host: `nuwebspace.co.uk`, Username: `w25037992`, Password: `<your_password>`).
2. Once connected, navigate to the `public_html` directory (this is the root directory that serves your website).
3. **Upload Backend:**
   * Copy the entire *contents* of the `/backend` folder (including `.htaccess`, `index.php`, `config/`, `controllers/`, etc.) from your local computer into a new folder named `api` inside `public_html`.
   * The structure on the remote server should look like: `public_html/api/index.php`.
4. **Upload Frontend:**
   * Open the `/frontend/dist` folder on your local computer.
   * Copy **all the files** inside the `dist` folder and drag them directly into the root `public_html` directory on the Nuwebspace server.
   * *Note: Do not upload the `frontend` folder itself, only the contents of `dist`.*

### Step 3: Verify Deployment
1. Go to your browser.
2. Visit `http://w25037992.nuwebspace.co.uk` 
   * You should see the CampusSync login page.
3. Visit `http://w25037992.nuwebspace.co.uk/calendar`
   * You should see the Timebox 2 Academic Calendar rendering (it will fetch events from the database you set up in phpMyAdmin).
