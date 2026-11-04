import express from "express";
import expressProxy from "express-http-proxy";

const app = express();

app.use("/api/auth", expressProxy(process.env.AUTH_SERVICE_URL || "http://localhost:5000"));
app.use("/api/utils", expressProxy(process.env.UTILS_SERVICE_URL || "http://localhost:5001", { limit: "50mb" }));
app.use("/api/user", expressProxy(process.env.USER_SERVICE_URL || "http://localhost:5002", { limit: "50mb" }));
app.use("/api/job", expressProxy(process.env.JOB_SERVICE_URL || "http://localhost:5003", { limit: "50mb" }));

app.listen(3000, () => {
  console.log("Gateway server listening on port 3000");
});
