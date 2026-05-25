const mongoose = require("mongoose");

const lightconeSchema = new mongoose.Schema({
    name: { type: String, index: true },
    version: String,
    star: Number,
    path: String,
    image: {
        url: String,
        public_id: String,
    },
    icon: {
        url: String,
        public_id: String,
    },
    baseStats: {
        hp: Number,
        atk: Number,
        def: Number,
    },
    abilityName: String,
    description: String,
});

const LightconeInfo = mongoose.model("Lightcone", lightconeSchema);

module.exports = LightconeInfo;
