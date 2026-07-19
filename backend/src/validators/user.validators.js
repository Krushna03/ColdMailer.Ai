import { z } from "zod"

const registerSchema = z.object({
  username: z.string()
              .min(3, "Username must be atleast 3 characters")
              .max(30, "Username must not exceed 30 characters"),

  email: z.string().email("Invalid email format"),

  password: z.string().min(5, "Password must be at least 5 characters long"),
})

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(5, "Password must be at least 5 characters long"),
})

// Zod exposes validation problems on `issues`
const firstIssueMessage = (err, fallback = "Invalid input") =>
  (err?.issues ?? err?.errors ?? [])[0]?.message ?? fallback;

export const validateRegister = (req, res, next) => {
  try {
    registerSchema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: firstIssueMessage(err),
    });
  }
};


export const validateLogin = (req, res, next) => {
  try{
    loginSchema.parse(req.body);
    next();
  } 
  catch (err) {
    return res.status(400).json({
      success: false,
      message: firstIssueMessage(err),
    });
  }
} 