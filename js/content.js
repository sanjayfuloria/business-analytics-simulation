// ============================================================
// BUSINESS ANALYTICS SIMULATION — ALL CONTENT
// ============================================================

// Store all code snippets separately to avoid template literal conflicts
const CODE_SNIPPETS = {};

CODE_SNIPPETS['slr-solved-1-python'] = [
'import numpy as np',
'from scipy import stats',
'',
'# Data',
'ad_spend = [10, 12, 15, 14, 18, 20, 22, 25, 23, 28, 30, 35]',
'sales = [100, 120, 140, 130, 160, 180, 190, 210, 200, 230, 250, 280]',
'',
'# Run Simple Linear Regression',
'slope, intercept, r_value, p_value, std_err = stats.linregress(ad_spend, sales)',
'',
'print(f"=== Simple Linear Regression Results ===")',
'print(f"Equation: Sales = {intercept:.2f} + {slope:.2f} * AdSpend")',
'print(f"\\nSlope (beta1): {slope:.4f}")',
'print(f"Intercept (beta0): {intercept:.4f}")',
'print(f"R-squared: {r_value**2:.4f}")',
'print(f"P-value: {p_value:.6f}")',
'print(f"Standard Error: {std_err:.4f}")',
'print(f"\\n=== Interpretation ===")',
'print(f"For every $1,000 increase in advertising,")',
'print(f"sales increase by ${slope:.2f}K (${slope*1000:.0f}).")',
'print(f"\\nThe model explains {r_value**2*100:.1f}% of the")',
'print(f"variation in sales revenue.")',
'print(f"\\nP-value = {p_value:.6f} < 0.05, so the")',
'print(f"relationship is statistically significant.")',
'print(f"\\n=== Prediction ===")',
'new_spend = 32',
'predicted_sales = intercept + slope * new_spend',
'print(f"If ad spend = $32K, predicted sales = ${predicted_sales:.1f}K")'
].join('\n');

CODE_SNIPPETS['slr-solved-1-r'] = [
'# Data',
'ad_spend <- c(10, 12, 15, 14, 18, 20, 22, 25, 23, 28, 30, 35)',
'sales <- c(100, 120, 140, 130, 160, 180, 190, 210, 200, 230, 250, 280)',
'',
'# Create data frame',
'df <- data.frame(ad_spend, sales)',
'',
'# Fit the model',
'model <- lm(sales ~ ad_spend, data = df)',
'',
'# Display results',
'cat("=== Simple Linear Regression Results ===\\n")',
'print(summary(model))',
'',
'cat("\\n=== Interpretation ===\\n")',
'cat(sprintf("Equation: Sales = %.2f + %.2f * AdSpend\\n",',
'    coef(model)[1], coef(model)[2]))',
'cat(sprintf("For every $1,000 increase in ad spend,\\n"))',
'cat(sprintf("sales increase by $%.2fK ($%.0f).\\n",',
'    coef(model)[2], coef(model)[2]*1000))',
'cat(sprintf("R-squared: %.4f\\n", summary(model)$r.squared))',
'',
'# Prediction',
'new_data <- data.frame(ad_spend = 32)',
'pred <- predict(model, new_data, interval = "confidence")',
'cat(sprintf("\\nPredicted sales at $32K spend: $%.1fK\\n", pred[1]))',
'cat(sprintf("95%% CI: [$%.1fK, $%.1fK]\\n", pred[2], pred[3]))'
].join('\n');

CODE_SNIPPETS['slr-solved-2-python'] = [
'import numpy as np',
'from scipy import stats',
'',
'# Data',
'size = [5, 8, 12, 15, 10, 20, 18, 25, 30, 7]',
'revenue = [2.1, 3.5, 5.2, 6.8, 4.1, 8.5, 7.9, 10.2, 12.1, 2.9]',
'',
'# Regression',
'slope, intercept, r_value, p_value, std_err = stats.linregress(size, revenue)',
'',
'print("=== Store Size vs Revenue ===")',
'print(f"Equation: Revenue = {intercept:.3f} + {slope:.3f} * Size")',
'print(f"R-squared: {r_value**2:.4f}")',
'print(f"P-value: {p_value:.8f}")',
'print(f"\\nInterpretation:")',
'print(f"Each additional 1,000 sq ft of store space")',
'print(f"is associated with ${slope:.3f}M additional revenue.")',
'print(f"\\nThe model explains {r_value**2*100:.1f}% of revenue variation.")',
'',
'# Predict for a 22K sqft store',
'pred = intercept + slope * 22',
'print(f"\\nPrediction: A 22K sqft store would generate ~${pred:.2f}M revenue")'
].join('\n');

CODE_SNIPPETS['slr-solved-2-r'] = [
'# Data',
'size <- c(5, 8, 12, 15, 10, 20, 18, 25, 30, 7)',
'revenue <- c(2.1, 3.5, 5.2, 6.8, 4.1, 8.5, 7.9, 10.2, 12.1, 2.9)',
'',
'df <- data.frame(size, revenue)',
'model <- lm(revenue ~ size, data = df)',
'',
'cat("=== Store Size vs Revenue ===\\n")',
'print(summary(model))',
'',
'# Diagnostics',
'cat("\\n=== Diagnostic Checks ===\\n")',
'cat("Residuals:\\n")',
'print(round(residuals(model), 3))',
'',
'# Prediction',
'pred <- predict(model, data.frame(size = 22), interval = "prediction")',
'cat(sprintf("\\nPrediction for 22K sqft: $%.2fM\\n", pred[1]))',
'cat(sprintf("95%% Prediction Interval: [$%.2fM, $%.2fM]\\n", pred[2], pred[3]))'
].join('\n');

CODE_SNIPPETS['mlr-solved-1-python'] = [
'import numpy as np',
'import pandas as pd',
'from numpy.linalg import inv',
'',
'# Data: 15 houses',
'data = {',
'    "sqft":     [1200,1500,1800,2000,2200,1350,1650,1900,2400,2800,1100,1750,2100,2500,3000],',
'    "bedrooms": [2,3,3,3,4,2,3,3,4,5,2,3,4,4,5],',
'    "age":      [20,15,10,8,5,25,12,6,3,2,30,18,7,4,1],',
'    "price":    [150,200,250,280,320,140,220,275,350,420,120,210,300,370,450]',
'}',
'df = pd.DataFrame(data)',
'',
'# Correlation matrix',
'print("=== Correlation Matrix ===")',
'print(df.corr().round(3).to_string())',
'',
'# OLS via matrix form',
'X = np.column_stack([np.ones(15), df["sqft"], df["bedrooms"], df["age"]])',
'Y = df["price"].values',
'',
'beta = inv(X.T @ X) @ X.T @ Y',
'y_hat = X @ beta',
'residuals = Y - y_hat',
'SSR = np.sum(residuals**2)',
'SST = np.sum((Y - Y.mean())**2)',
'R2 = 1 - SSR/SST',
'n, k = 15, 3',
'adj_R2 = 1 - (1 - R2) * (n - 1) / (n - k - 1)',
'MSE = SSR / (n - k - 1)',
'se_beta = np.sqrt(np.diag(MSE * inv(X.T @ X)))',
't_stats = beta / se_beta',
'',
'print(f"\\n=== Multiple Regression Results ===")',
'print(f"Price = {beta[0]:.2f} + {beta[1]:.4f}*Sqft + {beta[2]:.2f}*Bedrooms + {beta[3]:.2f}*Age")',
'print(f"\\nR-squared: {R2:.4f}")',
'print(f"Adjusted R-squared: {adj_R2:.4f}")',
'print(f"\\nCoefficients:")',
'names = ["Intercept", "Sqft", "Bedrooms", "Age"]',
'print(f"{\'Variable\':<12} {\'Coeff\':>10} {\'Std Err\':>10} {\'t-stat\':>10}")',
'print("-" * 44)',
'for i in range(4):',
'    print(f"{names[i]:<12} {beta[i]:>10.4f} {se_beta[i]:>10.4f} {t_stats[i]:>10.4f}")',
'',
'# VIF',
'print(f"\\n=== VIF Check ===")',
'X_vars = X[:, 1:]',
'corr_matrix = np.corrcoef(X_vars.T)',
'vif = np.diag(inv(corr_matrix))',
'for i, name in enumerate(["Sqft", "Bedrooms", "Age"]):',
'    status = "OK" if vif[i] < 5 else "CONCERN"',
'    print(f"  {name}: VIF = {vif[i]:.2f} [{status}]")',
'',
'# Prediction',
'new_house = [1, 2000, 3, 10]',
'pred = np.dot(new_house, beta)',
'print(f"\\nPrediction: 2000 sqft, 3 bed, 10yr old = ${pred:.1f}K")'
].join('\n');

CODE_SNIPPETS['mlr-solved-1-r'] = [
'# Data',
'df <- data.frame(',
'    sqft = c(1200,1500,1800,2000,2200,1350,1650,1900,2400,2800,1100,1750,2100,2500,3000),',
'    bedrooms = c(2,3,3,3,4,2,3,3,4,5,2,3,4,4,5),',
'    age = c(20,15,10,8,5,25,12,6,3,2,30,18,7,4,1),',
'    price = c(150,200,250,280,320,140,220,275,350,420,120,210,300,370,450)',
')',
'',
'# Correlation Matrix',
'cat("=== Correlation Matrix ===\\n")',
'print(round(cor(df), 3))',
'',
'# Fit Multiple Regression',
'model <- lm(price ~ sqft + bedrooms + age, data = df)',
'cat("\\n=== Multiple Regression Results ===\\n")',
'print(summary(model))',
'',
'# VIF',
'cat("\\n=== VIF ===\\n")',
'for (var in c("sqft", "bedrooms", "age")) {',
'    formula_str <- paste(var, "~ .")',
'    r2 <- summary(lm(as.formula(formula_str), data = df[,-4]))$r.squared',
'    vif_val <- 1 / (1 - r2)',
'    cat(sprintf("  %s: VIF = %.2f\\n", var, vif_val))',
'}',
'',
'# Prediction',
'new_house <- data.frame(sqft = 2000, bedrooms = 3, age = 10)',
'pred <- predict(model, new_house, interval = "confidence")',
'cat(sprintf("\\nPrediction: $%.1fK [95%% CI: $%.1fK - $%.1fK]\\n", pred[1], pred[2], pred[3]))'
].join('\n');

