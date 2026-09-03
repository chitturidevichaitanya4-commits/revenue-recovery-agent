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
# CREATE DATABASE TABLE
# ----------------------------------------

def create_database():

    connection = sqlite3.connect(DATABASE_PATH)

    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (

            transaction_id TEXT PRIMARY KEY,

            recovery_case_id TEXT NOT NULL,

            customer_id TEXT NOT NULL,

            attempt_number INTEGER NOT NULL,

            available_balance REAL NOT NULL,

            amount REAL NOT NULL,

            payment_method TEXT NOT NULL,

            status TEXT NOT NULL,

            failure_reason TEXT,

            created_at TEXT NOT NULL,

            recovery_decision TEXT,

            recovery_reason TEXT,

            recovery_action TEXT,

            recovery_priority TEXT,

            recovery_urgency TEXT,

            recovery_strategy TEXT,

            execution_status TEXT,

            execution_action TEXT,

            next_step TEXT,

            execution_message TEXT,

            recovery_probability REAL,

            expected_recovered_revenue REAL,

            optimizer_confidence TEXT,

            estimation_source TEXT

        )
    """)


    # ------------------------------------
    # CHECK EXISTING COLUMNS
    # ------------------------------------

    cursor.execute("""
        PRAGMA table_info(transactions)
    """)

    columns = [
        column[1]
        for column in cursor.fetchall()
    ]


    # ------------------------------------
    # ADD MISSING COLUMNS
    # ------------------------------------

    required_columns = {

        "recovery_case_id":
            "TEXT",

        "execution_status":
            "TEXT",

        "execution_action":
            "TEXT",

        "next_step":
            "TEXT",

        "execution_message":
            "TEXT",

        "recovery_probability":
            "REAL",

        "expected_recovered_revenue":
            "REAL",

        "optimizer_confidence":
            "TEXT",

        "estimation_source":
            "TEXT"
    }


    for column_name, column_type in required_columns.items():

        if column_name not in columns:

            cursor.execute(
                f"""
                ALTER TABLE transactions
                ADD COLUMN {column_name} {column_type}
                """
            )


    connection.commit()

    connection.close()

    print("Database initialized successfully.")


# ----------------------------------------
# INSERT TRANSACTION
# ----------------------------------------

def insert_transaction(transaction):

    connection = sqlite3.connect(DATABASE_PATH)

    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO transactions (

            transaction_id,

            recovery_case_id,

            customer_id,

            attempt_number,

            available_balance,

            amount,

            payment_method,

            status,

            failure_reason,

            created_at,

            recovery_decision,

            recovery_reason,

            recovery_action,

            recovery_priority,

            recovery_urgency,

            recovery_strategy,

            execution_status,

            execution_action,

            next_step,

            execution_message,

            recovery_probability,

            expected_recovered_revenue,

            optimizer_confidence,

            estimation_source

        )

        VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?
        )
    """, (

        transaction["transaction_id"],

        transaction["recovery_case_id"],

        transaction["customer_id"],

        transaction["attempt_number"],

        transaction["available_balance"],

        transaction["amount"],

        transaction["payment_method"],

        transaction["status"],

        transaction["failure_reason"],

        transaction["created_at"],

        transaction["recovery_decision"],

        transaction["recovery_reason"],

        transaction["recovery_action"],

        transaction["recovery_priority"],

        transaction["recovery_urgency"],

        transaction["recovery_strategy"],

        transaction["execution_status"],

        transaction["execution_action"],

        transaction["next_step"],

        transaction["execution_message"],

        transaction["recovery_probability"],

        transaction["expected_recovered_revenue"],

        transaction["optimizer_confidence"],

        transaction["estimation_source"]

    ))

    connection.commit()

    connection.close()


# ----------------------------------------
# CLEAN TRANSACTION DATA
# ----------------------------------------

def clear_transactions():

    connection = sqlite3.connect(DATABASE_PATH)

    cursor = connection.cursor()

    cursor.execute("""
        DELETE FROM transactions
    """)

    connection.commit()

    connection.close()

    print("All transaction data cleared successfully.")


# ----------------------------------------
# GET ALL TRANSACTIONS
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
# TEST DATABASE
# ----------------------------------------

if __name__ == "__main__":

    create_database()

    clear_transactions()

    print("\nDatabase is ready for clean data.")