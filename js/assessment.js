// ============================================================
// ASSESSMENT ENGINE — Grading, Submission, Student Profile
// ============================================================

// >>> PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE <<<
var GOOGLE_SCRIPT_URL = '';

// ===== STUDENT PROFILE =====

function getStudentProfile() {
    var saved = localStorage.getItem('ba-student-profile');
    return saved ? JSON.parse(saved) : null;
}

function saveStudentProfile(profile) {
    localStorage.setItem('ba-student-profile', JSON.stringify(profile));
    updateProfileButton();
}

function updateProfileButton() {
    var btn = document.getElementById('profileBtn');
    if (!btn) return;
    var profile = getStudentProfile();
    if (profile && profile.name) {
        btn.innerHTML = '<i class="fas fa-user-check"></i> ' + profile.name.split(' ')[0];
        btn.classList.add('has-profile');
    } else {
        btn.innerHTML = '<i class="fas fa-user"></i> Register';
        btn.classList.remove('has-profile');
    }
}

function showProfileModal(onComplete) {
    var profile = getStudentProfile() || {};
    var modal = document.getElementById('profileModal');
    if (!modal) return;

    document.getElementById('profileName').value = profile.name || '';
    document.getElementById('profileEmail').value = profile.email || '';
    document.getElementById('profileRoll').value = profile.rollNumber || '';
    document.getElementById('profileSection').value = profile.section || '';

    modal.style.display = 'flex';
    modal._onComplete = onComplete || null;

    // Focus first empty field
    if (!profile.name) document.getElementById('profileName').focus();
    else if (!profile.email) document.getElementById('profileEmail').focus();
    else document.getElementById('profileName').focus();
}

function closeProfileModal() {
    var modal = document.getElementById('profileModal');
    if (modal) modal.style.display = 'none';
}

function saveProfileFromModal() {
    var name = document.getElementById('profileName').value.trim();
    var email = document.getElementById('profileEmail').value.trim();
    var roll = document.getElementById('profileRoll').value.trim();
    var section = document.getElementById('profileSection').value.trim();

    if (!name || !email || !roll || !section) {
        alert('Please fill in all fields.');
        return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    var profile = { name: name, email: email, rollNumber: roll, section: section };
    saveStudentProfile(profile);
    closeProfileModal();

    if (document.getElementById('profileModal')._onComplete) {
        document.getElementById('profileModal')._onComplete(profile);
    }
}

// ===== SUBMISSION TRACKING =====

function getSubmissionStatus() {
    var saved = localStorage.getItem('ba-submissions');
    return saved ? JSON.parse(saved) : {};
}

function markTopicSubmitted(topic, submissionId) {
    var status = getSubmissionStatus();
    status[topic] = { submitted: true, id: submissionId, time: new Date().toISOString() };
    localStorage.setItem('ba-submissions', JSON.stringify(status));
    updateSidebarStatus();
}

function updateSidebarStatus() {
    var status = getSubmissionStatus();
    document.querySelectorAll('.menu-item[data-topic]').forEach(function(item) {
        var topic = item.getAttribute('data-topic');
        var badge = item.querySelector('.submit-badge');
        if (status[topic] && status[topic].submitted) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'submit-badge';
                badge.innerHTML = '<i class="fas fa-check-circle"></i>';
                item.appendChild(badge);
            }
        }
    });
}

// ===== MCQ GRADING =====

function gradeAssessment(topic) {
    var questions = ASSESSMENT_DATA[topic];
    if (!questions) return null;

    var mcqs = questions.mcqs;
    var score = 0;
    var total = mcqs.length;
    var answers = {};

    for (var i = 0; i < mcqs.length; i++) {
        var selected = document.querySelector('input[name="mcq-' + topic + '-' + i + '"]:checked');
        var answer = selected ? parseInt(selected.value) : -1;
        var correct = mcqs[i].correct;
        answers['q' + (i + 1)] = {
            selected: answer,
            correct: correct,
            isCorrect: answer === correct,
            question: mcqs[i].question
        };
        if (answer === correct) score++;
    }

    return { score: score, total: total, answers: answers };
}

