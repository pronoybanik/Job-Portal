import { StatusCodes } from "http-status-codes";
import AppError from "./errorHandler.js";
import getBufferFromFile from "./buffer.js";

type UploadResult = {
  url: string;
  public_id: string;
};

const uploadFile = async (
  file: Express.Multer.File,
  previousPublicId?: string | null,
): Promise<UploadResult> => {
  const uploadService = process.env.UPLOAD_SERVICE || "http://localhost:5001";

  try {
    const response = await fetch(`${uploadService}/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buffer: getBufferFromFile(file).toString(),
        ...(previousPublicId ? { public_id: previousPublicId } : {}),
      }),
    });

    const body = (await response.json()) as Partial<UploadResult> & {
      message?: string;
    };
    if (!response.ok || !body.url || !body.public_id) {
      throw new AppError(
        StatusCodes.BAD_GATEWAY,
        body.message || "File upload failed",
      );
    }

    return { url: body.url, public_id: body.public_id };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(StatusCodes.BAD_GATEWAY, "Upload service is unavailable");
  }
};

export default uploadFile;
