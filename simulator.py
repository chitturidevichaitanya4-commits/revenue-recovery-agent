import uuid
from datetime import datetime

from ai_model.predict import predict_priority
from recovery_agent import recovery_agent
from recovery_executor import execute_recovery_action
from database.database import create_database, insert_transaction


# ----------------------------------------
# TRANSACTION STORAGE
# ----------------------------------------

transactions = []
attempt_number = 0


# ----------------------------------------
# RECOVERY CASE ID
# ----------------------------------------

recovery_case_id = (
    "CASE-"
    + uuid.uuid4().hex[:8].upper()
)


create_database()


# Maximum number of payment attempts allowed
MAX_RETRY_ATTEMPTS = 3


# ----------------------------------------
# REVENUE TRACKING
# ----------------------------------------

revenue_at_risk = 0.0
revenue_recovered = 0.0


# ----------------------------------------
# CUSTOMER STATE
# ----------------------------------------

customer = {
    "customer_id": None,
    "available_balance": 0.0
}


# ----------------------------------------
# CUSTOMER ID
# ----------------------------------------

customer_id = input(
    "Enter customer ID: "
).strip()

customer["customer_id"] = customer_id


# ----------------------------------------
# CUSTOMER BALANCE
# ----------------------------------------

while True:

    try:

        balance = float(
            input(
                "Enter customer available balance: "
            )
        )

        if balance < 0:

            print(
                "Invalid balance. "
                "Balance cannot be negative."
            )

            continue

        customer["available_balance"] = balance

        break

    except ValueError:

        print(
            "Invalid balance. "
            "Please enter a valid number."
        )


# ----------------------------------------
# PAYMENT ATTEMPT LOOP
# ----------------------------------------

