import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import gameRoutes from "./routes/gameRoute.js";
import voiceRoutes from "./routes/voiceRoute.js";
import cors from "cors";
import path from "path";


//configure env
dotenv.config();

//databse config
connectDB();

//rest object
const app = express();

//middelwares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "./client/build")));

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/game", gameRoutes);
app.use("/api/v1/voice", voiceRoutes);

//rest api
app.use("*", function (req, res) {
    res.sendFile(path.join(__dirname, "./client/build/index.html"))

});

/*app.get("/", (req, res) => {
    res.send("<h1>Welcome to ecommerce app</h1>");
});*/

//PORT
const PORT = process.env.PORT || 8080;

//run listen
app.listen(PORT, () => {
    console.log(
        `Server Running on ${process.env.DEV_MODE} mode on port ${PORT}`.bgCyan
            .white
    );
});

//MONGO_URL=mongodb+srv://janhavibhati2004_db_user:CuS873fdCGmILyPl@cluster0.eezx2a3.mongodb.net/eCom
//mongodb+srv://<db_username>:<db_password>@cluster0.eezx2a3.mongodb.net/?appName=Cluster0
//$env:Path += ";C:\Program Files\nodejs"