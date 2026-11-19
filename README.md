# Loan Management System with Integrated Risk Analysis

A full-stack(without auth) loan management application integrating machine learning and explainable AI to support loan officers in evaluating loan eligibility, assessing financial risk, and making informed lending decisions.

## Problem Statement
Credit risk assessment directly impacts a financial institution's profitability and risk exposure. However, current evaluation methods face few major challenges:
- Inconsistent Manual Reviews: Traditional loan evaluation relies heavily on individual judgment, leading to inconsistent decisions across different loan officers and making it difficult to spot complex patterns across interconnected financial variables.
- "Black-Box" AI Models: While machine learning improves prediction accuracy, most high-performing models lack transparency, making it hard for officers to trust or justify automated decisions.
- Rigid All-or-Nothing Decisions: Traditional and ML-based systems typically treat loan amounts as fixed, resulting in a binary approve-or-reject outcome. When an applicant requests an amount that is risky but is on the borderline, outright rejection misses opportunities to offer a smaller, safer loan limit tailored to their financial capacity.

## Project Objective
This project aims to build a data-driven Loan Management System that supports loan officers with accurate, transparent, and actionable credit risk insights:
- Build a Loan Decision Assistant: Assist loan officers in evaluating applications using automated risk assessment and explainable AI.
- Train Credit Risk Prediction Models: Predict loan approval risk using borrower demographics, financial status, credit history, and loan details.
- Benchmark ML Algorithms: Compare Random Forest, XGBoost, LightGBM, and CatBoost across Accuracy, Precision, Recall, F1-Score, and ROC-AUC.
• Provide Transparent Explanations (XAI): Use SHAP analysis and feature importance visualizations to show why a model makes each prediction.
• Recommend Safe Loan Limits: Calculate and suggest a maximum acceptable loan amount to help minimize the risk of default.

## Key Features
1. **Loan System Dashboard:** Managing and handling of loan applications and applicant financial information by loan officer and administrator respectively.

   <img width="1262" height="847" alt="Screenshot 2026-06-30 164217" src="https://github.com/user-attachments/assets/18a5d5ef-7210-4a7f-a84b-479acf22d721" />

   <img width="1257" height="827" alt="Screenshot 2026-06-30 164737" src="https://github.com/user-attachments/assets/6bfcf55c-2b26-4490-a9c4-fe9e852b98ec" />

   <img width="1233" height="572" alt="Screenshot 2026-06-30 164753" src="https://github.com/user-attachments/assets/3bc972ab-b43e-44f8-a029-e5b3a72bab88" />

   <img width="1228" height="801" alt="Screenshot 2026-06-30 164813" src="https://github.com/user-attachments/assets/34aab892-5517-43dc-b82f-ce553300d407" />

2. **Machine Learning-Based Risk Live Prediction:** Immediate prediction of loan risk using four machine learning models: Random Forest, CatBoost, LightGBM and XGBoost when user data are submitted.

   <img width="1151" height="802" alt="Screenshot 2026-06-30 164415" src="https://github.com/user-attachments/assets/4b71d4a3-4662-4e05-8866-d44e1eeb1302" />

3. **Multiple Model Comparison:** Compare predictive outcomes and model performance to produce more consistent results and thus trusted to support decision-making.

   <img width="664" height="366" alt="Screenshot 2026-06-30 164436 - Copy1" src="https://github.com/user-attachments/assets/5da8c11c-3bac-4f9a-af39-3ece3045ccfb" />

   <img width="1041" height="207" alt="Screenshot 2026-06-30 164449" src="https://github.com/user-attachments/assets/0cbb3a5f-24e6-4d89-b5d2-22c9e4a3bbe1" />

4. **Explainable AI (SHAP):** Provide feature contribution explanations to help loan officers understand the top contributing factors influencing individual predictions.

   <img width="654" height="389" alt="Screenshot 2026-06-30 164436 - Copy2" src="https://github.com/user-attachments/assets/ea4b4b4c-ddcd-4a2d-91c0-49c2e8964a65" />

5. **Maximum Loan Amount Recommendation:** Estimate a recommended maximum loan amount that does not fall under the high risk category based on the applicant's financial information.

   <img width="724" height="212" alt="Screenshot 2026-06-30 164415 - Copy1" src="https://github.com/user-attachments/assets/3ef7420b-9340-4537-846e-1df09c006dbc" />

6. **User Management and Audit Logging:** Support user account management, account deactivation and activity tracking.

   <img width="1167" height="781" alt="Screenshot 2026-06-30 165306" src="https://github.com/user-attachments/assets/9c5eebd5-8b91-486d-ac0c-ac744da90af6" />
