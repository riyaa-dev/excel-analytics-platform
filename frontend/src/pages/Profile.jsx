// Profile.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../features/axiosInstance';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate(); // Added missing navigate hook
  const dispatch = useDispatch();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    profilePicture: user?.profilePicture || '',
    bio: '',
    location: '',
    occupation: '',
    joinedDate: user?.createdAt || new Date().toISOString(),
  });

  const [stats, setStats] = useState({
    totalCharts: 0,
    chartsThisMonth: 0,
    totalUploads: 0,
    uploadsThisMonth: 0,
    totalDownloads: 0,
    downloadsThisMonth: 0,
    favoriteChartType: 'bar',
    lastActivity: new Date().toISOString(),
  });

  const [isEditing, setIsEditing] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  // Fetch profile data and statistics
  useEffect(() => {
    fetchProfileData();
    fetchUserStats();
  }, []);

  const fetchProfileData = async () => {
    try {
      const res = await axiosInstance.get('/user/profile');
      setProfileData(prev => ({ ...prev, ...res.data }));
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const [chartsRes, uploadsRes] = await Promise.all([
        axiosInstance.get('/chart/stats'),
        axiosInstance.get('/upload/stats')
      ]);

      setStats({
        totalCharts: chartsRes.data.total || 0,
        chartsThisMonth: chartsRes.data.thisMonth || 0,
        totalUploads: uploadsRes.data.total || 0,
        uploadsThisMonth: uploadsRes.data.thisMonth || 0,
        totalDownloads: uploadsRes.data.downloads || 0,
        downloadsThisMonth: uploadsRes.data.downloadsThisMonth || 0,
        favoriteChartType: chartsRes.data.favoriteType || 'bar',
        lastActivity: chartsRes.data.lastActivity || new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      const previewURL = URL.createObjectURL(file);
      setProfileData(prev => ({ ...prev, profilePicture: previewURL }));
    }
  };

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();
      
      Object.keys(profileData).forEach(key => {
        if (key !== 'profilePicture') {
          formData.append(key, profileData[key]);
        }
      });

      if (profilePicFile) {
        formData.append('profilePicture', profilePicFile);
      }

      const res = await axiosInstance.put('/user/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setIsEditing(false);
      setAlert({
        show: true,
        message: '✅ Profile updated successfully!',
        type: 'success'
      });
      setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setAlert({
        show: true,
        message: '❌ Failed to update profile. Please try again.',
        type: 'error'
      });
      setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleLogout = () => {
    // Add logout logic here if needed
    navigate('/');
  };

  return (
    <div className="bg-slate-950 text-white min-h-screen relative overflow-hidden">
      {/* Alert Notification */}
      {alert.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`p-4 rounded-xl border backdrop-blur-sm shadow-2xl max-w-sm ${
            alert.type === 'success' 
              ? 'bg-green-500/10 border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                alert.type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                <span className="text-lg">
                  {alert.type === 'success' ? '✅' : '❌'}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium">{alert.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold">E</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ExcelVision
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ← Back to Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-slate-300 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Profile Picture Section */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 p-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 flex items-center justify-center">
                  {profileData.profilePicture ? (
                    <img 
                      src={profileData.profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-white">
                      {getInitials(profileData.name)}
                    </span>
                  )}
                </div>
              </div>
              
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-purple-500 hover:bg-purple-600 rounded-full p-2 cursor-pointer transition-colors">
                  <span className="text-white">📷</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleProfilePicChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    className="text-3xl font-bold bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-2 text-white w-full max-w-md focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                    placeholder="Your Name"
                  />
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    className="text-lg bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-2 text-slate-300 w-full max-w-md focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                    placeholder="Your Email"
                  />
                  <input
                    type="text"
                    name="occupation"
                    value={profileData.occupation}
                    onChange={handleInputChange}
                    className="text-lg bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-2 text-purple-300 w-full max-w-md focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                    placeholder="Your Occupation"
                  />
                  <input
                    type="text"
                    name="location"
                    value={profileData.location}
                    onChange={handleInputChange}
                    className="text-lg bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-2 text-slate-400 w-full max-w-md focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                    placeholder="Your Location"
                  />
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    rows="3"
                    className="bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-2 text-slate-300 w-full max-w-md resize-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {profileData.name}
                  </h2>
                  <p className="text-lg text-slate-300 mb-2">{profileData.email}</p>
                  {profileData.occupation && (
                    <p className="text-lg text-purple-300 mb-2">📋 {profileData.occupation}</p>
                  )}
                  {profileData.location && (
                    <p className="text-lg text-slate-400 mb-4">📍 {profileData.location}</p>
                  )}
                  {profileData.bio && (
                    <p className="text-slate-300 mb-4">{profileData.bio}</p>
                  )}
                  <p className="text-sm text-slate-500">
                    👤 Member since {formatDate(profileData.joinedDate)}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    💾 Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    ❌ Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  ✏️ Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/30 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{loading ? '...' : stats.totalCharts}</p>
                <p className="text-slate-400">Total Charts</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/30 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">📈</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{loading ? '...' : stats.chartsThisMonth}</p>
                <p className="text-slate-400">Charts This Month</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/30 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">📁</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{loading ? '...' : stats.totalUploads}</p>
                <p className="text-slate-400">Total Uploads</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/30 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">⭐</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white capitalize">{loading ? '...' : stats.favoriteChartType}</p>
                <p className="text-slate-400">Favorite Chart</p>
              </div>
            </div>
          </div>
        </div>

        {/* This Month Statistics & Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-bold text-white mb-4">📈 This Month Activity</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Charts Created:</span>
                <span className="text-white font-medium">{stats.chartsThisMonth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Files Uploaded:</span>
                <span className="text-white font-medium">{stats.uploadsThisMonth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Downloads:</span>
                <span className="text-white font-medium">{stats.downloadsThisMonth}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-bold text-white mb-4">🏆 Achievements</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✅</span>
                <span className="text-slate-300">First Chart Created</span>
              </div>
              {stats.totalCharts >= 10 && (
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">🏅</span>
                  <span className="text-slate-300">Chart Master (10+ Charts)</span>
                </div>
              )}
              {stats.totalUploads >= 5 && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">📊</span>
                  <span className="text-slate-300">Data Analyst (5+ Uploads)</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-bold text-white mb-4">⚙️ Quick Actions</h3>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-full text-left p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span>📊</span>
                    <span className="text-white group-hover:text-purple-300">Go to Dashboard</span>
                  </div>
                  <span className="text-slate-400 group-hover:text-purple-300">→</span>
                </div>
              </button>
              <button className="w-full text-left p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span>🔒</span>
                    <span className="text-white group-hover:text-purple-300">Change Password</span>
                  </div>
                  <span className="text-slate-400 group-hover:text-purple-300">→</span>
                </div>
              </button>
              <button className="w-full text-left p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span>🔔</span>
                    <span className="text-white group-hover:text-purple-300">Notification Settings</span>
                  </div>
                  <span className="text-slate-400 group-hover:text-purple-300">→</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-xl">⏰</span>
            </div>
            <h3 className="text-xl font-bold text-white">Recent Activity</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-700/50 transition-colors">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-white font-medium">Created {stats.chartsThisMonth} charts this month</p>
                <p className="text-slate-400 text-sm">Last activity: {formatDate(stats.lastActivity)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-700/50 transition-colors">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-white font-medium">Uploaded {stats.uploadsThisMonth} files this month</p>
                <p className="text-slate-400 text-sm">Keep up the great work!</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-700/50 transition-colors">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-white font-medium">Favorite chart type: {stats.favoriteChartType} charts</p>
                <p className="text-slate-400 text-sm">Most used visualization style</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animation for alert */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Profile;
