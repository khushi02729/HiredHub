const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 120 },
  company: {
    name: { type: String, required: [true, 'Company name is required'], trim: true, index: true },
    logo: String, website: String, size: String,
  },
  location: { type: String, required: [true, 'Location is required'], trim: true, index: true },
  workMode: { type: String, enum: ['Remote', 'Hybrid', 'On-site'], required: true, index: true },
  employmentType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship'], required: true, index: true },
  experienceLevel: { type: String, enum: ['Entry', 'Mid', 'Senior', 'Lead'], required: true, index: true },
  minExperience: { type: Number, min: 0, default: 0 },
  salary: {
    min: { type: Number, min: 0, required: true },
    max: { type: Number, min: 0, required: true },
    currency: { type: String, default: 'INR' },
  },
  category: { type: String, trim: true, index: true },
  description: { type: String, required: [true, 'Description is required'] },
  responsibilities: [String],
  qualifications: [String],
  skills: [{ type: String, trim: true }],
  benefits: [String],
  status: { type: String, enum: ['active', 'closed'], default: 'active', index: true },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
}, { timestamps: true });

jobSchema.pre('validate', function (next) {
  if (this.salary && this.salary.min > this.salary.max) return next(new Error('Minimum salary cannot exceed maximum'));
  next();
});

jobSchema.index({ title: 'text', 'company.name': 'text', skills: 'text', description: 'text' });
jobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
