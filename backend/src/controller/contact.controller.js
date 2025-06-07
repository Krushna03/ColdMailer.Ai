import { Contact } from "../model/Contact.model.js";
import nodemailer from "nodemailer";
import { contactEmailTemplate } from "../utils/email.js";


const sendEmailNotification = async (formData) => {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          secure: true,
          port: 465,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
        
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: formData.email && process.env.EMAIL_USER,
          subject: 'Thanks for Contacting | I will coonect you soon.',
          html: contactEmailTemplate(formData)
        }
  
        const resp = await transporter.sendMail(mailOptions);
  
        return resp;

      } catch (error) {
        console.error('Error sending email:', error);
        return error;
      }
};




const contact = async (req, res) => {

    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(500).json(
        {
          success: false,
          message: 'All fields are required',
        },
      );
    }

    const newContactMessage = await Contact.create({
      name,
      email,
      message,
    });

    if (!newContactMessage) {
      return res.status(500).json(
        {
          success: false,
          message: "Error sending message | Please try again.",
        },
      );
    }

    try {
      await sendEmailNotification({
          name,
          email,
          message,
      });

        return res.status(200).json({
          success: true,
          message: 'Message sent successfully.'
        });
      }
      catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({
            success: false,
            message: 'Error sending message:', error
        });
      }
}

export { contact }