CODE_SNIPPETS['mlr-solved-2-python'] = [
'import numpy as np',
'',
'# Weekly data (20 weeks)',
'tv_spend = [5,8,12,6,15,10,7,20,14,18,3,9,11,16,22,4,13,17,25,19]',
'digital = [3,5,7,4,8,6,5,10,9,11,2,6,8,9,12,3,7,10,14,11]',
'discount = [0,5,10,0,15,5,0,20,10,15,0,5,10,15,20,0,10,15,25,20]',
'sales = [120,180,260,145,310,210,160,380,270,340,95,195,245,305,400,110,255,330,450,360]',
'',
'n = len(sales)',
'X = np.column_stack([np.ones(n), tv_spend, digital, discount])',
'Y = np.array(sales)',
'',
'beta = np.linalg.inv(X.T @ X) @ X.T @ Y',
'y_hat = X @ beta',
'SSR = np.sum((Y - y_hat)**2)',
'SST = np.sum((Y - Y.mean())**2)',
'R2 = 1 - SSR/SST',
'k = 3',
'adj_R2 = 1 - (1-R2)*(n-1)/(n-k-1)',
'',
'print("=== Marketing Mix Model ===")',
'print(f"Sales = {beta[0]:.1f} + {beta[1]:.2f}*TV + {beta[2]:.2f}*Digital + {beta[3]:.2f}*Discount")',
'print(f"\\nR-squared: {R2:.4f}")',
'print(f"Adjusted R-squared: {adj_R2:.4f}")',
'print(f"\\n=== ROI Analysis ===")',
'print(f"TV Ads: Each $1K generates {beta[1]:.1f} units")',
'print(f"Digital: Each $1K generates {beta[2]:.1f} units")',
'print(f"Discount: Each 1% generates {beta[3]:.1f} units")'
].join('\n');

CODE_SNIPPETS['mlr-solved-2-r'] = [
'df <- data.frame(',
'    tv = c(5,8,12,6,15,10,7,20,14,18,3,9,11,16,22,4,13,17,25,19),',
'    digital = c(3,5,7,4,8,6,5,10,9,11,2,6,8,9,12,3,7,10,14,11),',
'    discount = c(0,5,10,0,15,5,0,20,10,15,0,5,10,15,20,0,10,15,25,20),',
'    sales = c(120,180,260,145,310,210,160,380,270,340,95,195,245,305,400,110,255,330,450,360)',
')',
'',
'model <- lm(sales ~ tv + digital + discount, data = df)',
'cat("=== Marketing Mix Model ===\\n")',
'print(summary(model))',
'',
'# Standardized coefficients',
'cat("\\n=== Standardized Coefficients ===\\n")',
'df_scaled <- as.data.frame(scale(df))',
'model_std <- lm(sales ~ tv + digital + discount, data = df_scaled)',
'print(round(coef(model_std)[-1], 4))',
'',
'# Prediction',
'new_week <- data.frame(tv = 15, digital = 8, discount = 10)',
'pred <- predict(model, new_week, interval = "prediction")',
'cat(sprintf("\\nPrediction: TV=$15K, Digital=$8K, 10%% discount\\n"))',
'cat(sprintf("Sales: %.0f units [95%% PI: %.0f - %.0f]\\n", pred[1], pred[2], pred[3]))'
].join('\n');

CODE_SNIPPETS['log-solved-1-python'] = [
'import numpy as np',
'',
'# Data: 20 customers',
'monthly_charge = [30,45,60,35,80,55,70,40,90,65,50,75,85,42,38,72,58,95,48,62]',
'contract_months = [24,12,6,24,3,12,6,18,1,12,24,3,6,18,24,6,12,1,18,6]',
'support_calls =   [0, 1, 3, 0, 5, 2, 4, 1, 6, 2, 0, 4, 3, 1, 0, 3, 2, 7, 1, 3]',
'churned =         [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1]',
'',
'X = np.column_stack([np.ones(20), monthly_charge, contract_months, support_calls])',
'y = np.array(churned)',
'',
'def sigmoid(z):',
'    return 1 / (1 + np.exp(-np.clip(z, -500, 500)))',
'',
'# Standardize',
'means = X[:, 1:].mean(axis=0)',
'stds = X[:, 1:].std(axis=0)',
'X_std = np.column_stack([np.ones(20), (X[:, 1:] - means) / stds])',
'',
'# Gradient descent',
'beta = np.zeros(4)',
'for _ in range(10000):',
'    p = sigmoid(X_std @ beta)',
'    beta -= 0.001 * (X_std.T @ (p - y) / 20)',
'',
'probs = sigmoid(X_std @ beta)',
'preds = (probs >= 0.5).astype(int)',
'',
'print("=== Logistic Regression: Churn ===")',
'print(f"Coefficients (standardized):")',
'print(f"  Intercept:       {beta[0]:.4f}")',
'print(f"  Monthly Charge:  {beta[1]:.4f}")',
'print(f"  Contract Length: {beta[2]:.4f}")',
'print(f"  Support Calls:   {beta[3]:.4f}")',
'',
'print(f"\\nOdds Ratios (per 1 SD change):")',
'for i, name in enumerate(["Monthly Charge", "Contract Length", "Support Calls"]):',
'    print(f"  {name}: {np.exp(beta[i+1]):.3f}")',
'',
'TP = np.sum((preds == 1) & (y == 1))',
'TN = np.sum((preds == 0) & (y == 0))',
'FP = np.sum((preds == 1) & (y == 0))',
'FN = np.sum((preds == 0) & (y == 1))',
'accuracy = (TP + TN) / len(y)',
'',
'print(f"\\n=== Confusion Matrix ===")',
'print(f"              Pred:No  Pred:Yes")',
'print(f"Actual No      {TN:>4}     {FP:>4}")',
'print(f"Actual Yes     {FN:>4}     {TP:>4}")',
'print(f"\\nAccuracy: {accuracy:.1%}")'
].join('\n');

CODE_SNIPPETS['log-solved-1-r'] = [
'df <- data.frame(',
'    monthly_charge = c(30,45,60,35,80,55,70,40,90,65,50,75,85,42,38,72,58,95,48,62),',
'    contract_months = c(24,12,6,24,3,12,6,18,1,12,24,3,6,18,24,6,12,1,18,6),',
'    support_calls = c(0,1,3,0,5,2,4,1,6,2,0,4,3,1,0,3,2,7,1,3),',
'    churned = c(0,0,1,0,1,0,1,0,1,0,0,1,1,0,0,1,0,1,0,1)',
')',
'',
'model <- glm(churned ~ monthly_charge + contract_months + support_calls,',
'             data = df, family = binomial)',
'',
'cat("=== Logistic Regression Results ===\\n")',
'print(summary(model))',
'',
'cat("\\n=== Odds Ratios ===\\n")',
'or_table <- exp(cbind(OR = coef(model), confint.default(model)))',
'print(round(or_table, 4))',
'',
'probs <- predict(model, type = "response")',
'preds <- ifelse(probs > 0.5, 1, 0)',
'',
'cat("\\n=== Confusion Matrix ===\\n")',
'print(table(Actual = df$churned, Predicted = preds))',
'accuracy <- mean(preds == df$churned)',
'cat(sprintf("\\nAccuracy: %.1f%%\\n", accuracy * 100))',
'',
'new_cust <- data.frame(monthly_charge=75, contract_months=6, support_calls=4)',
'prob <- predict(model, new_cust, type="response")',
'cat(sprintf("\\nChurn prob for new customer: %.1f%%\\n", prob * 100))'
].join('\n');

CODE_SNIPPETS['log-solved-2-python'] = [
'import numpy as np',
'',
'credit_score = [720,650,580,700,620,750,680,550,690,710,600,740,660,570,730,640,590,760,670,610,700,630,560,680,720]',
'dti_ratio = [0.2,0.35,0.45,0.25,0.40,0.15,0.30,0.50,0.28,0.22,0.42,0.18,0.33,0.48,0.20,0.38,0.44,0.12,0.32,0.41,0.26,0.36,0.52,0.29,0.21]',
'loan_amt = [200,150,100,250,120,300,180,80,220,280,90,260,160,70,240,130,95,320,170,110,230,140,75,190,270]',
'default = [0,0,1,0,1,0,0,1,0,0,1,0,0,1,0,1,1,0,0,1,0,0,1,0,0]',
'',
'X = np.column_stack([np.ones(25), credit_score, dti_ratio, loan_amt])',
'y = np.array(default)',
'',
'means = X[:, 1:].mean(axis=0)',
'stds = X[:, 1:].std(axis=0)',
'X_std = np.column_stack([np.ones(25), (X[:, 1:] - means) / stds])',
'',
'def sigmoid(z):',
'    return 1 / (1 + np.exp(-np.clip(z, -500, 500)))',
'',
'beta = np.zeros(4)',
'for _ in range(20000):',
'    p = sigmoid(X_std @ beta)',
'    beta -= 0.01 * (X_std.T @ (p - y) / 25)',
'',
'probs = sigmoid(X_std @ beta)',
'preds = (probs >= 0.5).astype(int)',
'',
'TP = np.sum((preds==1) & (y==1))',
'TN = np.sum((preds==0) & (y==0))',
'FP = np.sum((preds==1) & (y==0))',
'FN = np.sum((preds==0) & (y==1))',
'',
'print("=== Loan Default Prediction ===")',
'print(f"Coefficients (standardized):")',
'print(f"  Intercept:     {beta[0]:.4f}")',
'print(f"  Credit Score:  {beta[1]:.4f}  (negative = protective)")',
'print(f"  DTI Ratio:     {beta[2]:.4f}  (positive = risky)")',
'print(f"  Loan Amount:   {beta[3]:.4f}")',
'print(f"\\nAccuracy: {(TP+TN)/25:.1%}")',
'print(f"\\nRisk Scores (first 5):")',
'for i in range(5):',
'    print(f"  Customer {i+1}: Score={credit_score[i]}, DTI={dti_ratio[i]:.2f}, P(Default)={probs[i]:.1%}")'
].join('\n');

CODE_SNIPPETS['log-solved-2-r'] = [
'df <- data.frame(',
'    credit_score = c(720,650,580,700,620,750,680,550,690,710,600,740,660,570,730,640,590,760,670,610,700,630,560,680,720),',
'    dti_ratio = c(0.2,0.35,0.45,0.25,0.40,0.15,0.30,0.50,0.28,0.22,0.42,0.18,0.33,0.48,0.20,0.38,0.44,0.12,0.32,0.41,0.26,0.36,0.52,0.29,0.21),',
'    loan_amt = c(200,150,100,250,120,300,180,80,220,280,90,260,160,70,240,130,95,320,170,110,230,140,75,190,270),',
'    default_flag = c(0,0,1,0,1,0,0,1,0,0,1,0,0,1,0,1,1,0,0,1,0,0,1,0,0)',
')',
'',
'model <- glm(default_flag ~ credit_score + dti_ratio + loan_amt,',
'             data = df, family = binomial)',
'',
'cat("=== Loan Default Model ===\\n")',
'print(summary(model))',
'',
'cat("\\n=== Odds Ratios ===\\n")',
'print(round(exp(coef(model)), 4))',
'',
'probs <- predict(model, type = "response")',
'df$risk_cat <- ifelse(probs < 0.2, "Low",',
'               ifelse(probs < 0.5, "Medium", "High"))',
'cat("\\n=== Risk Categories ===\\n")',
'print(table(df$risk_cat))'
].join('\n');

