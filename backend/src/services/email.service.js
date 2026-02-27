import { Email } from "../model/Email.model.js";
import {
  buildPlanUsageSummary,
  getPlanConfigForUser,
  getMonthlyEmailUsage
} from "../utils/planLimits.js";
import { generateAIContent, generateAIContentWithRole } from "./ai.service.js";
import {
  EMAIL_GENERATION_PROMPT,
  EMAIL_UPDATE_PROMPT,
  EMAIL_HISTORY_UPDATE_PROMPT
} from "../constants/email.prompts.js";


const checkMonthlyLimit = async (user, now) => {
  const planConfig = getPlanConfigForUser(user);
  const userId = user._id;
  const monthlyUsage = await getMonthlyEmailUsage({ userId, now });
  const monthlyLimit = planConfig?.limits?.monthlyEmailGenerations ?? null;

  if (monthlyLimit && monthlyUsage.used >= monthlyLimit) {
    return res.status(403).json({
      success: false,
      message: `You have reached the ${planConfig.name} plan limit of ${monthlyLimit} emails this month. Please upgrade your plan to continue.`
    });
  }

  return { planConfig, monthlyUsage };
};


const checkRegenerationLimit = (user, emailRecord) => {
  const planConfig = getPlanConfigForUser(user);
  const maxRegenerations = planConfig?.limits?.maxRegenerationsPerEmail;
  const currentRegenerations = emailRecord.chatEmails?.length || 0;

  if (
    typeof maxRegenerations === 'number' &&
    maxRegenerations >= 0 &&
    currentRegenerations >= maxRegenerations
  ) {
    return res.status(403).json({
      success: false,
      message: `Your current plan allows ${maxRegenerations} updates per email. Upgrade to unlock unlimited revisions.`
    });
  }

  return planConfig;
};


export const generateEmailService = async ({ prompt, user }) => {
  const now = new Date();
  
  const { planConfig, monthlyUsage } = await checkMonthlyLimit(user, now);

  const fullPrompt = EMAIL_GENERATION_PROMPT + prompt;
  const aiResponse = await generateAIContent(fullPrompt);

  if (!aiResponse.success) {
    return res.status(aiResponse.statusCode).json({
      success: false,
      message: aiResponse.error
    });
  }

  const fullEmail = aiResponse.data;

  const email = await Email.create({
    prompt,
    generatedEmail: fullEmail,
    userId: user._id
  });

  const updatedMonthlyUsage = {
    ...monthlyUsage,
    used: monthlyUsage.used + 1
  };

  const usageSummary = await buildPlanUsageSummary({
    user,
    planConfig,
    now,
    monthlyUsageSnapshot: updatedMonthlyUsage
  });

  return {
    fullEmail,
    emailId: email._id,
    usage: usageSummary
  };
};


export const updateEmailService = async ({ emailId, baseEmail, modifications, user }) => {
  // Find email record
  const emailRecord = await Email.findOne({
    _id: emailId,
    userId: user._id
  });

  if (!emailRecord) {
    return res.status(404).json({
      success: false,
      message: 'Email not found'
    });
  }

  checkRegenerationLimit(user, emailRecord);

  const systemPrompt = EMAIL_UPDATE_PROMPT(baseEmail, modifications);
  const aiResponse = await generateAIContentWithRole(systemPrompt, 'user');

  if (!aiResponse.success) {
    return res.status(aiResponse.statusCode).json({
      success: false,
      message: aiResponse.error
    });
  }

  const updatedEmail = aiResponse.data;

  emailRecord.chatEmails.push({
    prompt: modifications,
    generatedEmail: updatedEmail,
  });

  await emailRecord.save();

  return updatedEmail;
};


export const updateEmailHistoryService = async ({
  emailId,
  modification,
  baseprompt,
  prevchats,
  user
}) => {

  const emailRecord = await Email.findOne({
    _id: emailId,
    userId: user._id
  });

  if (!emailRecord) {
    return res.status(404).json({
      success: false,
      message: 'Email not found'
    });
  }

  checkRegenerationLimit(user, emailRecord);

  const normalizedPrevChats = Array.isArray(prevchats) ? prevchats : [];
  let formattedPrevChats = '';
  for (let i = 0; i < normalizedPrevChats.length; i++) {
    formattedPrevChats += `\n• ${normalizedPrevChats[i]}`;
  }

  const systemPrompt = EMAIL_HISTORY_UPDATE_PROMPT(
    baseprompt,
    modification,
    formattedPrevChats
  );
  const fullPrompt = systemPrompt + baseprompt;
  const aiResponse = await generateAIContent(fullPrompt);

  if (!aiResponse.success) {
    return res.status(aiResponse.statusCode).json({
      success: false,
      message: aiResponse.error
    });
  }

  const fullEmail = aiResponse.data;

  emailRecord.chatEmails.push({
    prompt: modification,
    generatedEmail: fullEmail,
  });

  await emailRecord.save();

  return fullEmail;
};


export const getUserEmailHistoryService = async ({ userId, limit, page }) => {
  const emails = await Email.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(page * limit);

  return {
    emails: emails || [],
    hasMore: emails.length === limit
  };
};


export const getUsageSummaryService = async (user) => {
  const planConfig = getPlanConfigForUser(user);
  const usageSummary = await buildPlanUsageSummary({
    user,
    planConfig,
    now: new Date()
  });

  return usageSummary;
};


export const deleteEmailService = async ({ emailId, userId }) => {
  const deletedEmail = await Email.findOneAndDelete({
    _id: emailId,
    userId
  });

  if (!deletedEmail) {
    return res.status(404).json({
      success: false,
      message: 'Email not found or already deleted'
    });
  }

  return { success: true };
};

