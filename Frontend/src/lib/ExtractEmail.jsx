export const extractEmailAndContent = (fullText) => {
  // Handle empty or invalid input
  console.log("emaui", fullText);
  if (!fullText || typeof fullText !== 'string') {
    return { 
      email: "No valid input provided.", 
      content: "Please provide text containing an email and additional content."
    };
  }

  // Define markers that separate email content from additional suggestions
  // Using more reliable markers that align with the system prompt
  const emailMarkers = ["Subject:", "subject:", "EMAIL:", "email:", "Subject line:", "SUBJECT:"];
  const contentMarkers = [
    "Additional Suggestions", 
    "Additional suggestions", 
    "ADDITIONAL SUGGESTIONS",
    "Additional Content",
    "Additional content",
    "Here are some suggestions",
    "Here are some additional suggestions",
    "Some suggestions",
    "Some additional suggestions",
    "Suggestions:",
    "Explanation:",
    "Additional notes:"
  ];
  
  // Find the starting position of the email - use the first occurrence of any marker
  let emailStartIndex = -1;
  let startMarker = "";
  
  for (const marker of emailMarkers) {
    const index = fullText.indexOf(marker);
    if (index !== -1 && (emailStartIndex === -1 || index < emailStartIndex)) {
      emailStartIndex = index;
      startMarker = marker;
    }
  }
  
  // Find the starting position of the additional content
  let contentStartIndex = -1;
  let contentMarker = "";
  
  for (const marker of contentMarkers) {
    const index = fullText.indexOf(marker);
    if (index !== -1 && (contentStartIndex === -1 || index < contentStartIndex)) {
      contentStartIndex = index;
      contentMarker = marker;
    }
  }
  
  // Handle cases where markers aren't found
  if (emailStartIndex === -1) {
    // If no email markers found, try to intelligently split the content
    // Look for patterns like a greeting followed by paragraphs
    const greetingPatterns = /^(Hi|Hello|Dear|Greetings|Hey)/m;
    const greetingMatch = fullText.match(greetingPatterns);
    
    if (greetingMatch && greetingMatch.index !== undefined) {
      // Found a greeting, try to find where additional content might start
      const paragraphs = fullText.split(/\n\s*\n/);
      
      if (paragraphs.length > 1) {
        // Assume the last paragraph might be additional content
        const lastParagraphIndex = fullText.lastIndexOf(paragraphs[paragraphs.length - 1]);
        return {
          email: fullText.substring(0, lastParagraphIndex).trim(),
          content: paragraphs[paragraphs.length - 1].trim()
        };
      } else {
        // If only one paragraph, just return everything as email
        return { 
          email: fullText.trim(), 
          content: "" 
        };
      }
    } else {
      // No clear structure, return everything as email
      return { 
        email: fullText.trim(), 
        content: "" 
      };
    }
  }
  
  // If no content marker is found, try to infer where content might begin
  if (contentStartIndex === -1) {
    // Strategy 1: Look for signature markers which might indicate email end
    const signaturePatterns = /\n(Regards|Sincerely|Best|Thanks|Thank you|Cheers|Yours),?\s*\n/i;
    const signatureMatch = fullText.substring(emailStartIndex).match(signaturePatterns);
    
    if (signatureMatch && signatureMatch.index !== undefined) {
      const signatureEndIndex = emailStartIndex + signatureMatch.index + signatureMatch[0].length;
      // Check if there's still content after the signature
      if (signatureEndIndex < fullText.length - 20) { // Require at least 20 chars of content
        return {
          email: fullText.substring(emailStartIndex, signatureEndIndex).trim(),
          content: fullText.substring(signatureEndIndex).trim()
        };
      }
    }
    
    // Strategy 2: If no signature found or insufficient content after signature,
    // return everything as email and show a placeholder for content
    return {
      email: fullText.substring(emailStartIndex).trim(),
      content: "No additional suggestions found."
    };
  }
  
  // Normal case: both markers found
  const email = fullText.substring(emailStartIndex, contentStartIndex).trim();
  
  // Include the content marker in the content section
  const content = fullText.substring(contentStartIndex).trim();
  
  return { email, content };
};

