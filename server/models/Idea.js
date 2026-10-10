import mongoose from 'mongoose'

const validationReportSchema = new mongoose.Schema(
  {
    overallScore:      { type: Number, required: true, min: 0, max: 100 },
    problemClarity:    { type: Number, required: true, min: 0, max: 100 },
    targetAudienceFit: { type: Number, required: true, min: 0, max: 100 },
    marketPotential:   { type: Number, required: true, min: 0, max: 100 },
    strengths:  { type: [String], default: [] },
    risks:      { type: [String], default: [] },
    nextSteps:  { type: [String], default: [] },
    summary:    { type: String, required: true, trim: true },
    generatedAt: { type: Date, required: true },
  },
  { _id: false }
)

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
    // Populated by POST /api/ideas/:id/validate — absent on draft ideas
    validationReport: {
      type: validationReportSchema,
      default: undefined,
    },
  },
  { timestamps: true }
)

export default mongoose.model('Idea', ideaSchema)
