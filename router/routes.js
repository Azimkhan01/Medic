const router = require('express').Router();
const { parseStringPromise } = require('xml2js'); // Import xml2js
const medic = require('../controller/medic');
const list = require('../controller/list');
const similar = require('../controller/similar');
// router.get('/data/:name', async (req, res) => {
//     const name = req.params.name
//     try {
//         const response = await fetch(`https://api.fda.gov/drug/label.json?search=${name}&limit=10`);
//         const data = await response.json(); // Await JSON response
//         console.log(data); // Log the data properly
//         res.json(data); // Send data to the client
//     } catch (error) {
//         console.error("Error fetching medicine data:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });

// router.get('/d1/:name', async (req, res) => {
//     const name = req.params.name;
//     try {
//         const response = await fetch(`https://rxnav.nlm.nih.gov/REST/drugs?name=${name}`);
//         const xmlData = await response.text(); // Get XML response as text

//         // Convert XML to JSON
//         const jsonData = await parseStringPromise(xmlData, { explicitArray: false });

//         console.log(jsonData); // Log parsed JSON
//         res.json(jsonData); // Send JSON response
//     } catch (error) {
//         console.error("Error fetching medicine data:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });

router.route("/medic").get(medic)
router.route("/list").get(list)
router.route("/similar").get(similar)

module.exports = router;