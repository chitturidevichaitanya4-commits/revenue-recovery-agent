import csv
from pathlib import Path
from collections import defaultdict


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
# LOAD FEEDBACK DATASET
# ----------------------------------------

def load_feedback_data():

    if not FEEDBACK_DATASET.exists():
        print("Feedback dataset not found.")
        return []

    with open(
        FEEDBACK_DATASET,
        "r",
        newline="",
        encoding="utf-8"
    ) as file:

        reader = csv.DictReader(file)

        return list(reader)


# ----------------------------------------
# ANALYZE FEEDBACK
# ----------------------------------------

def analyze_feedback():

    records = load_feedback_data()

    if not records:
        print("No feedback records available.")
        return

    total_cases = len(records)

    recovered_cases = sum(
        1
        for record in records
        if record["outcome"] == "RECOVERED"
    )

    not_recovered_cases = sum(
        1
        for record in records
        if record["outcome"] == "NOT_RECOVERED"
    )


    # ------------------------------------
    # OVERALL RECOVERY RATE
    # ------------------------------------

    recovery_rate = (
        recovered_cases / total_cases * 100
        if total_cases > 0
        else 0
    )


    # ------------------------------------
    # RECOVERY BY PRIORITY
    # ------------------------------------

    priority_stats = defaultdict(
        lambda: {
            "total": 0,
            "recovered": 0
        }
    )

    for record in records:

        priority = record["predicted_priority"]

        priority_stats[priority]["total"] += 1

        if record["outcome"] == "RECOVERED":
            priority_stats[priority]["recovered"] += 1


    # ------------------------------------
    # RECOVERY BY FAILURE REASON
    # ------------------------------------

    failure_stats = defaultdict(
        lambda: {
            "total": 0,
            "recovered": 0
        }
    )

    for record in records:

        failure_reason = (
            record["failure_reason"]
            if record["failure_reason"]
            else "SUCCESS"
        )

        failure_stats[failure_reason]["total"] += 1

        if record["outcome"] == "RECOVERED":
            failure_stats[failure_reason]["recovered"] += 1


    # ------------------------------------
    # RECOVERY BY PAYMENT METHOD
    # ------------------------------------

    payment_method_stats = defaultdict(
        lambda: {
            "total": 0,
            "recovered": 0
        }
    )

    for record in records:

        payment_method = record["payment_method"]

        payment_method_stats[payment_method]["total"] += 1

        if record["outcome"] == "RECOVERED":
            payment_method_stats[payment_method]["recovered"] += 1


    # ------------------------------------
    # REVENUE OUTCOME ANALYSIS
    # ------------------------------------

    total_revenue = sum(
        float(record["payment_amount"])
        for record in records
    )

    recovered_revenue = sum(
        float(record["payment_amount"])
        for record in records
        if record["outcome"] == "RECOVERED"
    )

    unrecovered_revenue = sum(
        float(record["payment_amount"])
        for record in records
        if record["outcome"] == "NOT_RECOVERED"
    )

    revenue_recovery_rate = (
        recovered_revenue / total_revenue * 100
        if total_revenue > 0
        else 0
    )


    # ------------------------------------
    # PRINT RESULTS
    # ------------------------------------

    print("\n========================================")
    print("       RECOVERY FEEDBACK ANALYSIS")
    print("========================================")

    print(f"\nTotal recovery cases : {total_cases}")
    print(f"Recovered cases      : {recovered_cases}")
    print(f"Not recovered cases  : {not_recovered_cases}")
    print(f"Recovery rate        : {recovery_rate:.2f}%")


    # ------------------------------------
    # REVENUE RESULTS
    # ------------------------------------

    print("\n----------------------------------------")
    print("REVENUE OUTCOME ANALYSIS")
    print("----------------------------------------")

    print(
        f"Total revenue opportunity : "
        f"₹{total_revenue:.2f}"
    )

    print(
        f"Revenue recovered         : "
        f"₹{recovered_revenue:.2f}"
    )

    print(
        f"Revenue not recovered     : "
        f"₹{unrecovered_revenue:.2f}"
    )

    print(
        f"Revenue recovery rate     : "
        f"{revenue_recovery_rate:.2f}%"
    )


    # ------------------------------------
    # PRIORITY RESULTS
    # ------------------------------------

    print("\n----------------------------------------")
    print("RECOVERY BY AI PRIORITY")
    print("----------------------------------------")

    for priority, stats in priority_stats.items():

        rate = (
            stats["recovered"]
            / stats["total"]
            * 100
            if stats["total"] > 0
            else 0
        )

        print(
            f"{priority}: "
            f"{stats['recovered']}/{stats['total']} recovered "
            f"({rate:.2f}%)"
        )


    # ------------------------------------
    # FAILURE REASON RESULTS
    # ------------------------------------

    print("\n----------------------------------------")
    print("RECOVERY BY FAILURE REASON")
    print("----------------------------------------")

    for reason, stats in failure_stats.items():

        rate = (
            stats["recovered"]
            / stats["total"]
            * 100
            if stats["total"] > 0
            else 0
        )

        print(
            f"{reason}: "
            f"{stats['recovered']}/{stats['total']} recovered "
            f"({rate:.2f}%)"
        )


    # ------------------------------------
    # PAYMENT METHOD RESULTS
    # ------------------------------------

    print("\n----------------------------------------")
    print("RECOVERY BY PAYMENT METHOD")
    print("----------------------------------------")

    for method, stats in payment_method_stats.items():

        rate = (
            stats["recovered"]
            / stats["total"]
            * 100
            if stats["total"] > 0
            else 0
        )

        print(
            f"{method}: "
            f"{stats['recovered']}/{stats['total']} recovered "
            f"({rate:.2f}%)"
        )


# ----------------------------------------
# RUN ANALYSIS
# ----------------------------------------

if __name__ == "__main__":

    analyze_feedback()