CODE_SNIPPETS['fa-solved-1-python'] = [
'import numpy as np',
'',
'np.random.seed(42)',
'n = 200',
'',
'# 3 underlying factors',
'F1 = np.random.normal(0, 1, n)',
'F2 = np.random.normal(0, 1, n)',
'F3 = np.random.normal(0, 1, n)',
'',
'V1 = 0.85*F1 + np.random.normal(0, 0.4, n)',
'V2 = 0.80*F1 + np.random.normal(0, 0.4, n)',
'V3 = 0.75*F1 + np.random.normal(0, 0.4, n)',
'V4 = 0.82*F2 + np.random.normal(0, 0.4, n)',
'V5 = 0.78*F2 + np.random.normal(0, 0.4, n)',
'V6 = 0.70*F2 + np.random.normal(0, 0.4, n)',
'V7 = 0.88*F3 + np.random.normal(0, 0.4, n)',
'V8 = 0.83*F3 + np.random.normal(0, 0.4, n)',
'',
'data = np.column_stack([V1, V2, V3, V4, V5, V6, V7, V8])',
'corr = np.corrcoef(data.T)',
'',
'names = ["Clean","Comfort","Bath","Staff","CheckIn","Concierge","Food","Service"]',
'print("=== Correlation Matrix (selected) ===")',
'for i in range(8):',
'    row = " ".join([f"{corr[i,j]:6.3f}" for j in range(8)])',
'    print(f"{names[i]:>10} {row}")',
'',
'# Eigenvalue decomposition',
'eigenvalues, eigenvectors = np.linalg.eigh(corr)',
'idx = eigenvalues.argsort()[::-1]',
'eigenvalues = eigenvalues[idx]',
'eigenvectors = eigenvectors[:, idx]',
'',
'print(f"\\n=== Eigenvalues ===")',
'cum = 0',
'for i in range(8):',
'    pct = eigenvalues[i] / 8 * 100',
'    cum += pct',
'    marker = " <-- Retain" if eigenvalues[i] > 1 else ""',
'    print(f"F{i+1}: {eigenvalues[i]:.4f} ({pct:.1f}%, Cum: {cum:.1f}%){marker}")',
'',
'# Extract 3 factors with loadings',
'n_factors = 3',
'loadings = eigenvectors[:, :n_factors] * np.sqrt(eigenvalues[:n_factors])',
'',
'# Simple varimax rotation',
'L = loadings.copy()',
'p, k = L.shape',
'for _ in range(100):',
'    for i in range(k):',
'        for j in range(i+1, k):',
'            u = L[:, i]**2 - L[:, j]**2',
'            v = 2 * L[:, i] * L[:, j]',
'            num = 2*p*np.sum(u*v) - 2*np.sum(u)*np.sum(v)',
'            den = p*(np.sum(u**2 - v**2)) - (np.sum(u)**2 - np.sum(v)**2)',
'            angle = 0.25 * np.arctan2(num, den)',
'            c, s = np.cos(angle), np.sin(angle)',
'            L[:, [i,j]] = L[:, [i,j]] @ np.array([[c,-s],[s,c]])',
'',
'print(f"\\n=== Rotated Factor Loadings (Varimax) ===")',
'print(f"{\'Variable\':<12} {\'Factor 1\':<10} {\'Factor 2\':<10} {\'Factor 3\':<10}")',
'for i, name in enumerate(names):',
'    print(f"{name:<12} {L[i,0]:<10.3f} {L[i,1]:<10.3f} {L[i,2]:<10.3f}")',
'',
'communalities = np.sum(L**2, axis=1)',
'print(f"\\n=== Communalities ===")',
'for i, name in enumerate(names):',
'    print(f"  {name}: {communalities[i]:.3f}")',
'',
'print(f"\\n=== Interpretation ===")',
'print("Factor 1: Room Quality (Cleanliness, Comfort, Bathroom)")',
'print("Factor 2: Staff Service (Staff, Check-in, Concierge)")',
'print("Factor 3: Dining Experience (Food, Service)")'
].join('\n');

CODE_SNIPPETS['fa-solved-1-r'] = [
'set.seed(42)',
'n <- 200',
'F1 <- rnorm(n); F2 <- rnorm(n); F3 <- rnorm(n)',
'',
'data <- data.frame(',
'    Clean     = 0.85*F1 + rnorm(n, 0, 0.4),',
'    Comfort   = 0.80*F1 + rnorm(n, 0, 0.4),',
'    Bath      = 0.75*F1 + rnorm(n, 0, 0.4),',
'    Staff     = 0.82*F2 + rnorm(n, 0, 0.4),',
'    CheckIn   = 0.78*F2 + rnorm(n, 0, 0.4),',
'    Concierge = 0.70*F2 + rnorm(n, 0, 0.4),',
'    Food      = 0.88*F3 + rnorm(n, 0, 0.4),',
'    Service   = 0.83*F3 + rnorm(n, 0, 0.4)',
')',
'',
'cat("=== Correlation Matrix ===\\n")',
'print(round(cor(data), 3))',
'',
'pca <- prcomp(data, scale. = TRUE)',
'eigenvalues <- pca$sdev^2',
'',
'cat("\\n=== Eigenvalues ===\\n")',
'cum_var <- cumsum(eigenvalues / sum(eigenvalues) * 100)',
'for (i in 1:8) {',
'    pct <- eigenvalues[i] / sum(eigenvalues) * 100',
'    marker <- ifelse(eigenvalues[i] > 1, " <-- Retain", "")',
'    cat(sprintf("F%d: %.4f (%.1f%%, Cum: %.1f%%)%s\\n",',
'        i, eigenvalues[i], pct, cum_var[i], marker))',
'}',
'',
'fa_result <- factanal(data, factors = 3, rotation = "varimax")',
'cat("\\n=== Factor Analysis Results ===\\n")',
'print(fa_result)',
'',
'cat("\\nFactor 1: Room Quality\\n")',
'cat("Factor 2: Staff Service\\n")',
'cat("Factor 3: Dining Experience\\n")'
].join('\n');

CODE_SNIPPETS['ca-solved-1-python'] = [
'import numpy as np',
'',
'np.random.seed(42)',
'',
'spending =  [2,5,8,3,45,52,48,55,20,22,25,18,60,58,50,4,6,3,42,55,21,23,19,62,51,7,48,24,56,3]',
'frequency = [2,4,6,3,15,18,14,20,8,10,9,7,22,20,16,3,5,2,13,19,9,11,8,25,17,5,15,10,21,2]',
'avg_order = [50,60,55,45,150,160,145,170,90,100,95,85,180,175,155,55,65,50,140,165,92,105,88,190,158,58,148,98,172,48]',
'',
'data = np.column_stack([spending, frequency, avg_order])',
'means = data.mean(axis=0)',
'stds = data.std(axis=0)',
'data_std = (data - means) / stds',
'',
'def kmeans(X, K, max_iter=100):',
'    n = X.shape[0]',
'    indices = np.random.choice(n, K, replace=False)',
'    centroids = X[indices].copy()',
'    for _ in range(max_iter):',
'        distances = np.array([np.sum((X - c)**2, axis=1) for c in centroids]).T',
'        labels = np.argmin(distances, axis=1)',
'        new_centroids = np.array([X[labels == k].mean(axis=0) for k in range(K)])',
'        if np.allclose(centroids, new_centroids): break',
'        centroids = new_centroids',
'    wcss = sum(np.sum((X[labels==k] - centroids[k])**2) for k in range(K))',
'    return labels, centroids, wcss',
'',
'print("=== Elbow Method ===")',
'for k in range(2, 7):',
'    _, _, wcss = kmeans(data_std, k)',
'    print(f"K={k}: WCSS = {wcss:.2f}")',
'',
'labels, centroids, wcss = kmeans(data_std, 3)',
'',
'print(f"\\n=== Customer Segments (K=3) ===")',
'for k in range(3):',
'    mask = labels == k',
'    cluster_data = data[mask]',
'    n_k = mask.sum()',
'    print(f"\\nCluster {k+1} (n={n_k}):")',
'    print(f"  Avg Spending: ${cluster_data[:,0].mean():.1f}K")',
'    print(f"  Avg Frequency: {cluster_data[:,1].mean():.1f}/year")',
'    print(f"  Avg Order: ${cluster_data[:,2].mean():.0f}")',
'',
'print("\\n=== Recommendations ===")',
'print("Low spend: Reactivation campaigns")',
'print("Medium: Upsell and loyalty programs")',
'print("High: VIP exclusive offers")'
].join('\n');

CODE_SNIPPETS['ca-solved-1-r'] = [
'set.seed(42)',
'',
'df <- data.frame(',
'    spending = c(2,5,8,3,45,52,48,55,20,22,25,18,60,58,50,4,6,3,42,55,21,23,19,62,51,7,48,24,56,3),',
'    frequency = c(2,4,6,3,15,18,14,20,8,10,9,7,22,20,16,3,5,2,13,19,9,11,8,25,17,5,15,10,21,2),',
'    avg_order = c(50,60,55,45,150,160,145,170,90,100,95,85,180,175,155,55,65,50,140,165,92,105,88,190,158,58,148,98,172,48)',
')',
'',
'df_scaled <- scale(df)',
'',
'cat("=== Elbow Method ===\\n")',
'for (k in 2:7) {',
'    km <- kmeans(df_scaled, centers = k, nstart = 25)',
'    cat(sprintf("K=%d: WCSS = %.2f\\n", k, km$tot.withinss))',
'}',
'',
'km3 <- kmeans(df_scaled, centers = 3, nstart = 25)',
'',
'cat("\\n=== Cluster Profiles ===\\n")',
'for (k in 1:3) {',
'    members <- df[km3$cluster == k, ]',
'    cat(sprintf("\\nCluster %d (n=%d):\\n", k, nrow(members)))',
'    cat(sprintf("  Avg Spending: $%.1fK\\n", mean(members$spending)))',
'    cat(sprintf("  Avg Frequency: %.1f/year\\n", mean(members$frequency)))',
'    cat(sprintf("  Avg Order: $%.0f\\n", mean(members$avg_order)))',
'}',
'',
'cat(sprintf("\\nBSS/TSS ratio: %.1f%%\\n", km3$betweenss/(km3$tot.withinss+km3$betweenss)*100))'
].join('\n');

CODE_SNIPPETS['ca-solved-2-python'] = [
'import numpy as np',
'',
'countries = ["USA","Germany","Japan","Brazil","India","China","UK","Nigeria"]',
'gdp_pc =     [63, 46, 40, 9, 2, 10, 42, 2]',
'internet =   [90, 88, 92, 75, 45, 70, 95, 36]',
'ease_biz =   [84, 79, 78, 59, 63, 78, 83, 36]',
'',
'data = np.column_stack([gdp_pc, internet, ease_biz])',
'means = data.mean(axis=0)',
'stds = data.std(axis=0)',
'data_std = (data - means) / stds',
'',
'n = len(countries)',
'',
'# Distance matrix',
'print("=== Distance Matrix (Euclidean, Standardized) ===")',
'for i in range(n):',
'    for j in range(i+1, n):',
'        d = np.sqrt(np.sum((data_std[i] - data_std[j])**2))',
'        if d < 1.5:',
'            print(f"  {countries[i]:>8} - {countries[j]:<8}: {d:.3f}  (similar)")',
'',
'print("\\n=== Suggested 3-Cluster Solution ===")',
'print("Cluster 1 (Developed): USA, UK, Germany, Japan")',
'print("  High GDP, high internet, high ease of business")',
'print("Cluster 2 (Emerging): Brazil, China")',
'print("  Medium GDP, medium-high internet")',
'print("Cluster 3 (Frontier): India, Nigeria")',
'print("  Low GDP, lower internet penetration")',
'',
'print("\\n=== Business Strategy ===")',
'print("Developed: Premium positioning, digital-first")',
'print("Emerging: Value positioning, mobile commerce")',
'print("Frontier: Basic access, partnership-based entry")'
].join('\n');

