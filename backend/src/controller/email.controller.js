import { Email } from "../model/Email.models.js";
import { model } from "../../index.js";

const generateEmail = async (req, res) => {
  try {
    const { prompt } = req.body;

    const systemPrompt = `You are an expert at writing cold emails.
    Create a professional cold email with the following characteristics:
    - Keep it concise and engaging
    - Include a clear call to action
    - Be professional and respectful`;


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

    return NextResponse.json({
      success: true,
      updatedEmail,
    }, { status: 200 });

  } catch (error) {
      console.error('Error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to generate email',
      }, { status: 500 });
  }
}


export { generateEmail, updateEmail }