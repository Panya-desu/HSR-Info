const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

dotenv.config();

const charactersRoutes = require("./routes/characters");
const adminCharactersRoutes = require("./routes/adminCharacters");
const adminLightconesRoutes = require("./routes/adminLightcones");
const authRoutes = require("./routes/auth");
const lightconesRoutes = require("./routes/lightcones");

const app = express();
const PORT = process.env.PORT;

app.use(helmet());
app.use(cookieParser());

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5001";
app.use(cors({
    origin: allowedOrigin,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error("Error: MONGODB_URI is not defined in .env file");
    process.exit(1);
}

mongoose.connect(MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('HSR Info API');
})

app.use("/characters", charactersRoutes);
app.use("/admin", adminCharactersRoutes);
app.use("/admin/lightcones", adminLightconesRoutes);
app.use("/auth", authRoutes);
app.use("/metadata", require("./routes/metadata"));
app.use("/lightcones", lightconesRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR:", err);
    if (err.message) console.error("ERROR MESSAGE:", err.message);
    if (err.stack) console.error("STACK:", err.stack);
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
})