CODE_SNIPPETS['ca-solved-2-r'] = [
'countries <- c("USA","Germany","Japan","Brazil","India","China","UK","Nigeria")',
'df <- data.frame(',
'    gdp_pc = c(63, 46, 40, 9, 2, 10, 42, 2),',
'    internet = c(90, 88, 92, 75, 45, 70, 95, 36),',
'    ease_biz = c(84, 79, 78, 59, 63, 78, 83, 36)',
')',
'rownames(df) <- countries',
'',
'df_scaled <- scale(df)',
'd <- dist(df_scaled)',
'hc <- hclust(d, method = "ward.D2")',
'',
'cat("=== Merge Sequence ===\\n")',
'for (i in 1:nrow(hc$merge)) {',
'    left <- ifelse(hc$merge[i,1] < 0, countries[-hc$merge[i,1]], paste("Cluster", hc$merge[i,1]))',
'    right <- ifelse(hc$merge[i,2] < 0, countries[-hc$merge[i,2]], paste("Cluster", hc$merge[i,2]))',
'    cat(sprintf("Step %d: %s + %s (height: %.3f)\\n", i, left, right, hc$height[i]))',
'}',
'',
'clusters <- cutree(hc, k = 3)',
'cat("\\n=== 3-Cluster Solution ===\\n")',
'for (k in 1:3) {',
'    members <- countries[clusters == k]',
'    cat(sprintf("Cluster %d: %s\\n", k, paste(members, collapse = ", ")))',
'    cat(sprintf("  Avg GDP/capita: $%.0fK\\n", mean(df$gdp_pc[clusters==k])))',
'    cat(sprintf("  Avg Internet: %.0f%%\\n\\n", mean(df$internet[clusters==k])))',
'}'
].join('\n');

// Sandbox / Try-it snippets
CODE_SNIPPETS['slr-tryit-python'] = [
'# Simple Linear Regression Example',
'import numpy as np',
'from scipy import stats',
'',
'# Your data here',
'x = [10, 12, 15, 14, 18, 20, 22, 25, 23, 28, 30, 35]',
'y = [100, 120, 140, 130, 160, 180, 190, 210, 200, 230, 250, 280]',
'',
'# Fit the model',
'slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)',
'',
'print(f"Y = {intercept:.2f} + {slope:.2f} * X")',
'print(f"R-squared: {r_value**2:.4f}")',
'print(f"P-value: {p_value:.6f}")'
].join('\n');

CODE_SNIPPETS['slr-tryit-r'] = [
'# Simple Linear Regression Example',
'x <- c(10, 12, 15, 14, 18, 20, 22, 25, 23, 28, 30, 35)',
'y <- c(100, 120, 140, 130, 160, 180, 190, 210, 200, 230, 250, 280)',
'',
'model <- lm(y ~ x)',
'summary(model)'
].join('\n');

CODE_SNIPPETS['mlr-tryit-python'] = [
'import numpy as np',
'',
'np.random.seed(42)',
'n = 50',
'X1 = np.random.uniform(10, 50, n)',
'X2 = np.random.uniform(1, 10, n)',
'Y = 20 + 3.5*X1 + 8*X2 + np.random.normal(0, 15, n)',
'',
'X = np.column_stack([np.ones(n), X1, X2])',
'beta = np.linalg.inv(X.T @ X) @ X.T @ Y',
'y_hat = X @ beta',
'R2 = 1 - np.sum((Y-y_hat)**2)/np.sum((Y-Y.mean())**2)',
'',
'print(f"Y = {beta[0]:.2f} + {beta[1]:.2f}*X1 + {beta[2]:.2f}*X2")',
'print(f"R-squared: {R2:.4f}")'
].join('\n');

CODE_SNIPPETS['mlr-tryit-r'] = [
'set.seed(42)',
'n <- 50',
'x1 <- runif(n, 10, 50)',
'x2 <- runif(n, 1, 10)',
'y <- 20 + 3.5*x1 + 8*x2 + rnorm(n, 0, 15)',
'',
'model <- lm(y ~ x1 + x2)',
'summary(model)'
].join('\n');

CODE_SNIPPETS['log-tryit-python'] = [
'import numpy as np',
'',
'def sigmoid(z):',
'    return 1 / (1 + np.exp(-np.clip(z, -500, 500)))',
'',
'duration = np.array([1, 3, 5, 7, 10, 12, 15, 18, 20, 25])',
'purchased = np.array([0, 0, 0, 0, 1, 0, 1, 1, 1, 1])',
'',
'X = np.column_stack([np.ones(10), duration])',
'beta = np.zeros(2)',
'for _ in range(10000):',
'    p = sigmoid(X @ beta)',
'    beta -= 0.01 * (X.T @ (p - purchased) / 10)',
'',
'print(f"Intercept: {beta[0]:.4f}")',
'print(f"Duration coeff: {beta[1]:.4f}")',
'print(f"\\nPredicted probabilities:")',
'for d in [5, 10, 15, 20]:',
'    p = sigmoid(beta[0] + beta[1]*d)',
'    print(f"  {d} min visit -> {p:.1%} purchase prob")'
].join('\n');

CODE_SNIPPETS['log-tryit-r'] = [
'duration <- c(1, 3, 5, 7, 10, 12, 15, 18, 20, 25)',
'purchased <- c(0, 0, 0, 0, 1, 0, 1, 1, 1, 1)',
'',
'model <- glm(purchased ~ duration, family = binomial)',
'summary(model)',
'',
'new_data <- data.frame(duration = c(5, 10, 15, 20))',
'probs <- predict(model, new_data, type = "response")',
'cat("\\nPredicted probabilities:\\n")',
'for (i in 1:4) {',
'    cat(sprintf("  %d min -> %.1f%%\\n", new_data$duration[i], probs[i]*100))',
'}'
].join('\n');

CODE_SNIPPETS['fa-tryit-python'] = [
'import numpy as np',
'',
'np.random.seed(42)',
'n = 100',
'F1 = np.random.normal(0, 1, n)',
'F2 = np.random.normal(0, 1, n)',
'',
'V1 = 0.9*F1 + np.random.normal(0,0.3,n)',
'V2 = 0.8*F1 + np.random.normal(0,0.3,n)',
'V3 = 0.85*F2 + np.random.normal(0,0.3,n)',
'V4 = 0.75*F2 + np.random.normal(0,0.3,n)',
'',
'data = np.column_stack([V1, V2, V3, V4])',
'corr = np.corrcoef(data.T)',
'eigvals, eigvecs = np.linalg.eigh(corr)',
'eigvals = eigvals[::-1]',
'',
'print("Correlation Matrix:")',
'print(np.round(corr, 3))',
'print(f"\\nEigenvalues: {np.round(eigvals, 3)}")',
'print(f"Variance explained: {np.round(eigvals/4*100, 1)}%")'
].join('\n');

CODE_SNIPPETS['fa-tryit-r'] = [
'set.seed(42)',
'n <- 100',
'F1 <- rnorm(n)',
'F2 <- rnorm(n)',
'',
'data <- data.frame(',
'    V1 = 0.9*F1 + rnorm(n, 0, 0.3),',
'    V2 = 0.8*F1 + rnorm(n, 0, 0.3),',
'    V3 = 0.85*F2 + rnorm(n, 0, 0.3),',
'    V4 = 0.75*F2 + rnorm(n, 0, 0.3)',
')',
'',
'cat("Correlation Matrix:\\n")',
'print(round(cor(data), 3))',
'',
'pca <- prcomp(data, scale. = TRUE)',
'cat("\\nEigenvalues:\\n")',
'print(round(pca$sdev^2, 3))',
'',
'fa <- factanal(data, factors = 2, rotation = "varimax")',
'print(fa)'
].join('\n');

CODE_SNIPPETS['ca-tryit-python'] = [
'import numpy as np',
'',
'np.random.seed(42)',
'',
'def kmeans(X, K, max_iter=50):',
'    n = X.shape[0]',
'    idx = np.random.choice(n, K, replace=False)',
'    centroids = X[idx].copy()',
'    for _ in range(max_iter):',
'        dists = np.array([np.sum((X-c)**2, axis=1) for c in centroids]).T',
'        labels = np.argmin(dists, axis=1)',
'        new_c = np.array([X[labels==k].mean(0) for k in range(K)])',
'        if np.allclose(centroids, new_c): break',
'        centroids = new_c',
'    return labels, centroids',
'',
'c1 = np.random.normal([2,2], 0.5, (20,2))',
'c2 = np.random.normal([7,7], 0.5, (20,2))',
'c3 = np.random.normal([2,8], 0.5, (20,2))',
'data = np.vstack([c1, c2, c3])',
'',
'labels, centers = kmeans(data, 3)',
'print("Cluster centers:")',
'for i, c in enumerate(centers):',
'    n = np.sum(labels==i)',
'    print(f"  Cluster {i+1}: ({c[0]:.2f}, {c[1]:.2f}) - {n} points")'
].join('\n');

CODE_SNIPPETS['ca-tryit-r'] = [
'set.seed(42)',
'c1 <- matrix(rnorm(40, mean=2, sd=0.5), ncol=2)',
'c2 <- matrix(rnorm(40, mean=7, sd=0.5), ncol=2)',
'c3 <- cbind(rnorm(20, 2, 0.5), rnorm(20, 8, 0.5))',
'data <- rbind(c1, c2, c3)',
'',
'km <- kmeans(data, centers=3, nstart=25)',
'cat("Cluster sizes:", km$size, "\\n\\n")',
'cat("Cluster centers:\\n")',
'print(round(km$centers, 2))',
'',
'd <- dist(data)',
'hc <- hclust(d, method="ward.D2")',
'clusters <- cutree(hc, k=3)',
'cat("\\nHierarchical cluster sizes:", table(clusters), "\\n")'
].join('\n');


// ============================================================
// Helper to build code block HTML
// ============================================================
function makeCodeBlock(id, snippetPrefix) {
    var pyCode = CODE_SNIPPETS[snippetPrefix + '-python'] || '# No code available';
    var rCode = CODE_SNIPPETS[snippetPrefix + '-r'] || '# No code available';
    return '<div class="code-block-wrapper" id="' + id + '">' +
        '<div class="code-block-header">' +
            '<div class="code-lang-tabs">' +
                '<button class="code-lang-tab active" onclick="switchCodeTab(\'' + id + '\', \'python\')">Python</button>' +
                '<button class="code-lang-tab" onclick="switchCodeTab(\'' + id + '\', \'r\')">R</button>' +
            '</div>' +
            '<div class="code-block-actions">' +
                '<button class="btn-copy" onclick="copyCode(\'' + id + '\')"><i class="fas fa-copy"></i> Copy</button>' +
                '<button class="btn-run-code" onclick="runCodeBlock(\'' + id + '\')"><i class="fas fa-play"></i> Run</button>' +
            '</div>' +
        '</div>' +
        '<div class="code-block-body">' +
            '<div class="code-panel active" data-lang="python">' +
                '<pre><code class="language-python">' + escapeHtml(pyCode) + '</code></pre>' +
            '</div>' +
            '<div class="code-panel" data-lang="r">' +
                '<pre><code class="language-r">' + escapeHtml(rCode) + '</code></pre>' +
            '</div>' +
        '</div>' +
        '<div class="output-block" id="' + id + '-output"></div>' +
    '</div>';
}

