// NEET 2026 Mock Test - Results Logic

let results = {};
let currentFilter = 'all';

// Initialize results page
document.addEventListener('DOMContentLoaded', function() {
    loadResults();
    if (Object.keys(results).length === 0) {
        // No results found, redirect to home
        alert('No test results found. Please take the test first.');
        window.location.href = 'index.html';
        return;
    }
    
    displayResults();
    displayQuestionReview();
    animateScoreCircle();
});

// Load results from localStorage
function loadResults() {
    const savedResults = localStorage.getItem('testResults');
    if (savedResults) {
        results = JSON.parse(savedResults);
    }
}

// Animate score circle on load
function animateScoreCircle() {
    const totalMarks = results.total?.marks || 0;
    const maxMarks = 720;
    const percentage = (totalMarks / maxMarks) * 100;
    const circumference = 2 * Math.PI * 54; // radius = 54
    const strokeDasharray = (percentage / 100) * circumference;
    
    const circle = document.getElementById('scoreCircleProgress');
    if (circle) {
        setTimeout(() => {
            circle.style.strokeDasharray = `${strokeDasharray}, ${circumference}`;
        }, 100);
    }
}

// Display overall results
function displayResults() {
    // Candidate information
    const candidateInfo = JSON.parse(localStorage.getItem('candidateInfo') || '{}');
    if (candidateInfo.name) {
        document.getElementById('resultName').textContent = candidateInfo.name;
        document.getElementById('resultRoll').textContent = candidateInfo.rollNumber;
    }
    
    const testDate = localStorage.getItem('testEndTime');
    if (testDate) {
        const date = new Date(testDate);
        document.getElementById('testDate').textContent = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
    
    // Overall score
    const totalMarks = results.total?.marks || 0;
    const maxMarks = 720;
    const percentage = ((totalMarks / maxMarks) * 100).toFixed(1);
    
    document.getElementById('totalScore').textContent = totalMarks;
    document.getElementById('totalPercentage').textContent = percentage + '%';
    
    // Update score rank based on percentage
    const rankEl = document.querySelector('.score-rank');
    if (rankEl) {
        if (percentage >= 90) rankEl.textContent = 'Outstanding Performance';
        else if (percentage >= 75) rankEl.textContent = 'Excellent Performance';
        else if (percentage >= 60) rankEl.textContent = 'Good Performance';
        else if (percentage >= 45) rankEl.textContent = 'Average Performance';
        else rankEl.textContent = 'Need More Practice';
    }
    
    // Overall statistics
    document.getElementById('totalCorrect').textContent = results.total?.correct || 0;
    document.getElementById('totalIncorrect').textContent = results.total?.incorrect || 0;
    document.getElementById('totalUnattempted').textContent = results.total?.unattempted || 0;
    document.getElementById('totalMarks').textContent = totalMarks;
    
    // Subject-wise breakdown
    displaySubjectBreakdown('physics');
    displaySubjectBreakdown('chemistry');
    displaySubjectBreakdown('biology');
}

// Display subject breakdown
function displaySubjectBreakdown(subject) {
    const subjectData = results[subject] || { correct: 0, incorrect: 0, unattempted: 0, marks: 0 };
    
    const correctEl = document.getElementById(`${subject}Correct`);
    const incorrectEl = document.getElementById(`${subject}Incorrect`);
    const unattemptedEl = document.getElementById(`${subject}Unattempted`);
    const marksEl = document.getElementById(`${subject}Marks`);
    
    if (correctEl) correctEl.textContent = subjectData.correct || 0;
    if (incorrectEl) incorrectEl.textContent = subjectData.incorrect || 0;
    if (unattemptedEl) unattemptedEl.textContent = subjectData.unattempted || 0;
    if (marksEl) marksEl.textContent = subjectData.marks || 0;
}

// Display question review
function displayQuestionReview() {
    const reviewContainer = document.getElementById('reviewContainer');
    reviewContainer.innerHTML = '';
    
    if (!results.questionDetails || results.questionDetails.length === 0) {
        reviewContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 30px;">No question details available.</p>';
        return;
    }
    
    let filteredQuestions = results.questionDetails;
    
    // Apply filter
    if (currentFilter === 'correct') {
        filteredQuestions = results.questionDetails.filter(q => q.isCorrect);
    } else if (currentFilter === 'incorrect') {
        filteredQuestions = results.questionDetails.filter(q => q.isAttempted && !q.isCorrect);
    } else if (currentFilter === 'unattempted') {
        filteredQuestions = results.questionDetails.filter(q => !q.isAttempted);
    }
    
    if (filteredQuestions.length === 0) {
        reviewContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 30px;">No questions in this category.</p>';
        return;
    }
    
    filteredQuestions.forEach((detail, index) => {
        const reviewItem = createReviewItem(detail, index);
        reviewContainer.appendChild(reviewItem);
    });
}

// Create review item
function createReviewItem(detail, index) {
    const item = document.createElement('div');
    
    // Determine status class
    let statusClass = 'unattempted';
    let statusIcon = '○';
    if (detail.isAttempted) {
        if (detail.isCorrect) {
            statusClass = 'correct';
            statusIcon = '✓';
        } else {
            statusClass = 'incorrect';
            statusIcon = '✕';
        }
    }
    
    item.className = `review-item ${statusClass}`;
    
    const subjectName = detail.subject.charAt(0).toUpperCase() + detail.subject.slice(1);
    
    // Build answer display
    let answerDisplay = '';
    if (detail.isAttempted) {
        const userAnswerText = detail.options[detail.userAnswer] || 'Not available';
        const correctAnswerText = detail.options[detail.correctAnswer] || 'Not available';
        
        answerDisplay = `
            <div class="review-answers">
                <div class="review-answer-box">
                    <span class="review-answer-label">Your Answer</span>
                    <div class="review-answer-text ${detail.isCorrect ? 'correct' : 'incorrect'}">
                        ${String.fromCharCode(65 + detail.userAnswer)}. ${userAnswerText}
                    </div>
                </div>
                <div class="review-answer-box">
                    <span class="review-answer-label">Correct Answer</span>
                    <div class="review-answer-text correct">
                        ${String.fromCharCode(65 + detail.correctAnswer)}. ${correctAnswerText}
                    </div>
                </div>
            </div>
        `;
    } else {
        const correctAnswerText = detail.options[detail.correctAnswer] || 'Not available';
        answerDisplay = `
            <div class="review-answers">
                <div class="review-answer-box">
                    <span class="review-answer-label">Your Answer</span>
                    <div class="review-answer-text unattempted not-attempted">
                        Not attempted
                    </div>
                </div>
                <div class="review-answer-box">
                    <span class="review-answer-label">Correct Answer</span>
                    <div class="review-answer-text correct">
                        ${String.fromCharCode(65 + detail.correctAnswer)}. ${correctAnswerText}
                    </div>
                </div>
            </div>
        `;
    }
    
    item.innerHTML = `
        <div class="review-question">
            <div class="review-q-number">${subjectName} • Question ${detail.questionId}</div>
            <div class="review-q-text">${detail.question}</div>
        </div>
        ${answerDisplay}
    `;
    
    return item;
}

// Filter review
function filterReview(filter) {
    currentFilter = filter;
    displayQuestionReview();
    
    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mark the clicked button as active
    event.target.closest('.filter-btn').classList.add('active');
}


