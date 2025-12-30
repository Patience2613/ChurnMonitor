import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

# Load data
df = pd.read_csv("customers.csv")

# Encode text to numbers
df_encoded = pd.get_dummies(
    df,
    columns=["contract_type"],
    drop_first=True
)

# Features and target
X = df_encoded.drop(["customer_id", "churn"], axis=1)
y = df_encoded["churn"]

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42
)

# Train model
model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print("Model performance:")
print(classification_report(y_test, y_pred))

# Save model and feature list
joblib.dump(model, "churn_model.pkl")
joblib.dump(X.columns.tolist(), "model_features.pkl")

print("\nModel saved as churn_model.pkl")
print("Feature list saved as model_features.pkl")