function makeTryItSection(topic, snippetPrefix) {
    return '<div class="content-section">' +
        '<h2><i class="fas fa-code"></i> Try It Yourself</h2>' +
        '<p>Edit the code below and click <strong>Run</strong> to execute. Switch between Python and R.</p>' +
        '<div class="info-box tip">' +
            '<h4>Getting Started</h4>' +
            '<p>The code below is pre-loaded with a working example. Modify the data or parameters and run to see how results change. Go to the <strong>Code Sandbox</strong> for a full editor experience.</p>' +
        '</div>' +
        makeCodeBlock(topic + '-tryit', snippetPrefix + '-tryit') +
    '</div>';
}

function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ============================================================
// CONTENT DEFINITIONS
// ============================================================
var CONTENT = {};

// ===================== HOME PAGE =====================
CONTENT.home = {
    render: function() {
        return '<div class="home-hero">' +
            '<h1>Business Analytics Simulation</h1>' +
            '<p>Master the analytical techniques that drive modern business decisions. Interactive tutorials, real-world examples, and hands-on coding in both Python and R.</p>' +
        '</div>' +
        '<div class="topic-cards">' +
            '<div class="topic-card" onclick="navigateTo(\'simple-regression\')">' +
                '<div class="card-icon blue"><i class="fas fa-chart-line"></i></div>' +
                '<h3>Simple Linear Regression</h3>' +
                '<p>Model the relationship between two variables. Predict sales from advertising spend, forecast demand from price changes.</p>' +
                '<div class="card-tags"><span class="tag">Prediction</span><span class="tag">Correlation</span><span class="tag">OLS</span></div>' +
            '</div>' +
            '<div class="topic-card" onclick="navigateTo(\'multiple-regression\')">' +
                '<div class="card-icon purple"><i class="fas fa-project-diagram"></i></div>' +
                '<h3>Multiple Regression</h3>' +
                '<p>Extend regression to multiple predictors. Understand how marketing mix, pricing, and seasonality jointly impact revenue.</p>' +
                '<div class="card-tags"><span class="tag">Multi-predictor</span><span class="tag">R-squared</span><span class="tag">VIF</span></div>' +
            '</div>' +
            '<div class="topic-card" onclick="navigateTo(\'logistic-regression\')">' +
                '<div class="card-icon green"><i class="fas fa-toggle-on"></i></div>' +
                '<h3>Logistic Regression</h3>' +
                '<p>Classify binary outcomes. Predict customer churn, loan defaults, purchase decisions, and employee attrition.</p>' +
                '<div class="card-tags"><span class="tag">Classification</span><span class="tag">Odds Ratio</span><span class="tag">ROC</span></div>' +
            '</div>' +
            '<div class="topic-card" onclick="navigateTo(\'factor-analysis\')">' +
                '<div class="card-icon orange"><i class="fas fa-layer-group"></i></div>' +
                '<h3>Factor Analysis</h3>' +
                '<p>Reduce dimensionality and discover latent constructs. Identify underlying factors in surveys and brand perception.</p>' +
                '<div class="card-tags"><span class="tag">PCA</span><span class="tag">Eigenvalues</span><span class="tag">Rotation</span></div>' +
            '</div>' +
            '<div class="topic-card" onclick="navigateTo(\'cluster-analysis\')">' +
                '<div class="card-icon pink"><i class="fas fa-object-group"></i></div>' +
                '<h3>Cluster Analysis</h3>' +
                '<p>Segment customers, markets, and products. Both hierarchical (dendrograms) and non-hierarchical (K-Means) approaches.</p>' +
                '<div class="card-tags"><span class="tag">K-Means</span><span class="tag">Dendrogram</span><span class="tag">Segmentation</span></div>' +
            '</div>' +
            '<div class="topic-card" onclick="navigateTo(\'sandbox\')">' +
                '<div class="card-icon blue"><i class="fas fa-code"></i></div>' +
                '<h3>Code Sandbox</h3>' +
                '<p>Write, run, and experiment with Python and R code directly in your browser. Pre-loaded templates for each topic.</p>' +
                '<div class="card-tags"><span class="tag">Python</span><span class="tag">R</span><span class="tag">Interactive</span></div>' +
            '</div>' +
        '</div>';
    }
};

// ===================== SIMPLE LINEAR REGRESSION =====================
CONTENT['simple-regression'] = {
    title: 'Simple Linear Regression',
    subtitle: 'Modeling the relationship between two continuous variables',
    tabs: ['Tutorial', 'Solved Problems', 'Exercises', 'Try It'],
    tutorial: function() {
        return '<div class="content-section">' +
        '<h2><i class="fas fa-book"></i> What is Simple Linear Regression?</h2>' +
        '<p>Simple Linear Regression (SLR) is a statistical method that models the linear relationship between a <strong>dependent variable</strong> (Y) and a single <strong>independent variable</strong> (X). It answers: <em>"How does Y change when X changes?"</em></p>' +
        '<div class="info-box concept"><h4>Key Business Question</h4><p>A marketing director asks: "If I increase my advertising budget by $10,000, how much additional revenue can I expect?" Simple regression provides a quantitative answer.</p></div>' +
        '<h3>The Regression Equation</h3>' +
        '<div class="formula-block">Y = &beta;<sub>0</sub> + &beta;<sub>1</sub>X + &epsilon;</div>' +
        '<p>Where:</p><ul>' +
        '<li><strong>Y</strong> = Dependent variable (what we predict)</li>' +
        '<li><strong>X</strong> = Independent variable (the predictor)</li>' +
        '<li><strong>&beta;<sub>0</sub></strong> = Y-intercept (value of Y when X = 0)</li>' +
        '<li><strong>&beta;<sub>1</sub></strong> = Slope (change in Y per unit change in X)</li>' +
        '<li><strong>&epsilon;</strong> = Error term (unexplained variation)</li></ul>' +
        '<h3>How OLS (Ordinary Least Squares) Works</h3>' +
        '<p>OLS finds the best-fit line by minimizing the <strong>sum of squared residuals</strong> — the squared vertical distances between observed points and the regression line.</p>' +
        '<div class="formula-block">Minimize: &Sigma;(Y<sub>i</sub> - &Ycirc;<sub>i</sub>)&sup2; = &Sigma;(Y<sub>i</sub> - &beta;<sub>0</sub> - &beta;<sub>1</sub>X<sub>i</sub>)&sup2;</div>' +
        '<h3>Key Metrics</h3>' +
        '<table class="data-table"><thead><tr><th>Metric</th><th>What It Tells You</th><th>Ideal</th></tr></thead><tbody>' +
        '<tr><td><strong>R&sup2;</strong></td><td>Proportion of variance in Y explained by X</td><td>Close to 1.0</td></tr>' +
        '<tr><td><strong>Adjusted R&sup2;</strong></td><td>R&sup2; adjusted for predictors</td><td>Close to 1.0</td></tr>' +
        '<tr><td><strong>p-value</strong></td><td>Statistical significance</td><td>&lt; 0.05</td></tr>' +
        '<tr><td><strong>Std Error</strong></td><td>Average prediction error</td><td>Low</td></tr>' +
        '<tr><td><strong>F-statistic</strong></td><td>Overall model significance</td><td>p &lt; 0.05</td></tr></tbody></table>' +
        '<h3>Assumptions</h3>' +
        '<ul class="assumptions-list">' +
        '<li><strong>Linearity</strong> — The relationship between X and Y is linear</li>' +
        '<li><strong>Independence</strong> — Observations are independent</li>' +
        '<li><strong>Homoscedasticity</strong> — Constant variance of residuals</li>' +
        '<li><strong>Normality</strong> — Residuals are approximately normally distributed</li>' +
        '<li><strong>No significant outliers</strong></li></ul>' +
        '<h3>Business Applications</h3>' +
        '<div class="info-box example"><h4>Real-World Examples</h4><p>' +
        '<strong>Marketing:</strong> Predicting sales from advertising spend<br>' +
        '<strong>Finance:</strong> Estimating stock returns from market index (CAPM Beta)<br>' +
        '<strong>Operations:</strong> Forecasting production costs from output<br>' +
        '<strong>HR:</strong> Predicting performance from training hours<br>' +
        '<strong>Real Estate:</strong> Estimating house prices from square footage</p></div>' +
        '<h3>Interpreting the Output</h3><ol>' +
        '<li><strong>Coefficient (&beta;<sub>1</sub>):</strong> A $1 increase in X leads to &beta;<sub>1</sub> change in Y</li>' +
        '<li><strong>p-value:</strong> If &lt; 0.05, the relationship is statistically significant</li>' +
        '<li><strong>R&sup2;:</strong> What % of variation in Y is explained by X?</li>' +
        '<li><strong>Residual plots:</strong> Check for patterns — curves suggest non-linearity</li></ol>' +
        '<div class="info-box warning"><h4>Common Pitfall: Correlation &ne; Causation</h4><p>A strong R&sup2; does not prove that X <em>causes</em> Y. Always combine statistical evidence with domain knowledge.</p></div>' +
        '</div>';
    },
    solved: function() {
        return '<div class="content-section">' +
        '<h2><i class="fas fa-check-circle"></i> Solved Problems</h2>' +
        '<div class="solved-problem open">' +
            '<div class="solved-problem-header" onclick="toggleSolvedProblem(this)"><h4>Problem 1: Advertising and Sales Revenue</h4><i class="fas fa-chevron-down"></i></div>' +
            '<div class="solved-problem-body">' +
                '<p><strong>Scenario:</strong> A retail company wants to understand the relationship between monthly advertising expenditure ($K) and monthly sales revenue ($K).</p>' +
                '<table class="data-table"><thead><tr><th>Month</th><th>Ad Spend ($K)</th><th>Sales ($K)</th></tr></thead><tbody>' +
                '<tr><td>Jan</td><td>10</td><td>100</td></tr><tr><td>Feb</td><td>12</td><td>120</td></tr><tr><td>Mar</td><td>15</td><td>140</td></tr>' +
                '<tr><td>Apr</td><td>14</td><td>130</td></tr><tr><td>May</td><td>18</td><td>160</td></tr><tr><td>Jun</td><td>20</td><td>180</td></tr>' +
                '<tr><td>Jul</td><td>22</td><td>190</td></tr><tr><td>Aug</td><td>25</td><td>210</td></tr><tr><td>Sep</td><td>23</td><td>200</td></tr>' +
                '<tr><td>Oct</td><td>28</td><td>230</td></tr><tr><td>Nov</td><td>30</td><td>250</td></tr><tr><td>Dec</td><td>35</td><td>280</td></tr></tbody></table>' +
                makeCodeBlock('slr-solved-1', 'slr-solved-1') +
                '<div class="interpretation"><h4>Business Interpretation</h4><ul>' +
                '<li>Each additional $1,000 in advertising generates approximately <strong>$7,220</strong> in additional sales</li>' +
                '<li>R&sup2; of 0.994 means advertising explains <strong>99.4%</strong> of sales variation</li>' +
                '<li>If the company spends $32K on ads, expected sales are ~<strong>$259K</strong></li>' +
                '<li>P-value &lt; 0.0001 — the relationship is statistically significant</li></ul></div>' +
            '</div>' +
        '</div>' +
        '<div class="solved-problem">' +
            '<div class="solved-problem-header" onclick="toggleSolvedProblem(this)"><h4>Problem 2: Store Size and Annual Revenue</h4><i class="fas fa-chevron-down"></i></div>' +
            '<div class="solved-problem-body">' +
                '<p><strong>Scenario:</strong> A supermarket chain wants to determine if store size (in 1000 sq ft) predicts annual revenue ($M).</p>' +
                '<table class="data-table"><thead><tr><th>Store</th><th>Size (K sqft)</th><th>Revenue ($M)</th></tr></thead><tbody>' +
                '<tr><td>1</td><td>5</td><td>2.1</td></tr><tr><td>2</td><td>8</td><td>3.5</td></tr><tr><td>3</td><td>12</td><td>5.2</td></tr>' +
                '<tr><td>4</td><td>15</td><td>6.8</td></tr><tr><td>5</td><td>10</td><td>4.1</td></tr><tr><td>6</td><td>20</td><td>8.5</td></tr>' +
                '<tr><td>7</td><td>18</td><td>7.9</td></tr><tr><td>8</td><td>25</td><td>10.2</td></tr><tr><td>9</td><td>30</td><td>12.1</td></tr>' +
                '<tr><td>10</td><td>7</td><td>2.9</td></tr></tbody></table>' +
                makeCodeBlock('slr-solved-2', 'slr-solved-2') +
                '<div class="interpretation"><h4>Business Decision</h4><p>For a proposed 22,000 sqft store, expected annual revenue is approximately <strong>$9.0M</strong>. Use for lease cost-benefit analysis.</p></div>' +
            '</div>' +
        '</div></div>';
    },
    exercises: function() {
        return '<div class="content-section"><h2><i class="fas fa-pencil-alt"></i> Practice Exercises</h2>' +
        '<div class="exercise-card"><span class="difficulty easy">Easy</span><h4>Exercise 1: Hotel Pricing</h4>' +
        '<p>Data: Rates=[80,100,120,150,180,200], Occupancy=[95,88,82,70,60,52]. Fit SLR with Rate as X and Occupancy as Y. Interpret the slope. Predict occupancy at $140. Is it significant at 5%?</p>' +
        '<button class="hint-toggle" onclick="toggleHint(this)">Show Hint</button>' +
        '<div class="hint-content"><p>Expect a negative slope (higher rates = lower occupancy). R&sup2; should be very high.</p></div></div>' +
        '<div class="exercise-card"><span class="difficulty medium">Medium</span><h4>Exercise 2: Training and Productivity</h4>' +
        '<p>Training Hours: [5,10,15,20,25,8,30,12,35,40], Productivity: [55,60,68,72,78,58,82,63,88,90]. Build model, report R&sup2;, predict at 22hrs, find hours needed for score 75, check residuals.</p>' +
        '<button class="hint-toggle" onclick="toggleHint(this)">Show Hint</button>' +
        '<div class="hint-content"><p>For task 4, rearrange: X = (Y - &beta;<sub>0</sub>) / &beta;<sub>1</sub>. Plot residuals to check assumptions.</p></div></div>' +
        '<div class="exercise-card"><span class="difficulty hard">Hard</span><h4>Exercise 3: CAPM Beta Estimation</h4>' +
        '<p>Market Returns: [2.1,-1.5,3.2,0.8,-2.1,1.5,2.8,-0.5,1.2,3.5,-1.8,2.0], Stock Returns: [3.5,-2.8,5.1,1.0,-3.5,2.2,4.2,-1.2,1.8,5.5,-3.0,3.1]. Run regression, interpret Beta and Alpha, test if Beta &ne; 1, predict stock return if market returns 4%.</p>' +
        '<button class="hint-toggle" onclick="toggleHint(this)">Show Hint</button>' +
        '<div class="hint-content"><p>Beta &gt; 1 = aggressive stock. To test Beta &ne; 1: t = (Beta - 1) / SE(Beta).</p></div></div></div>';
    },
    tryit: function() { return makeTryItSection('simple-regression', 'slr'); }
};

