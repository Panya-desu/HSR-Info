const express = require("express");
const router = express.Router();
const Lightcone = require("../models/lightcone");
const { cloudinary, upload, uploadToCloudinary } = require("../config/cloudinary");
const auth = require("../middleware/auth");

function buildFlexibleRegex(str) {
    const gap = "[^a-zA-Z0-9]*";
    const pattern = str
        .split("")
        .map(c => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join(gap);
    return `${gap}${pattern}${gap}`;
}

const lcUploadFields = [
    { name: 'image', maxCount: 1 },
    { name: 'icon', maxCount: 1 }
];

router.get("/", auth, async (req, res) => {
    try {
        const lightcones = await Lightcone.find().sort({ version: -1, star: -1, name: 1 });
        res.json(lightcones);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/:name", auth, async (req, res) => {
    try {
        const lightcone = await Lightcone.findOne({
            name: { $regex: new RegExp(`^${buildFlexibleRegex(req.params.name)}$`, "i") }
        });
        if (!lightcone) return res.status(404).json({ message: "Lightcone not found" });
        res.json(lightcone);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/", auth, upload.fields(lcUploadFields), async (req, res) => {
    try {
        const lightconeData = req.body;
        
        if (typeof lightconeData.baseStats === 'string') {
            lightconeData.baseStats = JSON.parse(lightconeData.baseStats);
        }

        if (req.files) {
            if (req.files.image && req.files.image[0]) {
                const result = await uploadToCloudinary(req.files.image[0].buffer, 'lightcones', req.files.image[0].mimetype);
                lightconeData.image = { url: result.secure_url, public_id: result.public_id };
            }
            if (req.files.icon && req.files.icon[0]) {
                const result = await uploadToCloudinary(req.files.icon[0].buffer, 'lightcones/icons', req.files.icon[0].mimetype);
                lightconeData.icon = { url: result.secure_url, public_id: result.public_id };
            }
        }

        const newLightcone = new Lightcone(lightconeData);
        await newLightcone.save();
        res.status(201).json(newLightcone);
    } catch (err) {
        console.error("CREATE LC ERROR:", err);
        res.status(400).json({ message: err.message });
    }
});

router.put("/:name", auth, upload.fields(lcUploadFields), async (req, res) => {
    try {
        const lightcone = await Lightcone.findOne({
            name: { $regex: new RegExp(`^${buildFlexibleRegex(req.params.name)}$`, "i") }
        });
        if (!lightcone) return res.status(404).json({ message: "Lightcone not found" });

        const updateData = req.body;

        if (typeof updateData.baseStats === 'string') {
            updateData.baseStats = JSON.parse(updateData.baseStats);
        }

        if (req.files) {
            if (req.files.image && req.files.image[0]) {
                if (lightcone.image?.public_id) await cloudinary.uploader.destroy(lightcone.image.public_id);
                const result = await uploadToCloudinary(req.files.image[0].buffer, 'lightcones', req.files.image[0].mimetype);
                updateData.image = { url: result.secure_url, public_id: result.public_id };
            }
            if (req.files.icon && req.files.icon[0]) {
                if (lightcone.icon?.public_id) await cloudinary.uploader.destroy(lightcone.icon.public_id);
                const result = await uploadToCloudinary(req.files.icon[0].buffer, 'lightcones/icons', req.files.icon[0].mimetype);
                updateData.icon = { url: result.secure_url, public_id: result.public_id };
            }
        }

        const updatedLightcone = await Lightcone.findByIdAndUpdate(lightcone._id, updateData, { new: true });
        res.json(updatedLightcone);
    } catch (err) {
        console.error("UPDATE LC ERROR:", err);
        res.status(400).json({ message: err.message });
    }
});

router.delete("/:name", auth, async (req, res) => {
    try {
        const lightcone = await Lightcone.findOne({
            name: { $regex: new RegExp(`^${buildFlexibleRegex(req.params.name)}$`, "i") }
        });
        if (!lightcone) return res.status(404).json({ message: "Lightcone not found" });

        if (lightcone.image?.public_id) await cloudinary.uploader.destroy(lightcone.image.public_id);
        if (lightcone.icon?.public_id) await cloudinary.uploader.destroy(lightcone.icon.public_id);

        await Lightcone.findByIdAndDelete(lightcone._id);
        res.json({ message: "Lightcone deleted successfully" });
    } catch (err) {
        console.error("DELETE LC ERROR:", err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
