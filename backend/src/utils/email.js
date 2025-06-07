export const contactEmailTemplate = (formData) => {

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #333; text-align: center;">New Contact Form Submission</h2>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
      <p><strong>Name:</strong> ${formData.name}</p>
      <p><strong>Email:</strong> <a href="mailto:${formData.email}" style="color: #007bff; text-decoration: none;">${formData.email}</a></p>
      <p><strong>Message:</strong></p>
      <blockquote style="border-left: 3px solid #007bff; padding-left: 10px; color: #555;">
        ${formData.message}
      </blockquote>
    </div>
  `;
};