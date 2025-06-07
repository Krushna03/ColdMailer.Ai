import { extractEmailAndContent, validateExtraction, sanitizeEmailResponse } from './ExtractEmail';

// Inside your component:
export const processGeneratedEmail = (rawResponse) => {
  // First sanitize the AI response to better match expected format
  const sanitizedResponse = sanitizeEmailResponse(rawResponse);
  
  // Then extract the email and content sections
  const { email, content } = extractEmailAndContent(sanitizedResponse);
  
  // Optionally validate the extraction for quality control
  const validation = validateExtraction({ email, content });
  
  // If there are issues with the extraction, you can handle them
  if (!validation.isValid) {
    console.warn("Email extraction may have issues:", validation.hasMissingElements);
    // You could potentially trigger a regeneration or display a warning
  }
  
  return { email, content, isValid: validation.isValid };
};

export const formatBulletPoints = (content) => {
  if (!content) return content;
  
  let formattedContent = content;
  
  // Convert asterisk bullet points to proper bullet points
  formattedContent = formattedContent.replace(/^\s*\*\s+/gm, '• ');
  
  // Fix bold formatting - change *emphasized text* to **bold text**
  formattedContent = formattedContent.replace(/\**([^*\n]+)\**/g, '$1');
  
  return formattedContent;
};
