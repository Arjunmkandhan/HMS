## Project Summary

### Project Name

**Hospital Management System**

### Project Overview

This project is a multi-portal Hospital Management System developed to digitally manage core hospital operations through a single web application. It provides separate access and workflows for **Admin**, **Doctor**, and **Patient** users. The system supports secure login, role-based access control, doctor onboarding, patient onboarding, appointment booking, prescription management, billing visibility, and dashboard-based monitoring of hospital activities.

### Main Objectives

- digitize hospital management activities
- reduce manual paperwork and repeated data entry
- simplify communication between admin, doctors, and patients
- improve appointment scheduling and record tracking
- provide a centralized and role-based healthcare platform

### Architecture Summary

- **Frontend:** React-based single page Kvapplication
- **Build Tool:** Vite
- **Backend Services:** Firebase Authentication and Cloud Firestore
- **Routing:** React Router for portal-based navigation
- **Charts and Analytics:** Recharts
- **Code Quality:** ESLint
- **Deployment-ready Output:** Vite production build in `dist/`

### User Portals Included

- **Admin Portal:** doctor onboarding, approval flow, scheduling, patient and appointment oversight, monitoring widgets
- **Doctor Portal:** doctor authentication, patient handling, appointment updates, prescription workflows, profile management
- **Patient Portal:** signup/login, vitals onboarding, appointment booking, prescriptions, billing, settings, and dashboard access

### Project Structure Summary

- `src/app/` for application routing and root app setup
- `src/features/admin/` for admin pages and flows
- `src/features/doctor/` for doctor dashboard and portal components
- `src/features/patient/` for patient onboarding, login, and dashboard pages
- `src/features/home/` for landing page components
- `src/lib/firebase.js` for Firebase app, authentication, and Firestore setup
- `src/shared/styles/` for portal-specific styling
- `src/shared/utils/` for shared utilities such as appointment slot handling

### Tools, Frameworks, Modules, and Versions Used

#### Core Development Tools

- **Node.js:** `v24.14.0`
- **npm:** `11.9.0`
- **Vite:** `^7.3.1`
- **@vitejs/plugin-react:** `^5.1.1`
- **ESLint:** `^9.39.1`
- **@eslint/js:** `^9.39.1`
- **globals:** `^16.5.0`

#### Main Frontend Libraries

- **React:** `^19.2.0`
- **React DOM:** `^19.2.0`
- **React Router DOM:** `^7.13.1`
- **Recharts:** `^3.8.1`

#### Backend and Database Libraries

- **Firebase:** `^12.10.0`

#### Important Firebase Modules Used in the Project

- `firebase/app`
- `firebase/auth`
- `firebase/firestore`

#### Firebase Services Used

- **Firebase Authentication** for user login, session persistence, and account creation
- **Cloud Firestore** for storing users, doctors, patients, appointments, prescriptions, and billing data

#### Important Authentication/Database Functions Used

- `initializeApp()`
- `getAuth()`
- `setPersistence()`
- `browserLocalPersistence`
- `createUserWithEmailAndPassword()`
- `signOut()`
- `getFirestore()`
- Firestore document and query operations used throughout the app such as add, read, update, delete, query, snapshot listening, and transaction handling

#### Linting and React Support Libraries

- **eslint-plugin-react-hooks:** `^7.0.1`
- **eslint-plugin-react-refresh:** `^0.4.24`
- **@types/react:** `^19.2.7`
- **@types/react-dom:** `^19.2.3`

### Key Features Implemented

- multi-role authentication system
- protected portal-based navigation
- doctor account creation and approval workflow
- patient profile and vitals onboarding
- appointment booking and schedule handling
- prescription and billing record management
- dashboard analytics and visualization
- real-time data updates using Firestore listeners

### Development and Build Commands

- `npm install` to install project dependencies
- `npm run dev` to start the local development server
- `npm run build` to generate the production build
- `npm run preview` to preview the production build
- `npm run lint` to run lint checks

### Summary Statement

In short, this project is a modern web-based Hospital Management System built with React, Vite, Firebase Authentication, and Cloud Firestore, supported by routing, charting, and linting tools to create a scalable, role-based, and user-friendly healthcare management platform.

# Firebase and Database Connectivity Explanation

This document explains how database connectivity works in this Hospital Management System project, how Firebase is used, and how the Admin, Doctor, and Patient portals are connected through the same backend.

