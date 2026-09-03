# ----------------------------------------
# AI REVENUE RECOVERY AGENT
# ----------------------------------------

from ai_model.recovery_optimizer import estimate_recovery


def recovery_agent(
    status,
    failure_reason,
    balance,
    payment_amount,
    attempt_number,
    ai_priority
):

    # ------------------------------------
    # SUCCESS
    # ------------------------------------

    if status == "SUCCESS":

        return {
            "decision": "PAYMENT_SUCCESS",
            "action": "Revenue recovered successfully.",
            "reason": "Payment completed successfully.",
            "urgency": "NONE",
            "strategy": "RECOVERY_COMPLETED",
            "ai_priority": ai_priority,

            # Optimizer information
            "recovery_probability": 1.0,
            "expected_recovered_revenue": payment_amount,
            "optimizer_confidence": "HIGH",
            "estimation_source": "PAYMENT_SUCCESS"
        }


    # ------------------------------------
    # RUN RECOVERY OPTIMIZER
    # ------------------------------------

    optimizer_result = estimate_recovery(
        payment_amount=payment_amount,
        failure_reason=failure_reason,
        ai_priority=ai_priority
    )

    recovery_probability = (
        optimizer_result["recovery_probability"]
    )

    expected_recovered_revenue = (
        optimizer_result["expected_recovered_revenue"]
    )

    optimizer_confidence = (
        optimizer_result["confidence"]
    )

    estimation_source = (
        optimizer_result["estimation_source"]
    )


    # ------------------------------------
    # DETERMINE AI-DRIVEN URGENCY
    # ------------------------------------

    if ai_priority == "HIGH":

        urgency = "IMMEDIATE"
        strategy = "PRIORITIZE_RECOVERY"

    elif ai_priority == "MEDIUM":

        urgency = "NORMAL"
        strategy = "STANDARD_RECOVERY"

    else:

        urgency = "LOW"
        strategy = "DEFER_RECOVERY"


    # ------------------------------------
    # FAILED PAYMENT
    # ------------------------------------

    if status == "FAILED":


        # --------------------------------
        # INSUFFICIENT FUNDS
        # --------------------------------

        if failure_reason == "INSUFFICIENT_FUNDS":

            if balance >= payment_amount:

                decision = "RETRY_PAYMENT"

                if ai_priority == "HIGH":

                    action = (
                        "Sufficient funds available. "
                        "Prioritize immediate payment retry."
                    )

                elif ai_priority == "MEDIUM":

                    action = (
                        "Sufficient funds available. "
                        "Proceed with standard payment retry."
                    )

                else:

                    action = (
                        "Sufficient funds available. "
                        "Proceed with low-priority payment retry."
                    )

                reason = (
                    "Customer has sufficient balance "
                    "for the payment retry."
                )

            else:

                decision = "WAIT_FOR_FUNDS"

                if ai_priority == "HIGH":

                    action = (
                        "Wait for funds and prioritize "
                        "immediate recovery follow-up."
                    )

                elif ai_priority == "MEDIUM":

                    action = (
                        "Wait for funds and schedule "
                        "a standard recovery follow-up."
                    )

                else:

                    action = (
                        "Wait for funds and defer "
                        "recovery follow-up."
                    )

                reason = (
                    "Customer balance is lower than "
                    "the payment amount."
                )


        # --------------------------------
        # OTP FAILED
        # --------------------------------

        elif failure_reason == "OTP_FAILED":

            decision = "CUSTOMER_ACTION_REQUIRED"

            reason = (
                "Customer must successfully complete "
                "OTP verification."
            )

            if ai_priority == "HIGH":

                action = (
                    "Request immediate customer action "
                    "to complete OTP verification."
                )

            elif ai_priority == "MEDIUM":

                action = (
                    "Request customer action to complete "
                    "OTP verification."
                )

            else:

                action = (
                    "Notify customer to complete "
                    "OTP verification when convenient."
                )


        # --------------------------------
        # BANK TIMEOUT
        # --------------------------------

        elif failure_reason == "BANK_TIMEOUT":

            decision = "RETRY_LATER"

            reason = (
                "Bank response timed out."
            )

            if ai_priority == "HIGH":

                action = (
                    "Schedule the payment retry as soon "
                    "as possible because the revenue risk is high."
                )

            elif ai_priority == "MEDIUM":

                action = (
                    "Schedule a standard payment retry "
                    "after the bank timeout."
                )

            else:

                action = (
                    "Defer the payment retry because "
                    "the revenue priority is low."
                )


        # --------------------------------
        # CARD EXPIRED
        # --------------------------------

        elif failure_reason == "CARD_EXPIRED":

            decision = "UPDATE_PAYMENT_METHOD"

            reason = (
                "The customer's card has expired."
            )

            if ai_priority == "HIGH":

                action = (
                    "Request immediate payment method "
                    "update because the revenue priority is high."
                )

            elif ai_priority == "MEDIUM":

                action = (
                    "Request the customer to update "
                    "the payment method."
                )

            else:

                action = (
                    "Notify the customer to update "
                    "the payment method."
                )


        # --------------------------------
        # UNKNOWN FAILURE
        # --------------------------------

        else:

            decision = "RECOVERY_REVIEW_REQUIRED"

            action = (
                "Manual recovery review required."
            )

            reason = (
                "The failure reason is not recognized "
                "by the recovery agent."
            )


        # --------------------------------
        # RETURN AGENT RESULT
        # --------------------------------

        return {
            "decision": decision,
            "action": action,
            "reason": reason,
            "urgency": urgency,
            "strategy": strategy,
            "ai_priority": ai_priority,

            # --------------------------------
            # AI RECOVERY OPTIMIZATION
            # --------------------------------

            "recovery_probability": recovery_probability,

            "expected_recovered_revenue": (
                expected_recovered_revenue
            ),

            "optimizer_confidence": (
                optimizer_confidence
            ),

            "estimation_source": (
                estimation_source
            )
        }


    # ------------------------------------
    # UNKNOWN STATUS
    # ------------------------------------

    return {
        "decision": "RECOVERY_REVIEW_REQUIRED",
        "action": "Manual recovery review required.",
        "reason": "Unknown payment status.",
        "urgency": "NORMAL",
        "strategy": "MANUAL_REVIEW",
        "ai_priority": ai_priority,

        # Optimizer information
        "recovery_probability": recovery_probability,
        "expected_recovered_revenue": (
            expected_recovered_revenue
        ),
        "optimizer_confidence": optimizer_confidence,
        "estimation_source": estimation_source
    }