import AppError from "../utils/errorHandler.js";
import { StatusCodes } from "http-status-codes";
import getBufferFromFile from "./buffer.js";


const uploadResume = async (file: Express.Multer.File) => {
  const uploadServiceBaseUrl =
    process.env.UPLOAD_SERVICE || "http://localhost:5001";
    
  const fileBuffer = getBufferFromFile(file);

  const response = await fetch(`${uploadServiceBaseUrl}/api/utils/upload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      buffer: fileBuffer.toString(),
    }),
  });

  if (!response.ok) {
    throw new AppError(
      StatusCodes.BAD_GATEWAY,
      "Failed to upload resume to upload service",
    );
  }

  const data = (await response.json()) as { url: string; public_id: string };

  if (!data.url || !data.public_id) {
    throw new AppError(
      StatusCodes.BAD_GATEWAY,
      "Invalid upload service response",
    );
  }

  return data;
};

export default uploadResume;