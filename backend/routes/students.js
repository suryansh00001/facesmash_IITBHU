const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// GET /api/students/random - Get random students for comparison
router.get('/random', async (req, res) => {
  try {
    const { gender, count = 2 } = req.query;
    
    // Validate count parameter
    const studentCount = Math.min(Math.max(parseInt(count) || 2, 1), 10);
    
    const students = await Student.getRandomStudents(studentCount, gender);
    
    if (students.length < 2) {
      return res.status(404).json({ 
        error: 'Not enough students found', 
        message: `Only ${students.length} student(s) available${gender ? ` for gender: ${gender}` : ''}` 
      });
    }
    
    res.json({
      success: true,
      students: students,
      filter: gender || 'all'
    });
  } catch (error) {
    console.error('Error fetching random students:', error);
    res.status(500).json({ 
      error: 'Failed to fetch students', 
      message: error.message 
    });
  }
});

// POST /api/students/vote - Vote for a student
router.post('/vote', async (req, res) => {
  try {
    const { studentId } = req.body;
    
    if (!studentId) {
      return res.status(400).json({ 
        error: 'Student ID is required',
        message: 'Please provide a valid student ID to vote for'
      });
    }
    
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({ 
        error: 'Student not found',
        message: 'The specified student does not exist'
      });
    }
    
    if (!student.isActive) {
      return res.status(400).json({ 
        error: 'Student is inactive',
        message: 'Cannot vote for inactive students'
      });
    }
    
    await student.vote();
    
    res.json({
      success: true,
      message: 'Vote recorded successfully',
      student: {
        id: student._id,
        rollNumber: student.rollNumber,
        upvotes: student.upvotes
      }
    });
  } catch (error) {
    console.error('Error recording vote:', error);
    res.status(500).json({ 
      error: 'Failed to record vote', 
      message: error.message 
    });
  }
});

// GET /api/students - Get all students (with pagination and filtering)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      gender, 
      sortBy = 'upvotes', 
      sortOrder = 'desc',
      search 
    } = req.query;
    
    // Build query
    const query = { isActive: true };
    if (gender && ['male', 'female', 'other'].includes(gender.toLowerCase())) {
      query.gender = gender.toLowerCase();
    }
    if (search) {
      query.rollNumber = { $regex: search, $options: 'i' };
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(Math.max(1, parseInt(limit)), 100);
    const skip = (pageNum - 1) * limitNum;
    
    const students = await Student.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .select('-__v');
    
    const total = await Student.countDocuments(query);
    
    res.json({
      success: true,
      students,
      pagination: {
        current: pageNum,
        total: Math.ceil(total / limitNum),
        count: students.length,
        totalStudents: total
      },
      filters: {
        gender: gender || 'all',
        search: search || '',
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ 
      error: 'Failed to fetch students', 
      message: error.message 
    });
  }
});

// POST /api/students - Add new student
router.post('/', async (req, res) => {
  try {
    const { rollNumber, imageUrl, gender, instagramId } = req.body;
    
    // Validate required fields
    if (!rollNumber || !imageUrl || !gender) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'rollNumber, imageUrl, and gender are required'
      });
    }
    
    // Check if student already exists
    const existingStudent = await Student.findOne({ rollNumber });
    if (existingStudent) {
      return res.status(409).json({
        error: 'Student already exists',
        message: `Student with roll number ${rollNumber} already exists`
      });
    }
    
    const student = new Student({
      rollNumber: rollNumber.trim(),
      imageUrl: imageUrl.trim(),
      gender: gender.toLowerCase().trim(),
      instagramId: instagramId ? instagramId.trim() : null
    });
    
    await student.save();
    
    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      student: {
        id: student._id,
        rollNumber: student.rollNumber,
        imageUrl: student.imageUrl,
        gender: student.gender,
        instagramId: student.instagramId,
        upvotes: student.upvotes
      }
    });
  } catch (error) {
    console.error('Error adding student:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        error: 'Validation failed',
        message: errors.join(', ')
      });
    }
    
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Duplicate entry',
        message: 'Student with this roll number already exists'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to add student', 
      message: error.message 
    });
  }
});

// GET /api/students/stats - Get statistics
router.get('/stats', async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({ isActive: true });
    const maleCount = await Student.countDocuments({ isActive: true, gender: 'male' });
    const femaleCount = await Student.countDocuments({ isActive: true, gender: 'female' });
    const otherCount = await Student.countDocuments({ isActive: true, gender: 'other' });
    
    const topVoted = await Student.find({ isActive: true })
      .sort({ upvotes: -1 })
      .limit(10)
      .select('rollNumber upvotes gender instagramId');
    
    const totalVotes = await Student.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$upvotes' } } }
    ]);
    
    res.json({
      success: true,
      stats: {
        totalStudents,
        genderDistribution: {
          male: maleCount,
          female: femaleCount,
          other: otherCount
        },
        totalVotes: totalVotes[0]?.total || 0,
        topVoted
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics', 
      message: error.message 
    });
  }
});

// PUT /api/students/:id - Update student (admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.__v;
    delete updates.createdAt;
    delete updates.updatedAt;
    
    const student = await Student.findByIdAndUpdate(
      id, 
      updates, 
      { new: true, runValidators: true }
    );
    
    if (!student) {
      return res.status(404).json({
        error: 'Student not found',
        message: 'The specified student does not exist'
      });
    }
    
    res.json({
      success: true,
      message: 'Student updated successfully',
      student
    });
  } catch (error) {
    console.error('Error updating student:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        error: 'Validation failed',
        message: errors.join(', ')
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to update student', 
      message: error.message 
    });
  }
});

// DELETE /api/students/:id - Soft delete student (set isActive to false)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await Student.findByIdAndUpdate(
      id, 
      { isActive: false }, 
      { new: true }
    );
    
    if (!student) {
      return res.status(404).json({
        error: 'Student not found',
        message: 'The specified student does not exist'
      });
    }
    
    res.json({
      success: true,
      message: 'Student deactivated successfully',
      student: {
        id: student._id,
        rollNumber: student.rollNumber,
        isActive: student.isActive
      }
    });
  } catch (error) {
    console.error('Error deactivating student:', error);
    res.status(500).json({ 
      error: 'Failed to deactivate student', 
      message: error.message 
    });
  }
});

module.exports = router;