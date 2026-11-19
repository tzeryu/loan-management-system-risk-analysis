from fastapi import FastAPI, HTTPException
import joblib
import pandas as pd
import shap 
import xgboost as xgb
import numpy as np
import sklearn

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models = { 
    "random_forest": joblib.load("../model/random_forest_loan_model.pkl"),
    "xgboost": joblib.load("../model/xgboost_loan_model.pkl"),
    "lightgbm": joblib.load("../model/lightgbm_loan_model.pkl"),
    "catboost": joblib.load("../model/catboost_loan_model.pkl")
}
columns = joblib.load("../model/model_columns.pkl")


@app.post("/predict/{model_name}")
def predict(model_name: str ,data: dict):
    model_name = model_name.lower()

    if model_name not in models:
        raise HTTPException(
            status_code=400,
            detail="Invalid model name. Choose from: xgboost, lightgbm, catboost, random_forest"
        )

    model = models[model_name]
        
    df = pd.DataFrame([data])
    df = pd.get_dummies(df)

    for col in columns:
        if col not in df.columns:
            df[col] = 0

    df = df[columns]

    prob = model.predict_proba(df)[0, 1].item()
    prob = max(min(prob, 0.9999), 0.0001)
    prob_percent = round(prob * 100, 2)
    
    pred = model.predict(df)[0].item()

    risk_level = (
        "Low Risk" if prob >= 0.8 else
        "Moderate Risk" if prob >= 0.60 else
        "High Risk"
    )

    return {
        "model_Used": model_name,
        "prediction": int(pred),
        "probability": prob_percent,
        "riskLevel": risk_level
    }

@app.post("/feature-importance/{model_type}")
def feature_importance(model_type: str):
    model_type = model_type.lower()
    model = models.get(model_type)

    if model is None:
        raise HTTPException(status_code=400, detail="Invalid model")

    try:
        # ----------------------------
        # Random Forest / XGBoost / LightGBM / CatBoost
        # ----------------------------
        if hasattr(model, "feature_importances_"):
            importances = model.feature_importances_

        elif model_type == "xgboost":
            importances = model.get_booster().get_score(importance_type="weight")
            importances = [
                importances.get(col, 0) for col in columns
            ]

        else:
            raise HTTPException(
                status_code=400,
                detail="Feature importance not supported for this model"
            )

        # Normalize to percentage
        total = sum(importances) if sum(importances) > 0 else 1

        result = []

        for i, col in enumerate(columns):
            result.append({
                "feature": col,
                "importance": float(importances[i]),
                "importance_percent": float(importances[i] / total * 100)
            })

        # Sort descending
        result = sorted(
            result,
            key=lambda x: x["importance"],
            reverse=True
        )[:10]

        return {
            "model": model_type,
            "features": result
        }

    except Exception as e:
        print("FEATURE IMPORTANCE ERROR:", e)
        raise HTTPException(
            status_code=500,
            detail=f"Feature importance calculation failed: {str(e)}"
        )


@app.post("/shap/{model_type}")
def shap_explain(model_type: str, data: dict):
    model_type = model_type.lower()
    model = models.get(model_type)

    if model is None:
        raise HTTPException(status_code=400, detail="Invalid model")

    df = pd.DataFrame([data])
    df = pd.get_dummies(df)

    for col in columns:
        if col not in df.columns:
            df[col] = 0

    df = df[columns]

    try:
        # XGBoost: use native contribution method
        if model_type == "xgboost":
            dmatrix = xgb.DMatrix(df)
            contribs = model.get_booster().predict(dmatrix, pred_contribs=True)

            # last value is bias/base value, exclude it
            shap_array = contribs[0][:-1]

        # LightGBM / CatBoost
        else:
            explainer = shap.TreeExplainer(model)
            shap_values = explainer.shap_values(df)

            # If SHAP returns Explanation object
            if hasattr(shap_values, "values"):
                shap_values = shap_values.values

            # If binary classifier returns list [class0, class1]
            if isinstance(shap_values, list):
                shap_values = shap_values[1]

            shap_values = np.array(shap_values)

            # Handle shape: (1, features)
            if shap_values.ndim == 2:
                shap_array = shap_values[0]

            # Handle shape: (1, features, classes)
            elif shap_values.ndim == 3:
                shap_array = shap_values[0, :, 1]

            else:
                shap_array = shap_values.flatten()

        result = []

        for i, col in enumerate(columns):
            result.append({
                "feature": col,
                "value": float(df.iloc[0][col]),
                "shap": float(shap_array[i])
            })

        filtered_result = []

        for item in result:
            feature = item["feature"]
            value = item["value"]

            is_one_hot_feature = (
                feature.startswith("loan_intent_") or
                feature.startswith("product_type_") or
                feature.startswith("occupation_status_")
            )

            # Keep numerical features always
            # Keep categorical one-hot features only when value == 1
            if not is_one_hot_feature or value == 1:
                filtered_result.append(item)

        # Sort by SHAP impact and return top 5
        filtered_result = sorted(
            filtered_result,
            key=lambda x: abs(x["shap"]),
            reverse=True
        )[:5]

        return filtered_result

    except Exception as e:
        print("SHAP ERROR:", e)
        raise HTTPException(status_code=500, detail=f"SHAP calculation failed: {str(e)}")