// ===================== MULTIPLE REGRESSION =====================
CONTENT['multiple-regression'] = {
    title: 'Multiple Linear Regression',
    subtitle: 'Modeling relationships with multiple predictor variables',
    tabs: ['Tutorial', 'Solved Problems', 'Exercises', 'Try It'],
    tutorial: function() {
        return '<div class="content-section">' +
        '<h2><i class="fas fa-book"></i> What is Multiple Linear Regression?</h2>' +
        '<p>Multiple regression uses <strong>two or more independent variables</strong> to predict a dependent variable, quantifying each predictor\'s unique contribution while controlling for the others.</p>' +
        '<div class="info-box concept"><h4>Key Business Question</h4><p>"What drives our sales? Is it advertising, pricing, store location, or a combination? And by how much does each factor contribute?"</p></div>' +
        '<h3>The Model</h3><div class="formula-block">Y = &beta;<sub>0</sub> + &beta;<sub>1</sub>X<sub>1</sub> + &beta;<sub>2</sub>X<sub>2</sub> + ... + &beta;<sub>k</sub>X<sub>k</sub> + &epsilon;</div>' +
        '<p>Each &beta;<sub>i</sub> = <strong>partial effect</strong> of X<sub>i</sub> on Y, holding all other variables constant.</p>' +
        '<h3>Key Concepts</h3>' +
        '<h4>1. Adjusted R-squared</h4><p>Penalizes for adding irrelevant predictors. Always use Adjusted R&sup2; when comparing models with different numbers of predictors.</p>' +
        '<h4>2. Multicollinearity</h4><p>When predictors are highly correlated, individual effects become unstable.</p>' +
        '<div class="info-box warning"><h4>Detecting Multicollinearity: VIF</h4><p><strong>Variance Inflation Factor:</strong> VIF &gt; 5 is concerning; VIF &gt; 10 is severe. Remedies: drop a variable, combine variables, or use ridge regression.</p></div>' +
        '<h4>3. Dummy Variables</h4><p>Categorical variables need k-1 dummy variables (0/1). The omitted category is the reference group.</p>' +
        '<h4>4. Interaction Effects</h4><p>When the effect of one variable depends on another. Captured via X<sub>1</sub> &times; X<sub>2</sub> terms.</p>' +
        '<h3>Model Building Strategy</h3><ol>' +
        '<li><strong>Start with theory:</strong> Include variables that make business sense</li>' +
        '<li><strong>Check correlations:</strong> Examine pairwise correlations and VIF</li>' +
        '<li><strong>Fit the model:</strong> Run regression and check significance</li>' +
        '<li><strong>Evaluate:</strong> R&sup2;, Adjusted R&sup2;, F-test, individual t-tests</li>' +
        '<li><strong>Diagnose:</strong> Residual plots, normality, outliers</li>' +
        '<li><strong>Refine:</strong> Remove insignificant variables, check interactions</li></ol>' +
        '<h3>Business Applications</h3>' +
        '<div class="info-box example"><h4>Real-World Examples</h4><p>' +
        '<strong>Marketing Mix:</strong> Sales = f(TV, Digital, Price, Season)<br>' +
        '<strong>Real Estate:</strong> Price = f(Sqft, Beds, Location, Age)<br>' +
        '<strong>Compensation:</strong> Salary = f(Experience, Education, Dept)<br>' +
        '<strong>Satisfaction:</strong> CSAT = f(Wait, Quality, Price, Ambiance)</p></div>' +
        '<h3>Assumptions</h3><ul class="assumptions-list">' +
        '<li><strong>Linearity</strong> — Linear relationship between each X and Y</li>' +
        '<li><strong>Independence</strong> — Observations are independent</li>' +
        '<li><strong>Homoscedasticity</strong> — Constant variance of residuals</li>' +
        '<li><strong>Normality</strong> — Normally distributed residuals</li>' +
        '<li><strong>No Multicollinearity</strong> — Predictors not highly correlated</li>' +
        '<li><strong>No Specification Errors</strong> — Relevant variables included</li></ul></div>';
    },
    solved: function() {
        return '<div class="content-section"><h2><i class="fas fa-check-circle"></i> Solved Problems</h2>' +
        '<div class="solved-problem open"><div class="solved-problem-header" onclick="toggleSolvedProblem(this)"><h4>Problem 1: Real Estate Price Prediction</h4><i class="fas fa-chevron-down"></i></div>' +
        '<div class="solved-problem-body"><p><strong>Scenario:</strong> Model house prices based on size (sqft), bedrooms, and age.</p>' +
        makeCodeBlock('mlr-solved-1', 'mlr-solved-1') +
        '<div class="interpretation"><h4>Business Interpretation</h4><ul>' +
        '<li><strong>Sqft</strong> has the strongest effect — each additional sqft adds ~$0.13K</li>' +
        '<li><strong>Bedrooms</strong> add ~$15-20K per bedroom after controlling for size</li>' +
        '<li><strong>Age</strong> has negative coefficient — older houses sell for ~$3-4K less per year</li>' +
        '<li>Adjusted R&sup2; &gt; 0.99 — excellent model fit</li></ul></div></div></div>' +
        '<div class="solved-problem"><div class="solved-problem-header" onclick="toggleSolvedProblem(this)"><h4>Problem 2: Marketing Mix Model</h4><i class="fas fa-chevron-down"></i></div>' +
        '<div class="solved-problem-body"><p><strong>Scenario:</strong> How do TV ads, digital marketing, and price discounts affect weekly unit sales?</p>' +
        makeCodeBlock('mlr-solved-2', 'mlr-solved-2') +
        '<div class="interpretation"><h4>Business Insight</h4><p>Digital marketing shows the highest ROI per dollar spent compared to TV advertising. Discounts drive volume but should be used strategically to avoid margin erosion.</p></div></div></div></div>';
    },
    exercises: function() {
        return '<div class="content-section"><h2><i class="fas fa-pencil-alt"></i> Practice Exercises</h2>' +
        '<div class="exercise-card"><span class="difficulty easy">Easy</span><h4>Exercise 1: Employee Salary Model</h4>' +
        '<p>Predict salary from experience, education level (1-3), and department (0/1). Report Adjusted R&sup2;, identify strongest predictor, check VIF, make a prediction.</p>' +
        '<button class="hint-toggle" onclick="toggleHint(this)">Show Hint</button>' +
        '<div class="hint-content"><p>Department is already a dummy. Education could be ordinal or dummies.</p></div></div>' +
        '<div class="exercise-card"><span class="difficulty medium">Medium</span><h4>Exercise 2: Restaurant Revenue Drivers</h4>' +
        '<p>Predict monthly revenue from: seating capacity, avg meal price, Yelp rating, and bar (0/1). Check all variables\' significance, try backward elimination, interpret the bar coefficient.</p>' +
        '<button class="hint-toggle" onclick="toggleHint(this)">Show Hint</button>' +
        '<div class="hint-content"><p>Bar coefficient = average revenue difference between locations with/without a bar, controlling for other factors.</p></div></div>' +
        '<div class="exercise-card"><span class="difficulty hard">Hard</span><h4>Exercise 3: Model Comparison</h4>' +
        '<p>Using real estate data: fit 3 nested models, compare R&sup2; and Adjusted R&sup2;, check VIF, plot residuals, perform partial F-test for age.</p>' +
        '<button class="hint-toggle" onclick="toggleHint(this)">Show Hint</button>' +
        '<div class="hint-content"><p>Partial F = [(SSR_reduced - SSR_full)/q] / [SSR_full/(n-k-1)]</p></div></div></div>';
    },
    tryit: function() { return makeTryItSection('multiple-regression', 'mlr'); }
};

