import mongoose, { Schema, } from 'mongoose';


const EmailSchema = new Schema({
    prompt: { 
      type: String, required: true 
    },
    
    generatedEmail: { 
      type: String,
    },
  }
  , { timestamps: true }
);

export const Email = mongoose.model('Email', EmailSchema);