The goal is to explain the project in a student-friendly way, using the actual code structure of this repository.

## 1. Big Picture

This project uses **Firebase** as the backend.

Firebase is doing two major jobs here:

1. **Authentication**
   It checks who the user is.
   Example: admin login, doctor login, patient login.

2. **Firestore Database**
   It stores the actual hospital data.
   Example: users, doctors, patients, appointments, prescriptions, and billing.

So the app works like this:

- React shows the UI
- Firebase Auth verifies the user
- Firestore stores and returns the data
- The app checks the user's role and shows the correct portal

## 2. Where Firebase Is Connected in the Code

The main Firebase connection is created in:

- `src/lib/firebase.js`

This file does three important things:

1. It initializes the Firebase app using the project configuration.
2. It creates `auth`, which is used for login and session handling.
3. It creates `db`, which is the Firestore database connection used everywhere in the app.

### What happens in `src/lib/firebase.js`

The code:

- calls `initializeApp(firebaseConfig)`
- creates `auth` using `getAuth(app)`
- creates `db` using `getFirestore(app)`
- enables browser session persistence using `setPersistence(auth, browserLocalPersistence)`

This means if a user refreshes the page, Firebase tries to keep them logged in.

The same file also contains a special helper:

- `createDoctorAuthAccount(email, password)`

This helper creates a doctor's Firebase Auth account from the admin side using a **secondary Firebase app instance**. That is important because the admin should be able to create a doctor account without logging the admin out.

## 3. Two Layers of Identity in This Project

A very important concept in this project is that a user exists in **two places**:

### Layer 1: Firebase Authentication

This tells us:

- the user has an account
- the user has an email
- the user can log in

But Auth alone does **not** tell us whether that person is an admin, doctor, or patient in this project.

### Layer 2: Firestore `users` collection

This project stores application-level role information in:

- `users/{uid}`

This document tells the app:

- what the user's role is
- whether the doctor is approved
- whether a profile is completed
- what linked doctor or patient data exists

So the app does not trust Firebase Auth alone.
It logs the user in first, then checks the `users` collection to understand what that user is allowed to do.

## 4. Main Collections Used in Firestore

From the code, the important collections are:

- `users`
- `doctors`
- `patients`
- `appointments`
- `prescriptions`
- `billing`

Below is what each one is used for.

### 4.1 `users`

This is the central role table of the project.

Typical fields:

- `uid`
- `name`
- `email`
- `role`
- `approved`
- `doctorId`
- `profileCompleted`
- `createdAt`
- `updatedAt`

Example roles:

- `admin`
- `doctor`
- `patient`

Think of `users` as the master identity record for the application.

### 4.2 `doctors`

This stores doctor-specific profile and schedule information.

Typical fields:

- `uid`
- `name`
- `specialization`
- `email`
- `phone`
- `availability`
- `timeSlots`
- `approved`
- `createdAt`
- `updatedAt`

This collection is used by both the admin and patient/doctor portals.

### 4.3 `patients`

This stores patient-specific medical and profile data.

Typical fields:

- `uid`
- `name`
- `email`
- `age`
- `gender`
- `phone`
- `address`
- `bloodGroup`
- `condition`
- `vitals`
- `vitalsCompleted`
- `createdAt`
- `updatedAt`

The `vitals` object contains fields such as:

- height
- weight
- allergies
- chronic conditions
- emergency contact

### 4.4 `appointments`

This collection connects patients and doctors.

Typical fields:

- `patientUid`
- `patientName`
- `doctorId`
- `doctor`
- `specialty`
- `date`
- `time`
- `status`
- `createdAt`

This is one of the most important collections because all three portals depend on it.

### 4.5 `prescriptions`

This stores prescriptions written by doctors for patients.

Typical fields:

- `patientId`
- `patientName`
- `doctorId`
- `medicines`
- `notes`
- `date`
- `createdAt`

### 4.6 `billing`

This stores patient billing records.

Typical fields seen in the patient portal:

- `patientId`
- `description`
- `amount`
- `status`
- `date`

## 5. How Login and Role Checking Work

Role checking is done in two places:

1. In each portal login flow
2. In the protected route component

The protected route is in:

- `src/app/routes/ProtectedRoleRoute.jsx`

### How `ProtectedRoleRoute` works

When a user tries to open a protected page:

1. Firebase checks whether a user session exists using `onAuthStateChanged`
2. If no user exists, the app redirects to the proper login page
3. If a user exists, the app reads `users/{uid}` from Firestore
4. It checks whether the role matches the required role
5. For doctors, it also checks whether `approved === true`

So route access is not based only on being logged in.
It is based on:

- logged in
- correct role
- approved doctor status when needed

## 6. How the Admin Portal Uses Firebase

Main files:

- `src/features/admin/pages/AdminSignupPage.jsx`
- `src/features/admin/pages/AdminLoginPage.jsx`
- `src/features/admin/pages/AdminDashboardPage.jsx`

### 6.1 Admin signup

When an admin signs up:

1. Firebase Auth creates the login account
2. Firestore creates a matching `users/{uid}` document
3. That document is saved with `role: "admin"`

So admin identity is stored in both Auth and Firestore.

### 6.2 Admin login

When the admin logs in:

1. `signInWithEmailAndPassword` authenticates the account
2. The code reads `users/{uid}`
3. It checks whether `role === "admin"`
4. If not, the app signs the user out

This prevents normal users from entering the admin portal through the UI.

### 6.3 Admin dashboard powers

The admin portal has the highest power in the app logic.

The admin can:

- read all doctors
- read all patients
- read all appointments
- create doctors
- create patients
- create appointments
- delete doctors
- delete related doctor appointments
- delete related doctor prescriptions
- remove linked doctor user records

This is why admin is the most powerful role in the project.

### 6.4 How admin creates a doctor

This is one of the best examples of Firebase integration in the project.

The admin dashboard:

1. checks whether the doctor's email already exists in `users`
2. calls `createDoctorAuthAccount(email, password)`
3. that creates a Firebase Auth account for the doctor
4. then the app writes into `users/{uid}` with:
   - `role: "doctor"`
   - `approved: true`
   - `doctorId`
5. then the app writes into `doctors/{uid}` with doctor profile data

So one admin action creates:

- a Firebase login account
- a Firestore role record
- a Firestore doctor profile

### 6.5 How admin creates a patient

The admin can also create patient records directly in the `patients` collection.

Important detail:

- this creates a patient document in Firestore
- but it does **not** automatically create a Firebase Auth login account for that patient

So admin-created patient records are like hospital-side records.
Patient self-signup is a different flow.

### 6.6 How admin creates appointments

The admin can book appointments by connecting:

- one patient
- one doctor
- one date
- one time slot

The code checks:

- whether the doctor is available that day
- whether the slot is already taken

It then writes the appointment into Firestore.

A transaction is used when writing the appointment so two users do not grab the same slot at the same moment.

That is a very good database practice.

## 7. How the Doctor Portal Uses Firebase

Main files:

- `src/features/doctor/pages/DoctorLoginPage.jsx`
- `src/features/doctor/pages/DoctorDashboardPage.jsx`

### 7.1 Doctor login

The doctor login flow:

1. authenticates with Firebase Auth
2. reads `users/{uid}`
3. checks:
   - role is `doctor`
   - approved is `true`
4. if the check fails, the user is signed out

This means a doctor cannot access the dashboard just by having an email and password.
The Firestore `users` document must also approve that doctor.

### 7.2 Doctor dashboard data loading

When the doctor dashboard opens:

1. it checks the logged-in user through `onAuthStateChanged`
2. it reads `users/{uid}`
3. it finds the corresponding doctor profile in `doctors`
4. it subscribes to the doctor's appointments
5. it subscribes to the doctor's prescriptions
6. it loads the patients connected to those appointments

This is a good example of relational thinking inside a NoSQL database.

Firestore does not do SQL joins, so the app performs the linking manually:

- first get appointments
- then extract patient IDs
- then load the patient documents one by one

### 7.3 What doctors are allowed to do

Doctors can:

- read their own appointments
- read patients connected to those appointments
- update appointment status
- create prescriptions
- update their own doctor profile

Doctors cannot do admin-level actions such as:

- create other doctors
- remove doctors
- read the full hospital-wide dataset from the admin dashboard

So the doctor role is more limited than admin.

## 8. How the Patient Portal Uses Firebase

Main files:

- `src/features/patient/pages/PatientSignupPage.jsx`
- `src/features/patient/pages/PatientLoginPage.jsx`
- `src/features/patient/pages/PatientVitalsPage.jsx`
- `src/features/patient/pages/PatientDashboardPage.jsx`

