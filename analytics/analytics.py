import sqlite3
from pathlib import Path


# ----------------------------------------
# DATABASE PATH
# ----------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

DATABASE_PATH = (
    BASE_DIR
    / "database"
    / "recovery.db"
)


# ----------------------------------------
# GET TRANSACTIONS
# ----------------------------------------

def get_transactions():

    connection = sqlite3.connect(DATABASE_PATH)

    connection.row_factory = sqlite3.Row

    cursor = connection.cursor()

    cursor.execute("""
        SELECT *
        FROM transactions
        ORDER BY created_at ASC
    """)

    rows = cursor.fetchall()

    connection.close()

    return [dict(row) for row in rows]


# ----------------------------------------
# CALCULATE CASE-AWARE ANALYTICS
# ----------------------------------------

def calculate_analytics():

    transactions = get_transactions()

    if not transactions:

        return {
            "total_attempts": 0,
            "failed_payments": 0,
            "successful_payments": 0,
            "total_customers": 0,
            "total_recovery_cases": 0,
            "recovered_cases": 0,
            "open_cases": 0,
            "revenue_at_risk": 0,
            "revenue_recovered": 0,
            "recovery_rate": 0,
            "high_priority": 0,
            "medium_priority": 0,
            "low_priority": 0
        }


    # ------------------------------------
    # ATTEMPT METRICS
    # ------------------------------------

    total_attempts = len(transactions)

    failed_payments = sum(
        1
        for transaction in transactions
        if transaction["status"] == "FAILED"
    )

    successful_payments = sum(
        1
        for transaction in transactions
        if transaction["status"] == "SUCCESS"
    )


    # ------------------------------------
    # CUSTOMER METRICS
    # ------------------------------------

    customers = set()

    for transaction in transactions:

        customers.add(
            transaction["customer_id"]
        )

    total_customers = len(customers)


    # ------------------------------------
    # RECOVERY CASES
    # ------------------------------------

    cases = {}

    for transaction in transactions:

        case_id = transaction["recovery_case_id"]

        # Safety fallback for old records
        if case_id is None:

            case_id = transaction["transaction_id"]


        # --------------------------------
        # CREATE CASE
        # --------------------------------

        if case_id not in cases:

            cases[case_id] = {

                "customer_id":
                    transaction["customer_id"],

                "amount":
                    transaction["amount"],

                "recovered":
                    False,

                "failed":
                    False,

                # Original AI priority
                "priority":
                    "NONE",

                # Track whether original
                # priority has been captured
                "priority_captured":
                    False
            }


        case = cases[case_id]


        # --------------------------------
        # TRACK FAILURE
        # --------------------------------

        if transaction["status"] == "FAILED":

            case["failed"] = True


        # --------------------------------
        # TRACK SUCCESSFUL RECOVERY
        # --------------------------------

        if transaction["status"] == "SUCCESS":

            case["recovered"] = True


        # --------------------------------
        # CAPTURE ORIGINAL AI PRIORITY
        # --------------------------------
        #
        # IMPORTANT:
        #
        # The AI priority should represent
        # the priority assigned when the
        # recovery case was first detected.
        #
        # We therefore use the FIRST
        # attempt's priority.
        #
        # We do NOT allow a later SUCCESS
        # attempt to overwrite it.
        # --------------------------------

        if (
            not case["priority_captured"]
            and transaction["recovery_priority"]
            in ["HIGH", "MEDIUM", "LOW"]
        ):

            case["priority"] = (
                transaction["recovery_priority"]
            )

            case["priority_captured"] = True


    # ------------------------------------
    # CASE METRICS
    # ------------------------------------

    total_recovery_cases = len(cases)

    recovered_cases = sum(
        1
        for case in cases.values()
        if case["recovered"]
    )

    open_cases = sum(
        1
        for case in cases.values()
        if case["failed"]
        and not case["recovered"]
    )


    # ------------------------------------
    # REVENUE METRICS
    # ------------------------------------

    revenue_at_risk = 0

    revenue_recovered = 0


    for case in cases.values():

        amount = case["amount"]


        # --------------------------------
        # SUCCESSFULLY RECOVERED CASE
        # --------------------------------

        if case["recovered"]:

            revenue_recovered += amount


        # --------------------------------
        # FAILED AND STILL UNRECOVERED
        # --------------------------------

        elif case["failed"]:

            revenue_at_risk += amount


    # ------------------------------------
    # RECOVERY RATE
    # ------------------------------------

    total_recovery_opportunity = (
        revenue_recovered
        + revenue_at_risk
    )


    if total_recovery_opportunity > 0:

        recovery_rate = (
            revenue_recovered
            / total_recovery_opportunity
        ) * 100

    else:

        recovery_rate = 0


    # ------------------------------------
    # AI PRIORITY DISTRIBUTION
    # ------------------------------------
    #
    # Count ALL recovery cases according
    # to their ORIGINAL AI priority.
    #
    # This is intentionally NOT limited
    # to open cases.
    #
    # Example:
    #
    # Attempt 1:
    #   FAILED
    #   AI Priority = MEDIUM
    #
    # Attempt 2:
    #   SUCCESS
    #
    # The case remains MEDIUM priority.
    #
    # The SUCCESS transaction does not
    # change the AI priority distribution.
    # ------------------------------------

    high_priority = sum(
        1
        for case in cases.values()
        if case["priority"] == "HIGH"
    )

    medium_priority = sum(
        1
        for case in cases.values()
        if case["priority"] == "MEDIUM"
    )

    low_priority = sum(
        1
        for case in cases.values()
        if case["priority"] == "LOW"
    )


    # ------------------------------------
    # RETURN ANALYTICS
    # ------------------------------------

    return {

        "total_attempts":
            total_attempts,

        "failed_payments":
            failed_payments,

        "successful_payments":
            successful_payments,

        "total_customers":
            total_customers,

        "total_recovery_cases":
            total_recovery_cases,

        "recovered_cases":
            recovered_cases,

        "open_cases":
            open_cases,

        "revenue_at_risk":
            revenue_at_risk,

        "revenue_recovered":
            revenue_recovered,

        "recovery_rate":
            recovery_rate,

        "high_priority":
            high_priority,

        "medium_priority":
            medium_priority,

        "low_priority":
            low_priority
    }


