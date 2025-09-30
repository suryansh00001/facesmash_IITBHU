import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Prism from './components/Prism';
import './index.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGender, setSelectedGender] = useState('all');
  const [voting, setVoting] = useState(false);
  const [votedStudentId, setVotedStudentId] = useState(null);
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(false);

  // Fetch random students
  const fetchRandomStudents = async (gender = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (gender !== 'all') {
        params.append('gender', gender);
      }
      params.append('count', '2');

      const response = await axios.get(`${API_BASE_URL}/students/random?${params}`);
      
      if (response.data.success && response.data.students.length >= 2) {
        setStudents(response.data.students);
      } else {
        setError(response.data.message || 'Not enough students found for comparison');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.message || 'Failed to fetch students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/students/stats`);
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Vote for a student
  const handleVote = async (studentId) => {
    if (voting) return;
    
    try {
      setVoting(true);
      setVotedStudentId(studentId);
      
      const response = await axios.post(`${API_BASE_URL}/students/vote`, {
        studentId: studentId
      });
      
      if (response.data.success) {
        // Show voting animation for a brief moment
        setTimeout(() => {
          fetchRandomStudents(selectedGender);
          setVotedStudentId(null);
          setVoting(false);
        }, 1000);
      } else {
        throw new Error(response.data.message || 'Vote failed');
      }
    } catch (err) {
      console.error('Error voting:', err);
      setError(err.response?.data?.message || 'Failed to record vote. Please try again.');
      setVoting(false);
      setVotedStudentId(null);
    }
  };

  // Handle gender filter change
  const handleGenderFilter = (gender) => {
    setSelectedGender(gender);
    fetchRandomStudents(gender);
  };

  // Load next round
  const loadNextRound = () => {
    fetchRandomStudents(selectedGender);
  };

  // Toggle stats
  const toggleStats = () => {
    if (!showStats) {
      fetchStats();
    }
    setShowStats(!showStats);
  };

  // Load initial data
  useEffect(() => {
    fetchRandomStudents();
    fetchStats();
  }, []);

  if (loading && students.length === 0) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading amazing students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg flex flex-col" style={{ position: 'relative' }}>
      {/* Black Ultimate Background */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100vh', 
        backgroundColor: 'black',
        zIndex: -20,
        pointerEvents: 'none'
      }} />
      
      {/* Prism Background */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100vh', 
        zIndex: -10,
        pointerEvents: 'none'
      }}>
        <Prism
          animationType="3drotate"
          timeScale={0.5}
          height={3.5}
          baseWidth={5.5}
          scale={3.0}
          hueShift={0}
          colorFrequency={1}
          noise={0.3}
          glow={0.7}
          transparent={true}
        />
      </div>
      
      {/* Header */}
      <header className="glass-effect border-white/20 px-4 sm:px-8 py-4 text-center">
        <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 text-shadow animate-fade-in">
          🎓 Facesmash
        </h1>
        <p className="text-white/80 text-base sm:text-lg animate-slide-up">
          Choose the more attractive student - College Edition
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-8 py-8 flex flex-col items-center">
        {/* Gender Filter */}
        <div className="mb-8 flex flex-wrap gap-2 justify-center animate-scale-in">
          {[
            { value: 'all', label: 'All Students', icon: '👥' },
            { value: 'male', label: 'Male', icon: '👨' },
            { value: 'female', label: 'Female', icon: '👩' }
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => handleGenderFilter(filter.value)}
              className={`glass-button ${
                selectedGender === filter.value ? 'glass-button-active' : ''
              }`}
            >
              <span className="mr-2">{filter.icon}</span>
              {filter.label}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-danger-500/20 border border-danger-500/50 text-danger-100 px-6 py-4 rounded-xl text-center max-w-md animate-fade-in">
            <p className="font-medium">{error}</p>
            <button
              onClick={() => fetchRandomStudents(selectedGender)}
              className="mt-3 px-4 py-2 bg-danger-600 hover:bg-danger-700 text-white rounded-lg transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Main Comparison Container */}
        {!error && students.length >= 2 && (
          <div className="glass-effect rounded-3xl p-4 sm:p-8 max-w-6xl w-full animate-scale-in">
            {/* Vote Instruction */}
            <p className="text-center text-white/90 text-lg mb-8 animate-fade-in">
              Click on the student you find more attractive
            </p>

            {/* Students Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center mb-8">
              {/* First Student */}
              <div
                onClick={() => handleVote(students[0]._id)}
                className={`student-card ${
                  votedStudentId === students[0]._id ? 'student-card-voting' : ''
                } ${voting ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="relative overflow-hidden rounded-xl mb-4">
                  <img
                    src={students[0].imageUrl}
                    alt={`Student ${students[0].rollNumber}`}
                    className="w-48 sm:w-56 h-64 sm:h-72 object-cover mx-auto transition-all duration-300 hover:scale-105"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=400&fit=crop&crop=face';
                    }}
                  />
                  {votedStudentId === students[0]._id && (
                    <div className="absolute inset-0 bg-success-500/30 flex items-center justify-center">
                      <div className="bg-success-500 text-white px-4 py-2 rounded-full font-bold animate-bounce">
                        ✓ Voted!
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <h3 className="text-white text-xl font-semibold mb-2">
                    {students[0].rollNumber}
                  </h3>
                  <p className="text-white/70 mb-2 capitalize">
                    {students[0].gender}
                  </p>
                  {students[0].instagramId && (
                    <a
                      href={`https://instagram.com/${students[0].instagramId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="instagram-link inline-flex items-center text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      📷 @{students[0].instagramId}
                    </a>
                  )}
                  <div className="inline-block bg-success-500/30 text-success-300 px-4 py-2 rounded-full font-semibold mt-3 border border-success-500/50">
                    ❤️ {students[0].upvotes} votes
                  </div>
                </div>
              </div>

              {/* VS Divider */}
              <div className="flex justify-center lg:order-none order-first">
                <div className="glass-effect w-16 h-16 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold text-shadow">VS</span>
                </div>
              </div>

              {/* Second Student */}
              <div
                onClick={() => handleVote(students[1]._id)}
                className={`student-card ${
                  votedStudentId === students[1]._id ? 'student-card-voting' : ''
                } ${voting ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="relative overflow-hidden rounded-xl mb-4">
                  <img
                    src={students[1].imageUrl}
                    alt={`Student ${students[1].rollNumber}`}
                    className="w-48 sm:w-56 h-64 sm:h-72 object-cover mx-auto transition-all duration-300 hover:scale-105"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1494790108755-2616b612b17c?w=300&h=400&fit=crop&crop=face';
                    }}
                  />
                  {votedStudentId === students[1]._id && (
                    <div className="absolute inset-0 bg-success-500/30 flex items-center justify-center">
                      <div className="bg-success-500 text-white px-4 py-2 rounded-full font-bold animate-bounce">
                        ✓ Voted!
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <h3 className="text-white text-xl font-semibold mb-2">
                    {students[1].rollNumber}
                  </h3>
                  <p className="text-white/70 mb-2 capitalize">
                    {students[1].gender}
                  </p>
                  {students[1].instagramId && (
                    <a
                      href={`https://instagram.com/${students[1].instagramId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="instagram-link inline-flex items-center text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      📷 @{students[1].instagramId}
                    </a>
                  )}
                  <div className="inline-block bg-success-500/30 text-success-300 px-4 py-2 rounded-full font-semibold mt-3 border border-success-500/50">
                    ❤️ {students[1].upvotes} votes
                  </div>
                </div>
              </div>
            </div>

            {/* Next Round Button */}
            <div className="text-center">
              <button
                onClick={loadNextRound}
                disabled={voting}
                className={`px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 ${
                  voting
                    ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-1'
                }`}
              >
                {voting ? 'Recording Vote...' : '🎲 Next Round'}
              </button>
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-8 w-full max-w-4xl">
          <button
            onClick={toggleStats}
            className="glass-button mx-auto block mb-4"
          >
            {showStats ? '📊 Hide Statistics' : '📊 Show Statistics'}
          </button>

          {showStats && stats && (
            <div className="glass-effect rounded-2xl p-6 animate-slide-up">
              <h3 className="text-white text-2xl font-bold text-center mb-6">
                📈 Statistics
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="glass-effect rounded-xl p-4 text-center">
                  <div className="text-success-400 text-2xl font-bold">
                    {stats.totalStudents}
                  </div>
                  <div className="text-white/70 text-sm">Total Students</div>
                </div>
                
                <div className="glass-effect rounded-xl p-4 text-center">
                  <div className="text-primary-400 text-2xl font-bold">
                    {stats.genderDistribution.male}
                  </div>
                  <div className="text-white/70 text-sm">Male Students</div>
                </div>
                
                <div className="glass-effect rounded-xl p-4 text-center">
                  <div className="text-secondary-400 text-2xl font-bold">
                    {stats.genderDistribution.female}
                  </div>
                  <div className="text-white/70 text-sm">Female Students</div>
                </div>
                
                <div className="glass-effect rounded-xl p-4 text-center">
                  <div className="text-yellow-400 text-2xl font-bold">
                    {stats.totalVotes}
                  </div>
                  <div className="text-white/70 text-sm">Total Votes</div>
                </div>
              </div>

              {/* Top Voted Students */}
              {stats.topVoted && stats.topVoted.length > 0 && (
                <div>
                  <h4 className="text-white text-lg font-semibold mb-4 text-center">
                    🏆 Most Popular Students
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {stats.topVoted.slice(0, 6).map((student, index) => (
                      <div key={student._id} className="glass-effect rounded-lg p-3 flex items-center space-x-3">
                        <div className="text-2xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{student.rollNumber}</div>
                          <div className="text-white/60 text-sm capitalize">{student.gender}</div>
                        </div>
                        <div className="text-success-400 font-bold">
                          {student.upvotes} ❤️
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="glass-effect border-t border-white/20 px-4 py-4 text-center">
        <p className="text-white/60 text-sm">
          Made with ❤️ for college students • Please vote responsibly
        </p>
      </footer>
    </div>
  );
}

export default App;