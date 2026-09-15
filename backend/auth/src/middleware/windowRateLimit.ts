import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import AppError from '../utils/errorHandler.js';

// Fixed point window rate limiting

type WindowRateLimitOptions = {
	windowMs?: number;
	maxRequests?: number;
	message?: string;
};

type WindowState = {
	count: number;
	windowStart: number;
};

const createWindowRateLimit = ({
	windowMs = 15 * 60 * 1000,
	maxRequests = 10,
	message = 'Too many auth requests. Please try again later.',
}: WindowRateLimitOptions = {}) => {
	const requestStore = new Map<string, WindowState>();

	return (req: Request, res: Response, next: NextFunction) => {
		const requestKey = req.ip || req.socket.remoteAddress || 'unknown';
        
		const now = Date.now();
		const currentState = requestStore.get(requestKey);

		if (!currentState || now - currentState.windowStart >= windowMs) {
			requestStore.set(requestKey, {
				count: 1,
				windowStart: now,
			});

			res.setHeader('X-RateLimit-Limit', String(maxRequests));
			res.setHeader('X-RateLimit-Remaining', String(maxRequests - 1));
			res.setHeader('X-RateLimit-Reset', String(Math.ceil((now + windowMs) / 1000)));
			next();
			return;
		}

		if (currentState.count >= maxRequests) {
			const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (now - currentState.windowStart)) / 1000));

			res.setHeader('Retry-After', String(retryAfterSeconds));
			next(new AppError(StatusCodes.TOO_MANY_REQUESTS, message));
			return;
		}

		currentState.count += 1;
		requestStore.set(requestKey, currentState);

		res.setHeader('X-RateLimit-Limit', String(maxRequests));
		res.setHeader('X-RateLimit-Remaining', String(maxRequests - currentState.count));
		res.setHeader('X-RateLimit-Reset', String(Math.ceil((currentState.windowStart + windowMs) / 1000)));
		next();
	};
};

export default createWindowRateLimit;
