import mongoose, { Schema, } from 'mongoose';


const EmailSchema = new Schema({
    prompt: { 
      type: String, required: true 
    },
    
    generatedEmail: { 
      type: String,
    },

    userId: { 
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true 
    }
  },
  { timestamps: true }
);

export const Email = mongoose.model('Email', EmailSchema);