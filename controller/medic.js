require('dotenv').config();
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { med } = require('../database/db'); // Import Mongoose model

// 🔹 Rate Limiting: Allow only 5 requests per minute per IP
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 5, 
    message: { error: "Too many requests, please try again later." },
    headers: true,
});

// 🔹 Slow Down: Gradually delay responses for repeated requests
const speedLimiter = slowDown({
    windowMs: 1 * 60 * 1000,
    delayAfter: 3,
    delayMs: (req, res) => Math.min(2000, (req.slowDown.current - 3) * 500),
});

const medic = async (req, res) => {
    console.log("🔹 Incoming request:", req.query.q);
    
    const apiKey = req.headers['x-api-key'];
    const VALID_API_KEY = process.env.API_KEY;

    if (!apiKey || apiKey !== VALID_API_KEY) {
        console.log("❌ Invalid API Key");
        return res.status(403).json({ error: "Forbidden: Invalid API Key" });
    }

    const query = req.query.q;
    if (!query) {
        console.log("❌ No query parameter provided");
        return res.status(400).json({ error: "Bad Request: Query parameter 'q' is required" });
    }

    try {
        // 🔹 Step 1: Check Database First
        console.log(`🔍 Searching database for: ${query}`);
        const existingMedicine = await med.findOne({ name: query });

        if (existingMedicine) {
            console.log("✅ Medicine found in database:", existingMedicine);
            return res.json({ source: "Database", ...existingMedicine.toObject() });
        }

        // 🔹 Step 2: Search in FDA API
        console.log(`🌎 Searching FDA API for: ${query}`);
        const fdaData = await fetchFDA(query);
        if (fdaData) {
            console.log("✅ Found medicine in FDA API");
            const formattedData = { source: "FDA", ...extractData(fdaData) };
            await med.create({ name: query, ...formattedData }); // Store in DB
            console.log("✅ Data stored in database");
            return res.json(formattedData);
        }

        // 🔹 Step 3: If not found, search in RxNav API
        console.log(`🌎 Searching RxNav API for: ${query}`);
        const rxcui = await fetchRxNorm(query);
        if (!rxcui) {
            console.log("❌ No RxCUI found for the medicine");
            return res.status(404).json({ error: "Medicine not found" });
        }

        // 🔹 Step 4: Fetch medicine details from RxNav
        console.log(`🌎 Fetching RxNav data for RxCUI: ${rxcui}`);
        const rxNavData = await fetchRxNavData(rxcui);

        // 🔹 Step 5: Use RxCUI to check FDA again
        console.log(`🌎 Searching FDA API using RxCUI: ${rxcui}`);
        const fdaDataByRxcui = await fetchFDA(rxcui);
        if (fdaDataByRxcui) {
            console.log("✅ Found medicine in FDA API via RxCUI");
            const formattedData = { source: "FDA (via RxCUI)", ...extractData(fdaDataByRxcui) };
            await med.create({ name: query, ...formattedData }); // Store in DB
            console.log("✅ Data stored in database");
            return res.json(formattedData);
        }

        // 🔹 Step 6: Return RxNav data if FDA still not found
        console.log("✅ Returning RxNav data");
        const finalData = { source: "RxNav", ...extractData(rxNavData) };
        await med.create({ name: query, ...finalData }); // Store in DB
        console.log("✅ Data stored in database");
        return res.json(finalData);

    } catch (error) {
        console.error("❌ Error fetching medicine data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const fetchFDA = async (query) => {
    try {
        console.log(`🔍 Fetching FDA data for: ${query}`);
        const response = await axios.get(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:${query}`);
        return response.data.results || null;
    } catch (error) {
        console.error("❌ FDA API error:", error.response?.data || error.message);
        return null;
    }
};

const fetchRxNorm = async (query) => {
    try {
        console.log(`🔍 Fetching RxNorm data for: ${query}`);
        const response = await axios.get(`https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${query}`);
        return response.data.idGroup?.rxnormId?.[0] || null;
    } catch (error) {
        console.error("❌ RxNorm API error:", error.response?.data || error.message);
        return null;
    }
};

const fetchRxNavData = async (rxcui) => {
    try {
        console.log(`🔍 Fetching RxNav data for RxCUI: ${rxcui}`);
        const response = await axios.get(`https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${rxcui}`);
        return response.data.approximateGroup?.candidate || null;
    } catch (error) {
        console.error("❌ RxNav API error:", error.response?.data || error.message);
        return null;
    }
};

// 🔹 Extract only useful fields and separate extra data
const extractData = (data) => {
    if (!data || !Array.isArray(data)) return null;

    return {
        data: data.map(item => ({
            brand_name: item.openfda?.brand_name?.[0] || "N/A",
            generic_name: item.openfda?.generic_name?.[0] || "N/A",
            manufacturer: item.openfda?.manufacturer_name?.[0] || "N/A",
            purpose: item.purpose?.[0] || "N/A",
            usage: item.indications_and_usage?.[0] || "N/A",
            dosage: item.dosage_and_administration?.[0] || "N/A",
            warnings: item.warnings?.[0] || "N/A",
            route: item.openfda?.route?.[0] || "N/A",
            storage: item.storage_and_handling?.[0] || "N/A",
            contact: item.questions?.[0] || "N/A",
            side_effects: item.adverse_reactions?.[0] || "N/A",
            contraindications: item.contraindications?.[0] || "N/A",
            interactions: item.drug_interactions?.[0] || "N/A",
            overdose_info: item.overdosage?.[0] || "N/A",
            pregnancy_warning: item.pregnancy?.[0] || "N/A",
        })),
        extra: data.map(item => ({
            inactive_ingredients: item.inactive_ingredient?.[0] || "N/A",
            box_warning: item.boxed_warning?.[0] || "N/A",
            how_supplied: item.how_supplied?.[0] || "N/A",
            clinical_studies: item.clinical_studies?.[0] || "N/A",
            pediatric_use: item.pediatric_use?.[0] || "N/A",
            geriatric_use: item.geriatric_use?.[0] || "N/A",
            abuse_potential: item.drug_abuse_and_dependence?.[0] || "N/A",
            pharmacodynamics: item.clinical_pharmacology?.[0] || "N/A",
        })),
    };
};

module.exports = medic;
