# Medicine API

## Overview
This project provides an API for retrieving medicine information from multiple sources (FDA, RxNav) and stores results in a MongoDB database for faster subsequent queries. It includes rate limiting and response caching.

## Features
- **Search Medicines**: Retrieves medicine details (brand name, generic name, manufacturer, etc.).
- **Database Caching**: Stores results in MongoDB to reduce API calls.
- **Rate Limiting**: Prevents excessive requests to protect resources.
- **Slowdown Mechanism**: Introduces delays for repeated requests.
- **Secure API Access**: Requires an API key for authentication.

---

## API Endpoints

### 1️⃣ **Search Medicine API** (`/medic`)
#### **Description**:
Search for medicine details from FDA and RxNav databases.

#### **Endpoint**:
```http
GET /medic?q=<medicine_name>
```

#### **Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | `string` | **(Required)** The name of the medicine to search. |

#### **Example Request**:
```sh
curl -X GET "http://your-server.com/medic?q=ibuprofen" -H "x-api-key: YOUR_SECRET_API_KEY"
```

#### **Example Response**:
```json
{
    "source": "FDA",
    "data": [
        {
            "brand_name": "Ibuprofen",
            "generic_name": "Ibuprofen",
            "manufacturer": "XYZ Pharma",
            "purpose": "Pain relief",
            "usage": "Used to treat pain and inflammation",
            "dosage": "200mg per dose",
            "warnings": "Do not exceed recommended dose",
            "route": "Oral",
            "storage": "Store at room temperature",
            "side_effects": "Nausea, headache",
            "interactions": "Avoid alcohol while taking this",
            "overdose_info": "Seek medical help in case of overdose"
        }
    ],
    "extra": [
        {
            "inactive_ingredients": "Starch, magnesium stearate",
            "box_warning": "Increased risk of heart attack",
            "clinical_studies": "Tested in clinical trials with positive results"
        }
    ]
}
```

---

### 2️⃣ **List Medicines API** (`/list`)
#### **Description**:
Retrieves relevant brand names and generic medicine names based on the query.

#### **Endpoint**:
```http
GET /list?q=<medicine_name>&limit=<number>
```

#### **Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | `string` | **(Required)** The medicine name to search. |
| `limit` | `number` | **(Optional)** Number of results to return (default: `10`). |

#### **Example Request**:
```sh
curl -X GET "http://your-server.com/list?q=paracetamol&limit=5" -H "x-api-key: YOUR_SECRET_API_KEY"
```

#### **Example Response**:
```json
{
    "source": "FDA & RxNav",
    "medicines": [
        "Paracetamol",
        "Tylenol",
        "Acetaminophen",
        "Panadol",
        "Mapap"
    ]
}
```

---

## Installation & Setup

### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/yourusername/medicine-api.git
cd medicine-api
```

### **2️⃣ Install Dependencies**
```sh
npm install
```

### **3️⃣ Setup Environment Variables**
Create a `.env` file and add:
```ini
PORT=3000
API_KEY=your_secret_api_key
MONGO_URI=your_mongodb_connection_string
```

### **4️⃣ Start the Server**
```sh
npm start
```

---

## 🔹 **Error Handling & Debugging**
- Console logs are added in key places to catch errors.
- If an API call fails, the system logs the error and continues execution.
- If a database connection fails, an error message is displayed.

---

## 📸 API Response Samples

| **Medic API Output** | **List API Output** |
|----------------------|----------------------|
| ![Medic API](./images/medic_api_output.png) | ![List API](./images/list_api_output.png) |

*(Make sure to add images in the `images` folder for visualization.)*

---

## Contributing
Feel free to submit issues or pull requests to improve the project.

---

## License
MIT License © 2025

# Medicine Info API (AI + Database)

This API provides detailed medicine information using **Google Gemini AI** and a **MongoDB database**. It first checks the database for medicine details, and if not found, it fetches data from Gemini AI, stores it in the database, and returns the response.

## 🚀 Features
- **Fast Database Lookup**: Avoids unnecessary API calls.
- **AI-Powered Data Generation**: Uses **Google Gemini AI** if the data isn't found.
- **Automatic Database Storage**: Saves AI-generated data for future use.
- **Strict JSON Format**: Ensures structured and readable responses.

---

## 📌 API Endpoint
### **1⃣ GET Medicine Info**
Fetch detailed medicine information.

#### **👉 Endpoint**
```
POST /api/medicine
```

#### **👉 Headers**
| Key         | Value                  | Required |
|------------|------------------------|----------|
| `x-api-key` | `your-secret-api-key`   | ✅ Yes |

#### **👉 Body (JSON)**
```json
{
  "prompt": "Paracetamol"
}
```

#### **👉 Response (If Found in Database)**
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

#### **👉 Response (If Not Found in Database)**
```json
{
  "error": "Medicine not found"
}
```

If not found, the API will query **Gemini AI**, store the response, and return it.

---

## 🛠️ **Setup Instructions**
### **1⃣ Install Dependencies**
```sh
npm install
```

### **2⃣ Set Environment Variables**
Create a `.env` file in the root directory and add:
```
GCP_API_KEY=your-google-gemini-api-key
API_KEY=your-secret-api-key
MONGO_URI=your-mongodb-connection-string
```

### **3⃣ Start the Server**
```sh
npm start
```

---

## 💌 **Tech Stack**
- **Node.js** - Backend runtime
- **Express.js** - Web framework
- **MongoDB** - Database for medicine storage
- **Google Gemini AI** - AI-based medicine information retrieval

---

## 📌 **Author**
**Azimuddeen Khan**  
🚀 Full Stack Developer  

---

## 🗂️ **License**
This project is licensed under the **MIT License**.