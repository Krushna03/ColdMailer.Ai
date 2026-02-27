// Parse email string to extract subject and body
export const parseEmail = (emailStr = "") => {
  if (!emailStr || typeof emailStr !== 'string') {
    return { subject: '', body: '' };
  }

  const [subjectLine, ...bodyLines] = emailStr.split('\n');
  return {
    subject: subjectLine.replace(/^Subject:\s*/i, '').trim(),
    body: bodyLines.join('\n').split('Additional suggestions')[0].trim(),
  };
};

// Create Gmail compose URL
export const createGmailComposeUrl = ({ to = '', subject = '', body = '' }) => {
  const baseUrl = "https://mail.google.com/mail/?view=cm&fs=1";
  const params = new URLSearchParams({
    to: to,
    su: subject,
    body: body,
  });
  return `${baseUrl}&${params.toString()}`;
};

// Open Gmail compose window
export const openGmailCompose = ({ to = '', subject = '', body = '', userEmail = null }) => {
  const gmailComposeUrl = createGmailComposeUrl({ to, subject, body });

  if (!userEmail) {
    const googleLoginUrl =
      "https://accounts.google.com/ServiceLogin" +
      `?continue=${encodeURIComponent(gmailComposeUrl)}`;
    window.open(googleLoginUrl, "_blank");
    return;
  }

  window.open(gmailComposeUrl, "_blank");
};
