require('dotenv').config();
const axios = require('axios');

const list = async (req, res) => {
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
        console.log(`Searching for: ${query}`);

        // 🔹 Fetch from FDA API
        const fdaData = await fetchFDA(query, limit);
        // 🔹 Fetch from RxNav API
        const rxNavData = await fetchRxNorm(query, limit);

        // Combine and filter unique results
        const combinedResults = [...new Set([...fdaData, ...rxNavData])].slice(0, limit);

        if (combinedResults.length === 0) {
            return res.status(404).json({ error: "No relevant medicines found" });
        }

        res.json({ source: "FDA & RxNav", medicines: combinedResults });

    } catch (error) {
        console.error("Error fetching medicine list:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const fetchFDA = async (query, limit) => {
    try {
        const response = await axios.get(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:${query}&limit=${limit}`);
        return response.data.results.map(item => item.openfda?.brand_name?.[0] || item.openfda?.generic_name?.[0]).filter(Boolean);
    } catch (error) {
        console.error("Error fetching from FDA:", error);
        return [];
    }
};

const fetchRxNorm = async (query, limit) => {
    try {
        const response = await axios.get(`https://rxnav.nlm.nih.gov/REST/drugs.json?name=${query}`);
        return response.data.drugGroup?.conceptGroup?.flatMap(group =>
            group.conceptProperties?.map(prop => prop.name) || []
        ).slice(0, limit) || [];
    } catch (error) {
        console.error("Error fetching from RxNav:", error);
        return [];
    }
};

module.exports = list;
