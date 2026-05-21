const express = require("express");
const router = express.Router();
const Path = require("../models/path");
const Type = require("../models/type");
const Stat = require("../models/stat");
const auth = require("../middleware/auth");
const { cloudinary, upload, uploadToCloudinary } = require("../config/cloudinary");

// ================= PATHS =================
router.get("/paths", async (req, res) => {
    try {
        const paths = await Path.find().sort({ name: 1 });
        res.json(paths);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/paths", auth, async (req, res) => {
    try {
        const newPath = new Path(req.body);
        const saved = await newPath.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put("/paths/:id/icon", auth, upload.single("icon"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No image provided" });
        const uploadRes = await uploadToCloudinary(req.file.buffer, "hsr-paths", req.file.mimetype);
        const updatedPath = await Path.findByIdAndUpdate(
            req.params.id,
            { icon: { url: uploadRes.secure_url, public_id: uploadRes.public_id } },
            { returnDocument: 'after' }
        );
        if (!updatedPath) return res.status(404).json({ message: "Path not found" });
        res.json(updatedPath);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete("/paths/:id", auth, async (req, res) => {
    try {
        await Path.findByIdAndDelete(req.params.id);
        res.json({ message: "Path deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ================= TYPES =================
router.get("/types", async (req, res) => {
    try {
        const types = await Type.find().sort({ name: 1 });
        res.json(types);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/types", auth, async (req, res) => {
    try {
        const newType = new Type(req.body);
        const saved = await newType.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put("/types/:id/icon", auth, upload.single("icon"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No image provided" });
        const uploadRes = await uploadToCloudinary(req.file.buffer, "hsr-types", req.file.mimetype);
        const updatedType = await Type.findByIdAndUpdate(
            req.params.id,
            { icon: { url: uploadRes.secure_url, public_id: uploadRes.public_id } },
            { returnDocument: 'after' }
        );
        if (!updatedType) return res.status(404).json({ message: "Type not found" });
        res.json(updatedType);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete("/types/:id", auth, async (req, res) => {
    try {
        await Type.findByIdAndDelete(req.params.id);
        res.json({ message: "Type deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ================= STATS =================
router.get("/stats", async (req, res) => {
    try {
        const stats = await Stat.find().sort({ name: 1 });
        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/stats", auth, async (req, res) => {
    try {
        const newStat = new Stat(req.body);
        const saved = await newStat.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put("/stats/:id/icon", auth, upload.single("icon"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No image provided" });
        const uploadRes = await uploadToCloudinary(req.file.buffer, "hsr-stats", req.file.mimetype);
        const updatedStat = await Stat.findByIdAndUpdate(
            req.params.id,
            { icon: { url: uploadRes.secure_url, public_id: uploadRes.public_id } },
            { returnDocument: 'after' }
        );
        if (!updatedStat) return res.status(404).json({ message: "Stat not found" });
        res.json(updatedStat);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete("/stats/:id", auth, async (req, res) => {
    try {
        await Stat.findByIdAndDelete(req.params.id);
        res.json({ message: "Stat deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
