export class AppError extends Error{
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number){
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }

    static validationError(message: string) {
        return new AppError(message, 400);
    }

    static authenticationError(message: string) {
        return new AppError(message, 401);
    }

    static forbiddenError(message: string) {
        return new AppError(message, 403);
    }

    static notFoundError(message: string) {
        return new AppError(message, 404);
    }
}