# Goreb API & Backend Integration Guide

This document outlines the frontend data contracts, API expectations, and required backend endpoints for **Goreb AI** (Student/Teacher Assistant & Quizzes) and the **Parent Portal** dashboard features.

---

## 1. Goreb AI & Study Assistant

### 1.1 Study Assistant Ask Endpoint
Used for **Learn Today** and conversational Q&A:

- **Endpoint**: `POST /study-assistant/ask`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Request Body**:
```json
{
  "question": "Can you explain photosynthesis with an example?"
}
```
- **Response Format (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "answer": "Photosynthesis is the process by which green plants...",
    "refused": false
  }
}
```

### 1.2 Dedicated AI Quiz Generation (Recommended Backend Addition)
Currently, the frontend sends a prompt to `/study-assistant/ask` requesting a JSON array of multiple-choice questions matching the student's class. Having a dedicated endpoint will ensure strict schema validation and faster response caching.

- **Recommended Endpoint**: `POST /study-assistant/quiz`
- **Request Body**:
```json
{
  "className": "JHS 2",
  "subject": "Integrated Science", // or "ALL"
  "count": 5
}
```
- **Expected Response Format (`200 OK`)**:
```json
{
  "success": true,
  "data": [
    {
      "subject": "Integrated Science",
      "topic": "Acids and Bases",
      "question": "What color does blue litmus paper turn when dipped into an acidic solution?",
      "options": ["Blue", "Red", "Green", "Yellow"],
      "correctIndex": 1,
      "explanation": "Acids turn blue litmus paper red, while alkalis turn red litmus blue."
    }
  ]
}
```

---

## 2. Parent Portal Dashboard

The Parent Portal supports **12 key sections**. The frontend currently reads through existing endpoints and is ready to ingest dedicated responses for the newly added modules.

### 2.1 My Children
- **Endpoint**: `GET /guardians/me/children`
- **Expected Response Format (`200 OK`)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "student_uuid_1",
      "name": "Kwame Mensah",
      "studentNo": "STU-2026-001",
      "className": "JHS 2 A",
      "gender": "MALE",
      "photoUrl": "https://...",
      "classTeacherEmail": "teacher@school.edu.gh"
    }
  ]
}
```

### 2.2 Academic Results
- **Endpoint**: `GET /guardians/me/children/:studentId/grades`
- **Expected Response Format (`200 OK`)**:
```json
{
  "success": true,
  "data": [
    {
      "term": {
        "termLabel": "Term 1 - 2025/2026",
        "academicYear": "2025/2026",
        "termNumber": "TERM1"
      },
      "average": 82.5,
      "gradingConfig": {
        "caMaxScore": 10,
        "caWeight": 30,
        "examMaxScore": 70
      },
      "subjects": [
        {
          "name": "Mathematics",
          "ca1": 8,
          "ca2": 9,
          "ca3": 7,
          "caTotal": 24,
          "exam": 58,
          "total": 82,
          "grade": "A1"
        }
      ]
    }
  ]
}
```

### 2.3 Attendance
- **Endpoint**: `GET /guardians/me/children/:studentId/attendance-summary`
- **Expected Response Format (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "total": 60,
      "present": 56,
      "absent": 3,
      "late": 1
    },
    "records": [
      {
        "date": "2026-11-10T08:00:00Z",
        "day": "Tuesday",
        "status": "PRESENT" // "PRESENT" | "ABSENT" | "LATE"
      }
    ]
  }
}
```

### 2.4 School Fees & Payments
- **Endpoint**: `GET /finance/student/:studentId` (or `GET /guardians/me/children/:studentId/finance`)
- **Expected Response Format (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "totalPaid": 1500.00,
    "unallocatedTotal": 0.00,
    "feeInvoices": [
      {
        "id": "invoice_uuid_1",
        "invoiceNumber": "INV-2026-004",
        "balance": 250.00,
        "dueDate": "2026-12-01T00:00:00Z",
        "status": "PENDING", // "PAID" | "PENDING" | "OVERDUE"
        "term": {
          "termNumber": "TERM1",
          "academicYear": "2025/2026"
        }
      }
    ],
    "recentTransactions": [
      {
        "id": "tx_uuid_1",
        "categoryName": "Tuition Fees",
        "receiptNumber": "REC-7891",
        "amount": 750.00,
        "createdAt": "2026-10-15T10:30:00Z"
      }
    ]
  }
}
```

