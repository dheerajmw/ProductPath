import { Router } from "express";
import multer from "multer";
import { updateSubmissionSchema } from "@productpath/shared";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { requireCandidate } from "../middleware/candidate";
import {
  listTemplatesForUser,
  getTemplateBySlug,
  listMySubmissions,
  getSubmission,
  createSubmission,
  updateSubmission,
  submitForReview,
  uploadArtifact,
  createResubmissionFromRejected,
  ProjectError,
} from "../services/project.service";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
});

router.use(requireAuth);
router.use(requireCandidate);

router.get("/templates", async (req: AuthedRequest, res, next) => {
  try {
    const data = await listTemplatesForUser(req.user!.id);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.get("/templates/:slug", async (req: AuthedRequest, res, next) => {
  try {
    const data = await getTemplateBySlug(req.user!.id, String(req.params.slug));
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.get("/submissions/mine", async (req: AuthedRequest, res, next) => {
  try {
    const data = await listMySubmissions(req.user!.id);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.get("/submissions/:id", async (req: AuthedRequest, res, next) => {
  try {
    const data = await getSubmission(req.user!.id, String(req.params.id));
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.post("/submissions", async (req: AuthedRequest, res, next) => {
  try {
    const body = z
      .object({
        templateId: z.string().min(1),
        title: z.string().optional(),
        narrative: z.string().optional(),
        artifactUrls: z
          .array(z.object({ type: z.literal("URL"), name: z.string(), url: z.string().url() }))
          .optional(),
      })
      .parse(req.body);
    const data = await createSubmission(req.user!.id, body.templateId, body);
    res.status(201).json(data);
  } catch (e) {
    next(e);
  }
});

router.put("/submissions/:id", async (req: AuthedRequest, res, next) => {
  try {
    const body = updateSubmissionSchema.parse(req.body);
    const data = await updateSubmission(req.user!.id, String(req.params.id), body);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.post("/submissions/:id/submit", async (req: AuthedRequest, res, next) => {
  try {
    const data = await submitForReview(req.user!.id, String(req.params.id));
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.post("/submissions/:id/resubmit", async (req: AuthedRequest, res, next) => {
  try {
    const data = await createResubmissionFromRejected(req.user!.id, String(req.params.id));
    res.status(201).json(data);
  } catch (e) {
    next(e);
  }
});

router.post(
  "/submissions/:id/upload",
  upload.single("file"),
  async (req: AuthedRequest, res, next) => {
    try {
      if (!req.file) {
        throw new ProjectError("No file uploaded", 400, "NO_FILE");
      }
      const data = await uploadArtifact(req.user!.id, String(req.params.id), {
        originalname: req.file.originalname,
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });
      res.json(data);
    } catch (e) {
      next(e);
    }
  },
);

export { router as projectsRoutes, ProjectError };
