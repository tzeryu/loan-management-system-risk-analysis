import pandas as pd
import joblib

model = joblib.load("lightgbm_loan_model.pkl")
model_columns = joblib.load("model_columns.pkl")

def predict_loan(input_dict: dict):
    df_input = pd.DataFrame([input_dict])

    # Apply same encoding as training
    df_input = pd.get_dummies(df_input, drop_first=True)

    # Add missing columns
    for col in model_columns:
        if col not in df_input.columns:
            df_input[col] = 0

    # Remove unexpected columns and reorder
    df_input = df_input[model_columns]

    prob = model.predict_proba(df_input)[0, 1]
    pred = model.predict(df_input)[0]

    risk_level = (
        "Low Risk" if prob >= 0.75 else
        "Moderate Risk" if prob >= 0.50 else
        "High Risk"
    )

    return {
        "prediction": int(pred),
        "approval_probability": float(prob),
        "risk_level": risk_level
    }

sample_input = {
    "age": 35,
    "occupation_status": "Employed",
    "years_employed": 8,
    "annual_income": 60000,
    "credit_score": 720,
    "credit_history_years": 6,
    "savings_assets": 15000,
    "current_debt": 12000,
    "defaults_on_file": 0,
    "delinquencies_last_2yrs": 0,
    "derogatory_marks": 0,
    "product_type": "Personal Loan",
    "loan_intent": "Education",
    "loan_amount": 20000,
    "interest_rate": 8.5,
    "debt_to_income_ratio": 0.25,
    "loan_to_income_ratio": 0.33,
    "payment_to_income_ratio": 0.12
}

predict_loan(sample_input)