const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const connectDB = require("./connectiondb/db");
const authRoutes = require("./routes/authRoutes");
const cors = require('cors');
const app = express();

connectDB();
app.use(cors({
    origin: '*', 
  }));

app.use(express.json());

app.use("/api", authRoutes);

app.get("/hello", (req, res) => {
    res.send("Hello, world!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
