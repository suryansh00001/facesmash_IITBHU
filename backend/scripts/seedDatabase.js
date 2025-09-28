const mongoose = require('mongoose');
const Student = require('../models/Student');
require('dotenv').config();

// Sample student data with placeholder images
const sampleStudents = [
  // Male students
  {
    rollNumber: 'CS21001',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=face',
    gender: 'male',
    instagramId: 'john_doe_cs',
    upvotes: 0
  },
  {
    rollNumber: 'CS21002',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=400&fit=crop&crop=face',
    gender: 'male',
    instagramId: 'mike_tech',
    upvotes: 0
  },
  {
    rollNumber: 'EE21001',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=400&fit=crop&crop=face',
    gender: 'male',
    instagramId: null,
    upvotes: 0
  },
  {
    rollNumber: 'ME21001',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=400&fit=crop&crop=face',
    gender: 'male',
    instagramId: 'alex_mech',
    upvotes: 0
  },
  {
    rollNumber: 'CS21003',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=400&fit=crop&crop=face',
    gender: 'male',
    instagramId: 'dev_ryan',
    upvotes: 0
  },

  // Female students
  {
    rollNumber: 'CS21004',
    imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b17c?w=300&h=400&fit=crop&crop=face',
    gender: 'female',
    instagramId: 'emma_codes',
    upvotes: 0
  },
  {
    rollNumber: 'EE21002',
    imageUrl: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=300&h=400&fit=crop&crop=face',
    gender: 'female',
    instagramId: 'sarah_electric',
    upvotes: 0
  },
  {
    rollNumber: 'ME21002',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=400&fit=crop&crop=face',
    gender: 'female',
    instagramId: 'lisa_engineer',
    upvotes: 0
  },
  {
    rollNumber: 'CS21005',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=400&fit=crop&crop=face',
    gender: 'female',
    instagramId: null,
    upvotes: 0
  },
  {
    rollNumber: 'BT21001',
    imageUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&h=400&fit=crop&crop=face',
    gender: 'female',
    instagramId: 'anna_biotech',
    upvotes: 0
  },

  // Additional students for better variety
  {
    rollNumber: 'CS21006',
    imageUrl: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=300&h=400&fit=crop&crop=face',
    gender: 'male',
    instagramId: 'david_developer',
    upvotes: 0
  },
  {
    rollNumber: 'EE21003',
    imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=400&fit=crop&crop=face',
    gender: 'female',
    instagramId: 'rachel_circuits',
    upvotes: 0
  },
  {
    rollNumber: 'ME21003',
    imageUrl: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=300&h=400&fit=crop&crop=face',
    gender: 'male',
    instagramId: 'tom_machines',
    upvotes: 0
  },
  {
    rollNumber: 'CS21007',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop&crop=face',
    gender: 'female',
    instagramId: 'sophia_ai',
    upvotes: 0
  },
  {
    rollNumber: 'BT21002',
    imageUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=300&h=400&fit=crop&crop=face',
    gender: 'male',
    instagramId: 'kevin_bio',
    upvotes: 0
  }
];

const seedDatabase = async () => {
  try {
    console.log('🚀 Starting database seeding process...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing students (optional - comment out if you want to keep existing data)
    const existingCount = await Student.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing students in database`);
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const clearDatabase = await new Promise((resolve) => {
        rl.question('Do you want to clear existing data? (y/N): ', (answer) => {
          rl.close();
          resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
      });

      if (clearDatabase) {
        await Student.deleteMany({});
        console.log('🗑️  Cleared existing student data');
      } else {
        console.log('📝 Keeping existing data, adding new students...');
      }
    }

    // Insert sample students
    let insertedCount = 0;
    let skippedCount = 0;

    for (const studentData of sampleStudents) {
      try {
        // Check if student already exists
        const existingStudent = await Student.findOne({ rollNumber: studentData.rollNumber });
        if (existingStudent) {
          console.log(`⏭️  Skipping ${studentData.rollNumber} - already exists`);
          skippedCount++;
          continue;
        }

        const student = new Student(studentData);
        await student.save();
        console.log(`✅ Added student: ${studentData.rollNumber} (${studentData.gender})`);
        insertedCount++;
      } catch (error) {
        console.error(`❌ Error adding student ${studentData.rollNumber}:`, error.message);
      }
    }

    // Display results
    console.log('\n📊 Seeding Results:');
    console.log(`   ✅ Successfully added: ${insertedCount} students`);
    console.log(`   ⏭️  Skipped (already exist): ${skippedCount} students`);
    
    const totalStudents = await Student.countDocuments();
    const maleCount = await Student.countDocuments({ gender: 'male' });
    const femaleCount = await Student.countDocuments({ gender: 'female' });
    
    console.log(`\n👥 Current Database Stats:`);
    console.log(`   Total students: ${totalStudents}`);
    console.log(`   Male: ${maleCount}`);
    console.log(`   Female: ${femaleCount}`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n💡 Tips:');
    console.log('   - Start the backend server: npm run dev');
    console.log('   - Start the frontend: cd ../frontend && npm start');
    console.log('   - Visit http://localhost:3000 to use the application');

  } catch (error) {
    console.error('❌ Error during database seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Handle script execution
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleStudents };