const express = require("express");
const router = express.Router();
const Character = require("../models/character");
const { cloudinary, upload, uploadToCloudinary } = require("../config/cloudinary");
const auth = require("../middleware/auth");

// Flexible search
function buildFlexibleRegex(str) {
    const gap = "[^a-zA-Z0-9]*";
    const pattern = str
        .split("")
        .map(c => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join(gap);
    return `${gap}${pattern}${gap}`;
}

// Upload fields
const buildUploadFields = () => {
    const fields = [
        { name: 'image', maxCount: 1 },
        { name: 'icon', maxCount: 1 }
    ];
    for (let i = 0; i < 3; i++) fields.push({ name: `trace_${i}_image`, maxCount: 1 });
    for (let i = 0; i < 6; i++) fields.push({ name: `eidolon_${i}_image`, maxCount: 1 });
    return fields;
};



// ================= READ ALL =================
router.get("/characters", auth, async (req, res) => {
    try {
        const characters = await Character.find().sort({ version: -1 });
        res.json(characters);
    } catch (err) {
        console.error("GET ALL ERROR:", err);
        res.status(500).json({ message: err.message });
    }
});

// ================= READ ONE =================
router.get("/characters/:name", auth, async (req, res) => {
    try {
        const character = await Character.findOne({
            name: { $regex: new RegExp(`^${buildFlexibleRegex(req.params.name)}$`, "i") }
        });
        if (!character) return res.status(404).json({ message: "Character not found" });
        res.json(character);
    } catch (err) {
        console.error("GET ONE ERROR:", err);
        res.status(500).json({ message: err.message });
    }
});

// ================= CREATE =================
router.post("/characters/", auth, upload.fields(buildUploadFields()), async (req, res) => {
    try {
        const characterData = {
            name: req.body.name,
            version: req.body.version,
            path: req.body.path,
            type: req.body.type,
            star: Number(req.body.star),
            voiceActor: req.body.voiceActor,
            skills: req.body.skills ? JSON.parse(req.body.skills) : [],
            baseStats: req.body.baseStats ? JSON.parse(req.body.baseStats) : {},
            traces: req.body.traces ? JSON.parse(req.body.traces) : [],
            eidolons: req.body.eidolons ? JSON.parse(req.body.eidolons) : [],
            statBonuses: req.body.statBonuses ? JSON.parse(req.body.statBonuses) : []
        };

        if (req.files) {
            if (req.files.image) {
                const f = req.files.image[0];
                const res = await uploadToCloudinary(f.buffer, "hsr-characters", f.mimetype);
                characterData.image = { url: res.secure_url, public_id: res.public_id };
            }

            if (req.files.icon) {
                const f = req.files.icon[0];
                const res = await uploadToCloudinary(f.buffer, "hsr-characters", f.mimetype);
                characterData.icon = { url: res.secure_url, public_id: res.public_id };
            }

            for (let i = 0; i < 3; i++) {
                const key = `trace_${i}_image`;
                if (req.files[key]) {
                    const f = req.files[key][0];
                    const res = await uploadToCloudinary(f.buffer, "hsr-traces", f.mimetype);
                    if (!characterData.traces[i]) characterData.traces[i] = {};
                    characterData.traces[i].image = { url: res.secure_url, public_id: res.public_id };
                }
            }

            for (let i = 0; i < 6; i++) {
                const key = `eidolon_${i}_image`;
                if (req.files[key]) {
                    const f = req.files[key][0];
                    const res = await uploadToCloudinary(f.buffer, "hsr-eidolons", f.mimetype);
                    if (!characterData.eidolons[i]) characterData.eidolons[i] = {};
                    characterData.eidolons[i].image = { url: res.secure_url, public_id: res.public_id };
                }
            }
        }

        const saved = await new Character(characterData).save();
        res.status(201).json(saved);

    } catch (err) {
        console.error("POST ERROR:", err.message);
        res.status(500).json({ message: err.message });
    }
});



// ================= UPDATE =================
router.put("/characters/:name", auth, upload.fields(buildUploadFields()), async (req, res) => {
    try {
        const character = await Character.findOne({
            name: { $regex: new RegExp(`^${buildFlexibleRegex(req.params.name)}$`, "i") }
        });

        if (!character) {
            return res.status(404).json({ message: "Character not found" });
        }

        // ===== TEXT =====
        if (req.body.name) character.name = req.body.name;
        if (req.body.version) character.version = req.body.version;
        if (req.body.path) character.path = req.body.path;
        if (req.body.type) character.type = req.body.type;
        if (req.body.star) character.star = Number(req.body.star);
        if (req.body.voiceActor) character.voiceActor = req.body.voiceActor;

        if (req.body.skills) character.skills = JSON.parse(req.body.skills);
        if (req.body.baseStats) character.baseStats = JSON.parse(req.body.baseStats);
        if (req.body.statBonuses) character.statBonuses = JSON.parse(req.body.statBonuses);

        // ===== MERGE =====
        if (req.body.traces) {
            const newTraces = JSON.parse(req.body.traces);
            newTraces.forEach((t, i) => {
                if (!character.traces[i]) character.traces[i] = {};
                character.traces[i] = { ...character.traces[i], ...t };
            });
        }

        if (req.body.eidolons) {
            const newE = JSON.parse(req.body.eidolons);
            newE.forEach((e, i) => {
                if (!character.eidolons[i]) character.eidolons[i] = {};
                character.eidolons[i] = { ...character.eidolons[i], ...e };
            });
        }

        // ===== FILE HANDLING =====
        const deleteQueue = [];

        if (req.files) {
            if (req.files.image) {
                if (character.image?.public_id) deleteQueue.push(character.image.public_id);
                const f = req.files.image[0];
                const resCloud = await uploadToCloudinary(f.buffer, "hsr-characters", f.mimetype);
                character.image = { url: resCloud.secure_url, public_id: resCloud.public_id };
            }

            if (req.files.icon) {
                if (character.icon?.public_id) deleteQueue.push(character.icon.public_id);
                const f = req.files.icon[0];
                const resCloud = await uploadToCloudinary(f.buffer, "hsr-characters", f.mimetype);
                character.icon = { url: resCloud.secure_url, public_id: resCloud.public_id };
            }

            for (let i = 0; i < 3; i++) {
                const key = `trace_${i}_image`;
                if (req.files[key]) {
                    if (character.traces[i]?.image?.public_id) {
                        deleteQueue.push(character.traces[i].image.public_id);
                    }
                    const f = req.files[key][0];
                    const resCloud = await uploadToCloudinary(f.buffer, "hsr-traces", f.mimetype);
                    if (!character.traces[i]) character.traces[i] = {};
                    character.traces[i].image = { url: resCloud.secure_url, public_id: resCloud.public_id };
                }
            }

            for (let i = 0; i < 6; i++) {
                const key = `eidolon_${i}_image`;
                if (req.files[key]) {
                    if (character.eidolons[i]?.image?.public_id) {
                        deleteQueue.push(character.eidolons[i].image.public_id);
                    }
                    const f = req.files[key][0];
                    const resCloud = await uploadToCloudinary(f.buffer, "hsr-eidolons", f.mimetype);
                    if (!character.eidolons[i]) character.eidolons[i] = {};
                    character.eidolons[i].image = { url: resCloud.secure_url, public_id: resCloud.public_id };
                }
            }
        }

        character.markModified('traces');
        character.markModified('eidolons');

        const saved = await character.save();

        // DELETE OLD IMAGES
        for (const id of deleteQueue) {
            if (id) await cloudinary.uploader.destroy(id);
        }

        res.json(saved);

    } catch (err) {
        console.error("PUT ERROR:", err.message);
        res.status(500).json({ message: err.message });
    }
});



// ================= DELETE =================
router.delete("/characters/:name", auth, async (req, res) => {
    try {
        const character = await Character.findOne({
            name: { $regex: new RegExp(`^${buildFlexibleRegex(req.params.name)}$`, "i") }
        });

        if (!character) return res.status(404).json({ message: "Character not found" });

        const images = [];

        if (character.image?.public_id) images.push(character.image.public_id);
        if (character.icon?.public_id) images.push(character.icon.public_id);

        character.traces?.forEach(t => t.image?.public_id && images.push(t.image.public_id));
        character.eidolons?.forEach(e => e.image?.public_id && images.push(e.image.public_id));

        for (const id of images) {
            if (id) await cloudinary.uploader.destroy(id);
        }

        await Character.deleteOne({ _id: character._id });

        res.json({ message: "Deleted successfully" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;