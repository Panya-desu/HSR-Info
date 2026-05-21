const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Path = require("./models/path");
const Type = require("./models/type");

dotenv.config();

const paths = [
    { name: "Destruction" },
    { name: "Hunt" },
    { name: "Erudition" },
    { name: "Harmony" },
    { name: "Nihility" },
    { name: "Preservation" },
    { name: "Abundance" }
];

const types = [
    { name: "Physical" },
    { name: "Fire" },
    { name: "Ice" },
    { name: "Lightning" },
    { name: "Wind" },
    { name: "Quantum" },
    { name: "Imaginary" }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        await Path.deleteMany({});
        await Type.deleteMany({});
        console.log("Cleared old metadata");

        await Path.insertMany(paths);
        await Type.insertMany(types);
        console.log("Inserted new metadata");

        process.exit(0);
    } catch (err) {
        console.error("Seed error:", err);
        process.exit(1);
    }
}

seed();
