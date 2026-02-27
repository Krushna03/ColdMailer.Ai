import { z } from "zod";

// Zod Schemas
const emailPromptSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(5000, "Prompt is too long")
});

const emailUpdateSchema = z.object({
  emailId: z.string().min(1, "Email ID is required"),
  baseEmail: z.string().min(1, "Base email is required"),
  modifications: z.string().min(1, "Modifications are required")
});

const emailHistoryUpdateSchema = z.object({
  emailId: z.string().min(1, "Email ID is required"),
  modification: z.string().min(1, "Modification is required"),
  baseprompt: z.string().min(1, "Base prompt is required")
});

const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
  page: z.coerce.number().int().min(0).default(0)
});

export const validateUserAuth = (user, res) => {
  if (!user?._id) {
    res.status(401).json({
      success: false,
      message: "Unauthorized request"
    });
    return false;
  }
  return true;
};

export const validateEmailPrompt = (prompt, res) => {
  const result = emailPromptSchema.safeParse({ prompt });
  if (!result.success) {
    res.status(400).json({
      success: false,
      message: result.error.errors[0].message
    });
    return false;
  }
  return true;
};

export const validateEmailUpdate = ({ emailId, baseEmail, modifications }, res) => {
  const result = emailUpdateSchema.safeParse({ emailId, baseEmail, modifications });
  if (!result.success) {
    res.status(400).json({
      success: false,
      message: result.error.errors[0].message
    });
    return false;
  }
  return true;
};

export const validateEmailHistoryUpdate = ({ emailId, modification, baseprompt }, res) => {
  const result = emailHistoryUpdateSchema.safeParse({ emailId, modification, baseprompt });
  if (!result.success) {
    res.status(400).json({
      success: false,
      message: result.error.errors[0].message
    });
    return false;
  }
  return true;
};

export const validateEmailDeletion = (emailId, res) => {
  if (!emailId) {
    res.status(400).json({
      success: false,
      message: "Email ID is required"
    });
    return false;
  }
  return true;
};

export const validatePagination = (limit, page, res) => {
  const result = paginationSchema.safeParse({ limit, page });
  if (!result.success) {
    res.status(400).json({
      success: false,
      message: result.error.errors[0].message
    });
    return null;
  }
  return result.data;
};