### 8.1 Patient signup

When a patient signs up with email and password:

1. Firebase Auth creates the account
2. Firestore creates `users/{uid}`
3. the role is saved as `patient`
4. the patient is sent to the vitals form

Notice:

- during normal signup, the patient record in `patients/{uid}` is not fully created yet
- that happens after the vitals form is completed

### 8.2 Patient Google login

The Google login flow is slightly different.

If the user signs in with Google for the first time:

1. the app creates `users/{uid}`
2. the app creates `patients/{uid}`
3. the patient is sent to the vitals flow

So Google sign-in can create both records in one go.

### 8.3 Patient vitals flow

This is where the patient medical profile becomes complete.

The page:

1. checks the logged-in user
2. reads `users/{uid}`
3. reads `patients/{uid}`
4. if vitals are already completed, it redirects to the dashboard
5. otherwise it saves medical details into `patients/{uid}`
6. then it updates `users/{uid}` with `profileCompleted: true`

So this flow links authentication with medical profile completion.

### 8.4 Patient dashboard

The patient dashboard does several Firestore reads:

- loads the logged-in patient's profile
- loads all doctors
- groups doctors by specialization
- loads the patient's appointments in real time
- loads prescriptions for that patient
- loads billing records for that patient

The patient can also:

- update their own profile
- book an appointment
- cancel an appointment

### 8.5 How patient appointment booking works

This is one of the best shared-data examples in the project.

When a patient books an appointment:

1. the app chooses a doctor
2. it checks doctor availability from the `doctors` collection
3. it checks existing `appointments`
4. it creates a fixed appointment document ID using:
   - doctor ID
   - date
   - time
5. it writes the appointment using a transaction

This means:

- the patient creates data
- the doctor later reads and manages that data
- the admin can also read and manage that same data

So one Firestore collection is shared by all three portals.

## 9. How the Three Portals Are Connected Through the Database

This project is a good example of a shared backend used by different roles.

### 9.1 Shared flow example: doctor creation

- Admin creates a doctor
- Firebase Auth gets a new doctor account
- `users` stores the role
- `doctors` stores the professional profile
- Doctor can now log in

### 9.2 Shared flow example: patient registration

- Patient signs up
- Firebase Auth creates the account
- `users` stores the role
- `patients` stores medical and profile information
- Patient can now use the dashboard

### 9.3 Shared flow example: appointments

- Patient books an appointment
- Admin can also create appointments
- Doctor reads those appointments
- Doctor changes the status
- Patient sees the updated result
- Admin sees the hospital-wide appointment list

So the `appointments` collection acts like a bridge between all three portals.

### 9.4 Shared flow example: prescriptions

- Doctor creates a prescription
- Firestore stores it in `prescriptions`
- Patient reads it in their own dashboard
- Admin can delete prescriptions indirectly when deleting a doctor's related data

## 10. How Role-Based Access Works in This Project

Now let us answer the main question clearly:

How is the database role-based, with more power for admin and less for doctor and patient?

### 10.1 Role meaning in this app

The role is stored in:

- `users/{uid}.role`

This is the main role flag.

Values used in the code:

- `admin`
- `doctor`
- `patient`

For doctors, there is one extra control:

- `approved: true`

### 10.2 Admin role

Admin has the highest application-level power.

Admin can:

- create doctors
- create patients
- create appointments
- read system-wide doctor data
- read system-wide patient data
- read system-wide appointment data
- delete doctors and related records

In simple words:

**Admin controls the system.**

### 10.3 Doctor role

Doctor has medium power.

Doctor can:

- access only the doctor dashboard
- read only doctor-related appointments
- read patient records connected to those appointments
- create prescriptions
- update own profile
- change appointment status

In simple words:

**Doctor manages treatment-related data, but not the whole hospital system.**

### 10.4 Patient role

Patient has the lowest power.

Patient can:

- manage their own account and profile
- view their own appointments
- book or cancel appointments
- see prescriptions written for them
- see billing records for them

In simple words:

**Patient mainly interacts with their own records.**

## 11. Important Technical Note About Role Enforcement

This is very important for understanding the project correctly.

### What the code definitely does

The code clearly enforces roles in the **frontend application logic**:

- route protection
- login checks
- dashboard redirects
- role checking in `users`
- approved-doctor check

### What is not present in this repository

I did **not** find a Firestore security rules file in this project.

