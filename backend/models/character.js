const mongoose = require("mongoose");

const characterSchema = new mongoose.Schema({
    name: String,
    version: String,
    path: String,
    type: String,
    star: Number,
    image: {
        url: String,
        public_id: String,
    },
    icon: {
        url: String,
        public_id: String,
    },
    skills: [{
        name: String,
        type: { type: String },
        description: String,
        energy: String,
        toughness: String,
        spChange: String
    }],
    baseStats: {
        hp: Number,
        atk: Number,
        def: Number,
        spd: Number,
        maxEnergy: Number
    },
    voiceActor: String,
    traces: [{
        name: String,
        description: String,
        image: {
            url: String,
            public_id: String,
        }
    }],
    eidolons: [{
        name: String,
        description: String,
        image: {
            url: String,
            public_id: String,
        }
    }],
    statBonuses: [{
        type: { type: String },
        value: String
    }]
});

const CharacterInfo = mongoose.model("Character", characterSchema);

module.exports = CharacterInfo;