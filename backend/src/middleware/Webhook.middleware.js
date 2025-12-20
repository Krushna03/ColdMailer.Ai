

export const webhookMiddleware = (req, res, next) => {
  try {
    const bodyString = req.body.toString();
    req.body = JSON.parse(bodyString);
    req.rawBody = bodyString;
  } catch (e) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid JSON body' 
    });
  }
  next();
};