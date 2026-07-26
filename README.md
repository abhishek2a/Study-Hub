# Study Hub 

A modern, highly optimized Progressive Web Application (PWA) built to help ACCA and CSEB students access mock exams, question banks, and meticulously track their daily study progress. 

## ✨ Key Features

### 📚 Course Management
*   **Dual Course Support**: Seamlessly toggle between ACCA (Financial Reporting) and CSEB courses.
*   **Dynamic Resource Loading**: Instantly access chapters, revision notes, and question banks.
*   **Built-in Viewer**: View PDFs, documents, and videos directly inside the app using a beautifully designed modal system without leaving the portal.

### 🎯 Advanced Study Tracker
*   **Log Sessions**: Record the date, chapter, source material (Kaplan/BPP/Mixed), section, quantity, and time spent studying.
*   **Smart History Table**: Sort and search through all past study sessions.
*   **Intelligent Filtering**: By default, the tracker displays only sessions logged *today* to keep your view clean. Searching instantly expands the filter to your entire history.
*   **Live Deletion**: Safely delete accidental or old tracker entries with instant UI updates.

### ⚡ PWA & Mobile Optimizations
*   **Fully Installable**: Functions as a native app on iOS, Android, and Windows via the Web App Manifest.
*   **Service Worker Caching**: Core assets are cached for ultra-fast load times.
*   **Smart Update Toast**: When new code is pushed to GitHub, the app automatically detects the new version and prompts the user to reload.
*   **Mobile-First Polish**: Touch-optimized scrolling (`overscroll-behavior-y: none`), disabled tap-highlights, and a custom Splash Screen ensure a premium mobile experience.

### 🔐 User & Session Management
*   **Firebase Authentication**: Secure email/password login and account creation.
*   **Live Session Tracking**: Automatically records login/logout times and calculates total session durations in the background.
*   **Profile Dashboard**: View total study time, bookmarks (coming soon), and edit your display name.

## 🛠️ Technology Stack

*   **Frontend**: HTML5, Vanilla JavaScript, CSS3
*   **Backend & DB**: Firebase Authentication & Cloud Firestore
*   **Icons**: [Lucide Icons](https://lucide.dev/)
*   **Architecture**: Single Page Application (SPA) with Progressive Web App (PWA) capabilities.

## 🚀 Deployment

This project is designed to be hosted statically (e.g., via GitHub Pages or Vercel). 
To update the live site:
1. Make your changes locally.
2. If modifying `app.js` or `styles.css`, bump the `?v=` version numbers inside `index.html`.
3. Commit and push the changes to the `main` branch. 
4. Users will automatically receive an "Update Available" notification on their next visit.

## 📂 Project Structure

- `index.html`: The main UI structure and layout.
- `app.js`: The core application logic, Firebase integration, and DOM manipulation.
- `styles.css`: All CSS styling, CSS variables, animations, and responsive media queries.
- `manifest.json`: Web App configuration for PWA installation.
- `service-worker.js`: Handles asset caching and background update detection.
- `icon.jpg`: The PWA and Splash Screen icon.
- `favicon.svg`: The browser tab icon.