// ===================== LOGISTIC REGRESSION =====================
CONTENT['logistic-regression'] = {
    title: 'Logistic Regression',
    subtitle: 'Predicting binary outcomes and classification',
    tabs: ['Tutorial', 'Solved Problems', 'Exercises', 'Try It'],
    tutorial: function() {
        return '<div class="content-section">' +
        '<h2><i class="fas fa-book"></i> What is Logistic Regression?</h2>' +
        '<p>Logistic Regression predicts <strong>binary outcomes</strong> (0/1). Instead of predicting a value, it predicts the <strong>probability</strong> that an observation belongs to a class.</p>' +
        '<div class="info-box concept"><h4>Key Business Question</h4><p>"Which customers will churn?" "Will this loan applicant default?" "Will a prospect click our ad?"</p></div>' +
        '<h3>Why Not Linear Regression?</h3><p>Linear regression can predict outside [0,1]. Logistic regression uses the <strong>sigmoid function</strong> to constrain predictions between 0 and 1.</p>' +
        '<h3>The Logistic Function</h3><div class="formula-block">P(Y=1) = 1 / (1 + e<sup>-(&beta;<sub>0</sub> + &beta;<sub>1</sub>X<sub>1</sub> + ... + &beta;<sub>k</sub>X<sub>k</sub>)</sup>)</div>' +
        '<h3>The Logit (Log-Odds)</h3><div class="formula-block">log(P / (1-P)) = &beta;<sub>0</sub> + &beta;<sub>1</sub>X<sub>1</sub> + ... + &beta;<sub>k</sub>X<sub>k</sub></div>' +
        '<h3>Interpreting Coefficients</h3>' +
        '<table class="data-table"><thead><tr><th>Concept</th><th>Formula</th><th>Interpretation</th></tr></thead><tbody>' +
        '<tr><td>Log-Odds</td><td>&beta;<sub>1</sub></td><td>1-unit increase in X changes log-odds by &beta;<sub>1</sub></td></tr>' +
        '<tr><td>Odds Ratio</td><td>e<sup>&beta;<sub>1</sub></sup></td><td>1-unit increase in X multiplies odds by e<sup>&beta;<sub>1</sub></sup></td></tr>' +
        '<tr><td>Probability</td><td>Sigmoid</td><td>Non-linear — depends on all X values</td></tr></tbody></table>' +
        '<h3>Evaluation Metrics</h3>' +
        '<table class="data-table"><thead><tr><th>Metric</th><th>Description</th><th>Best For</th></tr></thead><tbody>' +
        '<tr><td><strong>Accuracy</strong></td><td>% correct predictions</td><td>Balanced classes</td></tr>' +
        '<tr><td><strong>Confusion Matrix</strong></td><td>TP, TN, FP, FN</td><td>Detailed view</td></tr>' +
        '<tr><td><strong>Precision</strong></td><td>TP/(TP+FP)</td><td>Costly false positives</td></tr>' +
        '<tr><td><strong>Recall</strong></td><td>TP/(TP+FN)</td><td>Costly false negatives</td></tr>' +
        '<tr><td><strong>AUC-ROC</strong></td><td>Area under ROC curve</td><td>Overall discrimination</td></tr></tbody></table>' +
        '<div class="info-box tip"><h4>Choosing the Threshold</h4><p>Default is 0.5, but not always optimal. Fraud detection: lower to 0.3 for higher recall. Marketing: raise to 0.7 for higher precision.</p></div>' +
        '<h3>Business Applications</h3>' +
        '<div class="info-box example"><h4>Real-World Examples</h4><p>' +
        '<strong>Banking:</strong> Credit scoring<br><strong>Marketing:</strong> Churn prediction<br>' +
        '<strong>Healthcare:</strong> Disease diagnosis<br><strong>E-commerce:</strong> Purchase prediction<br>' +
        '<strong>HR:</strong> Employee attrition</p></div></div>';
    },
    solved: function() {
        return '<div class="content-section"><h2><i class="fas fa-check-circle"></i> Solved Problems</h2>' +
        '<div class="solved-problem open"><div class="solved-problem-header" onclick="toggleSolvedProblem(this)"><h4>Problem 1: Customer Churn Prediction</h4><i class="fas fa-chevron-down"></i></div>' +
        '<div class="solved-problem-body"><p><strong>Scenario:</strong> Predict churn based on monthly charges, contract length, and support calls.</p>' +
        makeCodeBlock('log-solved-1', 'log-solved-1') +
        '<div class="interpretation"><h4>Business Interpretation</h4><ul>' +
        '<li><strong>Support calls</strong> is the strongest churn predictor</li>' +
        '<li><strong>Contract length</strong> is protective — longer contracts reduce churn</li>' +
        '<li><strong>Action:</strong> Proactively reach out to customers with 3+ support calls on short contracts</li></ul></div></div></div>' +
        '<div class="solved-problem"><div class="solved-problem-header" onclick="toggleSolvedProblem(this)"><h4>Problem 2: Loan Default Prediction</h4><i class="fas fa-chevron-down"></i></div>' +
        '<div class="solved-problem-body"><p><strong>Scenario:</strong> Predict loan defaults based on credit score, DTI ratio, and loan amount.</p>' +
        makeCodeBlock('log-solved-2', 'log-solved-2') +
        '</div></div></div>';
    },
    exercises: function() {
        return '<div class="content-section"><h2><i class="fas fa-pencil-alt"></i> Practice Exercises</h2>' +
        '<div class="exercise-card"><span class="difficulty easy">Easy</span><h4>Exercise 1: Email Click-Through</h4>' +
        '<p>Predict click (1/0) from: past purchases, days since last visit, opened previous emails (1/0).</p>' +
        '<button class="hint-toggle" onclick="toggleHint(this)">Show Hint</button>' +
        '<div class="hint-content"><p>More purchases and opening emails increase click probability. More days since visit decreases it.</p></div></div>' +
        '<div class="exercise-card"><span class="difficulty medium">Medium</span><h4>Exercise 2: Employee Attrition</h4>' +
        '<p>Build model with satisfaction, tenure, salary, overtime. Calculate accuracy, precision, recall. Identify key predictors.</p>' +
        '<button class="hint-toggle" onclick="toggleHint(this)">Show Hint</button>' +
        '<div class="hint-content"><p>Low satisfaction and high overtime are typically strong predictors of attrition.</p></div></div>' +
        '<div class="exercise-card"><span class="difficulty hard">Hard</span><h4>Exercise 3: Multi-Threshold Analysis</h4>' +
        '<p>Calculate accuracy, precision, recall at thresholds 0.3, 0.4, 0.5, 0.6, 0.7. If losing a customer costs 5x a retention offer, which threshold is optimal?</p>' +
        '<button class="hint-toggle" onclick="toggleHint(this)">Show Hint</button>' +
        '<div class="hint-content"><p>Total cost = 5*FN + FP. Lower thresholds give higher recall (fewer missed churners) but more false alarms.</p></div></div></div>';
    },
    tryit: function() { return makeTryItSection('logistic-regression', 'log'); }
};

