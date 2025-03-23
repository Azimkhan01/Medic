const { GoogleGenerativeAI } = require("@google/generative-ai");
const { med } = require("../database/db");

const genAI = new GoogleGenerativeAI(process.env.GCP_API_KEY);

const ai = async (req, res) => {
    try {
        // ✅ Validate API Key
        const apiKey = req.headers["x-api-key"];
        if (!apiKey || apiKey !== process.env.API_KEY) {
            return res.status(401).json({ error: "Unauthorized: Invalid API key" });
        }

        // ✅ Validate Prompt
        const userPrompt = req.body.prompt?.trim();
        if (!userPrompt) {
            return res.status(400).json({ error: "Prompt is required!" });
        }

        // ✅ Step 1: Check in Database First
        const existingMedicine = await med.findOne({ name: { $regex: new RegExp(`^${userPrompt}$`, "i") } });
        if (existingMedicine) {
            return res.status(200).json(existingMedicine);
        }

        // ✅ Step 2: Prepare AI Prompt
        const aiPrompt = `Provide a **detailed** and **accurate** JSON response about the medicine **"${userPrompt}"**.

        The response **MUST** contain:
        - **Name** (Official and generic names)
        - **All brand names** available globally (including India-specific names)
        - **Drug class**
        - **Complete uses** (Pain relief, fever, specific diseases, etc.)
        - **Dosage details** (Adult & pediatric, recommended dosage, overdose risks)
        - **Side effects** (Common, rare, and severe)
        - **Contraindications** (Who should NOT take this)
        - **Drug interactions** (List common medications it interacts with)
        - **Warnings** (Pregnancy, liver issues, kidney issues, other risks)
        - **Legal status** (OTC or prescription-only in different countries)

        🔹 **Important Instructions:**
        - Output must be in **strict JSON format** without markdown or explanations.
        - If the medicine is **not found**, return exactly: {"error": "Medicine not found"}.
        - Do **not** add any introductory text, only return the JSON response.`;

        // ✅ Step 3: Call Gemini AI
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(aiPrompt);

        // ✅ Fix: Extract AI Response Properly
        const responseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (typeof responseText !== "string") {
            return res.status(500).json({ error: "Invalid response format from AI" });
        }

        // ✅ Clean and Parse JSON
        const jsonResponse = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
            const parsedResponse = JSON.parse(jsonResponse);

            // If AI returns "Medicine not found", don't save
            if (parsedResponse.error === "Medicine not found") {
                return res.status(404).json(parsedResponse);
            }

            // ✅ Step 4: Store in Database
            await med.insertOne(parsedResponse);

            res.status(200).json(parsedResponse);
        } catch (jsonError) {
            res.status(500).json({ error: "Invalid JSON format received", details: jsonError.message });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Something went wrong!", details: error.message });
    }
};

module.exports = ai;
