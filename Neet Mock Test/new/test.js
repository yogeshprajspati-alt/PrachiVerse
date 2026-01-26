// NEET 2026 Mock Test - Test Logic

let questions = {};
let currentSubject = 'physics';
let currentQuestionIndex = 0;
let answers = {};
let questionStatus = {}; // 'not-visited', 'answered', 'not-answered', 'marked'
let timerInterval = null;
let timeRemaining = 180 * 60; // 180 minutes in seconds
let warningShown = false;

// Question structure: { physics: { sectionA: [...], sectionB: [...] }, ... }
let questionStructure = {};

// Initialize test
document.addEventListener('DOMContentLoaded', async function() {
    loadCandidateInfo();
    await loadQuestions();
    loadSavedData();
    initializeTimer();
    renderQuestionPalette();
    displayQuestion();
    updateQuestionCounter();
    updateUnansweredButton();
    
    // Auto-save every 30 seconds
    setInterval(saveAnswers, 30000);
    
    // Update unanswered button every 5 seconds
    setInterval(updateUnansweredButton, 5000);
});

// Load candidate information
function loadCandidateInfo() {
    const candidateInfo = JSON.parse(localStorage.getItem('candidateInfo') || '{}');
    // These elements no longer exist in the HTML, so we skip them
    const nameElement = document.getElementById('testCandidateName');
    const rollElement = document.getElementById('testRollNumber');
    
    if (nameElement && candidateInfo.name) {
        nameElement.textContent = candidateInfo.name;
    }
    if (rollElement && candidateInfo.rollNumber) {
        rollElement.textContent = candidateInfo.rollNumber;
    }
}

// Load questions from JSON file
async function loadQuestions() {
    try {
        console.log('Starting to load questions...');
        const response = await fetch('questions.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Questions loaded from JSON:', data);
        
        questions = data;
        console.log('Questions object populated with', Object.keys(questions).length, 'subjects');
        
        // Organize questions by subject and section
        organizeQuestions();
        console.log('Questions organized successfully');
    } catch (error) {
        console.error('Error loading questions:', error);
        alert('Error loading questions. Please refresh the page. Error: ' + error.message);
    }
}

// Organize questions into structure
function organizeQuestions() {
    console.log('Organizing questions. Current questions object:', questions);
    
    questionStructure = {
        physics: { sectionA: [] },
        chemistry: { sectionA: [] },
        biology: { sectionA: [] }
    };
    
    // Organize Physics questions
    if (questions.physics && Array.isArray(questions.physics)) {
        console.log('Processing', questions.physics.length, 'physics questions');
        questions.physics.forEach(q => {
            questionStructure.physics.sectionA.push(q);
        });
    } else {
        console.warn('Physics questions not found or not an array');
    }
    
    // Organize Chemistry questions
    if (questions.chemistry && Array.isArray(questions.chemistry)) {
        console.log('Processing', questions.chemistry.length, 'chemistry questions');
        questions.chemistry.forEach(q => {
            questionStructure.chemistry.sectionA.push(q);
        });
    } else {
        console.warn('Chemistry questions not found or not an array');
    }
    
    // Organize Biology questions
    if (questions.biology && Array.isArray(questions.biology)) {
        console.log('Processing', questions.biology.length, 'biology questions');
        questions.biology.forEach(q => {
            questionStructure.biology.sectionA.push(q);
        });
    } else {
        console.warn('Biology questions not found or not an array');
    }
    
    // Initialize question status
    initializeQuestionStatus();
    
    // Log for debugging
    console.log('Questions organized:', {
        physics: questionStructure.physics.sectionA.length,
        chemistry: questionStructure.chemistry.sectionA.length,
        biology: questionStructure.biology.sectionA.length
    });
}

// Initialize question status
function initializeQuestionStatus() {
    const subjects = ['physics', 'chemistry', 'biology'];
    subjects.forEach(subject => {
        const sectionA = questionStructure[subject].sectionA;
        
        sectionA.forEach((q, idx) => {
            const key = `${subject}-A-${idx}`;
            if (!questionStatus[key]) {
                questionStatus[key] = 'not-visited';
            }
        });
    });
}

