// NEET 2026 Mock Test - Main Navigation Script

// Handle candidate form submission
document.addEventListener('DOMContentLoaded', function() {
    const candidateForm = document.getElementById('candidateForm');
    if (candidateForm) {
        candidateForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const candidateName = document.getElementById('candidateName').value.trim();
            const rollNumber = document.getElementById('rollNumber').value.trim();
            const dateOfBirth = document.getElementById('dateOfBirth').value;
            
            if (!candidateName || !rollNumber || !dateOfBirth) {
                alert('Please fill in all fields');
                return;
            }
            
            // Store candidate information
            const candidateInfo = {
                name: candidateName,
                rollNumber: rollNumber,
                dateOfBirth: dateOfBirth,
                testStartTime: new Date().toISOString()
            };
            
            localStorage.setItem('candidateInfo', JSON.stringify(candidateInfo));
            
            // Navigate to instructions page
            window.location.href = 'instructions.html';
        });
    }
    
    // Display candidate info on instructions page
    displayCandidateInfo();
});

// Display candidate information on instructions page
function displayCandidateInfo() {
    const candidateInfo = JSON.parse(localStorage.getItem('candidateInfo') || '{}');
    
    if (candidateInfo.name) {
        const displayName = document.getElementById('displayName');
        const displayRoll = document.getElementById('displayRoll');
        
        if (displayName) displayName.textContent = candidateInfo.name;
        if (displayRoll) displayRoll.textContent = candidateInfo.rollNumber;
    }
}

// Start test function
function startTest() {
    // Clear any previous test data
    localStorage.removeItem('testAnswers');
    localStorage.removeItem('testStartTime');
    localStorage.removeItem('questionStatus');
    
    // Set test start time
    localStorage.setItem('testStartTime', new Date().toISOString());
    
    // Navigate to test page
    window.location.href = 'test.html';
}


