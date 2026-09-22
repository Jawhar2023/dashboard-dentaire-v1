# Bugfix Requirements Document

## Introduction

The Khalil Dental CRM Electron application has three critical issues affecting the production release build:

1. **Missing Page in Release Build**: The newly added "Treatment Globale" page is accessible in development mode but does not appear in the packaged .exe release
2. **Missing Desktop Shortcut**: The Windows installer does not create a desktop shortcut, forcing users to navigate to the installation directory to launch the app
3. **Data Persistence Verification**: Need to ensure all application data (patients, appointments, doctors, treatments, etc.) persists correctly in localStorage across app restarts in the release build

These issues prevent users from fully utilizing the application after installation and may lead to data loss concerns.

## Bug Analysis

### Current Behavior (Defect)

**1. Treatment Globale Page Missing in Release**

1.1 WHEN the user builds the release with `npm run electron:build` THEN the Treatment Globale page is not included in the built .exe application

1.2 WHEN the user launches the Khalil Dental CRM.exe from the release folder THEN the Treatment Globale menu item or page is not accessible

1.3 WHEN the user runs the app in development mode with `npm run electron:dev` THEN the Treatment Globale page works correctly (demonstrating it's a build configuration issue)

**2. Desktop Shortcut Not Created**

2.1 WHEN the user installs the application using the NSIS installer THEN no desktop shortcut is created automatically

2.2 WHEN the user wants to launch the app THEN they must navigate to `C:\Program Files\Khalil Dental CRM` (or installation directory) to find the executable

2.3 WHEN using the portable version THEN users must remember the folder location to launch the app

**3. Data Persistence Issues (Potential)**

3.1 WHEN the user adds/modifies patients, appointments, or other data in the release build THEN the data may not persist after closing and reopening the app

3.2 WHEN the app loads in the release build THEN it may not properly load previously saved data from localStorage

3.3 WHEN checking the mockDataStore implementation THEN doctors, treatments, hotels, drivers, and other entities do not have explicit persistence functions called after mutations

### Expected Behavior (Correct)

**1. Treatment Globale Page Included in Release**

2.1 WHEN the user builds the release with `npm run electron:build` THEN the Treatment Globale page SHALL be included in all built assets (dist folder)

2.2 WHEN the user launches the Khalil Dental CRM.exe from the release folder THEN the Treatment Globale page SHALL be accessible via the navigation menu

2.3 WHEN the user navigates to the Treatment Globale page in the release build THEN it SHALL function identically to development mode (load patients, save treatment notes to localStorage)

2.4 WHEN examining the build configuration THEN the Vite build process SHALL include all lazy-loaded pages including TreatmentGlobalePage

**2. Desktop Shortcut Created by Installer**

2.5 WHEN the user runs the NSIS installer THEN a desktop shortcut SHALL be created automatically

2.6 WHEN the installation completes THEN the user SHALL be able to launch the app directly from the desktop icon

2.7 WHEN using the portable version THEN the app SHALL run correctly from any location the user chooses

2.8 WHEN checking electron-builder.json THEN the `createDesktopShortcut` setting SHALL be properly configured and effective

**3. Data Persistence Guaranteed**

2.9 WHEN the user adds/modifies patients, appointments, doctors, treatments, hotels, drivers, or any other data THEN the system SHALL immediately save all changes to localStorage

2.10 WHEN the user closes and reopens the app THEN all previously saved data SHALL be loaded from localStorage and displayed correctly

2.11 WHEN examining the mockDataStore.ts file THEN all entity mutation functions (add, update, delete) SHALL call their respective persist functions

2.12 WHEN the app initializes THEN it SHALL load all entity data from localStorage using the loadFromStorage utility

### Unchanged Behavior (Regression Prevention)

**1. Existing Pages Continue Working**

3.1 WHEN the user accesses any existing page (Dashboard, Patients, Appointments, Calendar, Doctors, Treatments, Payments, Invoices, Rappel, Settings) in the release build THEN the system SHALL CONTINUE TO function as before

3.2 WHEN the user navigates between pages in the release build THEN the system SHALL CONTINUE TO maintain state and routing correctly

**2. Development Mode Remains Functional**

3.3 WHEN developers run `npm run electron:dev` THEN the system SHALL CONTINUE TO work with hot module reloading

3.4 WHEN developers run `npm run dev` (web mode) THEN the system SHALL CONTINUE TO work in the browser

**3. Build Process for Other Platforms**

3.5 WHEN building for other platforms (Mac dmg, Linux AppImage) as configured in electron-builder.json THEN the system SHALL CONTINUE TO build successfully

**4. Existing Data Persistence**

3.6 WHEN the user manages patients and appointments THEN the system SHALL CONTINUE TO persist these correctly as it currently does

3.7 WHEN the user closes and reopens the app THEN existing patients and appointments data SHALL CONTINUE TO load from localStorage as before

**5. Electron Security and Performance**

3.8 WHEN the app runs in production THEN the system SHALL CONTINUE TO maintain contextIsolation, sandbox mode, and other security settings

3.9 WHEN users interact with the app THEN the system SHALL CONTINUE TO perform with the same responsiveness as before

**6. Treatment Globale in Development**

3.10 WHEN developers work on the Treatment Globale page in development mode THEN the system SHALL CONTINUE TO allow them to test and modify the page

3.11 WHEN the Treatment Globale page saves treatment notes to localStorage THEN this functionality SHALL CONTINUE TO work in development mode
