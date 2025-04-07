import { Email } from "../model/Email.models.js";
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

      Do not include any additional suggestions, explanations, or content beyond the email itself.`;


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
    const { baseEmail, modifications } = req.body  
    
    const systemPromptForUpdate = `You are an expert at writing cold emails. 
    Your task is to find the mistake in the following email and correct it.
    Base Email: ${baseEmail}
    Modifications: ${modifications}
    And now as you have a proper context & the mistake, you need to correct it, such that the user will get the most accurate cold email so that the user can make out most of it.
    - Always keep one point in mind, do not suggest the user that they can refine it. You just need to correct it as per the context.
    `;

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: baseEmail + modifications + systemPromptForUpdate }]
        },
      ],
    })

    const updatedEmail = result.response.text();

    const findPrompt = await Email.findOneAndUpdate(
      { prompt },
      {
        $push: {
          //  {
            prompt,
            generatedEmail: fullEmail,
          // } 
        }
      }    
    )


    await Email.create({
        prompt: baseEmail + modifications, 
        generatedEmail: updatedEmail,
    });

    return res.status(200).json({
      success: true,
      updatedEmail,
    }, 
  );

  } catch (error) {
      console.error('Error:', error);
      return res.status(200).json({
        success: false,
        error: 'Failed to generate email',
      });
  }
}


export { generateEmail, updateEmail }