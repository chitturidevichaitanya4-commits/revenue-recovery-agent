import csv
import random


# -----------------------------
# TRAINING DATASET
# -----------------------------
data = []


# -----------------------------
# GENERATE EXAMPLES
# -----------------------------
for _ in range(300):

    payment_amount = random.choice([
        500,
        1000,
        1500,
        2000,
        3000,
        5000,
        7500,
        10000,
        15000,
        20000
    ])

    balance = random.choice([
        100,
        200,
        500,
        1000,
        1500,
        2500,
        5000,
        10000,
        20000
    ])

    failure_reason = random.choice([
        "INSUFFICIENT_FUNDS",
        "OTP_FAILED",
        "BANK_TIMEOUT",
        "CARD_EXPIRED"
    ])

    payment_method = random.choice([
        "UPI",
        "CARD",
        "NET_BANKING"
    ])

    attempt_number = random.randint(1, 3)


    # -----------------------------
    # ASSIGN PRIORITY
    # -----------------------------
    if payment_amount >= 10000:

        priority = "HIGH"

    elif payment_amount >= 2000:

        priority = "MEDIUM"

    else:

        priority = "LOW"


    # -----------------------------
    # STORE EXAMPLE
    # -----------------------------
    data.append({

        "payment_amount": payment_amount,

        "available_balance": balance,

        "failure_reason": failure_reason,

        "payment_method": payment_method,

        "attempt_number": attempt_number,

        "priority": priority
    })


# -----------------------------
# SAVE DATASET
# -----------------------------
with open(
    "training_data.csv",
    "w",
    newline=""
) as file:

    writer = csv.DictWriter(
        file,
        fieldnames=[
            "payment_amount",
            "available_balance",
            "failure_reason",
            "payment_method",
            "attempt_number",
            "priority"
        ]
    )

    writer.writeheader()

    writer.writerows(data)


# -----------------------------
# RESULT
# -----------------------------
print(
    "Training dataset created successfully."
)

print(
    f"Total training examples: {len(data)}"
)

print(
    "File created: training_data.csv"
)