That means:

- the project code shows role-based behavior in the React app
- but I cannot confirm from this repository alone that Firestore itself is enforcing the same restrictions at the database-rule level

This is an important difference.

### Student-friendly way to think about this

There are two kinds of protection:

1. **Frontend protection**
   The app hides pages and actions from users.

2. **Database protection**
   Firestore rules stop unauthorized reads and writes even if someone bypasses the UI.

In this repository, the first type is clearly implemented.
The second type is not visible because the Firestore rules file is not present here.

So the role model is **strong in app logic**, but database-level rule enforcement is **not shown in this codebase**.

## 12. Why the `users` Collection Is So Important

If you understand one collection deeply, it should be `users`.

Why?

Because it connects:

- Firebase Auth identity
- role-based access
- dashboard routing
- doctor approval
- profile completion

Without `users`, Firebase would only know:

- "This person logged in"

But with `users`, the app knows:

- "This person is an admin"
- "This person is an approved doctor"
- "This person is a patient who still needs to fill vitals"

So `users` is the main bridge between authentication and business logic.

## 13. Why Firestore Works Well for This Project

Firestore is a document database.

That fits this project because hospital data is naturally grouped into documents:

- one user
- one doctor
- one patient
- one appointment
- one prescription
- one bill

The app then connects these documents using IDs like:

- `uid`
- `doctorId`
- `patientUid`
- `patientId`

So even though Firestore is not SQL, the project still builds relationships between records by storing matching IDs.

## 14. Full End-to-End Example

Here is one complete story that shows the whole system working together.

### Example: Admin -> Doctor -> Patient

1. Admin logs in
2. Admin creates a doctor
3. Firebase Auth creates that doctor's login account
4. Firestore stores:
   - doctor role in `users`
   - doctor profile in `doctors`
5. Patient signs up and completes vitals
6. Firestore stores:
   - patient role in `users`
   - patient medical profile in `patients`
7. Patient books an appointment
8. Firestore stores that in `appointments`
9. Doctor logs in and sees the appointment
10. Doctor updates status and adds a prescription
11. Firestore stores that in `prescriptions`
12. Patient opens dashboard and reads the prescription

This is the full database connectivity cycle across all three portals.

## 15. Final Summary

This project uses Firebase in a structured and practical way:

- **Firebase Auth** handles sign-up, login, and session persistence
- **Firestore** stores all hospital data
- the `users` collection defines role-based identity
- the Admin portal has the highest control
- the Doctor portal has treatment and schedule control
- the Patient portal mainly works with personal medical activity

The three portals are not separate backends.
They all use the same Firebase project and the same Firestore database, but each portal reads and writes different parts of the data depending on role.

If you remember the architecture in one sentence, remember this:

**Firebase Auth answers "Who are you?", and Firestore answers "What are you allowed to do and what data belongs to you?"**

## 16. Files to Study for This Topic

If you want to learn this project directly from the source code, study these files in this order:

1. `src/lib/firebase.js`
2. `src/app/routes/ProtectedRoleRoute.jsx`
3. `src/features/admin/pages/AdminSignupPage.jsx`
4. `src/features/admin/pages/AdminLoginPage.jsx`
5. `src/features/admin/pages/AdminDashboardPage.jsx`
6. `src/features/doctor/pages/DoctorLoginPage.jsx`
7. `src/features/doctor/pages/DoctorDashboardPage.jsx`
8. `src/features/patient/pages/PatientSignupPage.jsx`
9. `src/features/patient/pages/PatientLoginPage.jsx`
10. `src/features/patient/pages/PatientVitalsPage.jsx`
11. `src/features/patient/pages/PatientDashboardPage.jsx`

Reading them in this order will help you understand the backend flow from setup to real usage.

## 17. What Type of Database Is Firestore?

Firestore is a **NoSQL document database**.

That means it is:

- **not SQL**
- **not MySQL**
- **not PostgreSQL**
- **not Oracle**
- **not a relational table-based database**

It is also different from MongoDB in implementation, even though both are document-oriented NoSQL systems.

### 17.1 Simple classification

If someone asks, "What kind of database is used in this project?", the most correct answer is:

**This project uses Google Cloud Firestore, which is a NoSQL document database.**

### 17.2 What "NoSQL" means here

In SQL databases like MySQL or PostgreSQL, data is usually stored in:

- tables
- rows
- columns
- joins

