import express  from "express";
import dotenv from "dotenv";
import router from "./routes.js";
import cors from "cors";
import {v2 as cloudinary} from "cloudinary";
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
app.use(cors());

app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/utils", router);

app.listen(process.env.PORT || 5001, () => {
    console.log(`utils server is running on port ${process.env.PORT || 5001}`);
});

export default app;