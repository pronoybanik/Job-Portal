import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import AppError from '../utils/errorHandler.js';
import catchAsync from '../utils/catchAsync.js';

const serviceAuth = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
	const incomingSecret = req.headers['x-service-secret'];
	const expectedSecret = process.env.USER_SYNC_SECRET;

	if (!expectedSecret) {
		throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'USER_SYNC_SECRET is not configured in auth service');
	}

	if (incomingSecret !== expectedSecret) {
		throw new AppError(StatusCodes.FORBIDDEN, 'Unauthorized service request');
	}

	next();
});

export default serviceAuth;