In Firestore, data is stored in:

- collections
- documents
- fields

So instead of thinking like this:

- one SQL table called `users`
- one row for each user
- one column for role

Firestore thinks more like this:

- one collection called `users`
- one document for each user
- one field called `role` inside each user document

## 18. How Firestore Stores Data Internally in This Project

The collections in this project such as:

- `users`
- `doctors`
- `patients`
- `appointments`
- `prescriptions`
- `billing`

are **not** SQL tables.

They are **Firestore collections**.

Each collection contains **documents**.

Each document contains **fields**.

### 18.1 Collection -> Document -> Field

This is the basic Firestore structure:

```text
Collection
  Document
    Field: value
    Field: value
    Field: value
```

Example:

```text
users
  abc123uid
    name: "Arjun"
    email: "arjun@example.com"
    role: "admin"
```

So the structure is:

- `users` is the collection
- `abc123uid` is the document ID
- `name`, `email`, and `role` are fields

## 19. Is Firestore Data Stored Like a Dictionary?

The easiest student-friendly answer is:

**Yes, a Firestore document is very similar to a dictionary or JSON object.**

If you know Python, you can think of a document like:

```python
{
  "name": "Arjun",
  "email": "arjun@example.com",
  "role": "admin"
}
```

If you know JavaScript, you can think of it like:

```js
{
  name: "Arjun",
  email: "arjun@example.com",
  role: "admin"
}
```

But technically, in Firestore terminology, it is called a **document**, not just a dictionary.

So:

- conceptually: similar to a dictionary / object / JSON
- technically: a Firestore document with named fields

## 20. How Individual Fields Are Stored in Firestore

Each field inside a document has:

- a field name
- a field value
- a data type

Firestore supports many types.

The types most relevant to this project are:

- `string`
- `number`
- `boolean`
- `array`
- `map` (nested object)
- `timestamp`
- `null`

### 20.1 String fields

Examples:

- `name: "Dr. Kumar"`
- `role: "doctor"`
- `email: "doctor@hospital.com"`

These are plain text values.

### 20.2 Number fields

Examples:

- `age: 21`
- `amount: 1500`
- `weightKg: 68`

These are stored as numeric values, not text.

### 20.3 Boolean fields

Examples:

- `approved: true`
- `vitalsCompleted: false`
- `profileCompleted: true`

These are yes/no style values.

### 20.4 Array fields

Examples from this project:

- `specialization: ["Cardiology"]`
- `timeSlots: [...]`
- sometimes medicine lists are handled as arrays

An array means one field contains multiple values in a list.

### 20.5 Map fields

A map is a nested object inside a document.

Example from the patient data:

```text
patients/{uid}
  vitals:
    heightCm: 172
    weightKg: 68
    allergies: "Dust"
```

Here `vitals` is not a simple string.
It is a **map**, meaning a field that itself contains subfields.

This is very similar to a nested dictionary.

### 20.6 Timestamp fields

Examples:

- `createdAt: serverTimestamp()`
- `updatedAt: serverTimestamp()`

These are stored by Firestore as timestamp values.

This is useful because:

- Firestore can sort by time
- you can know when a record was created
- you can know when a record was updated

### 20.7 Null or missing values

Sometimes a field may not exist yet.

Example:

- a patient may not have a billing record yet
- a doctor profile may not have all fields filled in yet

Firestore documents do not need every field to be exactly the same.

That is one major difference from strict SQL schemas.

## 21. How Each Collection Is Stored

Now let us connect the Firestore model directly to your project collections.

### 21.1 `users` collection

This collection stores one document per application user.

Example structure:

```text
users
  uid_001
    uid: "uid_001"
    name: "Chief Admin"
    email: "admin@hospital.com"
    role: "admin"
    profileCompleted: true
    createdAt: Timestamp
```

For a doctor:

```text
users
  uid_002
    uid: "uid_002"
    doctorId: "uid_002"
    name: "Dr. Meera"
    email: "meera@hospital.com"
    role: "doctor"
    approved: true
    createdAt: Timestamp
```

For a patient:

```text
users
  uid_003
    uid: "uid_003"
    name: "Rahul"
    email: "rahul@gmail.com"
    role: "patient"
    profileCompleted: true
    createdAt: Timestamp
```

This collection acts like the application identity dictionary.

### 21.2 `doctors` collection

This collection stores doctor profile documents.

Example:

