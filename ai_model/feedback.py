import csv
from pathlib import Path

from database.database import get_transactions


# ----------------------------------------
# FEEDBACK DATASET PATH
# ----------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

FEEDBACK_DATASET = (
    BASE_DIR
    / "ai_model"
    / "recovery_feedback.csv"
)


# ----------------------------------------
# GENERATE AI FEEDBACK DATASET
# ----------------------------------------

def generate_feedback_dataset():

    transactions = get_transactions()

    if not transactions:

        print("No transaction data available.")

        return


    # ------------------------------------
    # GROUP TRANSACTIONS BY RECOVERY CASE
    # ------------------------------------

    cases = {}

    for transaction in transactions:

        case_id = transaction["recovery_case_id"]

        if case_id not in cases:

            cases[case_id] = []

        cases[case_id].append(transaction)


    # ------------------------------------
    # CREATE FEEDBACK RECORDS
    # ------------------------------------

    feedback_records = []

    for case_id, case_transactions in cases.items():

        first_attempt = case_transactions[0]

        final_attempt = case_transactions[-1]


        # --------------------------------
        # DETERMINE RECOVERY OUTCOME
        # --------------------------------

        recovered = any(
            transaction["status"] == "SUCCESS"
            for transaction in case_transactions
        )


        if recovered:

            outcome = "RECOVERED"

        else:

            outcome = "NOT_RECOVERED"


        # --------------------------------
        # CREATE FEEDBACK RECORD
        # --------------------------------

        feedback_record = {

            "recovery_case_id":
                case_id,

            "customer_id":
                first_attempt["customer_id"],

            "payment_amount":
                first_attempt["amount"],

            "available_balance":
                first_attempt["available_balance"],

            "failure_reason":
                first_attempt["failure_reason"],

            "payment_method":
                first_attempt["payment_method"],

            "attempt_number":
                first_attempt["attempt_number"],

            "predicted_priority":
                first_attempt["recovery_priority"],

            "recovery_decision":
                first_attempt["recovery_decision"],

            "recovery_strategy":
                first_attempt["recovery_strategy"],

            "final_status":
                final_attempt["status"],

            "total_attempts":
                len(case_transactions),

            "outcome":
                outcome
        }


        feedback_records.append(
            feedback_record
        )


    # ------------------------------------
    # SAVE FEEDBACK DATASET
    # ------------------------------------

    fieldnames = [

        "recovery_case_id",
        "customer_id",
        "payment_amount",
        "available_balance",
        "failure_reason",
        "payment_method",
        "attempt_number",
        "predicted_priority",
        "recovery_decision",
        "recovery_strategy",
        "final_status",
        "total_attempts",
        "outcome"
    ]


    with open(
        FEEDBACK_DATASET,
        "w",
        newline="",
        encoding="utf-8"
    ) as file:

        writer = csv.DictWriter(
            file,
            fieldnames=fieldnames
        )

        writer.writeheader()

        writer.writerows(
            feedback_records
        )


    # ------------------------------------
    # RESULT
    # ------------------------------------

    print("\n==============================")
    print("      AI FEEDBACK DATASET")
    print("==============================")

    print(
        f"Recovery cases processed: "
        f"{len(feedback_records)}"
    )

    print(
        f"Feedback dataset created at:"
    )

    print(FEEDBACK_DATASET)

    print(
        "\nRecovery feedback generation completed."
    )


# ----------------------------------------
# TEST FEEDBACK GENERATION
# ----------------------------------------

if __name__ == "__main__":

    generate_feedback_dataset()