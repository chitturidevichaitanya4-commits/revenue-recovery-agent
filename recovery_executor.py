# ----------------------------------------
# RECOVERY ACTION EXECUTOR
# ----------------------------------------

def execute_recovery_action(
    decision,
    payment_amount,
    attempt_number
):

    # ------------------------------------
    # PAYMENT SUCCESS
    # ------------------------------------

    if decision == "PAYMENT_SUCCESS":

        return {
            "execution_status": "COMPLETED",
            "execution_action": "PAYMENT_RECOVERED",
            "next_step": "RECOVERY_COMPLETED",
            "message": (
                "Payment was successfully completed. "
                "Revenue has been recovered."
            )
        }


    # ------------------------------------
    # RETRY PAYMENT
    # ------------------------------------

    elif decision == "RETRY_PAYMENT":

        return {
            "execution_status": "READY",
            "execution_action": "RETRY_PAYMENT",
            "next_step": "NEW_PAYMENT_ATTEMPT",
            "message": (
                f"Payment retry is authorized for "
                f"₹{payment_amount:.2f}."
            )
        }


    # ------------------------------------
    # WAIT FOR FUNDS
    # ------------------------------------

    elif decision == "WAIT_FOR_FUNDS":

        return {
            "execution_status": "WAITING",
            "execution_action": "WAIT_FOR_FUNDS",
            "next_step": "CUSTOMER_FUND_UPDATE",
            "message": (
                "Payment cannot be retried because "
                "the customer does not have sufficient funds."
            )
        }


    # ------------------------------------
    # CUSTOMER ACTION REQUIRED
    # ------------------------------------

    elif decision == "CUSTOMER_ACTION_REQUIRED":

        return {
            "execution_status": "ACTION_REQUIRED",
            "execution_action": "REQUEST_CUSTOMER_ACTION",
            "next_step": "CUSTOMER_ACTION",
            "message": (
                "Customer action is required before "
                "the payment can be retried."
            )
        }


    # ------------------------------------
    # RETRY LATER
    # ------------------------------------

    elif decision == "RETRY_LATER":

        return {
            "execution_status": "SCHEDULED",
            "execution_action": "SCHEDULE_RETRY",
            "next_step": "RETRY_AFTER_WAIT",
            "message": (
                "Payment retry has been scheduled "
                "for a later attempt."
            )
        }


    # ------------------------------------
    # UPDATE PAYMENT METHOD
    # ------------------------------------

    elif decision == "UPDATE_PAYMENT_METHOD":

        return {
            "execution_status": "ACTION_REQUIRED",
            "execution_action": "UPDATE_PAYMENT_METHOD",
            "next_step": "PAYMENT_METHOD_UPDATE",
            "message": (
                "Customer must update the payment method "
                "before the payment can be retried."
            )
        }


    # ------------------------------------
    # MANUAL RECOVERY REVIEW
    # ------------------------------------

    elif decision == "RECOVERY_REVIEW_REQUIRED":

        return {
            "execution_status": "MANUAL_REVIEW",
            "execution_action": "MANUAL_RECOVERY_REVIEW",
            "next_step": "MANUAL_REVIEW",
            "message": (
                "The recovery case requires "
                "manual review."
            )
        }


    # ------------------------------------
    # UNKNOWN DECISION
    # ------------------------------------

    else:

        return {
            "execution_status": "ERROR",
            "execution_action": "UNKNOWN_ACTION",
            "next_step": "MANUAL_REVIEW",
            "message": (
                f"Unknown recovery decision: "
                f"{decision}"
            )
        }


# ----------------------------------------
# TEST EXECUTOR
# ----------------------------------------

if __name__ == "__main__":

    print("\n==============================")
    print("     RECOVERY EXECUTOR TEST")
    print("==============================")

    test_decisions = [
        "RETRY_PAYMENT",
        "WAIT_FOR_FUNDS",
        "CUSTOMER_ACTION_REQUIRED",
        "RETRY_LATER",
        "UPDATE_PAYMENT_METHOD",
        "PAYMENT_SUCCESS",
        "RECOVERY_REVIEW_REQUIRED"
    ]

    for decision in test_decisions:

        result = execute_recovery_action(
            decision=decision,
            payment_amount=500.0,
            attempt_number=1
        )

        print("\nDecision:")
        print(decision)

        print("Execution Status:")
        print(result["execution_status"])

        print("Execution Action:")
        print(result["execution_action"])

        print("Next Step:")
        print(result["next_step"])

        print("Message:")
        print(result["message"])