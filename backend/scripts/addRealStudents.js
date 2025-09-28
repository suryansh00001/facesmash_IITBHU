const mongoose = require('mongoose');
const Student = require('../models/Student');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config();

/**
 * Script to add real student data to the database
 * 
 * Usage:
 * 1. Create a CSV file with columns: rollNumber,imageUrl,gender,instagramId
 * 2. Run: node scripts/addRealStudents.js path/to/your/students.csv
 * 
 * CSV Format Example:
 * rollNumber,imageUrl,gender,instagramId
 * CS21001,https://example.com/student1.jpg,male,john_doe
 * CS21002,https://example.com/student2.jpg,female,jane_smith
 * CS21003,https://example.com/student3.jpg,male,
 */

const addStudentsFromCSV = async (filePath) => {
  try {
    console.log('🚀 Starting real student data import...');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('❌ CSV file not found:', filePath);
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const students = [];
    const errors = [];

    // Read CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          // Validate required fields
          if (!row.rollNumber || !row.imageUrl || !row.gender) {
            errors.push(`Row ${students.length + 1}: Missing required fields (rollNumber, imageUrl, gender)`);
            return;
          }

          // Validate gender
          if (!['male', 'female', 'other'].includes(row.gender.toLowerCase())) {
            errors.push(`Row ${students.length + 1}: Invalid gender "${row.gender}". Must be male, female, or other`);
            return;
          }

          // Clean and validate data
          const studentData = {
            rollNumber: row.rollNumber.trim(),
            imageUrl: row.imageUrl.trim(),
            gender: row.gender.toLowerCase().trim(),
            instagramId: row.instagramId && row.instagramId.trim() ? row.instagramId.trim() : null
          };

          students.push(studentData);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`📄 Read ${students.length} student records from CSV`);

    if (errors.length > 0) {
      console.log('⚠️  Validation errors found:');
      errors.forEach(error => console.log(`   ${error}`));
      
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const continueAnyway = await new Promise((resolve) => {
        rl.question('Continue with valid records? (y/N): ', (answer) => {
          rl.close();
          resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
      });

      if (!continueAnyway) {
        console.log('❌ Import cancelled');
        process.exit(1);
      }
    }

    // Insert students
    let insertedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const [index, studentData] of students.entries()) {
      try {
        // Check if student already exists
        const existingStudent = await Student.findOne({ rollNumber: studentData.rollNumber });
        if (existingStudent) {
          console.log(`⏭️  Row ${index + 1}: Skipping ${studentData.rollNumber} - already exists`);
          skippedCount++;
          continue;
        }

        const student = new Student(studentData);
        await student.save();
        console.log(`✅ Row ${index + 1}: Added ${studentData.rollNumber} (${studentData.gender})`);
        insertedCount++;
      } catch (error) {
        console.error(`❌ Row ${index + 1}: Error adding ${studentData.rollNumber}:`, error.message);
        errorCount++;
      }
    }

    // Display results
    console.log('\n📊 Import Results:');
    console.log(`   ✅ Successfully added: ${insertedCount} students`);
    console.log(`   ⏭️  Skipped (already exist): ${skippedCount} students`);
    console.log(`   ❌ Errors: ${errorCount} students`);
    
    const totalStudents = await Student.countDocuments();
    const maleCount = await Student.countDocuments({ gender: 'male' });
    const femaleCount = await Student.countDocuments({ gender: 'female' });
    const otherCount = await Student.countDocuments({ gender: 'other' });
    
    console.log(`\n👥 Updated Database Stats:`);
    console.log(`   Total students: ${totalStudents}`);
    console.log(`   Male: ${maleCount}`);
    console.log(`   Female: ${femaleCount}`);
    console.log(`   Other: ${otherCount}`);

    console.log('\n🎉 Real student data import completed!');

  } catch (error) {
    console.error('❌ Error during import:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Handle script execution
if (require.main === module) {
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.log('📋 Usage: node scripts/addRealStudents.js <path-to-csv-file>');
    console.log('\n📝 CSV Format:');
    console.log('rollNumber,imageUrl,gender,instagramId');
    console.log('CS21001,https://example.com/student1.jpg,male,john_doe');
    console.log('CS21002,https://example.com/student2.jpg,female,jane_smith');
    console.log('CS21003,https://example.com/student3.jpg,male,');
    console.log('\n💡 Tips:');
    console.log('   - rollNumber, imageUrl, and gender are required');
    console.log('   - instagramId is optional (leave empty for no Instagram)');
    console.log('   - gender must be: male, female, or other');
    console.log('   - imageUrl should be a valid HTTP/HTTPS URL to an image');
    process.exit(1);
  }

  addStudentsFromCSV(filePath);
}

module.exports = { addStudentsFromCSV };