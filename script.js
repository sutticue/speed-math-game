document.addEventListener('DOMContentLoaded', () => {
    // Game state
    const state = {
        mode: null,
        category: null,
        level: null,
        score: 0,
        correct: 0,
        incorrect: 0,
        timeLeft: 30,
        timer: null,
        currentQuestion: null
    };

    // DOM elements - screens
    const modeScreen = document.getElementById('mode-screen');
    const categoryScreen = document.getElementById('category-screen');
    const levelScreen = document.getElementById('level-screen');
    const gameScreen = document.getElementById('game-screen');
    const resultScreen = document.getElementById('result-screen');
    
    // DOM elements - buttons and selectors
    const modeButtons = document.querySelectorAll('.mode-btn');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const levelButtons = document.querySelectorAll('.level-btn');
    const backToModeBtn = document.getElementById('back-to-mode-btn');
    const backToCategoryBtn = document.getElementById('back-to-category-btn');
    const exitGameBtn = document.getElementById('exit-game-btn');
    
    // DOM elements - gameplay
    const questionElement = document.getElementById('question');
    const answerInput = document.getElementById('answer-input');
    const submitButton = document.getElementById('submit-btn');
    const playAgainButton = document.getElementById('play-again-btn');
    const backToMenuButton = document.getElementById('back-to-menu-btn');
    
    // DOM elements - display
    const scoreElement = document.getElementById('score');
    const timerElement = document.getElementById('timer');
    const correctElement = document.getElementById('correct');
    const incorrectElement = document.getElementById('incorrect');
    const finalScoreElement = document.getElementById('final-score');
    const finalCorrectElement = document.getElementById('final-correct');
    const finalIncorrectElement = document.getElementById('final-incorrect');
    const modePlayed = document.getElementById('mode-played');
    const categoryPlayed = document.getElementById('category-played');
    const levelPlayed = document.getElementById('level-played');
    
    // DOM elements - navigation info
    const selectedModeElement = document.getElementById('selected-mode');
    const selectedModeLevelElement = document.getElementById('selected-mode-level');
    const selectedCategoryElement = document.getElementById('selected-category');
    
    // Level difficulty settings for standard mode
    const standardDifficulty = {
        addition: {
            easy: { min: 1, max: 10 },
            medium: { min: 10, max: 50 },
            hard: { min: 50, max: 100 }
        },
        subtraction: {
            easy: { min: 1, max: 10 },
            medium: { min: 10, max: 50 },
            hard: { min: 50, max: 100 }
        },
        multiplication: {
            easy: { min: 1, max: 10 },
            medium: { min: 5, max: 15 },
            hard: { min: 10, max: 20 }
        },
        division: {
            easy: { min: 1, max: 10 },
            medium: { min: 5, max: 15 },
            hard: { min: 10, max: 20 }
        }
    };
    
    // Level difficulty settings for integer mode (including negative numbers)
    const integerDifficulty = {
        addition: {
            easy: { min: -10, max: 10 },
            medium: { min: -30, max: 30 },
            hard: { min: -50, max: 50 }
        },
        subtraction: {
            easy: { min: -10, max: 10 },
            medium: { min: -30, max: 30 },
            hard: { min: -50, max: 50 }
        },
        multiplication: {
            easy: { min: -10, max: 10 },
            medium: { min: -15, max: 15 },
            hard: { min: -20, max: 20 }
        },
        division: {
            easy: { min: -10, max: 10 },
            medium: { min: -15, max: 15 },
            hard: { min: -20, max: 20 }
        }
    };

    // Initialize event listeners
    function initGame() {
        // Mode selection
        modeButtons.forEach(button => {
            button.addEventListener('click', () => selectMode(button.dataset.mode));
        });
        
        // Category selection
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => selectCategory(button.dataset.category));
        });
        
        // Level selection
        levelButtons.forEach(button => {
            button.addEventListener('click', () => selectLevel(button.dataset.level));
        });
        
        // Navigation buttons
        backToModeBtn.addEventListener('click', goBackToModeScreen);
        backToCategoryBtn.addEventListener('click', goBackToCategoryScreen);
        exitGameBtn.addEventListener('click', exitGame);
        
        // Game controls
        submitButton.addEventListener('click', checkAnswer);
        answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkAnswer();
            }
        });
        
        // Result screen buttons
        playAgainButton.addEventListener('click', () => {
            // Start with the same settings
            startGame();
        });
        
        backToMenuButton.addEventListener('click', goBackToModeScreen);
    }
    
    // Screen navigation functions
    function showScreen(screen) {
        // Hide all screens
        modeScreen.classList.remove('active');
        categoryScreen.classList.remove('active');
        levelScreen.classList.remove('active');
        gameScreen.classList.remove('active');
        resultScreen.classList.remove('active');
        
        // Show the selected screen
        screen.classList.add('active');
    }
    
    function goBackToModeScreen() {
        clearInterval(state.timer);
        showScreen(modeScreen);
    }
    
    function goBackToCategoryScreen() {
        showScreen(categoryScreen);
    }
    
    function exitGame() {
        clearInterval(state.timer);
        showScreen(modeScreen);
    }

    // Select mode function
    function selectMode(mode) {
        state.mode = mode;
        
        // Update UI
        modeButtons.forEach(button => {
            button.classList.remove('selected');
            if (button.dataset.mode === mode) {
                button.classList.add('selected');
            }
        });
        
        // Update navigation info
        const modeText = mode === 'standard' ? 'Standard Math' : 'Integer Math';
        selectedModeElement.textContent = modeText;
        selectedModeLevelElement.textContent = modeText;
        
        // Move to category screen
        showScreen(categoryScreen);
    }

    // Select category function
    function selectCategory(category) {
        state.category = category;
        
        // Update UI
        categoryButtons.forEach(button => {
            button.classList.remove('selected');
            if (button.dataset.category === category) {
                button.classList.add('selected');
            }
        });
        
        // Update navigation info
        selectedCategoryElement.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        
        // Move to level screen
        showScreen(levelScreen);
    }
    
    // Select level function
    function selectLevel(level) {
        if (!state.category) {
            alert('Please select a category first!');
            return;
        }
        
        state.level = level;
        
        // Update UI
        levelButtons.forEach(button => {
            button.classList.remove('selected');
            if (button.dataset.level === level) {
                button.classList.add('selected');
            }
        });
        
        startGame();
    }

    // Start the game
    function startGame() {
        // Reset game state
        state.score = 0;
        state.correct = 0;
        state.incorrect = 0;
        state.timeLeft = 30;
        
        // Update UI
        scoreElement.textContent = state.score;
        timerElement.textContent = state.timeLeft;
        correctElement.textContent = state.correct;
        incorrectElement.textContent = state.incorrect;
        
        // Switch screens
        showScreen(gameScreen);
        
        // Generate first question
        generateQuestion();
        
        // Focus on input
        answerInput.value = '';
        answerInput.focus();
        
        // Start timer
        startTimer();
    }
    
    // Generate a new question based on selected category, level, and mode
    function generateQuestion() {
        let question, answer;
        
        if (state.category === 'mixed') {
            const categories = ['addition', 'subtraction', 'multiplication', 'division'];
            state.currentCategory = categories[Math.floor(Math.random() * categories.length)];
        } else {
            state.currentCategory = state.category;
        }
        
        // Determine difficulty settings based on the current mode
        const difficultySettings = state.mode === 'standard' ? standardDifficulty : integerDifficulty;
        const difficulty = difficultySettings[state.currentCategory][state.level];
        
        switch (state.currentCategory) {
            case 'addition':
                const a = getRandomNumber(difficulty.min, difficulty.max);
                const b = getRandomNumber(difficulty.min, difficulty.max);
                question = formatQuestion(`${a} + ${b} = ?`);
                answer = a + b;
                break;
                
            case 'subtraction':
                let x = getRandomNumber(difficulty.min, difficulty.max);
                let y = getRandomNumber(difficulty.min, difficulty.max);
                
                // For standard mode, ensure x >= y for positive results only
                if (state.mode === 'standard' && x < y) {
                    [x, y] = [y, x];
                }
                
                question = formatQuestion(`${x} - ${y} = ?`);
                answer = x - y;
                break;
                
            case 'multiplication':
                const m = getRandomNumber(difficulty.min, difficulty.max);
                const n = getRandomNumber(difficulty.min, difficulty.max);
                question = formatQuestion(`${m} × ${n} = ?`);
                answer = m * n;
                break;
                
            case 'division':
                // Generate a division problem with a whole number answer
                if (state.mode === 'integer') {
                    // For integer mode, create divisible integer pairs
                    let divisor, dividend;
                    divisor = getRandomNumber(difficulty.min, difficulty.max);
                    // Avoid division by zero
                    if (divisor === 0) divisor = 1;
                    
                    const quotient = getRandomNumber(difficulty.min, difficulty.max);
                    dividend = divisor * quotient;
                    
                    question = formatQuestion(`${dividend} ÷ ${divisor} = ?`);
                    answer = quotient;
                } else {
                    // Standard mode - positive only
                    const divisor = getRandomNumber(1, difficulty.max); // Avoid zero divisor
                    const quotient = getRandomNumber(1, difficulty.max);
                    const dividend = divisor * quotient;
                    
                    question = formatQuestion(`${dividend} ÷ ${divisor} = ?`);
                    answer = quotient;
                }
                break;
        }
        
        state.currentQuestion = { question, answer };
        questionElement.textContent = question;
    }
    
    // Format question with proper negative number display - UPDATED
    function formatQuestion(questionText) {
        // Replace " + -" with " - " for cleaner display
        questionText = questionText.replace(/\+ -/g, "- ");
        
        // Replace " - -" with " + " for cleaner display
        questionText = questionText.replace(/- -/g, "+ ");
        
        return questionText;
    }
    
    // Check the player's answer
    function checkAnswer() {
        const userAnswer = parseInt(answerInput.value);
        
        // Check if input is empty or not a number
        if (isNaN(userAnswer)) {
            return;
        }
        
        const correctAnswer = state.currentQuestion.answer;
        const isCorrect = userAnswer === correctAnswer;
        
        // Add feedback
        let feedback = document.querySelector('.feedback');
        
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'feedback';
            gameScreen.insertBefore(feedback, document.querySelector('.question-container'));
        }
        
        if (isCorrect) {
            state.score += getPointsForLevel(state.level);
            state.correct++;
            feedback.className = 'feedback correct';
            feedback.textContent = 'Correct!';
        } else {
            state.incorrect++;
            feedback.className = 'feedback incorrect';
            feedback.textContent = `Wrong! Correct answer: ${correctAnswer}`;
        }
        
        // Update UI
        scoreElement.textContent = state.score;
        correctElement.textContent = state.correct;
        incorrectElement.textContent = state.incorrect;
        
        // Clear input and generate new question
        answerInput.value = '';
        answerInput.focus();
        
        // Remove feedback after a delay
        setTimeout(() => {
            feedback.className = 'feedback';
            feedback.textContent = '';
            generateQuestion();
        }, 1000);
    }
    
    // Get points based on level difficulty
    function getPointsForLevel(level) {
        switch (level) {
            case 'easy': return 1;
            case 'medium': return 2;
            case 'hard': return 3;
            default: return 1;
        }
    }
    
    // Start countdown timer
    function startTimer() {
        clearInterval(state.timer);
        
        state.timer = setInterval(() => {
            state.timeLeft--;
            timerElement.textContent = state.timeLeft;
            
            if (state.timeLeft <= 0) {
                clearInterval(state.timer);
                endGame();
            }
        }, 1000);
    }
    
    // End the game
    function endGame() {
        clearInterval(state.timer);
        
        // Update final results
        finalScoreElement.textContent = state.score;
        finalCorrectElement.textContent = state.correct;
        finalIncorrectElement.textContent = state.incorrect;
        
        // Display mode and category info
        modePlayed.textContent = state.mode === 'standard' ? 'Standard Math' : 'Integer Math';
        categoryPlayed.textContent = state.category === 'mixed' ? 'Mixed' : 
            state.category.charAt(0).toUpperCase() + state.category.slice(1);
        levelPlayed.textContent = state.level.charAt(0).toUpperCase() + state.level.slice(1);
        
        // Switch to result screen
        showScreen(resultScreen);
    }
    
    // Helper function to generate random number within range (inclusive)
    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // Initialize game
    initGame();
});