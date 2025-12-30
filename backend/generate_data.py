import numpy as np
import pandas as pd

np.random.seed(42)

N = 1000

data = {
    "customer_id": range(1, N + 1),
    "tenure_months": np.random.randint(1, 72, N),
    "monthly_charges": np.random.uniform(20, 120, N).round(2),
    "support_tickets": np.random.poisson(2, N),
    "late_payments": np.random.poisson(1, N),
    "contract_type": np.random.choice(
        ["Month-to-month", "One year", "Two year"],
        N,
        p=[0.6, 0.25, 0.15]
    )
}

df = pd.DataFrame(data)

# Simple churn rule
df["churn"] = (
    (df["tenure_months"] < 12) &
    (df["support_tickets"] > 3)
).astype(int)

df.to_csv("customers.csv", index=False)

print("customers.csv created successfully!")