// Load saved answers and status
function loadSavedData() {
    const savedAnswers = localStorage.getItem('testAnswers');
    const savedStatus = localStorage.getItem('questionStatus');
    const savedTime = localStorage.getItem('testStartTime');
    
    if (savedAnswers) {
        answers = JSON.parse(savedAnswers);
    }
    
    if (savedStatus) {
        questionStatus = JSON.parse(savedStatus);
    }
    
    if (savedTime) {
        const startTime = new Date(savedTime);
        const now = new Date();
        const elapsed = Math.floor((now - startTime) / 1000);
        timeRemaining = Math.max(0, 180 * 60 - elapsed);
    }
}

// Save answers to localStorage
function saveAnswers() {
    localStorage.setItem('testAnswers', JSON.stringify(answers));
    localStorage.setItem('questionStatus', JSON.stringify(questionStatus));
}

// Initialize and start timer
function initializeTimer() {
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        if (timeRemaining > 0) {
            timeRemaining--;
            updateTimerDisplay();
            
            // Show warning at 10 minutes
            if (timeRemaining === 10 * 60 && !warningShown) {
                showWarning();
                warningShown = true;
            }
        } else {
            // Time's up - auto submit
            clearInterval(timerInterval);
            alert('Time is up! Your test will be submitted automatically.');
            submitTest();
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;
    
    const timerElement = document.getElementById('timer');
    timerElement.textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    // Add warning classes
    if (timeRemaining <= 10 * 60) {
        timerElement.classList.add('danger');
    } else if (timeRemaining <= 30 * 60) {
        timerElement.classList.add('warning');
    }
}

// Show warning banner
function showWarning() {
    const warningBanner = document.getElementById('warningBanner');
    warningBanner.style.display = 'block';
}

// Switch subject
function switchSubject(subject) {
    currentSubject = subject;
    currentQuestionIndex = 0;
    
    // Update active button
    document.querySelectorAll('.subject-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-subject="${subject}"]`).classList.add('active');
    
    // Update palette display
    document.querySelectorAll('.subject-palette').forEach(palette => {
        palette.style.display = 'none';
    });
    document.getElementById(`${subject}Palette`).style.display = 'block';
    
    displayQuestion();
    updateQuestionPalette();
}

// Get current question
function getCurrentQuestion() {
    const sectionA = questionStructure[currentSubject]?.sectionA;
    if (!sectionA || sectionA.length === 0) {
        console.warn(`No questions found for ${currentSubject}. sectionA length:`, sectionA?.length);
        return null;
    }
    
    const question = sectionA[currentQuestionIndex];
    if (!question) {
        console.warn(`Question not found at index ${currentQuestionIndex} for ${currentSubject}`);
    }
    return question;
}

// Get Section A count for current subject
function getSectionACount() {
    return questionStructure[currentSubject].sectionA.length;
}

// Get current question key
function getCurrentQuestionKey() {
    return `${currentSubject}-A-${currentQuestionIndex}`;
}

// Display current question
function displayQuestion() {
    const question = getCurrentQuestion();
    if (!question) {
        console.error('Question not found for:', currentSubject, currentQuestionIndex, 'Available:', questionStructure);
        document.getElementById('questionText').textContent = 'Error: Question not found. Please check console for details.';
        document.getElementById('optionsContainer').innerHTML = '';
        return;
    }
    
    // Update question text
    document.getElementById('questionText').textContent = question.question;
    
    // Update section indicator
    const questionNum = currentQuestionIndex + 1;
    document.getElementById('currentSection').textContent = `Section A`;
    document.getElementById('currentQuestionNum').textContent = questionNum;
    
    // Display options
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    const questionKey = getCurrentQuestionKey();
    const selectedAnswer = answers[questionKey];
    
    // Mark as visited
    if (questionStatus[questionKey] === 'not-visited') {
        questionStatus[questionKey] = 'not-answered';
    }
    
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option-item';
        if (selectedAnswer === index) {
            optionDiv.classList.add('selected');
        }
        
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'option';
        radio.value = index;
        radio.id = `option-${index}`;
        radio.checked = selectedAnswer === index;
        radio.addEventListener('change', () => selectOption(index));
        
        const label = document.createElement('label');
        label.htmlFor = `option-${index}`;
        label.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
        
        optionDiv.appendChild(radio);
        optionDiv.appendChild(label);
        optionDiv.addEventListener('click', () => {
            radio.checked = true;
            selectOption(index);
        });
        
        optionsContainer.appendChild(optionDiv);
    });
    
    // Update palette highlight
    updateQuestionPalette();
    saveAnswers();
}

