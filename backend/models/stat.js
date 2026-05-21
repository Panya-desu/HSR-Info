const mongoose = require("mongoose");

const statSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    icon: {
        url: String,
        public_id: String
    }
});

module.exports = mongoose.model("Stat", statSchema);
