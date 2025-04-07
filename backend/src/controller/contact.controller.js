import { Contact } from "../model/Contact.model.js";


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
          message: "Error sending message | Please try again !",
        },
      );
    }

    return res.status(200) 
          .json({
          success: true,
          message: 'Message sent successfully.',
      }
    );
}

export { contact }