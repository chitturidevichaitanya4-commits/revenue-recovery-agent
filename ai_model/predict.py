import joblib
import pandas as pd
from pathlib import Path


# ----------------------------------------
# MODEL PATH
# ----------------------------------------

MODEL_PATH = (
    Path(__file__).resolve().parent
    / "recovery_priority_model.pkl"
)


# ----------------------------------------
# LOAD TRAINED MODEL
# ----------------------------------------

pipeline = joblib.load(MODEL_PATH)


# ----------------------------------------
# PREDICT RECOVERY PRIORITY
# ----------------------------------------

def predict_priority(
    payment_amount,
    available_balance,
    failure_reason,
    payment_method,
    attempt_number
):

    transaction = pd.DataFrame([
        {
            "payment_amount": payment_amount,
            "available_balance": available_balance,
            "failure_reason": failure_reason,
            "payment_method": payment_method,
            "attempt_number": attempt_number
        }
    ])

    prediction = pipeline.predict(transaction)

    return prediction[0]
# ----------------------------------------
# TEST
# ----------------------------------------

if __name__ == "__main__":

    result = predict_priority(
        payment_amount=2000,
        available_balance=5000,
        failure_reason="OTP_FAILED",
        payment_method="CARD",
        attempt_number=1
    )

    print("\nML Prediction:")
    print(result)


