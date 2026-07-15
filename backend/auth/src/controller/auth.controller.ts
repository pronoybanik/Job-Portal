import { Request, Response } from "express";

export const registerUser = async (req:Request, res:Response) => {
  try {
  
} catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
