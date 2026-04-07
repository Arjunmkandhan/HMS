# Hospital Management System

Live site: [https://hospital-management-system-ruddy-delta.vercel.app](https://hospital-management-system-ruddy-delta.vercel.app)


A multi-portal hospital operations application built with React, Vite, Firebase Authentication, and Cloud Firestore.

## Features

### Patient Portal
- Email/password and Google login
- Vitals onboarding and profile setup
- Appointment booking based on doctor availability
- Dashboard for appointments, records, prescriptions, billing, and settings

### Doctor Portal
- Approved-doctor authentication flow
- Dashboard for appointments, patients, prescriptions, and profile updates
- Real-time appointment status updates

### Admin Portal
- Admin authentication and protected dashboard access
- Doctor onboarding, scheduling, and profile management
- Patient and appointment oversight
- Bed, billing, and inventory monitoring widgets

## Tech Stack

- React 19
- Vite 7
- React Router 7
- Firebase Authentication
- Cloud Firestore
- Recharts

## Project Structure

```text
src/
  app/
    App.jsx
    routes/
  features/
    admin/
    doctor/
    home/
    patient/
  lib/
    firebase.js
  shared/
    assets/
    styles/
    utils/
```

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

### 3. Run lint checks

```bash
npm run lint
```

### 4. Build for production

```bash
npm run build
```

### 5. Preview the production build

```bash
npm run preview
```

## Portal Routes

| Portal | Route | Access |
| :--- | :--- | :--- |
| Patient | `/patient-login` | Email/password or Google |
| Doctor | `/doctor-login` | Approved doctor account |
| Admin | `/admin-login` | Admin account |

## First-Time Admin Setup

1. Open `/admin-signup` and create the first admin account.
2. Sign in at `/admin-login`.
3. Add doctors from the admin dashboard so they can access the doctor portal.

## Team

- Mohit Nanda Krishna Pabbati (24BCI0107)
- Arjun M Kandhan (24BDS0271)
- Abhinav Annam (24BCE0578)
- Dadibathina Gowtham Reddy (24BAI0224)
- Daggupati Gagan Sai Koushik (23BCE0397)
