const mongoose = require("mongoose");

const pathSchema = new mongoose.Schema({
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

const PathInfo = mongoose.model("Path", pathSchema);

module.exports = PathInfo;
