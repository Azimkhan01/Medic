require('dotenv').config();
const axios = require('axios');

const similar = async (req, res) => {
    const apiKey = req.headers['x-api-key'];
    const VALID_API_KEY = process.env.API_KEY;

    if (!apiKey || apiKey !== VALID_API_KEY) {
        return res.status(403).json({ error: "Forbidden: Invalid API Key" });
    }

    const query = req.query.q;
    const limit = parseInt(req.query.limit) || 10; // Default limit is 10

    if (!query) {
        return res.status(400).json({ error: "Bad Request: Query parameter 'q' is required" });
    }

    try {
        console.log(`🔍 Searching for similar medicines related to: ${query}`);

        // 🔹 Fetch from FDA API
        const fdaData = await fetchSimilarFDA(query, limit);
        // 🔹 Fetch from RxNav API
        const rxNavData = await fetchSimilarRxNorm(query, limit);

        // Combine and filter unique results, then apply limit
        const combinedResults = [...new Set([...fdaData, ...rxNavData])].slice(0, limit);

        if (combinedResults.length === 0) {
            return res.status(404).json({ error: "No similar medicines found" });
        }

        res.json({ source: "FDA & RxNav", similar_medicines: combinedResults });

    } catch (error) {
        console.error("❌ Error fetching similar medicines:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// 🔹 Fetch Similar Medicines from FDA
const fetchSimilarFDA = async (query, limit) => {
    try {
        const response = await axios.get(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:${query}+OR+openfda.generic_name:${query}&limit=${limit}`);
        return response.data.results.flatMap(item => item.openfda?.brand_name || []).filter(Boolean);
    } catch (error) {
        console.error("❌ FDA API error:", error);
        return [];
    }
};

// 🔹 Fetch Similar Medicines from RxNav
const fetchSimilarRxNorm = async (query, limit) => {
    try {
        const response = await axios.get(`https://rxnav.nlm.nih.gov/REST/drugs.json?name=${query}`);
        return response.data.drugGroup?.conceptGroup?.flatMap(group =>
            group.conceptProperties?.map(prop => prop.name) || []
        ).slice(0, limit) || [];
    } catch (error) {
        console.error("❌ RxNav API error:", error);
        return [];
    }
};

module.exports = similar;