// ===================== FACTOR ANALYSIS =====================
CONTENT['factor-analysis'] = {
    title: 'Factor Analysis',
    subtitle: 'Discovering latent constructs and reducing dimensionality',
    tabs: ['Tutorial', 'Solved Problems', 'Exercises', 'Try It'],
    tutorial: function() {
        return '<div class="content-section">' +
        '<h2><i class="fas fa-book"></i> What is Factor Analysis?</h2>' +
        '<p>Factor Analysis identifies <strong>underlying latent factors</strong> that explain patterns of correlations among observed variables, reducing many variables into fewer meaningful factors.</p>' +
        '<div class="info-box concept"><h4>Key Business Question</h4><p>"We measured 20 aspects of customer satisfaction. Can we summarize these into 3-4 key dimensions?"</p></div>' +
        '<h3>Types</h3>' +
        '<table class="data-table"><thead><tr><th>Type</th><th>Purpose</th><th>When to Use</th></tr></thead><tbody>' +
        '<tr><td><strong>Exploratory (EFA)</strong></td><td>Discover structure</td><td>Don\'t know factors upfront</td></tr>' +
        '<tr><td><strong>Confirmatory (CFA)</strong></td><td>Test hypothesized structure</td><td>Have a theory to test</td></tr>' +
        '<tr><td><strong>PCA</strong></td><td>Reduce dimensions</td><td>Create composite scores</td></tr></tbody></table>' +
        '<h3>Key Concepts</h3>' +
        '<h4>1. Eigenvalues &amp; Scree Plot</h4><p>Eigenvalues show how much variance each factor explains. <strong>Kaiser criterion:</strong> retain factors with eigenvalue &gt; 1. <strong>Scree plot:</strong> look for the "elbow."</p>' +
        '<h4>2. Factor Loadings</h4><p>Correlations between variables and factors. Loading &gt; |0.40| is meaningful. Each variable should load high on one factor.</p>' +
        '<h4>3. Rotation</h4><ul><li><strong>Varimax</strong> (orthogonal) — uncorrelated factors, cleaner structure</li><li><strong>Promax</strong> (oblique) — allows correlated factors, more realistic</li></ul>' +
        '<h4>4. Communality</h4><p>Proportion of variance explained by retained factors. Low (&lt; 0.40) = poor fit.</p>' +
        '<h3>Steps</h3><ol><li>Check suitability: KMO &gt; 0.6, Bartlett\'s test significant</li><li>Extract factors: eigenvalues, scree plot</li><li>Rotate: varimax or promax</li><li>Interpret: label factors from high-loading variables</li><li>Compute factor scores</li></ol>' +
        '<h3>Business Applications</h3>' +
        '<div class="info-box example"><h4>Examples</h4><p>' +
        '<strong>Marketing:</strong> Brand perception dimensions<br><strong>HR:</strong> Engagement survey dimensions<br>' +
        '<strong>Finance:</strong> Common risk factors<br><strong>Product:</strong> Feature clustering</p></div>' +
        '<div class="info-box warning"><h4>Pitfalls</h4><p><strong>Sample size:</strong> 5-10 obs per variable (min 100).<br><strong>Over-extraction:</strong> Too many factors = noise.<br><strong>Naming:</strong> Factor names are subjective — ensure loadings support them.</p></div></div>';
    },
    solved: function() {
        return '<div class="content-section"><h2><i class="fas fa-check-circle"></i> Solved Problems</h2>' +
        '<div class="solved-problem open"><div class="solved-problem-header" onclick="toggleSolvedProblem(this)"><h4>Problem 1: Hotel Satisfaction Survey</h4><i class="fas fa-chevron-down"></i></div>' +
        '<div class="solved-problem-body"><p><strong>Scenario:</strong> 200 guests rated 8 aspects of their stay. Identify underlying satisfaction dimensions.</p>' +
        '<p>Variables: V1=Cleanliness, V2=Comfort, V3=Bathroom, V4=Staff friendliness, V5=Check-in speed, V6=Concierge, V7=Food quality, V8=Restaurant service</p>' +
        makeCodeBlock('fa-solved-1', 'fa-solved-1') +
        '<div class="interpretation"><h4>Business Interpretation</h4><ul>' +
        '<li>8 items reduce to <strong>3 dimensions</strong>: Room Quality, Staff Service, Dining</li>' +
        '<li>Track 3 KPIs instead of 8 metrics</li>' +
        '<li>Factor scores enable <strong>customer segmentation</strong></li>' +
        '<li>If dining scores are low but room scores high, prioritize restaurant improvements</li></ul></div></div></div></div>';
    },
    exercises: function() {
        return '<div class="content-section"><h2><i class="fas fa-pencil-alt"></i> Practice Exercises</h2>' +
        '<div class="exercise-card"><span class="difficulty easy">Easy</span><h4>Exercise 1: Brand Perception</h4>' +
        '<p>6 attributes: Innovative, Modern, Reliable, Trustworthy, Affordable, Value. Run FA and identify 2 factors.</p>' +
        '<button class="hint-toggle" onclick="toggleHint(this)">Show Hint</button>' +
        '<div class="hint-content"><p>Expected: "Brand Image" (Innovative, Modern) and "Value Proposition" (Reliable, Trustworthy, Affordable, Value).</p></div></div>' +
        '<div class="exercise-card"><span class="difficulty medium">Medium</span><h4>Exercise 2: Employee Engagement</h4>' +
        '<p>10-item survey: Check KMO/Bartlett, determine factors, rotate, name, compute Cronbach\'s alpha.</p>' +
        '<button class="hint-toggle" onclick="toggleHint(this)">Show Hint</button>' +
        '<div class="hint-content"><p>Expect 2-4 factors. Alpha &gt; 0.7 is acceptable. Remove items with all loadings &lt; 0.4.</p></div></div>' +
        '<div class="exercise-card"><span class="difficulty hard">Hard</span><h4>Exercise 3: Rotation Comparison</h4>' +
        '<p>Compare no rotation, varimax, and promax. Which gives cleanest "simple structure"? When prefer promax?</p>' +
        '<button class="hint-toggle" onclick="toggleHint(this)">Show Hint</button>' +
        '<div class="hint-content"><p>Promax is preferred when factors are expected to correlate (common in business). Compare inter-factor correlations.</p></div></div></div>';
    },
    tryit: function() { return makeTryItSection('factor-analysis', 'fa'); }
};

// ===================== CLUSTER ANALYSIS =====================
CONTENT['cluster-analysis'] = {
    title: 'Cluster Analysis',
    subtitle: 'Hierarchical and Non-hierarchical clustering for market segmentation',
    tabs: ['Tutorial', 'Solved Problems', 'Exercises', 'Try It'],
    tutorial: function() {
        return '<div class="content-section">' +
        '<h2><i class="fas fa-book"></i> What is Cluster Analysis?</h2>' +
        '<p>Cluster Analysis groups objects into <strong>clusters</strong> where within-cluster objects are similar and between-cluster objects are dissimilar. It is <strong>unsupervised</strong> — no target variable.</p>' +
        '<div class="info-box concept"><h4>Key Business Question</h4><p>"Can we segment our customers into distinct groups to tailor marketing strategies?"</p></div>' +
        '<h2><i class="fas fa-sitemap"></i> Hierarchical Clustering</h2>' +
        '<p>Creates a <strong>dendrogram</strong> showing how clusters merge or split.</p>' +
        '<h3>Linkage Methods</h3>' +
        '<table class="data-table"><thead><tr><th>Method</th><th>Distance Definition</th><th>Characteristic</th></tr></thead><tbody>' +
        '<tr><td><strong>Single</strong></td><td>Min distance between pairs</td><td>Elongated clusters; chaining</td></tr>' +
        '<tr><td><strong>Complete</strong></td><td>Max distance between pairs</td><td>Compact, spherical clusters</td></tr>' +
        '<tr><td><strong>Average</strong></td><td>Average of all pairs</td><td>Compromise</td></tr>' +
        '<tr><td><strong>Ward\'s</strong></td><td>Minimizes within-cluster variance</td><td>Equal-sized clusters; most popular</td></tr></tbody></table>' +
        '<h2><i class="fas fa-circle-nodes"></i> K-Means Clustering</h2>' +
        '<h3>Algorithm</h3><ol><li>Choose K</li><li>Initialize K centroids</li><li>Assign each point to nearest centroid</li><li>Update centroids to cluster means</li><li>Repeat until convergence</li></ol>' +
        '<h3>Choosing K</h3>' +
        '<table class="data-table"><thead><tr><th>Method</th><th>How</th></tr></thead><tbody>' +
        '<tr><td><strong>Elbow</strong></td><td>Plot WCSS vs K, look for bend</td></tr>' +
        '<tr><td><strong>Silhouette</strong></td><td>Higher = better separation (max 1)</td></tr>' +
        '<tr><td><strong>Gap Statistic</strong></td><td>Compare WCSS vs expected under uniform</td></tr>' +
        '<tr><td><strong>Business Logic</strong></td><td>How many segments can you act on?</td></tr></tbody></table>' +
        '<h3>Comparison</h3>' +
        '<table class="data-table"><thead><tr><th></th><th>Hierarchical</th><th>K-Means</th></tr></thead><tbody>' +
        '<tr><td>Data size</td><td>Small-medium</td><td>Any size</td></tr>' +
        '<tr><td>K needed?</td><td>No (determined after)</td><td>Yes (specify upfront)</td></tr>' +
        '<tr><td>Visualization</td><td>Dendrogram</td><td>Scatter + centroids</td></tr>' +
        '<tr><td>Reproducibility</td><td>Deterministic</td><td>Depends on initialization</td></tr></tbody></table>' +
        '<div class="info-box warning"><h4>Standardize Your Data!</h4><p>Always z-score standardize before clustering. Variables on different scales will dominate distance calculations.</p></div>' +
        '<h3>Business Applications</h3>' +
        '<div class="info-box example"><h4>Examples</h4><p>' +
        '<strong>Customer Segmentation:</strong> RFM-based targeting<br>' +
        '<strong>Market Segmentation:</strong> Geographic market similarity<br>' +
        '<strong>Product Clustering:</strong> Recommendation engines<br>' +
        '<strong>Anomaly Detection:</strong> Points outside all clusters may be fraud</p></div></div>';
    },
    solved: function() {
        return '<div class="content-section"><h2><i class="fas fa-check-circle"></i> Solved Problems</h2>' +
        '<div class="solved-problem open"><div class="solved-problem-header" onclick="toggleSolvedProblem(this)"><h4>Problem 1: Customer Segmentation (K-Means)</h4><i class="fas fa-chevron-down"></i></div>' +
        '<div class="solved-problem-body"><p><strong>Scenario:</strong> Segment 30 customers by annual spending ($K), purchase frequency, and avg order value ($).</p>' +
        makeCodeBlock('ca-solved-1', 'ca-solved-1') +
        '<div class="interpretation"><h4>Business Interpretation</h4><ul>' +
        '<li>Three segments: <strong>Budget Shoppers</strong>, <strong>Regular Buyers</strong>, <strong>Premium Customers</strong></li>' +
        '<li>Each needs a different marketing strategy</li>' +
        '<li>K=3 confirmed by elbow method</li></ul></div></div></div>' +
        '<div class="solved-problem"><div class="solved-problem-header" onclick="toggleSolvedProblem(this)"><h4>Problem 2: Hierarchical Clustering — Market Similarity</h4><i class="fas fa-chevron-down"></i></div>' +
        '<div class="solved-problem-body"><p><strong>Scenario:</strong> Group 8 countries by market similarity using GDP, internet, and ease-of-business scores.</p>' +
        makeCodeBlock('ca-solved-2', 'ca-solved-2') +
        '<div class="interpretation"><h4>Strategy</h4><ul>' +
        '<li><strong>Developed:</strong> USA, UK, Germany, Japan — premium, digital-first</li>' +
        '<li><strong>Emerging:</strong> Brazil, China — value positioning, mobile commerce</li>' +
        '<li><strong>Frontier:</strong> India, Nigeria — basic access, partnerships</li></ul></div></div></div></div>';
    },
    exercises: function() {
        return '<div class="content-section"><h2><i class="fas fa-pencil-alt"></i> Practice Exercises</h2>' +
        '<div class="exercise-card"><span class="difficulty easy">Easy</span><h4>Exercise 1: Product Clustering</h4>' +
        '<p>10 products: Price=[10,25,50,15,80,90,30,70,12,45], Rating=[4.2,3.8,4.5,4.0,3.5,4.8,3.9,4.1,4.3,3.7]. Run K-Means with K=2 and K=3. Profile each cluster.</p>' +
        '<button class="hint-toggle" onclick="toggleHint(this)">Show Hint</button>' +
        '<div class="hint-content"><p>Standardize both variables. Expect "Budget/High-Rated" and "Premium" clusters.</p></div></div>' +
        '<div class="exercise-card"><span class="difficulty medium">Medium</span><h4>Exercise 2: RFM Segmentation</h4>' +
        '<p>Create RFM data for 20 customers. Run both K-Means and hierarchical. Compare segments — do they agree?</p>' +
        '<button class="hint-toggle" onclick="toggleHint(this)">Show Hint</button>' +
        '<div class="hint-content"><p>Typical segments: Champions, Loyal, At Risk, Lost. Use elbow method for K.</p></div></div>' +
        '<div class="exercise-card"><span class="difficulty hard">Hard</span><h4>Exercise 3: Linkage Comparison</h4>' +
        '<p>Run all 4 linkage methods on country data. Compare dendrograms and 3-cluster solutions. Which is most interpretable?</p>' +
        '<button class="hint-toggle" onclick="toggleHint(this)">Show Hint</button>' +
        '<div class="hint-content"><p>Single linkage chains. Complete gives compact clusters. Ward\'s produces balanced clusters.</p></div></div></div>';
    },
    tryit: function() { return makeTryItSection('cluster-analysis', 'ca'); }
};
