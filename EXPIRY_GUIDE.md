# Test Expiry Management - Simple Guide

## How to Expire the Test (Block All Access)

### Step 1: Open the Configuration File
Open this file: `frontend/js/expiry-check.js`

### Step 2: Change ONE Line
Find this line:
```javascript
const TEST_EXPIRED = false;
```

Change it to:
```javascript
const TEST_EXPIRED = true;
```

### Step 3: Save and Deploy
```bash
git add frontend/js/expiry-check.js
git commit -m "Expire the test"
git push origin main
```

### That's it! 
✅ The test is now expired
✅ All users will see the beautiful "Test time has expired" animation
✅ No one can access login, registration, instructions, or test pages
✅ The expire page cannot be bypassed

---

## How to Re-Enable the Test

### Step 1: Open the Configuration File
Open: `frontend/js/expiry-check.js`

### Step 2: Change Back
Change:
```javascript
const TEST_EXPIRED = true;
```

Back to:
```javascript
const TEST_EXPIRED = false;
```

### Step 3: Deploy
```bash
git add frontend/js/expiry-check.js
git commit -m "Re-enable the test"
git push origin main
```

---

## Optional: Automatic Expiry by Date/Time

If you want the test to automatically expire at a specific date/time:

1. Open `frontend/js/expiry-check.js`
2. Find these commented lines:
```javascript
// const AUTO_EXPIRY_DATE = new Date('2025-10-15 23:59:59');
// if (new Date() > AUTO_EXPIRY_DATE) {
//     TEST_EXPIRED = true;
// }
```

3. Uncomment them and set your date:
```javascript
const AUTO_EXPIRY_DATE = new Date('2025-10-20 18:00:00'); // Oct 20, 2025 at 6:00 PM
if (new Date() > AUTO_EXPIRY_DATE) {
    TEST_EXPIRED = true;
}
```

4. Save and deploy

The test will automatically expire at the specified date/time!

---

## What Happens When Test is Expired?

✅ Users visiting any page (`index.html`, `instructions.html`, `test.html`, `result.html`) are immediately redirected to `expire.html`

✅ The expire page shows a beautiful cosmic animation with the message "Test time has expired."

✅ No navigation, no buttons - users cannot go anywhere

✅ Perfect for when the test period is over

---

## Testing

To test the expiry:
1. Set `TEST_EXPIRED = true`
2. Open your website
3. You should see the expire page immediately
4. Try accessing any URL directly - all redirect to expire page

---

## Files Modified

- `frontend/js/expiry-check.js` - Configuration file (the only file you need to edit)
- `frontend/index.html` - Login page (checks expiry)
- `frontend/instructions.html` - Instructions page (checks expiry)
- `frontend/test.html` - Test page (checks expiry)
- `frontend/result.html` - Result page (checks expiry)
- `frontend/expire.html` - The beautiful expiry page (no changes needed)

---

## Quick Reference

**To expire test:** 
```javascript
const TEST_EXPIRED = true;
```

**To enable test:** 
```javascript
const TEST_EXPIRED = false;
```

**That's all you need to remember!** 🎉
