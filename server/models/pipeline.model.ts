import { Schema, model, Document } from 'mongoose';

export interface IPipeline extends Document {
  name: string;
  description?: string;
  stages: {
    name: string;
    order: number;
    description?: string;
    probability: number;
    color?: string;
  }[];
  isDefault: boolean;
  createdBy: Schema.Types.ObjectId;
  updatedBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const pipelineSchema = new Schema<IPipeline>(
  {
    name: { type: String, required: true },
    description: { type: String },
    stages: [{
      name: { type: String, required: true },
      order: { type: Number, required: true },
      description: { type: String },
      probability: { type: Number, min: 0, max: 100, required: true },
      color: { type: String },
    }],
    isDefault: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
pipelineSchema.index({ name: 1 });
pipelineSchema.index({ isDefault: 1 });

// Ensure only one default pipeline exists
pipelineSchema.pre('save', async function(this: IPipeline, next) {
  if (this.isDefault) {
    const PipelineModel = model<IPipeline>('Pipeline');
    await PipelineModel.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

export const Pipeline = model<IPipeline>('Pipeline', pipelineSchema); 