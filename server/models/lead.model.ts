import { Schema, model, Document, Types } from 'mongoose';

export interface ILead extends Document {
  contact: Types.ObjectId; // Reference to Contact model
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  expectedValue: number;
  assignedTo?: Types.ObjectId;
  notes?: string;
  lastContact?: Date;
  nextFollowUp?: Date;
  pipelineStage: string;
  customFields?: Record<string, any>;
  blockchainId?: string;
  interactions: {
    type: string;
    date: Date;
    notes: string;
    blockchainId?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    contact: { type: Schema.Types.ObjectId, ref: 'Contact', required: true },
    source: { type: String, required: true },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'],
      default: 'new',
    },
    probability: { type: Number, min: 0, max: 100, default: 0 },
    expectedValue: { type: Number, default: 0 },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },
    lastContact: { type: Date },
    nextFollowUp: { type: Date },
    pipelineStage: { type: String, required: true },
    customFields: { type: Schema.Types.Mixed },
    blockchainId: { type: String },
    interactions: [{
      type: { type: String, required: true },
      date: { type: Date, required: true },
      notes: { type: String, required: true },
      blockchainId: { type: String },
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
leadSchema.index({ contact: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ pipelineStage: 1 });
leadSchema.index({ nextFollowUp: 1 });

export const Lead = model<ILead>('Lead', leadSchema); 