# ----------------------------------------
# TEST ANALYTICS
# ----------------------------------------

if __name__ == "__main__":

    analytics = calculate_analytics()

    print("\n")
    print("==============================")
    print("       REVENUE ANALYTICS")
    print("==============================")

    print(
        f"Total Customers: "
        f"{analytics['total_customers']}"
    )

    print(
        f"Total Recovery Cases: "
        f"{analytics['total_recovery_cases']}"
    )

    print(
        f"Recovered Cases: "
        f"{analytics['recovered_cases']}"
    )

    print(
        f"Open Recovery Cases: "
        f"{analytics['open_cases']}"
    )

    print(
        f"Total Attempts: "
        f"{analytics['total_attempts']}"
    )

    print(
        f"Failed Payments: "
        f"{analytics['failed_payments']}"
    )

    print(
        f"Successful Payments: "
        f"{analytics['successful_payments']}"
    )

    print(
        f"Revenue at Risk: "
        f"₹{analytics['revenue_at_risk']:.2f}"
    )

    print(
        f"Revenue Recovered: "
        f"₹{analytics['revenue_recovered']:.2f}"
    )

    print(
        f"Recovery Rate: "
        f"{analytics['recovery_rate']:.2f}%"
    )

    print(
        f"High Priority Cases: "
        f"{analytics['high_priority']}"
    )

    print(
        f"Medium Priority Cases: "
        f"{analytics['medium_priority']}"
    )

    print(
        f"Low Priority Cases: "
        f"{analytics['low_priority']}"
    )