function showMCQFeedback(topic) {
    var result = gradeAssessment(topic);
    if (!result) return;

    var mcqs = ASSESSMENT_DATA[topic].mcqs;
    for (var i = 0; i < mcqs.length; i++) {
        var feedbackEl = document.getElementById('mcq-feedback-' + topic + '-' + i);
        if (!feedbackEl) continue;

        var selected = document.querySelector('input[name="mcq-' + topic + '-' + i + '"]:checked');
        if (!selected) {
            feedbackEl.className = 'quiz-feedback incorrect';
            feedbackEl.style.display = 'block';
            feedbackEl.textContent = 'Please select an answer.';
            continue;
        }

        if (result.answers['q' + (i + 1)].isCorrect) {
            feedbackEl.className = 'quiz-feedback correct';
            feedbackEl.textContent = 'Correct! ' + (mcqs[i].explanation || '');
        } else {
            feedbackEl.className = 'quiz-feedback incorrect';
            var correctOption = mcqs[i].options[mcqs[i].correct];
            feedbackEl.textContent = 'Incorrect. The correct answer is: ' + correctOption + '. ' + (mcqs[i].explanation || '');
        }
        feedbackEl.style.display = 'block';
    }

    // Show score summary
    var scoreEl = document.getElementById('mcq-score-' + topic);
    if (scoreEl) {
        var pct = Math.round((result.score / result.total) * 100);
        scoreEl.innerHTML = '<div class="score-display ' + (pct >= 60 ? 'pass' : 'fail') + '">' +
            '<i class="fas ' + (pct >= 60 ? 'fa-check-circle' : 'fa-times-circle') + '"></i> ' +
            'Score: ' + result.score + '/' + result.total + ' (' + pct + '%)' +
            '</div>';
        scoreEl.style.display = 'block';
    }
}

// ===== COLLECT ALL ASSESSMENT DATA =====

function collectAssessmentData(topic) {
    // MCQ
    var mcqResult = gradeAssessment(topic);

    // Code submissions
    var codeSubmissions = {};
    var codeAreas = document.querySelectorAll('.assessment-code-area[data-topic="' + topic + '"]');
    codeAreas.forEach(function(area) {
        var id = area.getAttribute('data-id');
        codeSubmissions[id] = area.value;
    });

    // Interpretation answers
    var interpAnswers = {};
    var interpAreas = document.querySelectorAll('.assessment-interp-area[data-topic="' + topic + '"]');
    interpAreas.forEach(function(area) {
        var id = area.getAttribute('data-id');
        interpAnswers[id] = area.value;
    });

    return {
        mcqScore: mcqResult ? mcqResult.score : 0,
        mcqTotal: mcqResult ? mcqResult.total : 0,
        mcqAnswers: mcqResult ? mcqResult.answers : {},
        codeSubmissions: codeSubmissions,
        interpretationAnswers: interpAnswers
    };
}

// ===== SUBMIT ASSESSMENT =====

