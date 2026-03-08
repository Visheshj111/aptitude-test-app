# Aptitude Test App

An online aptitude test platform built for college students. Users log in with their college email, take a timed multiple-choice test, and instantly see their results.

## Features

- **User Authentication** – Register and log in with a college email (`@iccs.ac.in` or `@iimp.edu.in`). Passwords are hashed with bcrypt and sessions use JWT.
- **Randomised Questions** – Each test session draws 50 questions from MongoDB (12 Verbal, 13 Logical Reasoning, 25 Quantitative Aptitude).
- **Timed Test** – A countdown timer is shown during the test. Unanswered questions are counted as incorrect on submission.
- **Instant Results** – Score, percentage, and a breakdown are displayed immediately after submission.
- **Test Expiry Toggle** – The test can be locked with a single boolean flag so that all access is redirected to an expiry page (see [EXPIRY_GUIDE.md](EXPIRY_GUIDE.md)).
- **One Attempt Per User** – Once a result is recorded, the user is shown their existing result instead of being allowed to retake the test.

## Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | HTML5 · Vanilla JavaScript · Tailwind CSS v3 |
| Backend   | Node.js · Express.js v5 |
| Database  | MongoDB Atlas (Mongoose ODM) |
| Auth      | JWT (`jsonwebtoken`) · `bcryptjs` |

## Project Structure

```
aptitude-test-app/
├── backend/
│   ├── server.js               # Express app entry point (port 5000)
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT verification
│   ├── models/
│   │   ├── User.js             # User schema (email + hashed password)
│   │   ├── Question.js         # Question schema (section, options, answer)
│   │   └── Result.js           # Result schema (score, percentage, timestamp)
│   └── routes/
│       ├── auth.js             # POST /api/auth/register & /login
│       ├── questions.js        # GET /api/questions/test
│       └── results.js          # POST /api/results/submit & GET /api/results
│
├── frontend/
│   ├── index.html              # Login / Registration page
│   ├── instructions.html       # Pre-test instructions
│   ├── test.html               # Test page (50 questions)
│   ├── result.html             # Results page
│   ├── expire.html             # Expiry page (shown when test is closed)
│   ├── css/                    # Tailwind-compiled stylesheets
│   └── js/
│       ├── auth.js             # Login / register logic
│       ├── expiry-check.js     # TEST_EXPIRED flag (true/false)
│       ├── test.js             # Test rendering and submission logic
│       └── result.js           # Result display logic
│
├── EXPIRY_GUIDE.md             # Guide for enabling / disabling the test
└── README.md
```

## API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| `POST` | `/api/auth/register` | ✗ | Register a new user |
| `POST` | `/api/auth/login` | ✗ | Log in and receive a JWT |
| `GET` | `/api/questions/test` | ✗ | Fetch 50 randomised questions |
| `POST` | `/api/questions/add` | ✗ | Add a question (admin / dev) |
| `POST` | `/api/results/submit` | ✓ | Submit answers and calculate score |
| `GET` | `/api/results/check-completion` | ✓ | Check whether the user has already completed the test |
| `GET` | `/api/results` | ✓ | Retrieve the user's latest result |

## Getting Started

### Prerequisites

- Node.js ≥ 18
- A MongoDB Atlas cluster (or a local MongoDB instance)

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<a-strong-random-secret>
PORT=5000
```

Start the server:

```bash
npm start
```

The API will be available at `http://localhost:5000`.

### Frontend

The frontend is plain HTML/CSS/JS and requires no build step. Serve it with any static file server:

```bash
# Using npx (no global install needed)
npx http-server frontend -p 8080 -c-1

# Or Python
cd frontend && python -m http.server 8080
```

Open `http://localhost:8080` in your browser.

> **Note:** The backend URL is hard-coded in the frontend JS files. If you change the backend port, update the API base URL accordingly.

## Enabling / Disabling the Test

To close the test (redirect all users to the expiry page):

1. Open `frontend/js/expiry-check.js`.
2. Set `TEST_EXPIRED = true`.

To re-open the test, set it back to `false`. See [EXPIRY_GUIDE.md](EXPIRY_GUIDE.md) for full details, including automatic date-based expiry.

## User Flow

```
Login / Register → Instructions → Take Test (timed) → View Results
```

- If the test is expired, all pages redirect to `expire.html`.
- If the user has already submitted, they are redirected to their existing result.