// Helper function to check if the extraction worked correctly
export const validateExtraction = (result) => {
  const { email, content } = result;
  
  // Check if email contains basic expected elements
  const hasSubjectLine = /subject|subject line|re:/i.test(email);
  const hasGreeting = /hi|hello|dear|greetings|hey/i.test(email);
  const hasSignature = /regards|sincerely|thanks|thank you|best|cheers/i.test(email);
  const hasCallToAction = /call|contact|reach out|schedule|connect|meeting|discuss|next steps|response|reply|thoughts|follow up/i.test(email);
  
  // Check if content section contains expected elements based on system prompt
  const hasAdditionalSuggestions = /suggestion|tip|recommend|idea|consider|try|enhance|improve|optimize/i.test(content);
  const hasExplanations = /explain|clarif|understand|reason|because|detail|note|background|context/i.test(content);
  
  return {
    isValid: hasSubjectLine && hasGreeting && hasCallToAction, // Call to action required by system prompt
    hasMissingElements: {
      subjectLine: !hasSubjectLine,
      greeting: !hasGreeting,
      callToAction: !hasCallToAction,
      signature: !hasSignature,
      additionalContent: !hasAdditionalSuggestions && !hasExplanations
    }
  };
};

// This helper function can be used to sanitize the AI response to better match expected format
export const sanitizeEmailResponse = (response) => {
  // Don't process null or undefined responses
  if (!response) return response;
  
  // Replace phrases that explicitly introduce the email (per system prompt requirement)
  const phrasesToRemove = [
    "Here is your generated email:",
    "Here's your generated email:",
    "Here is the generated email:",
    "Here's the generated email:",
    "I've generated the following cold email:",
    "Your cold email is ready:",
    "The cold email you requested:"
  ];
  
  let sanitized = response;
  
  // Remove introduction phrases
  phrasesToRemove.forEach(phrase => {
    if (sanitized.includes(phrase)) {
      sanitized = sanitized.replace(phrase, "").trim();
    }
  });
  
  // If no explicit "Additional Suggestions" section exists but the email is followed by other content,
  // add the marker to make parsing easier
  if (!/(Additional Suggestions|Additional Content|Suggestions:|Explanation:|Additional notes:)/i.test(sanitized)) {
    // Check if there's a signature followed by more content
    const signatureMatch = sanitized.match(/\n(Regards|Sincerely|Best|Thanks|Thank you|Cheers|Yours),?\s*\n.+/is);
    if (signatureMatch && signatureMatch.index !== undefined) {
      const signatureEndPos = signatureMatch.index + signatureMatch[0].indexOf('\n', signatureMatch[1].length + 1);
      if (signatureEndPos < sanitized.length - 30) { // Ensure there's substantial content after
        const beforeContent = sanitized.substring(0, signatureEndPos);
        const afterContent = sanitized.substring(signatureEndPos);
        sanitized = beforeContent + "\n\nAdditional Suggestions:\n" + afterContent;
      }
    }
  }
  
  // Convert asterisk bullets to proper bullet points in the additional suggestions section
  const formatBulletPoints = (text) => {
    // Split the text to separate email from additional content
    const sections = text.split(/(Additional Suggestions|Additional Content|Suggestions:|Explanation:|Additional notes:)/i);
    
    if (sections.length >= 3) {  // We have a marker and content after it
      const emailPart = sections[0] + sections[1];  // Keep email + marker unchanged
      let contentPart = sections.slice(2).join('');  // Get all content after marker
      
      // Replace asterisk bullet points with proper bullet points
      contentPart = contentPart.replace(/^\s*\*\s+/gm, '• ');
      
      // Fix bold formatting - change *Title* to **Title**
      contentPart = contentPart.replace(/\*([^*\n]+)\*/g, '**$1**');
      
      return emailPart + contentPart;
    }
    
    return text;  // Return unchanged if no sections found
  };
  
  sanitized = formatBulletPoints(sanitized);
  
  return sanitized;
};