/**
 * Authentication Guard
 * This script prevents unauthorized access to protected pages
 * Include this at the top of every protected HTML file
 */

(function () {
    'use strict';

    // Immediately check authentication
    function checkAuth() {
        const isAuthenticated = sessionStorage.getItem('access_granted');

        // If not authenticated, redirect to login
        if (!isAuthenticated || isAuthenticated !== 'true') {
            // Clear any partial session data
            sessionStorage.clear();

            // Redirect to login page
            // Use replace() instead of href to prevent back button bypass
            window.location.replace('login.html');

            // Stop script execution
            return false;
        }

        return true;
    }

    // Run check immediately
    if (!checkAuth()) {
        // Prevent page rendering by hiding body
        if (document.body) {
            document.body.style.display = 'none';
        }
        // Stop all script execution
        throw new Error('Unauthorized access');
    }

    // Add event listener to prevent back button bypass
    window.addEventListener('pageshow', function (event) {
        // Check if page is loaded from cache (back/forward button)
        if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
            checkAuth();
        }
    });

    // Periodic check (every 5 seconds) to ensure session is still valid
    setInterval(function () {
        if (!checkAuth()) {
            sessionStorage.clear();
            window.location.replace('login.html');
        }
    }, 5000);

    // Prevent session hijacking by checking if tab is visible
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) {
            checkAuth();
        }
    });

})();
