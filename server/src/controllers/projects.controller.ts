import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { prisma } from "../lib/prisma";
import { sendResponse } from "../utils/response";
import { AppError } from "../utils/AppError";

export const getProjects = catchAsync(async (req: Request, res: Response) => {
  const { featured } = req.query;

  const projects = await prisma.project.findMany({
    where: {
      isDeleted: false,
      ...(featured === "true" && { featured: true }),
    },
    orderBy: { createdAt: "desc" },
  });

  sendResponse(res, 200, true, "Projects retrieved successfully", projects);
});

export const getProjectById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const project = await prisma.project.findUnique({
    where: { slug: id, isDeleted: false },
  });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  sendResponse(res, 200, true, "Project retrieved successfully", project);
});