### 2.5 Timetable (Class Weekly Schedule)
- **Proposed Endpoint**: `GET /classes/:classId/timetable` (or `GET /guardians/me/children/:studentId/timetable`)
- **Expected Response Format (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "className": "JHS 2 A",
    "schedule": [
      {
        "day": "Monday",
        "periods": [
          { "time": "08:00 - 09:00", "subject": "Mathematics", "teacher": "Mr. Boateng" },
          { "time": "09:00 - 10:00", "subject": "English Language", "teacher": "Mrs. Mensah" },
          { "time": "10:00 - 10:30", "subject": "Break / Snack", "teacher": "Supervised" }
        ]
      }
    ]
  }
}
```

### 2.6 Assignments & Homework
- **Proposed Endpoint**: `GET /guardians/me/children/:studentId/assignments`
- **Expected Response Format (`200 OK`)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "hw_uuid_1",
      "subject": "Mathematics",
      "title": "Linear Equations & Word Problems",
      "details": "Complete exercise 4.2 in workbook, questions 1-10.",
      "dueDate": "2026-11-20T23:59:59Z",
      "status": "PENDING" // "PENDING" | "SUBMITTED" | "GRADED"
    }
  ]
}
```

### 2.7 Announcements & Notices
- **Endpoint**: `GET /notifications`
- **Query Params**: `?audience=PARENTS`
- **Expected Response Format (`200 OK`)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "notif_uuid_1",
      "title": "End of Term Examination Date Notice",
      "body": "Examinations will commence on Monday, 1st December 2026. Please ensure all outstanding fees are settled.",
      "createdAt": "2026-11-05T12:00:00Z"
    }
  ]
}
```

### 2.8 Messages & Communication
- **Proposed Endpoint**: `GET /guardians/me/children/:studentId/teacher-contact`
- **Expected Response Format (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "classTeacherName": "Eunice Arthur",
    "classTeacherEmail": "e.arthur@school.edu.gh",
    "schoolPhone": "0504686941",
    "officeHours": "Mon-Fri 07:30 AM - 04:30 PM"
  }
}
```

### 2.9 Behaviour & Achievements
- **Proposed Endpoint**: `GET /guardians/me/children/:studentId/conduct-log`
- **Expected Response Format (`200 OK`)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "achievement_uuid_1",
      "type": "ACHIEVEMENT", // "ACHIEVEMENT" | "CONDUCT" | "DISCIPLINARY"
      "title": "Punctuality & Neatness Commendation",
      "note": "Recognized for 100% on-time morning arrival and exemplary uniform turnout.",
      "date": "2026-11-08"
    }
  ]
}
```

### 2.10 Reports (Official Terminal Reports)
- **Endpoint**: `GET /guardians/me/children/:studentId/report-cards`
- **Download PDF Endpoint**: `GET /reports/:reportId/pdf`
- **Expected Response Format (`200 OK`)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "report_uuid_1",
      "termName": "Term 1 - 2025/2026",
      "status": "RELEASED",
      "average": 82.5,
      "position": "3rd out of 38"
    }
  ]
}
```