function submitAssessment(topic) {
    var profile = getStudentProfile();
    if (!profile || !profile.name) {
        showProfileModal(function() { submitAssessment(topic); });
        return;
    }

    // Validate: at least MCQs attempted
    var mcqResult = gradeAssessment(topic);
    var unanswered = 0;
    if (mcqResult) {
        for (var key in mcqResult.answers) {
            if (mcqResult.answers[key].selected === -1) unanswered++;
        }
    }
    if (unanswered > 0) {
        if (!confirm('You have ' + unanswered + ' unanswered MCQ question(s). Submit anyway?')) return;
    }

    // Show MCQ feedback first
    showMCQFeedback(topic);

    // Collect data
    var assessmentData = collectAssessmentData(topic);
    var topicTitle = CONTENT[topic] ? CONTENT[topic].title : topic;

    var payload = {
        name: profile.name,
        email: profile.email,
        rollNumber: profile.rollNumber,
        section: profile.section,
        topic: topicTitle,
        mcqScore: assessmentData.mcqScore,
        mcqTotal: assessmentData.mcqTotal,
        mcqAnswers: assessmentData.mcqAnswers,
        codeSubmissions: assessmentData.codeSubmissions,
        interpretationAnswers: assessmentData.interpretationAnswers
    };

    var submitBtn = document.getElementById('submit-btn-' + topic);
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    }

    var statusEl = document.getElementById('submit-status-' + topic);

    if (!GOOGLE_SCRIPT_URL) {
        // No URL configured — show local success + instructions
        if (statusEl) {
            statusEl.innerHTML = '<div class="submit-success">' +
                '<i class="fas fa-exclamation-triangle"></i> ' +
                '<strong>Google Apps Script URL not configured.</strong><br>' +
                'Your assessment has been graded locally (MCQ Score: ' + assessmentData.mcqScore + '/' + assessmentData.mcqTotal + ').<br>' +
                'To enable submission to Google Drive, the instructor needs to set the GOOGLE_SCRIPT_URL in assessment.js.<br>' +
                'See <code>google-apps-script.js</code> for setup instructions.</div>';
            statusEl.style.display = 'block';
        }
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Assessment';
        }
        return;
    }

    // Send to Google Apps Script
    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(function() {
        // no-cors means we can't read the response, but the request was sent
        markTopicSubmitted(topic, 'submitted');
        if (statusEl) {
            statusEl.innerHTML = '<div class="submit-success">' +
                '<i class="fas fa-check-circle"></i> ' +
                '<strong>Assessment submitted successfully!</strong><br>' +
                'MCQ Score: ' + assessmentData.mcqScore + '/' + assessmentData.mcqTotal +
                ' (' + Math.round(assessmentData.mcqScore / assessmentData.mcqTotal * 100) + '%)<br>' +
                'Your responses have been saved to the instructor\'s Google Drive.</div>';
            statusEl.style.display = 'block';
        }
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Submitted';
            submitBtn.classList.add('submitted');
        }
    })
    .catch(function(err) {
        if (statusEl) {
            statusEl.innerHTML = '<div class="submit-error">' +
                '<i class="fas fa-times-circle"></i> ' +
                '<strong>Submission failed.</strong> ' + err.message +
                '<br>Please try again or contact your instructor.</div>';
            statusEl.style.display = 'block';
        }
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Retry Submit';
        }
    });
}

// ===== RENDER ASSESSMENT HTML =====

