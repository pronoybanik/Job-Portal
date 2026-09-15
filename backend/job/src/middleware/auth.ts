import jwt, { JwtPayload } from 'jsonwebtoken';

import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/errorHandler.js';
import { StatusCodes } from "http-status-codes";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

const auth = (...requiredRoles: string[]) => {
  return catchAsync(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const token = req.headers.authorization;

      if (!token) {
        throw new AppError(
          StatusCodes.UNAUTHORIZED,
          'Authorization token is missing!',
        );
      }

      // Remove 'Bearer ' prefix if present
      const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;

      let decoded: JwtPayload;

      try {
        decoded = jwt.verify(
          tokenValue,
          process.env.JWT_SECRET as string,
        ) as JwtPayload;
      } catch (error) {
        throw new AppError(
          StatusCodes.UNAUTHORIZED,
          'Invalid or expired token!',
        );
      }

      const { id, role } = decoded;

      if (!id) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid token payload!');
      }

      const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:5000';
      let userResponse: globalThis.Response;
      try {
        userResponse = await fetch(`${authServiceUrl}/me`, {
          headers: { Authorization: token },
        });
      } catch {
        throw new AppError(StatusCodes.BAD_GATEWAY, 'Auth service is unavailable');
      }

      if (!userResponse.ok) {
        throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
      }

      // Check role if required roles are specified
      if (requiredRoles.length && !requiredRoles.includes(role)) {
        throw new AppError(
          StatusCodes.FORBIDDEN,
          'You do not have the required permissions!',
        );
      }

      req.user = decoded;
      next();
    },
  );
};

export default auth;
