from sqlalchemy import create_engine, Column, Integer, Float, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://postgres:barbie@localhost:5432/churn_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    tenure_months = Column(Integer)
    monthly_charges = Column(Float)
    support_tickets = Column(Integer)
    late_payments = Column(Integer)
    contract_type = Column(String)
    churn_prediction = Column(Integer)
    churn_probability = Column(Float)

# Create table
Base.metadata.create_all(bind=engine)