function renderAssessmentHTML(topic) {
    var data = ASSESSMENT_DATA[topic];
    if (!data) return '<p>Assessment not available for this topic.</p>';

    var html = '<div class="content-section">';
    html += '<h2><i class="fas fa-clipboard-check"></i> Assessment</h2>';
    html += '<p>Complete all sections below and click <strong>Submit Assessment</strong> at the bottom. Your MCQs will be auto-graded and all responses sent to the instructor.</p>';

    // Student info bar
    var profile = getStudentProfile();
    if (profile && profile.name) {
        html += '<div class="student-info-bar">' +
            '<i class="fas fa-user-circle"></i> ' +
            '<strong>' + escapeHtml(profile.name) + '</strong> | ' +
            escapeHtml(profile.email) + ' | ' +
            'Roll: ' + escapeHtml(profile.rollNumber) + ' | ' +
            'Section: ' + escapeHtml(profile.section) +
            ' <button class="btn-edit-profile" onclick="showProfileModal()">Edit</button>' +
            '</div>';
    } else {
        html += '<div class="student-info-bar warning">' +
            '<i class="fas fa-exclamation-circle"></i> ' +
            'Please <button class="btn-edit-profile" onclick="showProfileModal()">register your details</button> before submitting.' +
            '</div>';
    }

    // Section 1: MCQs
    html += '<div class="assessment-section">';
    html += '<h3><i class="fas fa-question-circle"></i> Part A: Multiple Choice Questions</h3>';
    html += '<p class="section-desc">Select the best answer for each question. (' + data.mcqs.length + ' questions)</p>';

    for (var i = 0; i < data.mcqs.length; i++) {
        var q = data.mcqs[i];
        html += '<div class="quiz-question">';
        html += '<h4>Q' + (i + 1) + '. ' + q.question + '</h4>';
        for (var j = 0; j < q.options.length; j++) {
            html += '<label class="quiz-option">' +
                '<input type="radio" name="mcq-' + topic + '-' + i + '" value="' + j + '"> ' +
                q.options[j] + '</label>';
        }
        html += '<div class="quiz-feedback" id="mcq-feedback-' + topic + '-' + i + '"></div>';
        html += '</div>';
    }

    html += '<div id="mcq-score-' + topic + '" style="display:none"></div>';
    html += '<button class="btn-check-all" onclick="showMCQFeedback(\'' + topic + '\')"><i class="fas fa-check-double"></i> Check My Answers</button>';
    html += '</div>';

    // Section 2: Code Submission
    html += '<div class="assessment-section">';
    html += '<h3><i class="fas fa-code"></i> Part B: Code Submission</h3>';
    html += '<p class="section-desc">Write your code solution for each problem below. You may use Python or R.</p>';

    for (var c = 0; c < data.codeProblems.length; c++) {
        var cp = data.codeProblems[c];
        html += '<div class="code-problem">';
        html += '<h4>' + cp.title + '</h4>';
        html += '<p>' + cp.prompt + '</p>';
        html += '<textarea class="assessment-code-area" data-topic="' + topic + '" data-id="code-' + c + '" ' +
            'placeholder="Write your code here..." spellcheck="false">' + (cp.starter || '') + '</textarea>';
        html += '</div>';
    }
    html += '</div>';

    // Section 3: Interpretation
    html += '<div class="assessment-section">';
    html += '<h3><i class="fas fa-pen-fancy"></i> Part C: Business Interpretation</h3>';
    html += '<p class="section-desc">Provide a thoughtful written analysis for each scenario.</p>';

    for (var t = 0; t < data.interpretations.length; t++) {
        var ip = data.interpretations[t];
        html += '<div class="interp-problem">';
        html += '<h4>' + ip.title + '</h4>';
        html += '<p>' + ip.prompt + '</p>';
        html += '<textarea class="assessment-interp-area" data-topic="' + topic + '" data-id="interp-' + t + '" ' +
            'placeholder="Type your analysis here..." rows="6"></textarea>';
        html += '</div>';
    }
    html += '</div>';

    // Submit button
    html += '<div class="assessment-submit">';
    html += '<div id="submit-status-' + topic + '" style="display:none"></div>';
    html += '<button class="btn-submit-assessment" id="submit-btn-' + topic + '" onclick="submitAssessment(\'' + topic + '\')">' +
        '<i class="fas fa-paper-plane"></i> Submit Assessment</button>';
    html += '<p class="submit-note">Your MCQ answers will be auto-graded. Code and interpretation responses will be reviewed by the instructor.</p>';
    html += '</div>';

    html += '</div>';
    return html;
}


// ============================================================
// ASSESSMENT DATA — 5 questions + 2 code + 2 interpretation per topic
// ============================================================

