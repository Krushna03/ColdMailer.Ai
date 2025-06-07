import mongoose, { Schema, } from 'mongoose';


const UpdateEmailSchema = new Schema({
    prompt: { 
      type: String, required: true 
    },
    
    generatedEmail: { 
      type: String,
    },
  },
  { timestamps: true }
);




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
    },

    chatEmails: [UpdateEmailSchema],

  },
  { timestamps: true }
);

export const Email = mongoose.model('Email', EmailSchema);