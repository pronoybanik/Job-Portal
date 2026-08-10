import axios from "axios";
import { StatusCodes } from "http-status-codes";
import AppError from "../utils/errorHandler.js";
import getBufferFromFile from "./buffer.js";

const uploadResume = async (file: Express.Multer.File) => {
  const uploadServiceBaseUrl =
    process.env.UPLOAD_SERVICE || "http://localhost:5001";

  const fileBuffer = getBufferFromFile(file);

  try {
    const { data } = await axios.post<{
      url: string;
      public_id: string;
    }>(
      `${uploadServiceBaseUrl}/api/utils/upload`,
      {
        buffer: fileBuffer.toString(),
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!data.url || !data.public_id) {
      throw new AppError(
        StatusCodes.BAD_GATEWAY,
        "Invalid upload service response"
      );
    }

    return data;
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new AppError(
        StatusCodes.BAD_GATEWAY,
        error.response?.data?.message ||
          "Failed to upload resume to upload service"
      );
    }

    throw error;
  }
};

export default uploadResume;