"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_http_proxy_1 = __importDefault(require("express-http-proxy"));
const app = (0, express_1.default)();
app.use("/api/auth", (0, express_http_proxy_1.default)(process.env.AUTH_SERVICE_URL || "http://localhost:5000"));
app.use("/api/utils", (0, express_http_proxy_1.default)(process.env.UTILS_SERVICE_URL || "http://localhost:5001", { limit: "50mb" }));
app.use("/api/user", (0, express_http_proxy_1.default)(process.env.USER_SERVICE_URL || "http://localhost:5002", { limit: "50mb" }));
app.use("/api/job", (0, express_http_proxy_1.default)(process.env.JOB_SERVICE_URL || "http://localhost:5003", { limit: "50mb" }));
app.listen(3000, () => {
    console.log("Gateway server listening on port 3000");
});