### 2.11 My Profile
- **Endpoint**: `GET /guardians/me` (or current user session object)
- **Expected Response Format (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "name": "Mr. Kofi Mensah",
    "phone": "+233504686941",
    "email": "kofi.mensah@gmail.com",
    "address": "Accra, Ghana"
  }
}
```

### 2.12 Logout
- **Endpoint**: `POST /auth/logout` (or token invalidation endpoint)
- **Device Token Unregistration**: `DELETE /notifications/device-token` with `{ "token": "<fcm_token>" }`

---

## 3. Summary of Roles & Access Control
- `STUDENT`: Access to `/student` dashboard and `/study-assistant` (**Goreb AI**).
- `CLASS_TEACHER` & `SUBJECT_TEACHER`: Access to `/dashboard`, `/classes`, `/students`, `/attendance`, `/scores`, dedicated teacher modules, and `/study-assistant` (**Goreb AI** for teaching & lesson plans).
- `SCHOOL_ADMIN`: Full access to the School Management Administrator portal, Academics, Operations, Finance, and Reports & Settings.
- `ACCOUNTANT`: Access to `/dashboard`, School Fees (`/finance/fees`), Payments & Receipts (`/finance`), Expenses & Financial Reports (`/finance/expenses`), Payroll (`/finance/payroll`), and Announcements (`/notifications`).
- `PARENT`: Access to `/parent?tab=...` covering all 12 parent modules.

---

## 4. Navigation Structure & Frontend-to-Backend Audit

The system navigation has been aligned to the exact requested structure while preserving existing portals, URL protection, and RBAC security boundaries.

### 4.1 STUDENT PORTAL Navigation
| Item # | Navigation Label | Frontend Route / Query | Component / Implementation | Status |
|:---:|:---|:---|:---|:---|
| 1 | **Dashboard** | `/student?tab=dashboard` | `StudentPortal.jsx` (Overview Tab) | **Already Present** |
| 2 | **My Profile** | `/student?tab=profile` | `StudentPortal.jsx` (My Profile Tab) | **Already Present** |
| 3 | **My Results** | `/student?tab=scores` | `StudentPortal.jsx` (Grades & Score Breakdown) | **Renamed** (was *My Scores*) |
| 4 | **Attendance** | `/student?tab=attendance` | `StudentPortal.jsx` (Attendance Summary & Log) | **Renamed** (was *My Attendance*) |
| 5 | **Goreb AI** | `/study-assistant` | `StudyAssistant.jsx` (Learn Today, Quick Quiz, Study Guide) | **Already Present** (Updated UI & dynamic AI quiz) |
| 6 | **Timetable** | `/student?tab=timetable` | `StudentPortal.jsx` (Class Daily Schedule) | **Already Present** |
| 7 | **Assignments** | `/student?tab=assignments` | `StudentPortal.jsx` (Active Homework & Due Dates) | **Already Present** |
| 8 | **Learning Materials** | `/student?tab=materials` | `StudentPortal.jsx` (Resource Library & Downloads) | **Already Present** |
| 9 | **Announcements** | `/student?tab=announcements` | `StudentPortal.jsx` (Official Notices) | **Renamed** (was *Notifications*) |
| 10 | **Fee Status** | `/student?tab=finance` | `StudentPortal.jsx` (Invoices, Paid, Outstanding) | **Renamed** (was *Finance*) |
| 11 | **Settings** | `/student?tab=settings` | `StudentPortal.jsx` (Security & Preferences) | **Already Present** |
| 12 | **Logout** | `__logout__` | AppLayout Logout Trigger (`disablePushNotifications` + token clear) | **Already Present** |

---

### 4.2 TEACHER PORTAL Navigation
| Item # | Navigation Label | Frontend Route | Target Roles | Component / Implementation | Status |
|:---:|:---|:---|:---|:---|:---|
| 1 | **Dashboard** | `/dashboard` | `CLASS_TEACHER`, `SUBJECT_TEACHER` | `Dashboard.jsx` | **Already Present** |
| 2 | **Goreb AI** | `/study-assistant` | `CLASS_TEACHER`, `SUBJECT_TEACHER` | `StudyAssistant.jsx` | **Already Present** |
| 3 | **My Classes** | `/classes` | `CLASS_TEACHER`, `SUBJECT_TEACHER` | `Classes.jsx` | **Renamed** (was *Classes*) |
| 4 | **Students** | `/students` | `CLASS_TEACHER`, `SUBJECT_TEACHER` | `Students.jsx` | **Left Unchanged** |
| 5 | **Attendance Management** | `/attendance` | `CLASS_TEACHER`, `SUBJECT_TEACHER` | `Attendance.jsx` | **Renamed** (was *Attendance*) |
| 6 | **Results & Examinations** | `/scores` | `CLASS_TEACHER`, `SUBJECT_TEACHER` | `Scores.jsx` | **Renamed** (was *Scores*) |
| 7 | **Assignments & Homework** | `/teacher/assignments` | `CLASS_TEACHER`, `SUBJECT_TEACHER` | `TeacherAssignmentsPage.jsx` | **Newly Created** |
| 8 | **Learning Materials** | `/teacher/materials` | `CLASS_TEACHER`, `SUBJECT_TEACHER` | `TeacherMaterialsPage.jsx` | **Newly Created** |
| 9 | **My Timetable** | `/teacher/timetable` | `CLASS_TEACHER`, `SUBJECT_TEACHER` | `TeacherTimetablePage.jsx` | **Newly Created** |
| 10 | **Messages** | `/teacher/messages` | `CLASS_TEACHER`, `SUBJECT_TEACHER` | `TeacherMessagesPage.jsx` | **Newly Created** |
| 11 | **Reports & Analytics** | `/analytics` | `CLASS_TEACHER`, `SUBJECT_TEACHER` | `Analytics.jsx` | **Renamed** (was *Analytics*) |
| 12 | **Announcements** | `/notifications` | `CLASS_TEACHER`, `SUBJECT_TEACHER` | `Notifications.jsx` | **Renamed** (was *Notifications*) |
| 13 | **My Profile** | `/teacher/profile` | `CLASS_TEACHER`, `SUBJECT_TEACHER` | `TeacherProfilePage.jsx` | **Newly Created** |
| 14 | **Settings** | `/settings` | `CLASS_TEACHER`, `SUBJECT_TEACHER` | `Settings.jsx` | **Left Unchanged** |
| 15 | **Logout** | `__logout__` | `CLASS_TEACHER`, `SUBJECT_TEACHER` | AppLayout Logout Trigger | **Already Present** |

---

### 4.3 SCHOOL MANAGEMENT – ADMINISTRATOR PORTAL Navigation
| Section | Navigation Label | Frontend Route | Component / Implementation | Status |
|:---|:---|:---|:---|:---|
| **Overview** | **Dashboard** | `/dashboard` | `Dashboard.jsx` | **Left Unchanged** |
| **SCHOOL MANAGEMENT** | **Students** | `/students` | `Students.jsx` | **Left Unchanged** |
| | **Teachers** | `/staff?role=teacher` | `Staff.jsx` (Filtered to Teachers) | **Newly Created Item / Filter Link** |
| | **Parents & Guardians** | `/guardians` | `Guardians.jsx` | **Renamed** (was *Guardians*) |
| | **Admissions** | `/admissions` | `AdmissionsPage.jsx` | **Newly Created** |
| | **Staff Management** | `/staff` | `Staff.jsx` | **Renamed** (was *Staff*) |
| **ACADEMICS** | **Classes & Sections** | `/classes` | `Classes.jsx` | **Renamed** (was *Classes*) |
| | **Subjects** | `/subjects` | `Subjects.jsx` | **Left Unchanged** |
| | **Academic Years & Terms** | `/terms` | `Terms.jsx` | **Renamed** (was *Terms*) |
| | **Examinations & Results** | `/scores` | `Scores.jsx` | **Renamed** (was *Scores*) |
| | **Timetable** | `/academics/timetable` | `TimetablePage.jsx` | **Newly Created** |
| | **Attendance** | `/attendance` | `Attendance.jsx` | **Left Unchanged** |
| | **Assignments & Materials** | `/academics/assignments` | `AssignmentsMaterialsPage.jsx` | **Newly Created** |
| **FINANCE** | **School Fees** | `/finance/fees` | `FeeManagement.jsx` | **Renamed** (was *Fees & Invoices*) |
| | **Payments & Receipts** | `/finance` | `Finance.jsx` | **Renamed** (was *Finance*) |
| | **Expenses & Financial Reports**| `/finance/expenses` | `Expenses.jsx` | **Renamed** (was *Expenses*) |
| | **Payroll** | `/finance/payroll` | `PayrollPage.jsx` | **Newly Created** |
| **SCHOOL OPERATIONS** | **Library** | `/operations/library` | `LibraryPage.jsx` | **Newly Created** |
| | **Transport** | `/operations/transport`| `TransportPage.jsx` | **Newly Created** |
| | **Discipline** | `/operations/discipline`| `DisciplinePage.jsx` | **Newly Created** |
| | **Announcements** | `/notifications` | `Notifications.jsx` | **Renamed** (was *Notifications*) |
| | **Messages** | `/operations/messages` | `MessagesPage.jsx` | **Newly Created** |
| **REPORTS & SETTINGS** | **Reports & Analytics** | `/reports` | `Reports.jsx` | **Renamed** (was *Reports*) |
| | **User Roles & Permissions**| `/settings/roles` | `RolesPermissionsPage.jsx` | **Newly Created** |
| | **System Settings** | `/settings` | `Settings.jsx` | **Renamed** (was *School Settings*) |
| | **Audit Logs** | `/activity-logs` | `ActivityLogs.jsx` | **Renamed** (was *Activity Log*) |
| | **Backup & Restore** | `/settings/backup` | `BackupRestorePage.jsx` | **Newly Created** |

---

## 5. Backend Team API Contracts for Newly Created Modules

The following endpoints are recommended for the backend team to back the newly created frontend pages:

### 5.1 Admissions (`/admissions`)
- `GET /admissions`: List applicant admissions (`?status=PENDING&termId=...`)
- `POST /admissions`: Create new student application
- `PATCH /admissions/:id/status`: Update application status (`APPROVED`, `REVIEWING`, `REJECTED`)
- `POST /admissions/:id/enroll`: Convert approved applicant into an active student record

### 5.2 Academic Timetable (`/academics/timetable` & `/teacher/timetable`)
- `GET /timetable/classes/:classId`: Retrieve weekly periods and assigned teachers for a class
- `GET /timetable/teachers/me`: Retrieve current teacher's weekly periods
- `POST /timetable/slots`: Create/update a timetable period slot

### 5.3 Assignments & Materials (`/academics/assignments` & `/teacher/assignments`)
- `GET /assignments`: List assignments filtered by class, subject, or teacher
- `POST /assignments`: Create new homework task with attachment and deadline
- `GET /assignments/:id/submissions`: List student submissions and grading status
- `PATCH /assignments/submissions/:submissionId`: Submit grade and feedback

### 5.4 Payroll (`/finance/payroll`)
- `GET /finance/payroll`: List payroll runs by month/year
- `POST /finance/payroll/run`: Generate monthly staff payroll calculation
- `POST /finance/payroll/:id/disburse`: Approve and mark payslips as disbursed
- `GET /finance/payroll/:id/payslip/:staffId`: Download individual staff payslip PDF

### 5.5 Library Operations (`/operations/library`)
- `GET /library/books`: List books with search by ISBN, title, or category
- `POST /library/books`: Register book volume into library catalog
- `POST /library/issues`: Issue book to student/staff borrower
- `POST /library/returns/:issueId`: Process returned book and calculate overdue fines

### 5.6 Transport Operations (`/operations/transport`)
- `GET /transport/routes`: List active bus routes, vehicles, drivers, and capacity
- `POST /transport/routes`: Register a new bus route and pickup stops
- `GET /transport/routes/:id/students`: List registered students boarding each route

### 5.7 Student Discipline (`/operations/discipline`)
- `GET /discipline/incidents`: List incident reports by term, class, or student
- `POST /discipline/incidents`: File an infraction report
- `PATCH /discipline/incidents/:id`: Record action taken, sanction status, and resolution

### 5.8 Operations Messaging (`/operations/messages` & `/teacher/messages`)
- `GET /messages/broadcasts`: List sent SMS/app broadcasts and delivery statistics
- `POST /messages/broadcast`: Dispatch mass broadcast SMS/Push notification
- `GET /messages/threads`: Direct message threads for teachers and parents
- `POST /messages/threads/:id/send`: Send direct message in a thread

### 5.9 Roles & Permissions Matrix (`/settings/roles`)
- `GET /roles/matrix`: Retrieve role capability mappings and user counts
- `PATCH /roles/:roleKey/permissions`: Adjust customized permissions per school role

### 5.10 School Backup & Recovery (`/settings/backup`)
- `GET /backups/school`: List point-in-time snapshot archives
- `POST /backups/school/export`: Trigger asynchronous full school data export
- `POST /backups/school/restore`: Upload and restore from validated archive ZIP



---

## 6. Frontend Navigation UX — Portal Update (Nov 2026)

### 6.1 Sidebar-Only Navigation for Student & Parent Portals

Both the **Student Portal** (`/student`) and **Parent Portal** (`/parent`) previously rendered an internal horizontal scrollable tab bar *inside* the page in addition to the sidebar nav. This duplicated navigation has been **removed** to avoid confusion on mobile.

**How navigation now works:**
- Sidebar links use `?tab=<id>` query parameters, e.g. `/student?tab=scores`
- A `useEffect` inside each portal syncs `searchParams.get('tab')` → `setActiveTab()`
- Clicking any sidebar link updates the URL and renders the matching tab content
- The internal TABS array and `handleTabSelect()` function are retained in code for programmatic `onNavigate()` callbacks (e.g. from dashboard quick-access cards)

**Files changed:**
| File | Change |
|------|--------|
| `src/pages/student/StudentPortal.jsx` | Removed internal tab bar `<div>`, removed duplicate Logout button, added `onNavigate` prop to `DashboardTab`, stat cards now navigate on tap |
| `src/pages/parent/ParentPortal.jsx` | Removed internal tab bar `<div>`, removed duplicate Logout button, `MyChildrenTab` now accepts `onNavigate` prop and renders an 8-item Quick Access grid |

### 6.2 Quick Access Sections

**Student Dashboard** — 8 quick-access cards rendered below the Goreb AI banner:
`My Results`, `Attendance`, `Assignments`, `Fee Status`, `Timetable`, `Learning Materials`, `Announcements`, `My Profile`

**Parent "My Children" tab** — 8 quick-access cards rendered below the children cards grid:
`Academic Results`, `Attendance`, `School Fees & Payments`, `Assignments & Homework`, `Timetable`, `Announcements`, `Behaviour & Achievements`, `Reports`

> These sections are purely frontend — no additional backend APIs are needed. Each card calls `setSearchParams({ tab })` to switch tabs within the same portal page.

### 6.3 Logout Button

Logout is now **sidebar-only** for both portals (handled by `AppLayout.jsx`). The duplicate Logout button that previously appeared in the portal page header has been removed from both portals.

### 6.4 Attendance Date Comma Fix

**Bug:** Attendance records displayed as `, 2 Oct 2026` (leading comma).  
**Root cause:** `r.day` was sometimes `undefined` or empty, causing the separator to render at the start.  
**Fix applied** in `MyAttendanceTab` (StudentPortal):
```jsx
// Before (buggy):
{r.day || ''} {r.date ? new Date(r.date).toLocaleDateString(...) : ''}

// After (fixed):
{[r.day, r.date ? new Date(r.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : ''].filter(Boolean).join(' ')}
```