```text
doctors
  uid_002
    uid: "uid_002"
    name: "Dr. Meera"
    email: "meera@hospital.com"
    phone: "9876543210"
    specialization: ["Cardiology"]
    availability: "Monday, Wednesday, Friday"
    approved: true
    timeSlots: [
      { day: "Monday", start: "09:00", end: "12:00" },
      { day: "Wednesday", start: "09:00", end: "12:00" }
    ]
    createdAt: Timestamp
    updatedAt: Timestamp
```

Important storage idea:

- `specialization` is usually an array
- `timeSlots` is an array of objects

So Firestore is storing both lists and nested structured values inside one document.

### 21.3 `patients` collection

This collection stores patient medical documents.

Example:

```text
patients
  uid_003
    uid: "uid_003"
    name: "Rahul"
    email: "rahul@gmail.com"
    age: 21
    gender: "Male"
    phone: "9876501234"
    address: "Chennai"
    bloodGroup: "O+"
    vitalsCompleted: true
    vitals: {
      heightCm: 172,
      weightKg: 68,
      allergies: "Dust",
      chronicConditions: "None",
      emergencyContactName: "Father",
      emergencyContactPhone: "9123456780"
    }
    createdAt: Timestamp
    updatedAt: Timestamp
```

Important storage idea:

- basic patient fields are top-level fields
- medical detail is grouped inside the `vitals` map

This makes the document more organized.

### 21.4 `appointments` collection

This collection stores appointment documents.

Example:

```text
appointments
  doctorUid_2026-04-10_09:00
    patientUid: "uid_003"
    patientName: "Rahul"
    doctorId: "uid_002"
    doctor: "Dr. Meera"
    specialty: "Cardiology"
    date: "2026-04-10"
    time: "09:00"
    status: "pending"
    createdAt: Timestamp
```

Important storage idea:

- one document represents one appointment slot
- the project often uses a custom document ID based on doctor + date + time

That is why the app can prevent duplicate slot booking more safely.

### 21.5 `prescriptions` collection

This collection stores prescriptions written by doctors.

Example:

```text
prescriptions
  autoGeneratedDocId
    patientId: "uid_003"
    patientName: "Rahul"
    doctorId: "uid_002"
    medicines: "Paracetamol\nVitamin C"
    notes: "Take after food"
    date: "2026-04-10"
    createdAt: Timestamp
```

Depending on app logic, `medicines` may be handled as:

- a string
- or later transformed into an array in the UI

So Firestore is flexible, but this also means developers must stay consistent.

### 21.6 `billing` collection

This collection stores billing records.

Example:

```text
billing
  autoGeneratedDocId
    patientId: "uid_003"
    description: "Consultation Fee"
    amount: 1500
    status: "paid"
    date: "2026-04-10"
```

This is a simpler document structure with mostly scalar values.

## 22. How Firestore Reads and Writes These Documents

In this project, the common Firestore operations are:

- `doc()`
- `collection()`
- `getDoc()`
- `getDocs()`
- `setDoc()`
- `updateDoc()`
- `deleteDoc()`
- `query()`
- `where()`
- `onSnapshot()`
- `runTransaction()`

### 22.1 `collection(db, "users")`

This points to a whole collection.

It means:

- "go to the `users` collection"

### 22.2 `doc(db, "users", user.uid)`

This points to one specific document.

It means:

- "go to the document inside `users` whose ID is `user.uid`"

### 22.3 `getDoc(...)`

Reads one document.

Example use:

- read one logged-in user's role

### 22.4 `getDocs(...)`

Reads many documents.

Example use:

- load all doctors
- load all patients

### 22.5 `setDoc(...)`

Creates or replaces a document.

Example use:

- create `users/{uid}`
- create `patients/{uid}`
- create `doctors/{uid}`

### 22.6 `updateDoc(...)`

Updates selected fields in an existing document.

Example use:

- update doctor profile
- mark patient profile completed
- change appointment status

### 22.7 `deleteDoc(...)`

Deletes a document.

Example use:

- cancel appointment by deleting it
- remove doctor records

### 22.8 `query(...)` and `where(...)`

These are used to filter documents.

Example:

- get appointments where `doctorId == currentDoctorId`
- get billing where `patientId == currentUserUid`

So Firestore queries are based on field values inside documents.

### 22.9 `onSnapshot(...)`

This is for real-time updates.

