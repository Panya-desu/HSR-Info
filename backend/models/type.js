const mongoose = require("mongoose");

const typeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    icon: {
        url: String,
        public_id: String,
    }
});

const TypeInfo = mongoose.model("Type", typeSchema);

module.exports = TypeInfo;
