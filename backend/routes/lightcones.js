const express = require("express");
const router = express.Router();
const Lightcone = require("../models/lightcone");

// Build flexible regex
function buildFlexibleRegex(str) {
    const gap = "[^a-zA-Z0-9]*";
    const pattern = str
        .split("")
        .map(c => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join(gap);
    return `${gap}${pattern}${gap}`;
}

// READ ALL
router.get("/", async (req, res) => {
    try {
        const lightcones = await Lightcone.find().sort({ version: -1, star: -1, name: 1 });
        res.json(lightcones);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// READ ONE
router.get("/:name", async (req, res) => {
    try {
        const lightcone = await Lightcone.findOne({
            name: { $regex: new RegExp(`^${buildFlexibleRegex(req.params.name)}$`, "i") }
        });
        if (!lightcone) return res.status(404).json({ message: "Lightcone not found" });
        res.json(lightcone);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
