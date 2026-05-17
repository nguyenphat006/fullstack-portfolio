import { Router } from "express";
import { getProjects, getProjectById } from "../controllers/projects.controller";

const router = Router();

/**
 * @openapi
 * /api/projects:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Lấy danh sách dự án
 *     parameters:
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Lọc ra các dự án nổi bật (true/false)
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/", getProjects);

/**
 * @openapi
 * /api/projects/{id}:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Lấy chi tiết một dự án bằng Slug/ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug hoặc ID của dự án
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not Found
 */
router.get("/:id", getProjectById);

export default router;
