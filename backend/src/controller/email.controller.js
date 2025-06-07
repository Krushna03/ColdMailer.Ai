import { Email } from "../model/Email.model.js";
import { model } from "../index.js";

const generateEmail = async (req, res) => {
  try {
    const { prompt, userId } = req.body;

    if (!userId) {
        return res.status(500).json({
          success: false,
          message: "Userid is not provided",
        },
      );
    }

    const systemPrompt = `You are an expert in crafting high-converting cold emails.
      Generate a professional cold email based on the user's input with the following guidelines:
      - Keep it concise, engaging, and to the point
      - Maintain a professional and respectful tone
      - Include a clear and compelling call to action
      Do include any additional suggestions, explanations, or content beyond the email itself at the end of the generated email & do not use words like here is your generated email & all the related words, just additional suggestions, explanations, or content, these 3 things are needed. 
      
      For the additional suggestions section:
      - Use proper bullet points (•) instead of asterisks (*) 
      - For emphasis, use markdown bold formatting (**bold text**) for titles or key points only
      - Keep the rest of the text normal without formatting
      - Example: Instead of "**Title**: content" use "• Title: content"
      - Format important points with bold text and normal descriptions`;

    const result = await model.generateContent({
      contents: [
        {
          parts: [{ text: systemPrompt + prompt }]
        },
      ],
    });

    const fullEmail = result?.response?.text();

    const email = await Email.create({
        prompt,
        generatedEmail: fullEmail,
        userId
    });

    if (!email) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate email',
      });
    }

    return res.status(200).json({
      success: true,
      fullEmail,
      emailId: email?._id
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate email',
    });
  }
} 



const updateEmail = async (req, res) => {
  try {
    const { baseEmail, modifications, emailId } = req.body  

    if (!emailId) {
      return res.status(500).json({
        success: false,
        message: "Email Id is not provided",
      },
    );
  }
    
    const systemPromptForUpdate = `You are an expert at writing high-converting cold emails. 
    Your task is to update the following email based on the user's modifications while maintaining its professional quality.
    
    Base Email: ${baseEmail}
    Modifications: ${modifications}
    
    Guidelines for your updated email:
    - Keep it concise, engaging, and to the point
    - Maintain a professional and respectful tone
    - Include a clear and compelling call to action
    
    After the updated email, include additional suggestions, explanations, or content that might help the user further improve their email. Do not use introductory phrases like "here is your updated email" or similar wording.
    
    For the additional suggestions section:
    - Use proper bullet points (•) instead of asterisks (*) 
    - For emphasis, use markdown bold formatting (**bold text**) for titles or key points only
    - Keep the rest of the text normal without formatting
    - Example: Instead of "**Title**: content" use "• Title: content"
    - Format important points with bold text and normal descriptions`;

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPromptForUpdate }]
        },
      ],
    })

    const updatedEmail = result.response.text();

    const findPromptAndAddToChat = await Email.findOneAndUpdate(
      { _id: emailId, userId: req.user._id},
      {
        $push: {
          chatEmails: {
            prompt: modifications,
            generatedEmail: updatedEmail,
          }
        }
      }    
    )

    if (!findPromptAndAddToChat) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate email and update email',
      });
    }

    return res.status(200).json({
      success: true,
      updatedEmail,
    }, 
  );

  } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate email',
      });
  }
}


const getUserEmailHistory = async (req, res) => {
    try {
      const { userID } = req.query;

      if(!userID){
        return res.status(500).json({
          success: false,
          message: "UserID is not provided"
        })
      }

      const getEmails = await Email.find({ userId: userID }).sort({ createdAt: -1})

      if (!getEmails || getEmails.length === 0) {
        return res.status(500).json({
          success: false,
          message: "No emails found"
        })
      }

      const updatedEmails = getEmails.map(email => {
        return {
          ...email._doc,
          chatEmails: [...email.chatEmails].reverse()
        };
      });

      return res.status(200).json({
        success: true,
        emails: updatedEmails,
        message: "Emails fetched successfully"
      })

    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get email history',
      });
    }
}


const updateEmailHistory = async (req, res) => {
    const { emailId, modification, baseprompt, prevchats } = req.body;

    if (!emailId) {
      return res.status(500).json({
        success: false,
        message: "Email Id is not provided",
      });
    }
    if (!modification) {
      return res.status(500).json({
        success: false,
        message: "Prompt is not provided",
      });
    }

    let formattedPrevChats  = '';
    for(let i = 0; i < prevchats.length; i++) {
      formattedPrevChats += `\n• ${prevchats[i]}`;
    }

    const systemPrompt = `You are an expert email optimization specialist focused on crafting high-converting cold emails through iterative refinement.

    CONTEXT & EVOLUTION:
    Base Email: ${baseprompt}
    Current Modification Request: ${modification}
    Previous Refinements: ${formattedPrevChats}
    
    TASK:
    Analyze the evolution of this email through previous modifications and apply the current requested changes while maintaining consistency with the established direction and tone. Consider what has been tried before to avoid repetition and build upon successful elements.
    
    OPTIMIZATION GUIDELINES:
    - Maintain the core message and value proposition from the base email
    - Incorporate lessons learned from previous iterations (avoid reverting successful changes)
    - Apply the current modification request while preserving what's working
    - Ensure the email remains concise, engaging, and professional
    - Include a compelling call to action that aligns with the email's evolution
    - Keep the tone consistent with the established voice from previous versions
    
    RESPONSE FORMAT:
    Provide ONLY the refined email content. Do not include any additional suggestions, explanations, introductory text, or commentary. The response should contain exclusively the optimized email text that can be used directly.
    
    OUTPUT REQUIREMENTS:
    - Start immediately with the email content
    - No prefacing phrases like "Here's your email" or similar
    - No additional sections or suggestions
    - Clean, ready-to-use email format only`;


    console.log("SystemPrompt", systemPrompt);

    const result = await model.generateContent({
      contents: [
        {
          parts: [{ text: systemPrompt + baseprompt }]
        },
      ],
    });

    const fullEmail = result?.response?.text();

    const foundEmailHistory = await Email.findOneAndUpdate(
      { _id: emailId, userId: req.user._id},
      {
        $push: {
          chatEmails: {
            prompt: modification,
            generatedEmail: fullEmail,
          }
        }
      }    
    )

    if (!foundEmailHistory) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update email history',
      });
    }

    return res.status(200).json({
      success: true,
      updatedEmail: fullEmail,
      message: "Email history updated successfully"
    });
}


const deleteEmail = async (req, res) => {
    const { emailId } = req.body

    if (!emailId) {
      return res.status(500).json({
        success: false,
        message: "Email Id is not provided",
      });
    }

    const deletedEmail = await Email.findOneAndDelete({ _id: emailId, userId: req.user._id });

    if (!deletedEmail) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete email',
      });
    }

    return res.status(200).json({
      success: true,
      message: "Email deleted successfully"
    });
}

export { generateEmail, updateEmail, getUserEmailHistory, updateEmailHistory, deleteEmail }