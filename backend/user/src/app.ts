import express from 'express';

import { StatusCodes } from 'http-status-codes';
import AppError from './utils/errorHandler.js';
import userRoutes from './routes/user.routes.js';

const app = express();
app.use(express.json());

app.use('/', userRoutes);

app.use((req, res, next) => {
	next(new AppError(StatusCodes.NOT_FOUND, `Route not found: ${req.originalUrl}`));
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
	console.error(err);
	const appError =
		err instanceof AppError
			? err
			: new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Something went wrong');

	res.status(appError.statusCode).json({
		success: false,
		message:
			process.env.NODE_ENV === 'development' && !(err instanceof AppError)
				? err instanceof Error
					? err.message
					: 'Something went wrong'
				: appError.message,
		error: {
			statusCode: appError.statusCode,
			status: appError.status,
		},
		stack: process.env.NODE_ENV === 'development' ? appError.stack : undefined,
	});
});

export default app;
