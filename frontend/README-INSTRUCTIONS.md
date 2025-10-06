What's changed

- Added `instructions.html` — a post-login instructions page with Start Test and Logout actions.
- Updated `js/auth.js` to redirect to `instructions.html` after successful login or registration.

How to test locally (Windows PowerShell)

1. Serve the `frontend/` folder. If `npx` is blocked by PowerShell execution policy, use one of the following options:

Option A — use Node's http-server (recommended):

- If you have it installed globally: http-server frontend -p 8080 -c-1
- Or install it temporarily in the workspace and run it:
  npm install -g http-server
  http-server frontend -p 8080 -c-1

Option B — use Python (if available):

# For Python 3
cd frontend; python -m http.server 8080

Option C — change PowerShell execution policy (if you trust running npx):

Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
npx http-server frontend -p 8080 -c-1

2. Open a browser to http://localhost:8080/index.html
3. Log in or register. After successful auth you should be redirected to /instructions.html
4. Click "Start Test" to go to /test.html, or "Logout" to sign out and return to index.html.

Notes

- `instructions.html` checks for a token in localStorage and will redirect to `index.html` if none is present.
- If you want the instructions page to be shown only once per user, we can add an API-backed flag or a localStorage mark; tell me if you'd like that.
