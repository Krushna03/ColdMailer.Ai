import mongoose, { Schema, } from 'mongoose';


const ContactSchema = new Schema({
    name: { 
      type: String, required: true 
    },
    
    email: { 
      type: String, required: true 
    },

    message: {
      type: String
    }
  }
  , { timestamps: true }
);

export const Contact = mongoose.model('Contact', ContactSchema);