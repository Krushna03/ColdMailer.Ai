import { asyncHandler } from "../utils/asyncHandler.js";
import {
  generateEmailService,
  updateEmailService,
  updateEmailHistoryService,
  getUserEmailHistoryService,
  getUsageSummaryService,
  deleteEmailService
} from "../services/email.service.js";
import {
  validateUserAuth,
  validateEmailPrompt,
  validateEmailUpdate,
  validateEmailHistoryUpdate,
  validateEmailDeletion,
  validatePagination
} from "../validators/email.validators.js";

/**
 * Generate a new email
 * POST /api/v1/email/generate-email
 */
const generateEmail = asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  if (!validateUserAuth(req.user, res)) return;
  if (!validateEmailPrompt(prompt, res)) return;

  const result = await generateEmailService({
    prompt,
    user: req.user
  });

  return res.status(200).json({
    success: true,
    fullEmail: result.fullEmail,
    emailId: result.emailId,
    usage: result.usage
  });
});

/**
 * Update an existing email
 * POST /api/v1/email/update-email
 */
const updateEmail = asyncHandler(async (req, res) => {
  const { baseEmail, modifications, emailId } = req.body;

  if (!validateUserAuth(req.user, res)) return;
  if (!validateEmailUpdate({ emailId, baseEmail, modifications }, res)) return;

  const updatedEmail = await updateEmailService({
    emailId,
    baseEmail,
    modifications,
    user: req.user
  });

  return res.status(200).json({
    success: true,
    updatedEmail
  });
});

/**
 * Get user email history with pagination
 * GET /api/v1/email/history
 */
const getUserEmailHistory = asyncHandler(async (req, res) => {
  const { limit = 10, page = 0 } = req.query;
  const userId = req.user?._id;

  if (!validateUserAuth(req.user, res)) return;
  const pagination = validatePagination(limit, page, res);
  if (!pagination) return;
  const { pageInt, limitInt } = pagination;

  const { emails } = await getUserEmailHistoryService({
    userId,
    limit: limitInt,
    page: pageInt
  });

  if (!emails || emails.length === 0) {
    return res.status(200).json({
      success: true,
      emails: [],
      message: "No emails found"
    });
  }

  return res.status(200).json({
    success: true,
    emails,
    message: "Emails fetched successfully"
  });
});

/**
 * Update email history with iterative refinement
 * POST /api/v1/email/update-history
 */
const updateEmailHistory = asyncHandler(async (req, res) => {
  const { emailId, modification, baseprompt, prevchats } = req.body;

  if (!validateUserAuth(req.user, res)) return;
  if (!validateEmailHistoryUpdate({ emailId, modification, baseprompt }, res)) return;

  const updatedEmail = await updateEmailHistoryService({
    emailId,
    modification,
    baseprompt,
    prevchats,
    user: req.user
  });

  return res.status(200).json({
    success: true,
    updatedEmail,
    message: "Email history updated successfully"
  });
});

/**
 * Get usage summary for the current user
 * GET /api/v1/email/usage-summary
 */
const getUsageSummary = asyncHandler(async (req, res) => {
  if (!validateUserAuth(req.user, res)) return;

  const usageSummary = await getUsageSummaryService(req.user);

  return res.status(200).json({
    success: true,
    message: "Usage summary retrieved successfully",
    data: usageSummary
  });
});

/**
 * Delete an email
 * DELETE /api/v1/email/delete-email
 */
const deleteEmail = asyncHandler(async (req, res) => {
  const { emailId } = req.body;

  if (!validateUserAuth(req.user, res)) return;
  if (!validateEmailDeletion(emailId, res)) return;

  await deleteEmailService({
    emailId,
    userId: req.user._id
  });

  return res.status(200).json({
    success: true,
    message: "Email deleted successfully"
  });
});

export {
  generateEmail,
  updateEmail,
  getUserEmailHistory,
  updateEmailHistory,
  deleteEmail,
  getUsageSummary
};
