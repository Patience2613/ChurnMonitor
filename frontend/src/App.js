import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function App() {
  const [newCustomer, setNewCustomer] = useState({
    tenure_months: 0,
    monthly_charges: 0,
    support_tickets: 0,
    late_payments: 0,
    contract_type_One_year: 0,
    contract_type_Two_year: 0,
  });

  const [customers, setCustomers] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});

  useEffect(() => {
    document.title = "ChurnMonitor";
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/customers");
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer({ ...newCustomer, [name]: Number(value) });
  };

  const handleContractChange = (type) => {
    setNewCustomer({
      ...newCustomer,
      contract_type_One_year: type === "one" ? 1 : 0,
      contract_type_Two_year: type === "two" ? 1 : 0,
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/predict",
        newCustomer
      );
      setPrediction(response.data);
      fetchCustomers();
      setNewCustomer({
        tenure_months: 0,
        monthly_charges: 0,
        support_tickets: 0,
        late_payments: 0,
        contract_type_One_year: 0,
        contract_type_Two_year: 0,
      });
    } catch (error) {
      console.error("Prediction error:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/customers/${id}`);
      fetchCustomers();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const startEdit = (customer) => {
    setEditingId(customer.id);
    setEditingData({
      tenure_months: customer.tenure_months,
      monthly_charges: customer.monthly_charges,
      support_tickets: customer.support_tickets,
      late_payments: customer.late_payments,
      contract_type_One_year: customer.contract_type === "One year" ? 1 : 0,
      contract_type_Two_year: customer.contract_type === "Two year" ? 1 : 0,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingData({ ...editingData, [name]: Number(value) });
  };

  const handleContractEditChange = (type) => {
    setEditingData({
      ...editingData,
      contract_type_One_year: type === "one" ? 1 : 0,
      contract_type_Two_year: type === "two" ? 1 : 0,
    });
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`http://127.0.0.1:8000/customers/${id}`, editingData);
      setEditingId(null);
      fetchCustomers();
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  // Churn chart data
  const churnData = [
    { name: 'No Churn', value: customers.filter(c => c.churn_prediction === 0).length },
    { name: 'Churn', value: customers.filter(c => c.churn_prediction === 1).length },
  ];

  return (
    <div style={{
      padding: "30px",
      fontFamily: "Arial, sans-serif",
      minHeight: "100vh",
      backgroundColor: "#cce7ff",
    }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px", color: "#004085" }}>
        ChurnMonitor
      </h1>

      {/* Add Customer Form */}
      <div style={{
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        marginBottom: "30px",
        backgroundColor: "#99ccff"
      }}>
        <h2 style={{ marginBottom: "15px", color: "#004085" }}>Add Customer</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
          {["tenure_months", "monthly_charges", "support_tickets", "late_payments"].map((field, i) => (
            <input
              key={i}
              type="number"
              name={field}
              placeholder={field.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
              value={newCustomer[field]}
              onChange={handleChange}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #004085",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                outline: "none",
                fontSize: "14px",
                backgroundColor: "#e6f2ff",
                transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#002752"}
              onBlur={(e) => e.target.style.borderColor = "#004085"}
            />
          ))}
          <select
            value={newCustomer.contract_type_One_year ? "one" : newCustomer.contract_type_Two_year ? "two" : "month"}
            onChange={(e) => handleContractChange(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #004085",
              outline: "none",
              fontSize: "14px",
              backgroundColor: "#e6f2ff",
              cursor: "pointer",
              transition: "border-color 0.2s"
            }}
            onFocus={(e) => e.target.style.borderColor = "#002752"}
            onBlur={(e) => e.target.style.borderColor = "#004085"}
          >
            <option value="month">Month-to-month</option>
            <option value="one">One year</option>
            <option value="two">Two year</option>
          </select>
        </div>
        <button onClick={handleSubmit} style={{
          marginTop: "20px",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
          backgroundColor: "#004085",
          color: "white",
          cursor: "pointer",
          transition: "background-color 0.2s, box-shadow 0.2s"
        }}
        onMouseEnter={(e) => { e.target.style.backgroundColor = "#002752"; e.target.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)"; }}
        onMouseLeave={(e) => { e.target.style.backgroundColor = "#004085"; e.target.style.boxShadow = "none"; }}>
          Predict & Add
        </button>
      </div>

      {/* Prediction Card */}
      {prediction && (
        <div style={{
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          marginBottom: "30px",
          backgroundColor: "#80dfff"
        }}>
          <h2 style={{ color: "#004085" }}>Prediction Result</h2>
          <p>Churn Prediction: <strong>{prediction.churn_prediction}</strong></p>
          <p>Churn Probability: <strong>{prediction.churn_probability.toFixed(2)}</strong></p>
        </div>
      )}

      {/* Churn Analytics Chart */}
      <div style={{
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        marginBottom: "30px",
        backgroundColor: "#80dfff"
      }}>
        <h2 style={{ color: "#004085" }}>Churn Analytics</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={churnData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#004085" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Customers Table */}
      <div style={{
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        backgroundColor: "#99ccff"
      }}>
        <h2 style={{ color: "#004085" }}>Customer Table</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#004085", color: "white" }}>
              <th>ID</th>
              <th>Tenure</th>
              <th>Monthly Charges</th>
              <th>Tickets</th>
              <th>Late Payments</th>
              <th>Contract</th>
              <th>Prediction</th>
              <th>Probability</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr
                key={c.id}
                style={{
                  backgroundColor: c.churn_prediction === 1 ? "#f8d7da" : "#d4edda",
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,64,133,0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = c.churn_prediction === 1 ? "#f8d7da" : "#d4edda"}
              >
                <td style={{ textAlign: "center" }}>{c.id}</td>

                {editingId === c.id ? (
                  <>
                    {["tenure_months", "monthly_charges", "support_tickets", "late_payments"].map((field, i) => (
                      <td key={i}>
                        <input
                          type="number"
                          name={field}
                          value={editingData[field]}
                          onChange={handleEditChange}
                          style={{
                            padding: "8px",
                            borderRadius: "6px",
                            border: "1px solid #004085",
                            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
                            outline: "none",
                            fontSize: "13px",
                            backgroundColor: "#e6f2ff",
                            width: "100%",
                            transition: "border-color 0.2s"
                          }}
                          onFocus={(e) => e.target.style.borderColor = "#002752"}
                          onBlur={(e) => e.target.style.borderColor = "#004085"}
                        />
                      </td>
                    ))}

                    <td>
                      <select
                        value={editingData.contract_type_One_year ? "one" : editingData.contract_type_Two_year ? "two" : "month"}
                        onChange={(e) => handleContractEditChange(e.target.value)}
                        style={{
                          padding: "8px",
                          borderRadius: "6px",
                          border: "1px solid #004085",
                          outline: "none",
                          fontSize: "13px",
                          backgroundColor: "#e6f2ff",
                          width: "100%",
                          cursor: "pointer",
                          transition: "border-color 0.2s"
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#002752"}
                        onBlur={(e) => e.target.style.borderColor = "#004085"}
                      >
                        <option value="month">Month-to-month</option>
                        <option value="one">One year</option>
                        <option value="two">Two year</option>
                      </select>
                    </td>

                    <td style={{ textAlign: "center" }}>{c.churn_prediction}</td>
                    <td style={{ textAlign: "center" }}>{c.churn_probability.toFixed(2)}</td>
                    <td style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
                      <button onClick={() => handleUpdate(c.id)} style={{
                        padding: "5px 10px",
                        borderRadius: "5px",
                        border: "none",
                        backgroundColor: "#28a745",
                        color: "white",
                        cursor: "pointer",
                        transition: "background-color 0.2s"
                      }} onMouseEnter={e=>e.target.style.backgroundColor="#218838"} onMouseLeave={e=>e.target.style.backgroundColor="#28a745"}>Save</button>
                      <button onClick={() => setEditingId(null)} style={{
                        padding: "5px 10px",
                        borderRadius: "5px",
                        border: "none",
                        cursor: "pointer"
                      }}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ textAlign: "center" }}>{c.tenure_months}</td>
                    <td style={{ textAlign: "center" }}>{c.monthly_charges}</td>
                    <td style={{ textAlign: "center" }}>{c.support_tickets}</td>
                    <td style={{ textAlign: "center" }}>{c.late_payments}</td>
                    <td style={{ textAlign: "center" }}>{c.contract_type}</td>
                    <td style={{ textAlign: "center" }}>{c.churn_prediction}</td>
                    <td style={{ textAlign: "center" }}>{c.churn_probability.toFixed(2)}</td>
                    <td style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
                      <button onClick={() => startEdit(c)} style={{
                        padding: "5px 10px",
                        borderRadius: "5px",
                        border: "none",
                        backgroundColor: "#ffc107",
                        color: "white",
                        cursor: "pointer",
                        transition: "background-color 0.2s"
                      }} onMouseEnter={e=>e.target.style.backgroundColor="#e6a700"} onMouseLeave={e=>e.target.style.backgroundColor="#ffc107"}>Edit</button>
                      <button onClick={() => handleDelete(c.id)} style={{
                        padding: "5px 10px",
                        borderRadius: "5px",
                        border: "none",
                        backgroundColor: "#dc3545",
                        color: "white",
                        cursor: "pointer",
                        transition: "background-color 0.2s"
                      }} onMouseEnter={e=>e.target.style.backgroundColor="#b02a37"} onMouseLeave={e=>e.target.style.backgroundColor="#dc3545"}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;