// Select an option
function selectOption(optionIndex) {
    const questionKey = getCurrentQuestionKey();
    answers[questionKey] = optionIndex;
    questionStatus[questionKey] = 'answered';
    
    saveAnswers();
    displayQuestion();
    updateQuestionCounter();
    updateQuestionPalette();
    updateUnansweredButton();
}

// Mark for review
function markForReview() {
    const questionKey = getCurrentQuestionKey();
    questionStatus[questionKey] = 'marked';
    saveAnswers();
    updateQuestionPalette();
}

// Clear response
function clearResponse() {
    const questionKey = getCurrentQuestionKey();
    delete answers[questionKey];
    questionStatus[questionKey] = 'not-answered';
    saveAnswers();
    displayQuestion();
    updateQuestionCounter();
    updateQuestionPalette();
    updateUnansweredButton();
}

// Navigate to question
function navigateToQuestion(subject, section, index) {
    currentSubject = subject;
    
    // Calculate question index
    if (section === 'A') {
        currentQuestionIndex = index;
    } else {
        currentQuestionIndex = getSectionACount() + index;
    }
    
    // Update subject selector
    switchSubject(subject);
    displayQuestion();
}

// Previous question
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    } else {
        // Move to previous subject
        const subjects = ['physics', 'chemistry', 'biology'];
        const currentIndex = subjects.indexOf(currentSubject);
        if (currentIndex > 0) {
            switchSubject(subjects[currentIndex - 1]);
            currentQuestionIndex = getSectionACount() - 1;
            displayQuestion();
        }
    }
}

// Next question
function nextQuestion() {
    const totalQuestions = getSectionACount();
    if (currentQuestionIndex < totalQuestions - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        // Move to next subject
        const subjects = ['physics', 'chemistry', 'biology'];
        const currentIndex = subjects.indexOf(currentSubject);
        if (currentIndex < subjects.length - 1) {
            switchSubject(subjects[currentIndex + 1]);
            currentQuestionIndex = 0;
            displayQuestion();
        }
    }
}