while True:

    attempt_number += 1

    print("\n==============================")
    print(
        f"      PAYMENT ATTEMPT "
        f"{attempt_number}"
    )
    print("==============================")


    # ------------------------------------
    # PAYMENT AMOUNT
    # ------------------------------------

    if attempt_number == 1:

        while True:

            try:

                payment_amount = float(
                    input(
                        "Enter payment amount: "
                    )
                )

                if payment_amount <= 0:

                    print(
                        "Invalid amount. "
                        "Payment amount must be "
                        "greater than 0."
                    )

                    continue

                break

            except ValueError:

                print(
                    "Invalid amount. "
                    "Please enter a valid number."
                )

    else:

        print(
            f"Retrying the same payment amount: "
            f"₹{payment_amount:.2f}"
        )


    # ------------------------------------
    # PAYMENT METHOD
    # ------------------------------------

    print("\nSelect payment method:")
    print("1. UPI")
    print("2. CARD")
    print("3. NET BANKING")

    while True:

        payment_method_choice = input(
            "Choose payment method: "
        ).strip()

        if payment_method_choice in [
            "1",
            "2",
            "3"
        ]:

            break

        print(
            "Invalid payment method. "
            "Please choose 1, 2, or 3."
        )


    payment_methods = {

        "1": "UPI",

        "2": "CARD",

        "3": "NET BANKING"
    }


    payment_method = payment_methods[
        payment_method_choice
    ]


    # ------------------------------------
    # PAYMENT OUTCOME
    # ------------------------------------

    print("\nSelect payment outcome:")
    print("1. SUCCESS")
    print("2. FAILED")

    while True:

        outcome_choice = input(
            "Choose payment outcome: "
        ).strip()

        if outcome_choice == "1":

            status = "SUCCESS"

            failure_reason = None

            break

        elif outcome_choice == "2":

            status = "FAILED"

            break

        else:

            print(
                "Invalid payment outcome. "
                "Please choose 1 or 2."
            )


    # ------------------------------------
    # FAILURE REASON
    # ------------------------------------

    if status == "FAILED":

        print("\nSelect failure reason:")
        print("1. INSUFFICIENT_FUNDS")
        print("2. OTP_FAILED")
        print("3. BANK_TIMEOUT")
        print("4. CARD_EXPIRED")

        while True:

            failure_choice = input(
                "Choose failure reason: "
            ).strip()


            if failure_choice == "1":

                failure_reason = (
                    "INSUFFICIENT_FUNDS"
                )

                break


            elif failure_choice == "2":

                failure_reason = (
                    "OTP_FAILED"
                )

                break


            elif failure_choice == "3":

                failure_reason = (
                    "BANK_TIMEOUT"
                )

                break


            elif failure_choice == "4":

                failure_reason = (
                    "CARD_EXPIRED"
                )

                break


            else:

                print(
                    "Invalid failure reason. "
                    "Please choose 1, 2, 3, or 4."
                )


    # ------------------------------------
    # REVENUE AT RISK
    # ------------------------------------

    if (
        status == "FAILED"
        and attempt_number == 1
    ):

        revenue_at_risk = payment_amount


    # ------------------------------------
    # AI RECOVERY PRIORITY
    # ------------------------------------

    if status == "FAILED":

        recovery_priority = predict_priority(

            payment_amount=payment_amount,

            available_balance=balance,

            failure_reason=failure_reason,

            payment_method=payment_method,

            attempt_number=attempt_number
        )

    else:

        recovery_priority = "NONE"


    # ------------------------------------
    # AI REVENUE RECOVERY AGENT
    # ------------------------------------

    agent_result = recovery_agent(

        status=status,

        failure_reason=failure_reason,

        balance=balance,

        payment_amount=payment_amount,

        attempt_number=attempt_number,

        ai_priority=recovery_priority
    )


    recovery_decision = (
        agent_result["decision"]
    )

    recovery_urgency = (
        agent_result["urgency"]
    )

    recovery_reason = (
        agent_result["reason"]
    )

    recovery_result = (
        agent_result["action"]
    )

    recovery_strategy = (
        agent_result["strategy"]
    )


    # ------------------------------------
    # OPTIMIZER INTELLIGENCE
    # ------------------------------------

    recovery_probability = (
        agent_result[
            "recovery_probability"
        ]
    )

    expected_recovered_revenue = (
        agent_result[
            "expected_recovered_revenue"
        ]
    )

    optimizer_confidence = (
        agent_result[
            "optimizer_confidence"
        ]
    )

    estimation_source = (
        agent_result[
            "estimation_source"
        ]
    )


    # ------------------------------------
    # RECOVERY ACTION EXECUTION
    # ------------------------------------

    execution_result = (
        execute_recovery_action(

            decision=recovery_decision,

            payment_amount=payment_amount,

            attempt_number=attempt_number
        )
    )


    execution_status = (
        execution_result[
            "execution_status"
        ]
    )

    execution_action = (
        execution_result[
            "execution_action"
        ]
    )

    next_step = (
        execution_result[
            "next_step"
        ]
    )

    execution_message = (
        execution_result[
            "message"
        ]
    )


    # ------------------------------------
    # TRANSACTION CREATION
    # ------------------------------------

    created_at = datetime.now().isoformat()


    transaction = {

        "transaction_id":
            f"TXN-"
            f"{uuid.uuid4().hex[:8].upper()}",

        "recovery_case_id":
            recovery_case_id,

        "attempt_number":
            attempt_number,

        "customer_id":
            customer_id,

        "available_balance":
            balance,

        "amount":
            payment_amount,

        "payment_method":
            payment_method,

        "status":
            status,

        "failure_reason":
            failure_reason,

        "created_at":
            created_at,

        "recovery_decision":
            recovery_decision,

        "recovery_reason":
            recovery_reason,

        "recovery_action":
            recovery_result,

        "recovery_priority":
            recovery_priority,

        "recovery_urgency":
            recovery_urgency,

        "recovery_strategy":
            recovery_strategy,


        # --------------------------------
        # RECOVERY EXECUTOR RESULT
        # --------------------------------

        "execution_status":
            execution_status,

        "execution_action":
            execution_action,

        "next_step":
            next_step,

        "execution_message":
            execution_message,


        # --------------------------------
        # OPTIMIZER RESULT
        # --------------------------------

        "recovery_probability":
            recovery_probability,

        "expected_recovered_revenue":
            expected_recovered_revenue,

        "optimizer_confidence":
            optimizer_confidence,

        "estimation_source":
            estimation_source
    }


    transactions.append(
        transaction
    )


    insert_transaction(
        transaction
    )


    # ------------------------------------
    # DISPLAY TRANSACTION
    # ------------------------------------

    print("\nTransaction:")
    print(transaction)


    print("\nRecovery Decision:")
    print(recovery_decision)


    print("\nAI Recovery Priority:")
    print(recovery_priority)


    print("\nRecovery Urgency:")
    print(recovery_urgency)


    print("\nRecovery Strategy:")
    print(recovery_strategy)


    print("\nRecovery Reason:")
    print(recovery_reason)


    print("\nRecovery Action:")
    print(recovery_result)


    # ------------------------------------
    # DISPLAY OPTIMIZER INTELLIGENCE
    # ------------------------------------

    print("\nAI Recovery Probability:")
    print(
        f"{recovery_probability * 100:.2f}%"
    )


    print(
        "\nExpected Recovered Revenue:"
    )

    print(
        f"₹{expected_recovered_revenue:.2f}"
    )


    print("\nOptimizer Confidence:")
    print(
        optimizer_confidence
    )


    print("\nEstimation Source:")
    print(
        estimation_source
    )


    # ------------------------------------
    # RECOVERY EXECUTOR
    # ------------------------------------

    print("\nRecovery Executor:")

    print(
        f"Execution Status: "
        f"{execution_status}"
    )

    print(
        f"Execution Action: "
        f"{execution_action}"
    )

    print(
        f"Next Step: "
        f"{next_step}"
    )

    print(
        f"Executor Message: "
        f"{execution_message}"
    )


    # ------------------------------------
    # PAYMENT SUCCESS
    # ------------------------------------

    if status == "SUCCESS":

        balance = (
            balance - payment_amount
        )

        customer[
            "available_balance"
        ] = balance


        # Recover previously at-risk revenue

        if revenue_at_risk > 0:

            revenue_recovered = (
                revenue_at_risk
            )

            revenue_at_risk = 0.0


        print(
            "\nPayment successful. "
            "Revenue recovered."
        )


        print(
            f"Remaining customer balance: "
            f"₹{balance:.2f}"
        )


        break


    # ------------------------------------
    # RETRY PAYMENT
    # ------------------------------------

    elif recovery_decision == "RETRY_PAYMENT":

        if attempt_number >= MAX_RETRY_ATTEMPTS:

            print(
                f"\nMaximum retry limit of "
                f"{MAX_RETRY_ATTEMPTS} "
                f"attempts reached."
            )

            print(
                "Automatic recovery stopped."
            )

            print(
                "Manual recovery review required."
            )

            break


        print(
            "\nRecovery system will allow "
            "another payment attempt."
        )

        continue


    # ------------------------------------
    # WAIT FOR FUNDS
    # ------------------------------------

    elif recovery_decision == "WAIT_FOR_FUNDS":

        print(
            "\nCustomer does not have "
            "sufficient funds."
        )

        print(
            "Recovery system is waiting "
            "for funds."
        )


        while True:

            funds_action = input(
                "\nHave sufficient funds become "
                "available? (yes/no): "
            ).strip().lower()


            if funds_action == "yes":

                while True:

                    try:

                        new_balance = float(
                            input(
                                "Enter updated "
                                "customer balance: "
                            )
                        )

                        if new_balance < 0:

                            print(
                                "Invalid balance. "
                                "Balance cannot be "
                                "negative."
                            )

                            continue

                        break

                    except ValueError:

                        print(
                            "Invalid balance. "
                            "Please enter a valid number."
                        )


                balance = new_balance

                customer[
                    "available_balance"
                ] = new_balance


                print(
                    f"\nCustomer balance updated "
                    f"to ₹{balance:.2f}"
                )


                if balance >= payment_amount:

                    print(
                        "Customer now has "
                        "sufficient funds."
                    )

                    print(
                        "Recovery system will allow "
                        "another payment attempt."
                    )

                    continue_payment = True

                    break

                else:

                    print(
                        "Customer still does not "
                        "have sufficient funds."
                    )

                    continue_payment = False

                    break


            elif funds_action == "no":

                print(
                    "\nSufficient funds are "
                    "not available yet."
                )

                print(
                    "Recovery process paused."
                )

                continue_payment = False

                break


            else:

                print(
                    "Invalid input. "
                    "Please enter yes or no."
                )


        if continue_payment:

            continue

        else:

            break


    # ------------------------------------
    # CUSTOMER ACTION REQUIRED
    # ------------------------------------

    elif recovery_decision == "CUSTOMER_ACTION_REQUIRED":

        print(
            "\nCustomer action is required."
        )

        print(
            "Please complete OTP verification "
            "before retrying."
        )


        while True:

            otp_action = input(
                "\nHas the customer completed OTP "
                "verification? (yes/no): "
            ).strip().lower()


            if otp_action == "yes":

                print(
                    "\nOTP verification completed "
                    "successfully."
                )

                print(
                    "Recovery system will allow "
                    "another payment attempt."
                )

                continue_payment = True

                break


            elif otp_action == "no":

                print(
                    "\nOTP verification not completed."
                )

                print(
                    "Recovery process stopped. "
                    "Payment cannot be retried yet."
                )

                continue_payment = False

                break


            else:

                print(
                    "Invalid input. "
                    "Please enter yes or no."
                )


        if continue_payment:

            continue

        else:

            break


    # ------------------------------------
    # BANK TIMEOUT
    # ------------------------------------

    elif recovery_decision == "RETRY_LATER":

        print(
            "\nBank timeout detected."
        )


        if attempt_number >= MAX_RETRY_ATTEMPTS:

            print(
                f"\nMaximum retry limit of "
                f"{MAX_RETRY_ATTEMPTS} "
                f"attempts reached."
            )

            print(
                "Automatic recovery stopped."
            )

            print(
                "Manual recovery review required."
            )

            break


        print(
            "Payment retry will be "
            "attempted later."
        )

        print(
            "Simulating waiting period..."
        )

        print(
            "Waiting period completed."
        )

        print(
            "Recovery system will allow "
            "another payment attempt."
        )

        continue


    # ------------------------------------
    # CARD EXPIRED
    # ------------------------------------

    elif recovery_decision == "UPDATE_PAYMENT_METHOD":

        print(
            "\nCustomer action is required."
        )

        print(
            "The card has expired."
        )

        print(
            "Please update the payment method "
            "before retrying."
        )


        while True:

            card_action = input(
                "\nHas the customer updated the "
                "payment method? (yes/no): "
            ).strip().lower()


            if card_action == "yes":

                print(
                    "\nPayment method updated "
                    "successfully."
                )

                print(
                    "Recovery system will allow "
                    "another payment attempt."
                )

                continue_payment = True

                break


            elif card_action == "no":

                print(
                    "\nPayment method was not updated."
                )

                print(
                    "Recovery process stopped. "
                    "Payment cannot be retried yet."
                )

                continue_payment = False

                break


            else:

                print(
                    "Invalid input. "
                    "Please enter yes or no."
                )


        if continue_payment:

            continue

        else:

            break


    # ------------------------------------
    # OTHER FAILURE
    # ------------------------------------

    else:

        print(
            "\nRecovery process completed "
            "for this payment."
        )

        break


