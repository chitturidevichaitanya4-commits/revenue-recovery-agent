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
# LOAD FEEDBACK DATA
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
# BUILD OVERALL STATISTICS
# ----------------------------------------

def build_overall_statistics(records):

    total = len(records)

    recovered = sum(
        1
        for record in records
        if record["outcome"] == "RECOVERED"
    )

    return {
        "total": total,
        "recovered": recovered
    }


# ----------------------------------------
# BUILD FAILURE REASON STATISTICS
# ----------------------------------------

def build_failure_statistics(records):

    statistics = defaultdict(
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

        statistics[failure_reason]["total"] += 1

        if record["outcome"] == "RECOVERED":

            statistics[failure_reason]["recovered"] += 1

    return statistics


# ----------------------------------------
# BUILD PRIORITY + FAILURE STATISTICS
# ----------------------------------------

def build_priority_failure_statistics(records):

    statistics = defaultdict(
        lambda: {
            "total": 0,
            "recovered": 0
        }
    )

    for record in records:

        priority = (
            record["predicted_priority"]
            if record["predicted_priority"]
            else "NONE"
        )

        failure_reason = (
            record["failure_reason"]
            if record["failure_reason"]
            else "SUCCESS"
        )

        key = (
            priority.upper(),
            failure_reason.upper()
        )

        statistics[key]["total"] += 1

        if record["outcome"] == "RECOVERED":

            statistics[key]["recovered"] += 1

    return statistics


# ----------------------------------------
# DETERMINE CONFIDENCE
# ----------------------------------------

def determine_confidence(sample_size):

    if sample_size >= 20:

        return "HIGH"

    elif sample_size >= 5:

        return "MEDIUM"

    else:

        return "LOW"


# ----------------------------------------
# CALCULATE PROBABILITY
# ----------------------------------------

def calculate_probability(
    recovered,
    total
):

    if total <= 0:

        return 0

    return recovered / total


# ----------------------------------------
# ESTIMATE RECOVERY
# ----------------------------------------

def estimate_recovery(
    payment_amount,
    failure_reason,
    ai_priority
):

    records = load_feedback_data()

    if not records:

        return {
            "recovery_probability": 0,
            "expected_recovered_revenue": 0,
            "sample_size": 0,
            "confidence": "LOW",
            "estimation_source": "NO_DATA"
        }


    # ------------------------------------
    # NORMALIZE INPUTS
    # ------------------------------------

    failure_reason = (
        failure_reason
        if failure_reason
        else "SUCCESS"
    ).upper()

    ai_priority = (
        ai_priority
        if ai_priority
        else "NONE"
    ).upper()


    # ------------------------------------
    # BUILD STATISTICS
    # ------------------------------------

    overall_statistics = (
        build_overall_statistics(records)
    )

    failure_statistics = (
        build_failure_statistics(records)
    )

    priority_failure_statistics = (
        build_priority_failure_statistics(records)
    )


    # ------------------------------------
    # LEVEL 1
    # PRIORITY + FAILURE REASON
    # ------------------------------------

    specific_key = (
        ai_priority,
        failure_reason
    )

    specific_stats = (
        priority_failure_statistics.get(
            specific_key
        )
    )


    # We only use the specific combination
    # when there are at least 5 examples.

    if (
        specific_stats
        and specific_stats["total"] >= 5
    ):

        sample_size = (
            specific_stats["total"]
        )

        recovered = (
            specific_stats["recovered"]
        )

        recovery_probability = (
            calculate_probability(
                recovered,
                sample_size
            )
        )

        confidence = determine_confidence(
            sample_size
        )

        estimation_source = (
            "PRIORITY_AND_FAILURE_REASON"
        )


    else:

        # --------------------------------
        # LEVEL 2
        # FAILURE REASON
        # --------------------------------

        failure_stats = (
            failure_statistics.get(
                failure_reason
            )
        )


        if (
            failure_stats
            and failure_stats["total"] >= 5
        ):

            sample_size = (
                failure_stats["total"]
            )

            recovered = (
                failure_stats["recovered"]
            )

            recovery_probability = (
                calculate_probability(
                    recovered,
                    sample_size
                )
            )

            confidence = determine_confidence(
                sample_size
            )

            estimation_source = (
                "FAILURE_REASON"
            )


        else:

            # --------------------------------
            # LEVEL 3
            # OVERALL HISTORY
            # --------------------------------

            sample_size = (
                overall_statistics["total"]
            )

            recovered = (
                overall_statistics["recovered"]
            )

            recovery_probability = (
                calculate_probability(
                    recovered,
                    sample_size
                )
            )

            confidence = determine_confidence(
                sample_size
            )

            estimation_source = (
                "OVERALL_HISTORY"
            )


    # ------------------------------------
    # EXPECTED RECOVERED REVENUE
    # ------------------------------------

    expected_recovered_revenue = (
        payment_amount
        * recovery_probability
    )


    # ------------------------------------
    # RETURN OPTIMIZATION RESULT
    # ------------------------------------

    return {

        "recovery_probability":
            recovery_probability,

        "expected_recovered_revenue":
            expected_recovered_revenue,

        "sample_size":
            sample_size,

        "confidence":
            confidence,

        "estimation_source":
            estimation_source,

        "ai_priority":
            ai_priority,

        "failure_reason":
            failure_reason
    }


# ----------------------------------------
# TEST OPTIMIZER
# ----------------------------------------

if __name__ == "__main__":

    print("\n========================================")
    print("       RECOVERY OPTIMIZER")
    print("========================================")


    test_cases = [

        {
            "payment_amount": 10000,
            "failure_reason": "INSUFFICIENT_FUNDS",
            "ai_priority": "LOW"
        },

        {
            "payment_amount": 10000,
            "failure_reason": "INSUFFICIENT_FUNDS",
            "ai_priority": "HIGH"
        },

        {
            "payment_amount": 10000,
            "failure_reason": "OTP_FAILED",
            "ai_priority": "LOW"
        },

        {
            "payment_amount": 10000,
            "failure_reason": "BANK_TIMEOUT",
            "ai_priority": "MEDIUM"
        },

        {
            "payment_amount": 10000,
            "failure_reason": "CARD_EXPIRED",
            "ai_priority": "MEDIUM"
        },

        {
            "payment_amount": 10000,
            "failure_reason": "UNKNOWN_FAILURE",
            "ai_priority": "MEDIUM"
        }

    ]


    for case in test_cases:

        result = estimate_recovery(

            payment_amount=(
                case["payment_amount"]
            ),

            failure_reason=(
                case["failure_reason"]
            ),

            ai_priority=(
                case["ai_priority"]
            )
        )


        probability = (
            result["recovery_probability"]
            * 100
        )


        expected_revenue = (
            result[
                "expected_recovered_revenue"
            ]
        )


        print("\n----------------------------------------")

        print(
            f"Failure reason       : "
            f"{case['failure_reason']}"
        )

        print(
            f"AI priority          : "
            f"{case['ai_priority']}"
        )

        print(
            f"Payment amount       : "
            f"₹{case['payment_amount']:.2f}"
        )

        print(
            f"Recovery probability : "
            f"{probability:.2f}%"
        )

        print(
            f"Expected recovered revenue : "
            f"₹{expected_revenue:.2f}"
        )

        print(
            f"Historical samples  : "
            f"{result['sample_size']}"
        )

        print(
            f"Confidence           : "
            f"{result['confidence']}"
        )

        print(
            f"Estimation source    : "
            f"{result['estimation_source']}"
        )