// Count unanswered questions
function countUnanswered() {
    let count = 0;
    ['physics', 'chemistry', 'biology'].forEach(subject => {
        questionStructure[subject].sectionA.forEach((q, idx) => {
            const questionKey = `${subject}-A-${idx}`;
            const status = questionStatus[questionKey];
            if (status === 'not-answered' || status === 'not-visited') {
                count++;
            }
        });
    });
    return count;
}
function goToUnanswered() {
    const subjects = ['physics', 'chemistry', 'biology'];
    
    // First, search from the beginning to find ANY unanswered question
    console.log('Searching for unanswered questions...');
    console.log('Current questionStatus:', questionStatus);
    
    for (let s = 0; s < subjects.length; s++) {
        const subject = subjects[s];
        const sectionA = questionStructure[subject]?.sectionA || [];
        
        console.log(`Checking ${subject}: ${sectionA.length} questions`);
        
        // Search all questions in this subject
        for (let i = 0; i < sectionA.length; i++) {
            const questionKey = `${subject}-A-${i}`;
            const status = questionStatus[questionKey];
            
            console.log(`Q${i} status: ${status}`);
            
            // Check if not answered or not visited
            if (status === 'not-answered' || status === 'not-visited') {
                console.log(`Found unanswered at ${subject}-${i}`);
                
                currentSubject = subject;
                currentQuestionIndex = i;
                
                // Update active button
                document.querySelectorAll('.subject-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                document.querySelector(`[data-subject="${subject}"]`).classList.add('active');
                
                // Update palette display
                document.querySelectorAll('.subject-palette').forEach(palette => {
                    palette.style.display = 'none';
                });
                document.getElementById(`${subject}Palette`).style.display = 'block';
                
                displayQuestion();
                updateQuestionPalette();
                updateUnansweredButton();
                return;
            }
        }
    }
    
    // If no unanswered questions found, show message
    console.log('No unanswered questions found');
    alert('✓ All questions have been answered!');
}

// Update unanswered count on button
function updateUnansweredButton() {
    const count = countUnanswered();
    const btn = document.querySelector('button[onclick="goToUnanswered()"]');
    
    console.log('Updating unanswered button. Count:', count);
    
    if (btn) {
        if (count > 0) {
            btn.textContent = `📋 Unanswered (${count})`;
            btn.style.opacity = '1';
            btn.disabled = false;
        } else {
            btn.textContent = '✓ All Done';
            btn.style.opacity = '0.7';
            btn.disabled = true;
        }
    } else {
        console.warn('Unanswered button not found');
    }
}

// Render question palette
function renderQuestionPalette() {
    const subjects = ['physics', 'chemistry', 'biology'];
    
    subjects.forEach(subject => {
        // Section A
        const sectionAGrid = document.getElementById(`${subject}SectionA`);
        if (sectionAGrid) {
            sectionAGrid.innerHTML = '';
            
            questionStructure[subject].sectionA.forEach((q, idx) => {
                const btn = createQuestionNumberButton(subject, 'A', idx);
                sectionAGrid.appendChild(btn);
            });
        }
    });
}

// Create question number button
function createQuestionNumberButton(subject, section, index) {
    const btn = document.createElement('div');
    const questionKey = `${subject}-${section}-${index}`;
    const questionNum = section === 'A' ? index + 1 : index + 1;
    
    btn.className = 'question-number';
    btn.textContent = questionNum;
    btn.addEventListener('click', () => navigateToQuestion(subject, section, index));
    
    return btn;
}

// Update question palette colors
function updateQuestionPalette() {
    const subjects = ['physics', 'chemistry', 'biology'];
    
    subjects.forEach(subject => {
        const sectionGrid = document.getElementById(`${subject}SectionA`);
        if (!sectionGrid) return;
        
        const buttons = sectionGrid.querySelectorAll('.question-number');
        buttons.forEach((button, idx) => {
            const questionKey = `${subject}-A-${idx}`;
            updateButtonStatus(button, questionKey);
        });
    });
    
    // Update current question highlight
    highlightCurrentQuestion();
}

// Update button status
function updateButtonStatus(button, questionKey) {
    // Remove all status classes
    button.classList.remove('not-visited', 'answered', 'not-answered', 'marked', 'current');
    
    const status = questionStatus[questionKey] || 'not-visited';
    button.classList.add(status);
}

// Highlight current question
function highlightCurrentQuestion() {
    // Remove current class from all
    document.querySelectorAll('.question-number').forEach(btn => {
        btn.classList.remove('current');
    });
    
    // Add current class to active question
    const sectionGrid = document.getElementById(`${currentSubject}SectionA`);
    
    if (sectionGrid) {
        const buttons = sectionGrid.querySelectorAll('.question-number');
        if (buttons[currentQuestionIndex]) {
            buttons[currentQuestionIndex].classList.add('current');
        }
    }
}

// Update question counter
function updateQuestionCounter() {
    let answeredCount = 0;
    Object.keys(answers).forEach(key => {
        if (answers[key] !== undefined && answers[key] !== null) {
            answeredCount++;
        }
    });
    
    // Calculate total questions dynamically
    let totalQuestions = 0;
    ['physics', 'chemistry', 'biology'].forEach(subject => {
        totalQuestions += questionStructure[subject].sectionA.length;
    });
    
    document.getElementById('answeredCount').textContent = answeredCount;
    document.getElementById('totalQuestions').textContent = totalQuestions || 180;
}

// Show submit dialog
function showSubmitDialog() {
    const stats = calculateSubmissionStats();
    const statsHTML = `
        <p><strong>Answered:</strong> ${stats.answered}</p>
        <p><strong>Not Answered:</strong> ${stats.notAnswered}</p>
        <p><strong>Marked for Review:</strong> ${stats.marked}</p>
        <p><strong>Not Visited:</strong> ${stats.notVisited}</p>
    `;
    
    document.getElementById('submissionStats').innerHTML = statsHTML;
    document.getElementById('submitModal').classList.add('active');
}

// Close submit dialog
function closeSubmitDialog() {
    document.getElementById('submitModal').classList.remove('active');
}

// Calculate submission stats
function calculateSubmissionStats() {
    let answered = 0, notAnswered = 0, marked = 0, notVisited = 0;
    
    Object.keys(questionStatus).forEach(key => {
        const status = questionStatus[key];
        if (status === 'answered') answered++;
        else if (status === 'not-answered') notAnswered++;
        else if (status === 'marked') marked++;
        else notVisited++;
    });
    
    return { answered, notAnswered, marked, notVisited };
}

// Submit test
function submitTest() {
    clearInterval(timerInterval);
    
    // Calculate results
    const results = calculateResults();
    
    // Store results
    localStorage.setItem('testResults', JSON.stringify(results));
    localStorage.setItem('testEndTime', new Date().toISOString());
    
    // Clear test data
    localStorage.removeItem('testAnswers');
    localStorage.removeItem('questionStatus');
    localStorage.removeItem('testStartTime');
    
    // Navigate to results page
    window.location.href = 'results.html';
}

// Calculate results
function calculateResults() {
    const results = {
        physics: { correct: 0, incorrect: 0, unattempted: 0, marks: 0 },
        chemistry: { correct: 0, incorrect: 0, unattempted: 0, marks: 0 },
        biology: { correct: 0, incorrect: 0, unattempted: 0, marks: 0 },
        total: { correct: 0, incorrect: 0, unattempted: 0, marks: 0 },
        questionDetails: []
    };
    
    // Process each subject
    ['physics', 'chemistry', 'biology'].forEach(subject => {
        // Process Section A (all questions are compulsory)
        questionStructure[subject].sectionA.forEach((q, idx) => {
            const key = `${subject}-A-${idx}`;
            const userAnswer = answers[key];
            const correctAnswer = q.correct;
            
            processQuestion(results, subject, q, userAnswer, correctAnswer, key);
        });
    });
    
    // Calculate totals
    results.total.correct = results.physics.correct + results.chemistry.correct + results.biology.correct;
    results.total.incorrect = results.physics.incorrect + results.chemistry.incorrect + results.biology.incorrect;
    results.total.unattempted = results.physics.unattempted + results.chemistry.unattempted + results.biology.unattempted;
    results.total.marks = results.physics.marks + results.chemistry.marks + results.biology.marks;
    
    return results;
}

// Process individual question
function processQuestion(results, subject, question, userAnswer, correctAnswer, key) {
    const detail = {
        subject: subject,
        questionId: question.id,
        question: question.question,
        options: question.options,
        correctAnswer: correctAnswer,
        userAnswer: userAnswer,
        isCorrect: false,
        isAttempted: userAnswer !== undefined && userAnswer !== null
    };
    
    if (detail.isAttempted) {
        if (userAnswer === correctAnswer) {
            results[subject].correct++;
            results[subject].marks += 4;
            detail.isCorrect = true;
        } else {
            results[subject].incorrect++;
            results[subject].marks -= 1;
        }
    } else {
        results[subject].unattempted++;
    }
    
    results.questionDetails.push(detail);
}