@app.post("/recommend-loan/{model_type}")
def recommend_loan(model_type: str, data: dict):
    model_type = model_type.lower()
    model = models.get(model_type)
    if model is None:
        raise HTTPException(status_code=400, detail="Invalid model")
    requested = float(data.get("loan_amount", 0))
    income = float(data.get("annual_income", 1))  # Avoid division by zero
    # ----------------------------
    # Risk evaluation helper
    # ----------------------------
    def get_risk(df):
        prob = model.predict_proba(df)[0][1]
        if prob >= 0.8:
            return "Low Risk", prob
        elif prob >= 0.6:
            return "Moderate Risk", prob
        else:
            return "High Risk", prob
    # ----------------------------
    # Feature builder - include ALL required features
    # ----------------------------
    def build_features(base_data, loan_amount):
        new_data = base_data.copy()
        new_data["loan_amount"] = loan_amount
        # Recalculate derived ratios
        new_data["loan_to_income_ratio"] = loan_amount / income if income > 0 else 0
        # Estimate payment as a proportion of loan amount
        # Use existing ratio to back-calculate, or default
        base_payment_ratio = base_data.get("payment_to_income_ratio", 0.1)
        original_loan = base_data.get("loan_amount", 1)
        
        if original_loan > 0:
            # Scale payment proportionally with loan amount
            original_payment = base_payment_ratio * income
            payment_per_dollar = original_payment / original_loan
            new_payment = loan_amount * payment_per_dollar
            new_data["payment_to_income_ratio"] = new_payment / income if income > 0 else 0
        else:
            new_data["payment_to_income_ratio"] = base_payment_ratio
        return new_data
    def prepare_dataframe(feature_data):
        df = pd.DataFrame([feature_data])
        df = pd.get_dummies(df)
        for col in columns:
            if col not in df.columns:
                df[col] = 0
        df = df[columns]
        return df
    # ----------------------------
    # Evaluate current risk level
    # ----------------------------
    base_features = build_features(data, requested)
    base_df = prepare_dataframe(base_features)
    base_risk, base_prob = get_risk(base_df)
    # Skip if already Low/Moderate risk
    if base_risk != "High Risk":
        return {
            "recommended_max_loan": requested,
            "original_requested": requested,
            "status": "NO_ADJUSTMENT_NEEDED",
            "reason": f"Applicant is already {base_risk} (probability: {base_prob:.2%})"
        }
    # ----------------------------
    # Binary search for maximum acceptable loan
    # ----------------------------
    low = 0
    high = requested
    best_amount = 0
    found_valid = False
    # First check if even $0 loan would help
    min_features = build_features(data, max(requested * 0.05, 100))
    min_df = prepare_dataframe(min_features)
    min_risk, min_prob = get_risk(min_df)
    if min_risk == "High Risk":
        # Even with $0 loan, still high risk — reject
        return {
            "recommended_max_loan": 0,
            "original_requested": requested,
            "status": "REJECTED",
            "reason": "Cannot reach moderate risk even with minimum loan amount"
        }
    # Binary search for maximum loan that stays at/above moderate risk
    while high - low > 100:  # $100 precision
        mid = (low + high) / 2
        test_features = build_features(data, mid)
        test_df = prepare_dataframe(test_features)
        risk, prob = get_risk(test_df)
        if risk in ["Low Risk", "Moderate Risk"]:
            # This amount works, try higher
            best_amount = mid
            found_valid = True
            low = mid
        else:
            # Too risky, try lower
            high = mid
    # Final validation at best_amount
    if found_valid:
        return {
            "recommended_max_loan": round(best_amount, 2),
            "original_requested": requested,
            "reduction_amount": round(requested - best_amount, 2),
            "reduction_percent": round((1 - best_amount / requested) * 100, 2) if requested > 0 else 0,
            "status": "ADJUSTED",
            "reason": "Loan amount reduced to achieve Moderate Risk or better"
        }
    return {
        "recommended_max_loan": 0,
        "original_requested": requested,
        "status": "REJECTED",
        "reason": "Unable to find acceptable loan amount"
    }