import mongoose from 'mongoose'

const ideaSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title must be 120 characters or fewer'],
    },
    problem: {
      type: String,
      required: [true, 'Problem statement is required'],
      trim: true,
      maxlength: [1000, 'Problem must be 1000 characters or fewer'],
    },
    targetAudience: {
      type: String,
      required: [true, 'Target audience is required'],
      trim: true,
      maxlength: [500, 'Target audience must be 500 characters or fewer'],
    },
    solution: {
      type: String,
      required: [true, 'Solution is required'],
      trim: true,
      maxlength: [1000, 'Solution must be 1000 characters or fewer'],
    },
    status: {
      type: String,
      enum: ['draft', 'validated', 'rejected'],
      default: 'draft',
    },
  },
  { timestamps: true }
)

export default mongoose.model('Idea', ideaSchema)
