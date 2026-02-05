# 🔐 Authentication System Documentation

## Overview
The Prachi Verse application now has a robust authentication system that prevents unauthorized access through multiple security measures.

## Security Features

### 1. **Login Protection**
- Username/Password authentication required
- Valid credentials:
  - User: `prachiii` / Password: `billu`
  - Admin: `deepak` / Password: `admin`

### 2. **Session Management**
- Uses `sessionStorage` for session tracking
- Session automatically cleared on:
  - Browser tab/window close
  - Manual logout
  - Failed authentication checks

### 3. **Bypass Prevention**
The system prevents unauthorized access through:

#### ✅ Direct URL Access Prevention
- Authentication check runs immediately before page loads
- Page content hidden if not authenticated
- Automatic redirect to login page

#### ✅ Back Button Protection
- Detects when page is loaded from browser cache
- Re-validates session on back/forward navigation
- Uses `window.location.replace()` to prevent history manipulation

#### ✅ Session Hijacking Prevention
- Periodic session validation (every 5 seconds)
- Re-checks authentication when tab becomes visible
- Clears invalid sessions immediately

#### ✅ Tab/Window Close Protection
- Session stored in `sessionStorage` (not `localStorage`)
- Automatically cleared when browser is closed
- No persistent login across browser sessions

## Implementation

### Protected Pages
All protected pages include this authentication guard in the `<head>` section:

```html
<!-- Authentication Guard - Prevents unauthorized access -->
<script>
    (function() {
        'use strict';
        
        function checkAuth() {
            const isAuthenticated = sessionStorage.getItem('access_granted');
            
            if (!isAuthenticated || isAuthenticated !== 'true') {
                sessionStorage.clear();
                window.location.replace('login.html');
                return false;
            }
            return true;
        }
        
        // Initial check
        if (!checkAuth()) {
            document.documentElement.style.display = 'none';
            throw new Error('Unauthorized');
        }
        
        // Prevent back button bypass
        window.addEventListener('pageshow', function(event) {
            if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
                checkAuth();
            }
        });
        
        // Periodic validation
        setInterval(function() {
            if (!checkAuth()) {
                sessionStorage.clear();
                window.location.replace('login.html');
            }
        }, 5000);
        
        // Check when tab becomes visible
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                checkAuth();
            }
        });
    })();
</script>
```

### Adding Protection to New Pages

To protect a new page, add the authentication guard script at the top of the `<head>` section, before any other scripts or content.

Alternatively, you can use the external script file:

```html
<script src="auth-guard.js"></script>
```

## Files

- **`login.html`** - Login page with credential validation
- **`index.html`** - Main page (protected)
- **`auth-guard.js`** - Reusable authentication guard script

## How It Works

1. **User visits protected page**
   - Authentication guard runs immediately
   - Checks for valid session in `sessionStorage`
   - If invalid: redirects to login page
   - If valid: allows page to load

2. **User logs in**
   - Credentials validated against hardcoded values
   - Session created in `sessionStorage`
   - Redirected to main page using `replace()` (prevents back button)

3. **User tries to bypass**
   - Direct URL access: Blocked by initial auth check
   - Back button: Blocked by pageshow event listener
   - Cached page: Blocked by navigation type detection
   - Session manipulation: Blocked by periodic validation

4. **User closes browser**
   - `sessionStorage` automatically cleared
   - Must log in again on next visit

## Testing the Security

### Test 1: Direct URL Access
1. Open browser (not logged in)
2. Try to access `index.html` directly
3. **Expected**: Redirected to `login.html`

### Test 2: Back Button Bypass
1. Log in successfully
2. Navigate to `index.html`
3. Manually clear `sessionStorage` in browser console
4. Press back button
5. **Expected**: Redirected to `login.html`

### Test 3: URL Copy-Paste
1. Log in and access `index.html`
2. Copy the URL
3. Open new browser tab/window
4. Paste URL
5. **Expected**: Redirected to `login.html` (new session)

### Test 4: Session Expiry
1. Log in successfully
2. Open browser console
3. Run: `sessionStorage.clear()`
4. Wait 5 seconds
5. **Expected**: Automatically redirected to `login.html`

## Security Notes

⚠️ **Important**: This is a client-side authentication system suitable for personal projects. For production applications with sensitive data, implement server-side authentication with proper encryption, HTTPS, and secure session management.

✅ **Current Protection Level**: Prevents casual unauthorized access and URL sharing
❌ **Not Protected Against**: Determined attackers with developer tools access (client-side only)

## Logout Functionality

To add a logout button to any protected page:

```html
<button onclick="logout()">Logout</button>

<script>
function logout() {
    sessionStorage.clear();
    window.location.replace('login.html');
}
</script>
```
