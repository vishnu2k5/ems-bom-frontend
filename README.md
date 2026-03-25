# EMS BOM PROCESSING APP – Frontend

A React-based web application for processing Electronics Manufacturing Services (EMS) Bill of Materials (BOM) files. Users upload BOMs, configure pricing, process components, handle missing parts, and generate assembly quotations.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Installation & Setup](#installation--setup)
4. [Project Structure](#project-structure)
5. [Application Flow](#application-flow)
6. [Pages & Routes](#pages--routes)
7. [API Endpoints](#api-endpoints)
8. [Data Flow & Session Storage](#data-flow--session-storage)
9. [How to Run](#how-to-run)

---

## Project Overview

This application processes BOM files through the following workflow:
- **Upload**: User uploads CSV/XLSX/JSON/TXT BOM files
- **Review**: Backend lists uploaded files; user verifies and proceeds
- **Configure**: User enters pricing (price per SMD/PTH pin) and board quantities
- **Process**: App validates components against a master database
- **Handle Missing**: If unknown parts are found, user enters details or skips
- **Results**: Final quotation and summary are displayed
- **Reset**: Clear all data to process new BOMs

---

## Technology Stack

- **Frontend Framework**: React 18 (Vite)
- **Routing**: React Router DOM v6
- **File Parsing**: PapaParse (CSV), xlsx (Excel)
- **State Management**: React Hooks (useState, useEffect, useNavigate, useLocation)
- **Styling**: Custom CSS with gradient backgrounds and responsive design
- **HTTP Client**: Fetch API

### Dependencies

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "papaparse": "^5.x",
    "xlsx": "^0.18.x"
  }
}
```

---

## Installation & Setup

### Prerequisites
- Node.js 16+ installed
- Backend API running on `http://localhost:8081` (or configure `API_BASE` in component files)

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
# Opens on http://localhost:5173
```

### Build for Production

```bash
npm run build
# Output goes to dist/
```

---

## Project Structure

```
frontend/
├── src/
│   ├── App.jsx                 # Router setup, main entry
│   ├── App.css                 # Global styles
│   ├── main.jsx                # React DOM render
│   ├── index.css               # Base styles
│   ├── pages/
│   │   ├── Home.jsx            # Landing page with process overview
│   │   ├── UploadFiles.jsx     # File upload & client-side parsing
│   │   ├── ReviewFiles.jsx     # Review uploaded files from server
│   │   ├── ConfigPage.jsx      # Configure pricing & quantities
│   │   ├── ProcessPage.jsx     # Submit config and trigger processing
│   │   ├── ResultPage.jsx      # Display final quotation results
│   │   └── MissingPage.jsx     # Handle missing component entry
│   └── assets/
├── public/
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. HOME PAGE (/):  Display process overview & CTA buttons   │
│    - User clicks "Upload BOMs"                              │
│    └──→ Navigate to /upload                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. UPLOAD PAGE (/upload): Select files & upload to backend  │
│    - User selects CSV/XLSX/JSON/TXT files                   │
│    - Frontend parses files client-side (preview first 5)    │
│    - POST files to POST /api/upload (multipart/form-data)   │
│    - On success, navigate to /review with parsed preview    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. REVIEW PAGE (/review): Fetch & verify server files       │
│    - Fetch files from backend: GET /api/files               │
│    - Display file list and headers from server response     │
│    - "Clear All" button calls DELETE /api/clear             │
│    - "Proceed to Config" saves preview & navigate to /config│
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. CONFIG PAGE (/config): Enter pricing & quantities        │
│    - User enters:                                            │
│      • Price per pin (SMD)                                  │
│      • Price per pin (PTH)                                  │
│      • Board quantity                                       │
│    - Save to sessionStorage and navigate to /process        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. PROCESS PAGE (/process): Submit & trigger backend        │
│    - Display configuration & file preview                   │
│    - On button click:                                       │
│      1) POST config to POST /api/config/set                 │
│      2) POST to POST /api/process/start (triggers process)  │
│    - Backend response determines next route:                │
│      • If status="success"|"completed" → /result            │
│      • If status="missing" or missing_components[] → /missing│
└─────────────────────────────────────────────────────────────┘
                            ↓
          ┌─────────────────┬─────────────────┐
          ↓                 ↓                 ↓
      ┌───────┐         ┌───────┐        ┌────────┐
      │MISSING│         │RESULT │        │FALLBACK│
      │PAGE   │         │PAGE   │        │(Optional)
      └───────┘         └───────┘        └────────┘
          ↓                 ↓
  (User fills form)  (View quotation)
          ↓                 ↓
   Reset sessionStorage    Reset sessionStorage
   & navigate to /upload   & navigate to /upload
```

---

## Pages & Routes

### 1. **Home Page** (`/`)
- **Component**: `src/pages/Home.jsx`
- **Purpose**: Landing page with process overview and CTAs
- **API Calls**: None
- **Displays**:
  - "Upload BOMs" button → navigates to `/upload`
  - "Review Uploaded Files" button → navigates to `/review`
  - 8-step process description
- **Data Flow**: Static page, no backend interaction

---

### 2. **Upload Files Page** (`/upload`)
- **Component**: `src/pages/UploadFiles.jsx`
- **Purpose**: Allow users to upload BOM files and preview first 5 rows
- **File Types**: CSV, XLSX, JSON, TXT
- **Client-Side Parsing**:
  - Uses **PapaParse** for CSV parsing
  - Uses **xlsx** library for Excel parsing
  - Extracts first 5 rows for preview
- **API Call**:
  - **Method**: POST
  - **Endpoint**: `/api/upload`
  - **Content-Type**: `multipart/form-data`
  - **Payload**: File objects
  - **Expected Response**:
    ```json
    {
      "status": "success",
      "message": "Files uploaded successfully",
      "uploaded_files": ["file1.csv", "file2.xlsx"]
    }
    ```
- **On Success**:
  - Save parsed preview to `sessionStorage.uploadedFilesPreview`
  - Navigate to `/review`
- **Session Storage Keys**:
  - `uploadedFilesPreview`: JSON array of parsed files with first 5 rows

---

### 3. **Review Files Page** (`/review`)
- **Component**: `src/pages/ReviewFiles.jsx`
- **Purpose**: Display uploaded files from backend, show headers, and allow clearing
- **API Calls**:
  - **GET /api/files**
    - **Purpose**: Fetch list of uploaded files and their headers
    - **Expected Response**:
      ```json
      {
        "status": "success",
        "files": [
          {
            "filename": "bom1.csv",
            "headers": ["Ref", "Value", "Footprint", "Qty"]
          },
          {
            "filename": "bom2.xlsx",
            "headers": ["Component", "Count", "Part Number"]
          }
        ]
      }
      ```
  - **DELETE /api/clear**
    - **Purpose**: Delete all uploaded files from server
    - **Expected Response**:
      ```json
      {
        "status": "success",
        "message": "All files cleared"
      }
      ```
- **Buttons**:
  - **Clear All**: Calls DELETE `/api/clear`, redirects to `/upload`
  - **Proceed to Config**: Saves preview to sessionStorage, navigates to `/config`
- **Session Storage**:
  - `uploadedFilesPreview`: Used from upload page

---

### 4. **Config Page** (`/config`)
- **Component**: `src/pages/ConfigPage.jsx`
- **Purpose**: Collect pricing and quantity configuration from user
- **Input Fields**:
  1. **Price per pin (SMD)**: Decimal input (e.g., 1.0000)
  2. **Price per pin (PTH)**: Decimal input (e.g., 2.0000)
  3. **Board Quantity**: Number input (e.g., 1, 10, 100)
- **API Calls**: None (local form)
- **On Submit**:
  - Validate all fields are filled
  - Save to `sessionStorage.processingConfig`:
    ```json
    {
      "priceSMD": 1.0,
      "pricePTH": 2.0,
      "boardQty": 1,
      "timestamp": "2026-02-12T10:00:00Z"
    }
    ```
  - Navigate to `/process`
- **Session Storage Keys**:
  - `processingConfig`: User configuration object

---

### 5. **Process Page** (`/process`)
- **Component**: `src/pages/ProcessPage.jsx`
- **Purpose**: Display summary and trigger backend processing
- **Display**:
  - Configuration summary (prices, board qty)
  - Uploaded files with headers and first 5 rows
- **API Calls**:
  1. **POST /api/config/set**
     - **Purpose**: Save configuration on backend
     - **Content-Type**: `application/json`
     - **Payload**:
       ```json
       {
         "board_quantities": {"file1.csv": 1, "file2.xlsx": 1},
         "price_per_smd": 1.0,
         "price_per_pth": 2.0
       }
       ```
     - **Expected Response**:
       ```json
       {
         "status": "success",
         "message": "Configuration saved"
       }
       ```
  2. **POST /api/process/start**
     - **Purpose**: Trigger BOM processing and component validation
     - **Payload**: Empty or no body required
     - **Expected Response** (Success):
       ```json
       {
         "status": "success",
         "total_quote": 137.00,
         "quote_per_board": 137.00,
         "processed_files": ["bom1.csv", "bom2.xlsx"],
         "message": "Processing completed"
       }
       ```
     - **Expected Response** (Missing Components):
       ```json
       {
         "status": "missing",
         "count": 3,
         "missing_components": [
           {
             "designator": "U1",
             "ref": "U1",
             "reason": "NOT FOUND IN DIGIKEY",
             "description": "Unknown IC",
             "pin_count": 14,
             "package": "DIP-14"
           }
         ]
       }
       ```
- **Navigation Logic**:
  - **If response.status = "success"** → Save to sessionStorage and navigate to `/result`
  - **If response.status = "missing"** → Save missing list and navigate to `/missing`
  - **If error** → Display error message
- **UI States**:
  - **Idle**: Show "Submit to Backend" button
  - **Processing**: Show "⏳ Processing..." disabled button
  - **Error**: Display red error box
- **Session Storage**:
  - `uploadedFilesPreview`: Files info
  - `processingConfig`: Configuration
  - `processResult`: (Set on success) Response from `/api/process/start`
  - `missingComponents`: (Set on missing) Array of missing component objects

---

### 6. **Result Page** (`/result`)
- **Component**: `src/pages/ResultPage.jsx`
- **Purpose**: Display final quotation and summary
- **Displays**:
  - Status: "success"
  - Total quote and quote per board
  - List of processed files
  - Optional HTML/formatted summary from backend
- **API Call**:
  - **DELETE /api/clear** (on "Process New Files" button click)
    - Clears server files and navigates to `/upload`
    - Clears sessionStorage: `uploadedFilesPreview`, `processResult`, `missingComponents`
- **Button**:
  - **"Process New Files"**:
    - Calls **DELETE /api/clear** to clear server files
    - Clears sessionStorage keys
    - Shows "Clearing..." state while API call is in progress
    - Navigates to `/upload`
- **Session Storage**:
  - Reads from `processResult` (set by ProcessPage)

---

### 7. **Missing Page** (`/missing`)
- **Component**: `src/pages/MissingPage.jsx`
- **Purpose**: Allow user to manually enter missing component details
- **API Calls**:
  1. **GET /api/missing** (optional)
     - **Purpose**: Fetch missing components list (fallback if not in sessionStorage)
     - **Expected Response**:
       ```json
       {
         "status": "success",
         "count": 3,
         "missing_components": [
           {
             "designator": "U1",
             "reason": "NOT FOUND IN DIGIKEY",
             "value": "STM32F103",
             "package": "LQFP-100",
             "pin_count": 100
           }
         ]
       }
       ```
  2. **POST /api/missing/save** (optional)
     - **Purpose**: Save user-entered component data to backend database
     - **Content-Type**: `application/json`
     - **Payload**:
       ```json
       {
         "original": {
           "designator": "U1",
           "reason": "NOT FOUND IN DIGIKEY",
           "value": "STM32F103"
         },
         "filled": {
           "ref": "U1",
           "manufacturer": "STMicroelectronics",
           "description": "ARM Microcontroller",
           "value": "STM32F103RBT6",
           "package": "LQFP-100",
           "pin_count": 100,
           "mounting": "Surface Mount",
           "voltage": "3.3V",
           "wattage": "",
           "current": "200mA",
           "dimensions": "14x14x1.4"
         }
       }
       ```
     - **Expected Response**:
       ```json
       {
         "status": "success",
         "message": "Component saved to database"
       }
       ```
- **Form Fields** (for each missing component):
  - Ref Designator
  - Manufacturer
  - Description
  - Value
  - Package
  - Pin Count
  - Mounting Type (dropdown: Surface Mount / Through Hole)
  - Voltage Rating
  - Wattage Rating
  - Current Rating
  - Dimensions (LxWxP in mm)
- **Buttons**:
  - **"Save & Add to Database"**: POST to `/api/missing/save`, move to next component
  - **"Skip"**: Skip current component, move to next
- **After All Components**:
  - Display "All Done" message
  - Buttons to navigate to `/result` or `/upload`
- **Session Storage**:
  - Reads from `missingComponents` (set by ProcessPage)

---

## API Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| POST | `/api/upload` | Upload BOM files | multipart/form-data | `{status, message, uploaded_files}` |
| GET | `/api/files` | Fetch uploaded file list | — | `{status, files[]}` |
| DELETE | `/api/clear` | Clear all uploaded files | — | `{status, message}` |
| POST | `/api/config/set` | Save pricing config | `{board_quantities, price_per_smd, price_per_pth}` | `{status, message}` |
| POST | `/api/process/start` | Start BOM processing | — | `{status, missing_components[]}` or `{status, total_quote}` |
| GET | `/api/missing` | Fetch missing components | — | `{status, count, missing_components[]}` |
| POST | `/api/missing/save` | Save filled component data | `{original, filled}` | `{status, message}` |

---

## Screenshots

Below are annotated screenshots of each key page in the application. Replace the placeholder paths with actual images before submitting to your manager.

### Home Page
![Home Page](public/screenshots/home.png)
*Overview of the process flow with call‑to‑action buttons.*

### Upload Files Page
![Upload Files](public/screenshots/upload.png)
*Select BOM files, preview first five rows, and upload to server.*

### Review Files Page
![Review Files](public/screenshots/review.png)
*Verify uploaded files, view headers, clear or proceed to configuration.*

### Config Page
![Configuration](public/screenshots/config.png)
*Enter pricing per pin and board quantities before processing.*

### Process Page
![Processing](public/screenshots/process.png)
*Submit configuration to backend and handle missing components if any.*

### Missing Page
![Missing Components](public/screenshots/missing.png)
*Form to enter or skip unknown components during processing.*

### Result Page
![Result Page](public/screenshots/result.png)
*Final quotation summary and option to process new files.*

## Data Flow & Session Storage

### Session Storage Keys

1. **`uploadedFilesPreview`**
   - **Type**: JSON array
   - **Set by**: UploadFiles.jsx (after parsing)
   - **Used by**: ReviewFiles, ProcessPage, ResultPage
   - **Structure**:
     ```json
     [
       {
         "filename": "bom1.csv",
         "headers": ["Ref", "Value", "Qty"],
         "first5Rows": [
           {"Ref": "R1", "Value": "10k", "Qty": 100},
           {"Ref": "C1", "Value": "100nF", "Qty": 100}
         ]
       }
     ]
     ```

2. **`processingConfig`**
   - **Type**: JSON object
   - **Set by**: ConfigPage.jsx
   - **Used by**: ProcessPage.jsx
   - **Structure**:
     ```json
     {
       "priceSMD": 1.5,
       "pricePTH": 2.0,
       "boardQty": 1,
       "timestamp": "2026-02-12T12:00:00Z"
     }
     ```

3. **`processResult`**
   - **Type**: JSON object
   - **Set by**: ProcessPage.jsx (on success)
   - **Used by**: ResultPage.jsx
   - **Structure**:
     ```json
     {
       "status": "success",
       "total_quote": 137.00,
       "quote_per_board": 137.00,
       "message": "Processing completed",
       "processed_files": ["bom1.csv"]
     }
     ```

4. **`missingComponents`**
   - **Type**: JSON array
   - **Set by**: ProcessPage.jsx (on missing status)
   - **Used by**: MissingPage.jsx
   - **Structure**:
     ```json
     [
       {
         "designator": "U1",
         "ref": "U1",
         "reason": "NOT FOUND IN DIGIKEY",
         "description": "Unknown IC",
         "pin_count": 14,
         "package": "DIP-14"
       }
     ]
     ```

### Clearing Session Data

- **On "/result" → "Process New Files"**:
  - Calls `DELETE /api/clear` (backend)
  - Clears: `uploadedFilesPreview`, `processResult`, `missingComponents`
  - Navigates to `/upload`

- **On "/review" → "Clear All"**:
  - Calls `DELETE /api/clear` (backend)
  - Clears: `uploadedFilesPreview`
  - Navigates to `/upload`

---

## How to Run

### Development Mode

```bash
# Start dev server with hot reload
npm run dev
```

The app will open on `http://localhost:5173`. The backend should be running on `http://localhost:8081` (configurable via `API_BASE` in each page component).

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Configuration

If your backend runs on a different port (e.g., `8000`), update `API_BASE` in these files:
- `src/pages/UploadFiles.jsx`
- `src/pages/ReviewFiles.jsx`
- `src/pages/ProcessPage.jsx`
- `src/pages/MissingPage.jsx`
- `src/pages/ResultPage.jsx`

Change:
```javascript
const API_BASE = 'http://localhost:8081';
```

To:
```javascript
const API_BASE = 'http://localhost:8000';  // Your backend port
```

---

## Notes & Future Enhancements

- **Real-time Progress**: Consider adding WebSocket or Server-Sent Events (SSE) for live processing updates instead of just "Processing..." state.
- **Download Results**: Add button to download final BOM/quotation files from backend.
- **File Validation**: Add client-side validation (e.g., check for required columns before upload).
- **Authentication**: Integrate user login/session management.
- **Error Recovery**: Implement retry logic for failed API requests.
- **Batch Processing**: Support processing multiple BOMs in parallel.

---

## Support

For issues or questions, check:
1. Browser console (F12) for errors
2. Network tab to inspect API requests/responses
3. Backend logs for server-side errors
4. Session storage in DevTools (Application → Session Storage)

---

**Last Updated**: February 12, 2026
