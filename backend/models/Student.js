const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  imageUrl: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Please provide a valid image URL'
    }
  },
  upvotes: {
    type: Number,
    default: 0,
    min: 0
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other'],
    lowercase: true
  },
  instagramId: {
    type: String,
    trim: true,
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow null/empty values
        return /^[a-zA-Z0-9_.]{1,30}$/.test(v);
      },
      message: 'Instagram ID should contain only letters, numbers, dots, and underscores'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient random queries
studentSchema.index({ isActive: 1, gender: 1 });

// Virtual for formatted Instagram URL
studentSchema.virtual('instagramUrl').get(function() {
  return this.instagramId ? `https://instagram.com/${this.instagramId}` : null;
});

// Static method to get random students
studentSchema.statics.getRandomStudents = async function(count = 2, gender = null) {
  const matchCondition = { isActive: true };
  if (gender && ['male', 'female', 'other'].includes(gender.toLowerCase())) {
    matchCondition.gender = gender.toLowerCase();
  }

  const students = await this.aggregate([
    { $match: matchCondition },
    { $sample: { size: count } }
  ]);

  return students;
};

// Instance method to increment upvotes
studentSchema.methods.vote = async function() {
  this.upvotes += 1;
  return await this.save();
};

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;