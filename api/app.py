from fastapi import FastAPI

from database.database import (
    create_database,
    get_transactions
)

from analytics.analytics import calculate_analytics


# ----------------------------------------
# CREATE FASTAPI APPLICATION
# ----------------------------------------

app = FastAPI(
    title="Revenue Recovery Agent API",
    description="AI-powered revenue recovery backend",
    version="1.0.0"
)


# ----------------------------------------
# INITIALIZE DATABASE
# ----------------------------------------

create_database()


# ----------------------------------------
# ROOT ENDPOINT
# ----------------------------------------

@app.get("/")
def root():

    return {
        "message": "Revenue Recovery Agent API is running.",
        "status": "healthy"
    }


# ----------------------------------------
# GET ALL TRANSACTIONS
# ----------------------------------------

@app.get("/transactions")
def transactions():

    return {
        "transactions": get_transactions()
    }


# ----------------------------------------
# GET ANALYTICS
# ----------------------------------------

@app.get("/analytics")
def analytics():

    return calculate_analytics()


# ----------------------------------------
# GET API HEALTH
# ----------------------------------------

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "database": "connected"
    }