var ASSESSMENT_DATA = {

'simple-regression': {
    mcqs: [
        {
            question: 'In simple linear regression, what does the coefficient of determination (R²) represent?',
            options: [
                'The slope of the regression line',
                'The proportion of variance in Y explained by X',
                'The correlation between X and Y',
                'The standard error of the estimate'
            ],
            correct: 1,
            explanation: 'R² measures the proportion of total variance in the dependent variable that is explained by the independent variable.'
        },
        {
            question: 'If the slope coefficient (β₁) in a regression of Sales on Advertising is 5.2, what does this mean?',
            options: [
                'Sales are 5.2 times the advertising spend',
                'A $1 increase in advertising is associated with a $5.20 increase in sales',
                'The correlation between sales and advertising is 0.52',
                'R² is 52%'
            ],
            correct: 1,
            explanation: 'The slope represents the expected change in Y for a one-unit change in X, holding everything else constant.'
        },
        {
            question: 'Which of the following is NOT an assumption of simple linear regression?',
            options: [
                'The relationship between X and Y is linear',
                'Residuals are normally distributed',
                'The variance of residuals is constant (homoscedasticity)',
                'The dependent variable must be categorical'
            ],
            correct: 3,
            explanation: 'In simple linear regression, the dependent variable must be continuous, not categorical. Categorical outcomes require logistic regression.'
        },
        {
            question: 'A p-value of 0.003 for the slope coefficient means:',
            options: [
                'The model is 99.7% accurate',
                'There is a 0.3% chance of observing this relationship if there were truly no relationship',
                'R² is 0.997',
                'The slope is 0.003'
            ],
            correct: 1,
            explanation: 'The p-value represents the probability of observing the test statistic (or more extreme) under the null hypothesis that β₁ = 0.'
        },
        {
            question: 'If a regression model has an R² of 0.85, which statement is correct?',
            options: [
                '85% of data points fall exactly on the regression line',
                '85% of the variance in the dependent variable is explained by the independent variable',
                'The correlation coefficient is 0.85',
                'The model makes 85% accurate predictions'
            ],
            correct: 1,
            explanation: 'R² = 0.85 means 85% of the variability in Y is accounted for by the linear relationship with X.'
        }
    ],
    codeProblems: [
        {
            title: 'Problem 1: E-commerce Conversion',
            prompt: 'An e-commerce company has data on website traffic (thousands of visitors/month) and sales ($K/month): Traffic = [5, 10, 15, 20, 25, 30, 35, 40], Sales = [12, 28, 35, 52, 60, 75, 82, 95]. Build a simple linear regression model, report the equation, R², and predict sales for 45K visitors.',
            starter: '# Write your code here (Python or R)\n'
        },
        {
            title: 'Problem 2: Residual Analysis',
            prompt: 'Using the same data above, calculate the residuals for each observation. Which month has the largest residual (worst prediction)? Is there any pattern in the residuals that would suggest a violation of assumptions?',
            starter: '# Write your code here\n'
        }
    ],
    interpretations: [
        {
            title: 'Scenario: Marketing Budget Decision',
            prompt: 'A company\'s regression model shows: Revenue = 50 + 4.5 × AdvertisingSpend (R² = 0.78, p < 0.001). The CMO wants to increase the ad budget from $20K to $30K. (a) What is the expected revenue increase? (b) What are the limitations of using this model for this decision? (c) What other factors should be considered?'
        },
        {
            title: 'Scenario: Correlation vs Causation',
            prompt: 'A regression of "ice cream sales" on "number of drownings" shows a positive significant relationship (R² = 0.72, p = 0.001). A junior analyst concludes that ice cream sales cause drownings. Write a 3-4 sentence response explaining why this conclusion is flawed and what is likely happening.'
        }
    ]
},

'multiple-regression': {
    mcqs: [
        {
            question: 'What is the primary advantage of Adjusted R² over R²?',
            options: [
                'It is always higher than R²',
                'It penalizes for adding irrelevant predictors',
                'It measures causation instead of correlation',
                'It works better with small sample sizes'
            ],
            correct: 1,
            explanation: 'Adjusted R² decreases when an added variable does not improve the model sufficiently, preventing overfitting from adding irrelevant predictors.'
        },
        {
            question: 'A VIF (Variance Inflation Factor) of 8.5 for a predictor indicates:',
            options: [
                'The variable is not significant',
                'The variable has strong multicollinearity with other predictors',
                'The variable should be transformed',
                'The regression has high R²'
            ],
            correct: 1,
            explanation: 'VIF > 5 indicates concerning multicollinearity. VIF of 8.5 means this predictor shares substantial variance with other predictors.'
        },
        {
            question: 'In a model with dummy variables for a categorical variable with 4 categories, how many dummy variables should be included?',
            options: [
                '4',
                '3',
                '2',
                '1'
            ],
            correct: 1,
            explanation: 'For k categories, use k-1 dummy variables. The omitted category serves as the reference group.'
        },
        {
            question: 'If adding variable X₃ to a model with X₁ and X₂ increases R² from 0.75 to 0.76 but decreases Adjusted R² from 0.73 to 0.72, what should you do?',
            options: [
                'Keep X₃ because R² increased',
                'Remove X₃ because Adjusted R² decreased',
                'Add more variables to compensate',
                'Transform X₃ and try again'
            ],
            correct: 1,
            explanation: 'When Adjusted R² decreases, the added variable does not improve the model enough to justify its inclusion. R² will always increase with more variables.'
        },
        {
            question: 'An interaction term X₁ × X₂ in a regression model captures:',
            options: [
                'The combined effect of X₁ and X₂ on Y',
                'The correlation between X₁ and X₂',
                'How the effect of X₁ on Y changes depending on the level of X₂',
                'The multicollinearity between X₁ and X₂'
            ],
            correct: 2,
            explanation: 'An interaction term means the effect of one variable depends on the value of another — e.g., advertising might be more effective in certain regions.'
        }
    ],
    codeProblems: [
        {
            title: 'Problem 1: Car Price Model',
            prompt: 'Build a multiple regression to predict used car prices ($K) from: Mileage (K miles) = [15,30,45,60,80,10,25,50,70,90], Age (years) = [1,2,3,4,5,1,2,3,5,6], EngineSize (liters) = [1.6,2.0,1.8,2.5,2.0,1.4,2.2,1.6,2.5,1.8], Price = [28,22,18,15,10,30,24,19,12,8]. Report the regression equation, Adjusted R², check VIF, and predict price for a 3-year-old car with 40K miles and 2.0L engine.',
            starter: '# Write your code here\n'
        }
    ],
    interpretations: [
        {
            title: 'Scenario: Marketing Mix Optimization',
            prompt: 'Your marketing mix model shows: Sales = 100 + 8.2×TV + 12.5×Digital - 3.1×Price + 5.0×Season_Q4. TV and Digital are in $K spent, Price is unit price, Season_Q4 is a dummy. (a) Which channel has higher ROI? (b) What happens to sales in Q4? (c) If budget is limited, where would you allocate the next $10K?'
        },
        {
            title: 'Scenario: Multicollinearity Problem',
            prompt: 'In a salary prediction model with "years of experience" and "age" as predictors, both have VIF > 8. The p-values are 0.15 and 0.22 (both insignificant), yet the overall model F-test is highly significant (p < 0.001). Explain what is happening and recommend a solution.'
        }
    ]
},

'logistic-regression': {
    mcqs: [
        {
            question: 'Why can\'t we use linear regression for binary outcomes?',
            options: [
                'Linear regression is too slow for binary data',
                'Linear regression can predict values outside [0,1], which are invalid probabilities',
                'Binary data has no variance',
                'Linear regression requires at least 3 categories'
            ],
            correct: 1,
            explanation: 'Linear regression can produce predicted values below 0 or above 1, which are meaningless as probabilities.'
        },
        {
            question: 'An odds ratio of 2.5 for variable X means:',
            options: [
                'The probability increases by 2.5 for each unit of X',
                'A one-unit increase in X multiplies the odds of the event by 2.5',
                'The event is 2.5 times more likely than not',
                'X explains 25% of the variance'
            ],
            correct: 1,
            explanation: 'The odds ratio is the multiplicative change in odds for a one-unit increase in the predictor.'
        },
        {
            question: 'In a confusion matrix, precision is defined as:',
            options: [
                'TP / (TP + FN)',
                'TP / (TP + FP)',
                '(TP + TN) / Total',
                'TN / (TN + FP)'
            ],
            correct: 1,
            explanation: 'Precision = TP/(TP+FP) measures how many of the predicted positives are actually positive.'
        },
        {
            question: 'When would you lower the classification threshold from 0.5 to 0.3?',
            options: [
                'When you want higher precision',
                'When false negatives are more costly than false positives',
                'When the model has low R²',
                'When the data is imbalanced in favor of positives'
            ],
            correct: 1,
            explanation: 'Lowering the threshold catches more true positives (higher recall) at the cost of more false positives, which is preferred when missing a positive case is expensive.'
        },
        {
            question: 'An AUC-ROC of 0.92 indicates:',
            options: [
                'The model is 92% accurate',
                'The model has excellent discrimination between classes',
                'The model explains 92% of variance',
                '92% of predictions are correct at threshold 0.5'
            ],
            correct: 1,
            explanation: 'AUC-ROC measures the model\'s ability to distinguish between classes. 0.9-1.0 is considered excellent discrimination.'
        }
    ],
    codeProblems: [
        {
            title: 'Problem 1: Customer Purchase Prediction',
            prompt: 'Predict whether a customer will purchase (1/0) based on: Age = [22,35,45,28,52,60,33,41,55,25,38,48,30,42,58], Income($K) = [25,45,60,30,80,70,50,55,75,28,48,65,35,58,85], WebVisits = [8,5,3,7,2,1,4,3,2,9,5,3,6,4,1], Purchased = [0,0,1,0,1,1,0,1,1,0,0,1,0,1,1]. Build a logistic regression, report odds ratios, and predict purchase probability for a 40-year-old with $55K income and 4 web visits.',
            starter: '# Write your code here\n'
        }
    ],
    interpretations: [
        {
            title: 'Scenario: Churn Prevention Budget',
            prompt: 'Your churn model identifies 500 customers as "high risk" (predicted probability > 0.6). A retention offer costs $50 per customer, and losing a customer costs $500 in lifetime value. If the model has 80% precision at this threshold, calculate the expected ROI of the retention campaign. Should the company proceed?'
        },
        {
            title: 'Scenario: Threshold Selection',
            prompt: 'A fraud detection model has the following performance at different thresholds: At 0.3: Recall=95%, Precision=20%. At 0.5: Recall=75%, Precision=55%. At 0.7: Recall=45%, Precision=85%. If each missed fraud costs $10,000 and each false alarm investigation costs $200, which threshold minimizes total expected cost? Show your reasoning.'
        }
    ]
},

'factor-analysis': {
    mcqs: [
        {
            question: 'What does the Kaiser criterion suggest for retaining factors?',
            options: [
                'Retain factors with eigenvalue > 0',
                'Retain factors with eigenvalue > 1',
                'Retain factors explaining > 50% variance',
                'Retain factors with loadings > 0.5'
            ],
            correct: 1,
            explanation: 'Kaiser criterion retains factors with eigenvalue > 1, as they explain more variance than a single original variable.'
        },
        {
            question: 'Varimax rotation is used to:',
            options: [
                'Maximize the total variance explained',
                'Maximize the simplicity of the factor structure (clean loadings)',
                'Remove correlated factors',
                'Increase the number of factors'
            ],
            correct: 1,
            explanation: 'Varimax maximizes the sum of squared loadings within each factor, making each variable load high on one factor and low on others.'
        },
        {
            question: 'A variable with a communality of 0.25 means:',
            options: [
                'It loads on exactly 0.25 factors',
                'Only 25% of its variance is explained by the retained factors',
                'It has 25% reliability',
                'It should be the reference variable'
            ],
            correct: 1,
            explanation: 'Low communality means the factor solution doesn\'t capture most of this variable\'s variance. Consider removing it.'
        },
        {
            question: 'KMO (Kaiser-Meyer-Olkin) measure of 0.82 indicates:',
            options: [
                'The sample size is too small',
                'The data is suitable for factor analysis',
                'There are 82 significant factors',
                'The model explains 82% variance'
            ],
            correct: 1,
            explanation: 'KMO > 0.6 is acceptable; > 0.8 is meritorious. It measures sampling adequacy for factor analysis.'
        },
        {
            question: 'When should you use Promax rotation instead of Varimax?',
            options: [
                'When you want uncorrelated factors',
                'When you expect the underlying factors to be correlated with each other',
                'When you have fewer than 5 variables',
                'When the sample size is small'
            ],
            correct: 1,
            explanation: 'Promax allows oblique (correlated) factors, which is more realistic in business/psychology where underlying dimensions often overlap.'
        }
    ],
    codeProblems: [
        {
            title: 'Problem 1: Brand Perception Analysis',
            prompt: 'A company surveyed 150 customers on 6 brand attributes (1-7 scale). Generate simulated data with 2 underlying factors (Brand Image: Innovative, Modern, Exciting; Value: Reliable, Affordable, Quality). Run PCA, determine the number of factors using eigenvalues, apply varimax rotation, and interpret the factors.',
            starter: '# Write your code here\n'
        }
    ],
    interpretations: [
        {
            title: 'Scenario: Survey Reduction',
            prompt: 'Your company\'s annual employee engagement survey has 40 questions. A factor analysis reveals 5 factors explaining 72% of variance. Management wants to reduce the survey to 15 questions. (a) How would you select which questions to keep? (b) What are the risks of reducing the survey? (c) How would you validate that the shorter survey captures the same constructs?'
        },
        {
            title: 'Scenario: Naming Factors',
            prompt: 'A factor analysis of customer satisfaction data produces a factor where the following variables load highest: "Website speed" (0.82), "Mobile app usability" (0.78), "Search functionality" (0.71), "Checkout process" (0.65), "Page load time" (0.61). Propose a name for this factor and explain why. What business actions would you recommend based on low scores on this factor?'
        }
    ]
},

'cluster-analysis': {
    mcqs: [
        {
            question: 'In K-Means clustering, what does the "elbow" in the elbow method represent?',
            options: [
                'The maximum number of possible clusters',
                'The point where adding more clusters gives diminishing returns in reducing WCSS',
                'The average cluster size',
                'The minimum distance between centroids'
            ],
            correct: 1,
            explanation: 'The elbow is where the rate of WCSS decrease slows down markedly, suggesting additional clusters aren\'t adding much value.'
        },
        {
            question: 'Ward\'s linkage method minimizes:',
            options: [
                'The distance between cluster centroids',
                'The total within-cluster variance at each merge',
                'The number of clusters',
                'The maximum distance between any two points'
            ],
            correct: 1,
            explanation: 'Ward\'s method merges the pair of clusters that results in the smallest increase in total within-cluster variance.'
        },
        {
            question: 'Why is it important to standardize variables before clustering?',
            options: [
                'To make the algorithm run faster',
                'To ensure all variables contribute equally to distance calculations',
                'To remove outliers',
                'To reduce the number of clusters needed'
            ],
            correct: 1,
            explanation: 'Without standardization, variables with larger scales dominate distance calculations, distorting cluster assignments.'
        },
        {
            question: 'A silhouette score of 0.71 for a clustering solution means:',
            options: [
                'The clustering is poor',
                'Points are, on average, well-matched to their own cluster and poorly-matched to neighbors',
                '71% of points are correctly clustered',
                'There are 0.71 clusters per data point'
            ],
            correct: 1,
            explanation: 'Silhouette scores range from -1 to 1. Values > 0.5 indicate good structure; > 0.7 is strong clustering.'
        },
        {
            question: 'Which clustering method would you choose for a dataset with 100,000 customers?',
            options: [
                'Hierarchical with single linkage',
                'Hierarchical with Ward\'s method',
                'K-Means with multiple random starts',
                'Complete linkage hierarchical'
            ],
            correct: 2,
            explanation: 'K-Means scales well to large datasets (O(nkd) per iteration), while hierarchical methods are O(n²) or O(n³) and impractical for 100K+ points.'
        }
    ],
    codeProblems: [
        {
            title: 'Problem 1: Customer RFM Segmentation',
            prompt: 'Create an RFM dataset for 20 customers: Recency (days since last purchase, 1-365), Frequency (purchases/year, 1-50), Monetary (annual spend $, 100-5000). Standardize the data, run K-Means for K=2 through K=6, plot WCSS (as text output), choose optimal K, and profile each segment with business labels.',
            starter: '# Write your code here\n'
        }
    ],
    interpretations: [
        {
            title: 'Scenario: Segment Action Plan',
            prompt: 'K-Means analysis of your customer base reveals 4 segments: (1) "Champions" — recent, frequent, high spend (15% of customers, 45% of revenue), (2) "Loyalists" — frequent, medium spend (25%, 30%), (3) "At Risk" — previously frequent but not recent (20%, 15%), (4) "Dormant" — not recent, low frequency and spend (40%, 10%). Design a specific marketing action for each segment. What KPIs would you track for each?'
        },
        {
            title: 'Scenario: Hierarchical vs K-Means',
            prompt: 'Your team is debating whether to use hierarchical or K-Means clustering for segmenting 500 retail stores by performance metrics. One analyst argues for hierarchical because "it shows the full structure." Another prefers K-Means for "cleaner segments." (a) What are the pros and cons of each for this specific use case? (b) Can you use both? How? (c) What would you recommend and why?'
        }
    ]
}

}; // end ASSESSMENT_DATA
