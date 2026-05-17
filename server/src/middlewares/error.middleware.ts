import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { ZodError } from "zod";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Intercept Zod Validation Errors
  if (err instanceof ZodError) {
    const message = "Invalid Input Data";
    const errors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message,
      errors,
    });
  }

  // Intercept Prisma Errors (e.g. Record Not Found)
  if (err.code === "P2025") {
    error = new AppError("Resource not found", 404);
  }

  // Default Error Payload Fallback
  res.status(error.statusCode).json({
    success: false,
    message: error.message || "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Endpoint ${req.originalUrl} not found!`, 404));
};
