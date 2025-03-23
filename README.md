# Medicine API

## Overview
The Medicine API provides detailed information about medicines, including brand names, dosage, side effects, and more. It integrates with external sources like **FDA API**, **RxNav API**, and **Google Gemini AI**. The API first checks the **MongoDB database** for medicine details, and if not found, it fetches data from Gemini AI, stores it in the database, and returns the response.

---

## 🚀 Features
- **Medicine Information Retrieval**: Fetches data from **MongoDB**, **FDA API**, **RxNav API**, or **Google Gemini AI**.
- **Similar Medicines Search**: Finds related medicines from multiple sources.
- **Database Caching**: Stores AI-generated responses to reduce API calls.
- **Secure API Access**: Requires API key authentication.
- **Rate Limiting**: Prevents excessive requests.
- **Strict JSON Response Format**: Ensures structured output.

---

## 📌 API Endpoints

### 1️⃣ **Get Medicine Information** (`/api/medicine`)
Fetches detailed information about a medicine.

#### **🔹 Endpoint**:
```http
POST /api/medicine
```

#### **🔹 Headers**:
| Key         | Value                  | Required |
|------------|------------------------|----------|
| `x-api-key` | `your-secret-api-key`   | ✅ Yes |

#### **🔹 Body (JSON)**:
```json
{
  "prompt": "Paracetamol"
}
```

#### **🔹 Response (If Found in Database)**:
```json
{
  "name": "Paracetamol",
  "brand_names": ["Tylenol", "Calpol", "Panadol"],
  "drug_class": "Analgesic, Antipyretic",
  "uses": ["Pain relief", "Fever reduction"],
  "dosage": {
    "adult": "500-1000 mg every 4-6 hours",
    "pediatric": "10-15 mg/kg every 4-6 hours"
  },
  "side_effects": ["Nausea", "Liver damage (overuse)"],
  "contraindications": ["Liver disease", "Alcohol dependency"],
  "drug_interactions": ["Warfarin", "Rifampin"],
  "warnings": ["Avoid alcohol", "Risk of liver failure"],
  "legal_status": "OTC in most countries"
}
```

#### **🔹 Response (If Not Found in Database, Fetches from Gemini AI)**:
```json
{
  "error": "Medicine not found"
}
```
If not found, the API queries **Google Gemini AI**, stores the response, and returns it.

---

### 2️⃣ **Get Similar Medicines** (`/api/similar`)
Finds similar medicines based on the given query.

#### **🔹 Endpoint**:
```http
GET /api/similar?q=<medicine_name>&limit=<number>
```

#### **🔹 Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | `string` | **(Required)** The medicine name to search. |
| `limit` | `number` | **(Optional)** Number of results to return (default: `10`). |

#### **🔹 Example Request**:
```sh
curl -X GET "http://your-server.com/api/similar?q=aspirin&limit=5" -H "x-api-key: YOUR_SECRET_API_KEY"
```

#### **🔹 Example Response**:
```json
{
    "source": "FDA & RxNav",
    "similar_medicines": [
        "Aspirin",
        "Acetylsalicylic Acid",
        "Bayer Aspirin",
        "Ecotrin",
        "Bufferin"
    ]
}
```

---

## 🛠️ **Setup Instructions**

### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/yourusername/medicine-api.git
cd medicine-api
```

### **2️⃣ Install Dependencies**
```sh
npm install
```

### **3️⃣ Set Environment Variables**
Create a `.env` file in the root directory and add:
```ini
PORT=3000
API_KEY=your-secret-api-key
GCP_API_KEY=your-google-gemini-api-key
MONGO_URI=your-mongodb-connection-string
```

### **4️⃣ Start the Server**
```sh
npm start
```

---

## 🔍 **How It Works**
1. When a **medicine search** request is made:
   - First, it checks the **MongoDB database**.
   - If found, it returns the stored data.
   - If not found, it queries **Google Gemini AI**, stores the result, and returns it.

2. When a **similar medicine search** request is made:
   - It fetches data from **FDA API** and **RxNav API**.
   - Combines and filters unique results.
   - Returns a structured JSON response.

---

## 💡 **Technologies Used**
- **Node.js** - Backend runtime
- **Express.js** - Web framework
- **MongoDB** - Database for medicine storage
- **Google Gemini AI** - AI-powered medicine information retrieval
- **Axios** - HTTP client for API requests

---

## 📌 **Author**
**Azimuddeen Khan**  
🚀 Full Stack Developer  

---

## 🗂️ **License**
This project is licensed under the **MIT License**.

