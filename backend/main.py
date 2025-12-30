from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
from database import SessionLocal, Customer
from pydantic import BaseModel
from fastapi import HTTPException

# Create app
app = FastAPI()

origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model
class CustomerInput(BaseModel):
    tenure_months: int
    monthly_charges: float
    support_tickets: int
    late_payments: int
    contract_type_One_year: int
    contract_type_Two_year: int

# Load model and features
model = joblib.load("churn_model.pkl")
model_features = joblib.load("model_features.pkl")

@app.get("/")
def home():
    return {"message": "Churn Prediction API is running"}

@app.post("/predict")
def predict(customer: CustomerInput):
    # Prepare features for prediction
    features = [
        customer.tenure_months,
        customer.monthly_charges,
        customer.support_tickets,
        customer.late_payments,
        customer.contract_type_One_year,
        customer.contract_type_Two_year
    ]
    pred = model.predict([features])[0]
    prob = model.predict_proba([features])[0][1]

    # Save to PostgreSQL
    db = SessionLocal()
    contract = "Month-to-month"
    if customer.contract_type_One_year == 1:
        contract = "One year"
    elif customer.contract_type_Two_year == 1:
        contract = "Two year"

    db_customer = Customer(
        tenure_months=customer.tenure_months,
        monthly_charges=customer.monthly_charges,
        support_tickets=customer.support_tickets,
        late_payments=customer.late_payments,
        contract_type=contract,
        churn_prediction=int(pred),
        churn_probability=float(prob)
    )
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    db.close()

    return {"churn_prediction": int(pred), "churn_probability": float(prob)}

@app.get("/customers")
def get_customers():
    db = SessionLocal()
    all_customers = db.query(Customer).all()
    db.close()
    
    # Convert to list of dicts for JSON response
    result = []
    for c in all_customers:
        result.append({
            "id": c.id,
            "tenure_months": c.tenure_months,
            "monthly_charges": c.monthly_charges,
            "support_tickets": c.support_tickets,
            "late_payments": c.late_payments,
            "contract_type": c.contract_type,
            "churn_prediction": c.churn_prediction,
            "churn_probability": c.churn_probability
        })
    return result
@app.delete("/customers/{customer_id}")
def delete_customer(customer_id: int):
    db = SessionLocal()
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        db.close()
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(customer)
    db.commit()
    db.close()
    return {"detail": "Customer deleted"}

@app.put("/customers/{customer_id}")
def update_customer(customer_id: int, updated: CustomerInput):
    db = SessionLocal()
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        db.close()
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Update fields
    customer.tenure_months = updated.tenure_months
    customer.monthly_charges = updated.monthly_charges
    customer.support_tickets = updated.support_tickets
    customer.late_payments = updated.late_payments
    if updated.contract_type_One_year == 1:
        customer.contract_type = "One year"
    elif updated.contract_type_Two_year == 1:
        customer.contract_type = "Two year"
    else:
        customer.contract_type = "Month-to-month"

    db.commit()
    db.refresh(customer)
    db.close()
    return customer