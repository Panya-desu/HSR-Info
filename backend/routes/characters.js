const express = require("express");
const router = express.Router();
const Character = require("../models/character");

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
        const characters = await Character.find().sort({ version: -1 });
        res.json(characters);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// READ ONE
router.get("/:name", async (req, res) => {
    try {
        const character = await Character.findOne({
            name: { $regex: new RegExp(`^${buildFlexibleRegex(req.params.name)}$`, "i") }
        });
        if (!character) return res.status(404).json({ message: "Character not found" });
        res.json(character);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;