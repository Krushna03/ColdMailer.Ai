import mongoose, { Schema, } from 'mongoose';


const UpdateEmailSchema = new Schema({
    prompt: { 
      type: String, required: true 
    },
    
    generatedEmail: { 
      type: String,
      required: true
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
      required: true
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

EmailSchema.index({ userId: 1, createdAt: -1 });

export const Email = mongoose.model('Email', EmailSchema);