If the data changes in Firestore:

- the UI gets the new data automatically

This is used in the project for:

- appointments
- prescriptions
- billing

That is why dashboards can stay updated without manual refresh.

### 22.10 `runTransaction(...)`

This is used when data consistency matters.

In this project, it is used during appointment booking.

Why?

Because if two users try to book the same appointment slot at nearly the same time, a simple write may cause conflict.

A transaction helps the app:

1. check whether the slot already exists
2. only write if it is still free

This is a safe way to protect shared data.

## 23. How Firestore Differs From SQL Tables in This Project

Let us compare directly.

### SQL way of thinking

- table: `users`
- row: one user
- columns: `name`, `email`, `role`
- join `users` with `doctors`

### Firestore way of thinking

- collection: `users`
- document: one user
- fields: `name`, `email`, `role`
- manually connect documents using IDs

So instead of SQL joins, this project does:

- read a document
- get an ID from it
- use that ID to read another document

Example:

- read `users/{uid}`
- get `doctorId`
- read `doctors/{doctorId}`

That is a common NoSQL pattern.

## 24. Final Continuation Summary

To answer your new question directly:

- Firestore is a **NoSQL document database**
- it does **not** store data as SQL tables and rows
- it stores data as **collections**
- each collection contains **documents**
- each document stores data as **field-value pairs**
- these field-value pairs are very similar to a **dictionary / object / JSON document**

Inside this project:

- `users` stores role identity documents
- `doctors` stores doctor profile documents
- `patients` stores patient medical documents
- `appointments` stores one document per appointment
- `prescriptions` stores doctor-written prescription documents
- `billing` stores patient bill documents

And inside those documents, the fields are stored using Firestore types such as:

- string
- number
- boolean
- timestamp
- array
- map

So if you want the cleanest one-line explanation, you can say:

**This project uses Firestore, a NoSQL document database, where hospital data is stored as collections of documents, and each document behaves like a structured dictionary of fields and values.**

## 25. Project Conclusion

This Hospital Management System project was created to solve the major inefficiencies found in traditional hospital operations such as manual record keeping, scattered patient information, delayed appointment handling, weak coordination between departments, and limited visibility for administrators, doctors, and patients. By bringing these activities into one centralized digital platform, the project improves speed, accuracy, transparency, and convenience across the hospital workflow.

### Problems Solved by This Project

- reduces paperwork and manual register-based management
- centralizes hospital data in one connected system
- improves role-based access and secure user handling
- makes appointment booking and tracking easier
- helps doctors manage patients and prescriptions more efficiently
- allows admins to supervise doctors, patients, and operations from one dashboard
- gives patients easier access to appointments, records, prescriptions, and billing details
- lowers chances of data duplication, delay, and communication gaps

### Who Benefits from This Project

- **Hospital Administrators** benefit from better control, monitoring, and decision-making
- **Doctors** benefit from faster access to schedules, patient details, and treatment records
- **Patients** benefit from simpler onboarding, booking, and record visibility
- **Hospital Staff** benefit from reduced workload and smoother coordination
- **Healthcare Organizations** benefit from a scalable digital system that can support growing operations

### Market Impact

This project creates strong value in the healthcare market because hospitals and clinics increasingly need affordable, efficient, and digitized solutions. A system like this supports operational modernization, improves service quality, and strengthens trust between healthcare providers and patients. It also demonstrates how web technologies and cloud services can be combined to build practical healthcare solutions that are scalable, maintainable, and ready for real-world use.

### Strong Conclusion Points

- it transforms a manually managed process into a structured digital ecosystem
- it connects multiple hospital stakeholders through one unified platform
- it improves efficiency, accountability, and accessibility in hospital operations
- it shows the practical use of modern web development in healthcare
- it provides a strong base for future expansion such as reports, notifications, inventory automation, AI support, or telemedicine features
- it has academic as well as real-world relevance because it solves genuine hospital workflow problems

### Final Conclusion

To conclude, the Hospital Management System is not just a software project but a meaningful digital solution for healthcare management. It successfully brings together authentication, database connectivity, role-based access, appointment handling, medical records, and monitoring features into one integrated platform. The project benefits hospitals, doctors, patients, and support staff by making their interactions faster, clearer, and more reliable. From both a technical and practical point of view, this project creates positive impact, demonstrates strong full-stack system design thinking, and offers a solid foundation for future healthcare innovation.