# ----------------------------------------
# PAYMENT HISTORY
# ----------------------------------------

print("\n==============================")
print("       PAYMENT HISTORY")
print("==============================")


for transaction in transactions:

    print(
        f"Attempt "
        f"{transaction['attempt_number']} "
        f"→ Balance: "
        f"₹{transaction['available_balance']:.2f} "
        f"→ Payment: "
        f"₹{transaction['amount']:.2f} "
        f"→ {transaction['status']} "
        f"→ {transaction['failure_reason']} "
        f"→ AI Priority: "
        f"{transaction['recovery_priority']} "
        f"→ Urgency: "
        f"{transaction['recovery_urgency']} "
        f"→ Strategy: "
        f"{transaction['recovery_strategy']} "
        f"→ Probability: "
        f"{transaction['recovery_probability'] * 100:.2f}% "
        f"→ Expected Revenue: "
        f"₹{transaction['expected_recovered_revenue']:.2f}"
    )


print(
    f"\nTotal attempts: "
    f"{len(transactions)}"
)


print(
    f"Final status: "
    f"{transactions[-1]['status']}"
)


# ----------------------------------------
# REVENUE SUMMARY
# ----------------------------------------

print("\n==============================")
print("       REVENUE SUMMARY")
print("==============================")


print(
    f"Revenue at Risk: "
    f"₹{revenue_at_risk:.2f}"
)


print(
    f"Revenue Recovered: "
    f"₹{revenue_recovered:.2f}"
)