import { Schema, model } from 'mongoose';

export interface IContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  title?: string;
  tags: string[];
  source: string;
  status: 'lead' | 'customer' | 'prospect';
  assignedTo?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  lastInteraction?: Date;
  customFields?: Record<string, any>;
  blockchainId?: string; // For storing blockchain transaction ID
  walletAddress?: string; // For Web3 integration
}

const contactSchema = new Schema<IContact>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    company: { type: String },
    title: { type: String },
    tags: [{ type: String }],
    source: { type: String, required: true },
    status: {
      type: String,
      enum: ['lead', 'customer', 'prospect'],
      default: 'lead',
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },
    customFields: { type: Schema.Types.Mixed },
    blockchainId: { type: String },
    walletAddress: { type: String },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ assignedTo: 1 });
contactSchema.index({ tags: 1 });

export const Contact = model<IContact>('Contact', contactSchema); 