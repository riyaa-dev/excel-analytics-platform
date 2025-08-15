import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../features/axiosInstance';
import ChartRenderer from '../components/ChartRenderer';
import { useNavigate } from 'react-router-dom';

// Alert Component
const AlertNotification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className={`p-4 rounded-xl border backdrop-blur-sm shadow-2xl max-w-sm ${
        type === 'success' 
          ? 'bg-green-500/10 border-green-500/20 text-green-400' 
          : 'bg-red-500/10 border-red-500/20 text-red-400'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}>
            <span className="text-lg">
              {type === 'success' ? '✅' : '❌'}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-medium">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors ml-2"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

// Saved Chart Card Component
const SavedChartCard = ({ chart, onDelete, onView }) => {
  const getChartIcon = (type) => {
    switch(type) {
      case 'bar': return '📊';
      case 'line': return '📈';
      case 'pie': return '🥧';
      default: return '📊';
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-lg">{getChartIcon(chart.chartType)}</span>
          </div>
          <div>
            <h4 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
              {chart.chartType.charAt(0).toUpperCase() + chart.chartType.slice(1)} Chart
            </h4>
            <p className="text-sm text-slate-400">
              {chart.xAxis} vs {chart.yAxis}
            </p>
          </div>
        </div>
        <button
          onClick={() => onDelete(chart._id)}
          className="text-slate-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
        >
          🗑️
        </button>
      </div>
      
      <div className="bg-white/5 rounded-lg p-4 mb-4 h-32">
        <ChartRenderer
          chartType={chart.chartType}
          chartData={{
            labels: chart.data?.map(item => item.x) || [],
            datasets: [{
              label: `${chart.yAxis} vs ${chart.xAxis}`,
              data: chart.data?.map(item => item.y) || [],
              backgroundColor: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'],
              borderColor: '#8b5cf6',
              borderWidth: 2,
            }],
          }}
        />
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => onView(chart)}
          className="flex-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300"
        >
          👁️ View Chart
        </button>
        <button
          onClick={() => {/* Add export functionality */}}
          className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300"
        >
          📤
        </button>
      </div>
      
      <div className="mt-3 text-xs text-slate-500">
        Saved: {new Date(chart.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // State
  const [file, setFile] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [message, setMessage] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [chartType, setChartType] = useState('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [savedCharts, setSavedCharts] = useState([]);
  const [showSavedCharts, setShowSavedCharts] = useState(false);
  const [viewingChart, setViewingChart] = useState(null);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'collection'
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // API Functions
  const fetchHistory = async () => {
    try {
      const res = await axiosInstance.get('/upload/history');
      setHistory(res.data || []);
    } catch (err) {
      console.error('Error fetching history:', err);
      setHistory([]);
    }
  };

  const fetchSavedCharts = async () => {
    try {
      const res = await axiosInstance.get('/chart/collection');
      setSavedCharts(res.data || []);
    } catch (err) {
      console.error('Error fetching charts:', err);
      setSavedCharts([]);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchSavedCharts();
  }, []);

  // Event Handlers
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axiosInstance.post('/upload', formData);
      setParsedData(res.data.upload.data || []);
      fetchHistory();
      setFile(null);
      setMessage('Upload successful!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Upload failed.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSaveChart = async () => {
    if (!xAxis || !yAxis || parsedData.length === 0) return;

    try {
      await axiosInstance.post("/chart/save", {
        xAxis,
        yAxis,
        chartType,
        data: parsedData.map(row => ({
          x: row[xAxis],
          y: row[yAxis],
        }))
      });

      fetchSavedCharts();
      setAlert({
        show: true,
        message: `🎉 Chart saved successfully! Your ${chartType} chart has been added to your collection.`,
        type: 'success'
      });
    } catch (err) {
      setAlert({
        show: true,
        message: '❌ Failed to save chart. Please try again.',
        type: 'error'
      });
    }
  };

  const handleDeleteChart = async (chartId) => {
    if (!window.confirm('Are you sure you want to delete this chart?')) return;

    try {
      await axiosInstance.delete(`/chart/${chartId}`);
      fetchSavedCharts();
      setAlert({
        show: true,
        message: '🗑️ Chart deleted successfully!',
        type: 'success'
      });
    } catch (err) {
      setAlert({
        show: true,
        message: '❌ Failed to delete chart.',
        type: 'error'
      });
    }
  };

  const handleViewChart = (chart) => {
    setViewingChart(chart);
  };

  const closeAlert = () => {
    setAlert({ show: false, message: '', type: '' });
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="bg-slate-950 text-white min-h-screen relative overflow-hidden">
      {/* Alert Notification */}
      {alert.show && (
        <AlertNotification
          message={alert.message}
          type={alert.type}
          onClose={closeAlert}
        />
      )}

      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-slate-950/90 backdrop-blur-md shadow-2xl' : 'bg-slate-950/90 backdrop-blur-md'
      } border-b border-slate-800`}>
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
            <div className="text-slate-300">
              Welcome, <span className="text-purple-400 font-semibold">{user?.name || 'User'}</span>
            </div>
            
            {/* Profile Button */}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-slate-300 hover:text-white"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              Profile
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Analytics Dashboard
            </span>
          </h2>
          <p className="text-xl text-slate-300">
            Upload your Excel files and transform them into beautiful insights
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-2 border border-slate-700/50">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'upload'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📊 Analytics Workspace
            </button>
            <button
              onClick={() => setActiveTab('collection')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'collection'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              💾 My Collection ({savedCharts.length})
            </button>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${
            message.includes('successful') || message.includes('saved') 
              ? 'bg-green-500/10 border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            <p className="text-center font-medium">{message}</p>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'upload' ? (
          // Original Analytics Workspace
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Panel - Upload & History */}
            <div className="lg:col-span-1 space-y-6">
              {/* Upload Section */}
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <span className="text-xl">📄</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Upload Excel File</h3>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="w-full text-sm text-slate-300 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-purple-500 file:text-white hover:file:bg-purple-600 file:transition-colors cursor-pointer"
                      accept=".xlsx,.xls,.csv"
                    />
                  </div>
                  
                  <button
                    onClick={handleUpload}
                    disabled={!file}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {file ? `Upload ${file.name}` : 'Select a file to upload'}
                  </button>
                </div>
              </div>

              {/* History Section */}
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <span className="text-xl">📊</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">Upload History</h3>
                  </div>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium"
                  >
                    {showHistory ? 'Hide' : 'Show'}
                  </button>
                </div>

                {showHistory && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {history.length > 0 ? (
                      history.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors">
                          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-purple-400 text-sm">📁</span>
                          </div>
                          <span className="text-slate-300 text-sm truncate">{item.originalName}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-center py-4">No uploads yet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Chart Configuration & Display */}
            <div className="lg:col-span-2">
              {parsedData.length > 0 ? (
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <span className="text-xl">📈</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">Data Visualization</h3>
                  </div>

                  {/* Chart Configuration */}
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Chart Type</label>
                      <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 text-white"
                      >
                        <option value="bar">📊 Bar Chart</option>
                        <option value="line">📈 Line Chart</option>
                        <option value="pie">🥧 Pie Chart</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">X-Axis</label>
                      <select
                        value={xAxis}
                        onChange={(e) => setXAxis(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 text-white"
                      >
                        <option value="">Select X-Axis</option>
                        {Object.keys(parsedData[0] || {}).map((key) => (
                          <option key={key} value={key}>{key}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Y-Axis</label>
                      <select
                        value={yAxis}
                        onChange={(e) => setYAxis(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 text-white"
                      >
                        <option value="">Select Y-Axis</option>
                        {Object.keys(parsedData[0] || {}).map((key) => (
                          <option key={key} value={key}>{key}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Chart Display */}
                  {xAxis && yAxis && (
                    <div className="space-y-4">
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-slate-600/30">
                        <ChartRenderer
                          chartType={chartType}
                          chartData={{
                            labels: parsedData.map((row) => row[xAxis]),
                            datasets: [{
                              label: `${yAxis} vs ${xAxis}`,
                              data: parsedData.map((row) => row[yAxis]),
                              backgroundColor: [
                                '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'
                              ],
                              borderColor: '#8b5cf6',
                              borderWidth: 2,
                            }],
                          }}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 justify-center">
                        <button
                          onClick={handleSaveChart}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02]"
                        >
                          💾 Save Chart
                        </button>
                        <button
                          onClick={() => {/* Add export functionality */}}
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-[1.02]"
                        >
                          📤 Export Chart
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-12 border border-slate-700/50 text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">📊</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Ready for Your Data</h3>
                  <p className="text-slate-400 text-lg">
                    Upload an Excel file to start creating beautiful visualizations and insights from your data.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Saved Charts Collection
          <div className="space-y-6">
            {viewingChart ? (
              // Chart Viewer
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <span className="text-xl">📈</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {viewingChart.chartType.charAt(0).toUpperCase() + viewingChart.chartType.slice(1)} Chart
                      </h3>
                      <p className="text-slate-400">{viewingChart.xAxis} vs {viewingChart.yAxis}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewingChart(null)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    ← Back to Collection
                  </button>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-slate-600/30">
                  <ChartRenderer
                    chartType={viewingChart.chartType}
                    chartData={{
                      labels: viewingChart.data.map((item) => item.x),
                      datasets: [{
                        label: `${viewingChart.yAxis} vs ${viewingChart.xAxis}`,
                        data: viewingChart.data.map((item) => item.y),
                        backgroundColor: [
                          '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'
                        ],
                        borderColor: '#8b5cf6',
                        borderWidth: 2,
                      }],
                    }}
                  />
                </div>

                <div className="flex gap-4 justify-center mt-6">
                  <button
                    onClick={() => handleDeleteChart(viewingChart._id)}
                    className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    🗑️ Delete Chart
                  </button>
                  <button
                    onClick={() => {/* Add export functionality */}}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    📤 Export Chart
                  </button>
                </div>
              </div>
            ) : (
              // Charts Grid
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">
                    My Chart Collection
                  </h3>
                  <div className="text-slate-400">
                    {savedCharts.length} chart{savedCharts.length !== 1 ? 's' : ''} saved
                  </div>
                </div>

                {savedCharts.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedCharts.map((chart) => (
                      <SavedChartCard
                        key={chart._id}
                        chart={chart}
                        onDelete={handleDeleteChart}
                        onView={handleViewChart}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-12 border border-slate-700/50 text-center">
                    <div className="w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-4xl">💾</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">No Saved Charts Yet</h3>
                    <p className="text-slate-400 text-lg mb-6">
                      Start creating and saving charts from your Excel data to build your collection.
                    </p>
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      📊 Create Your First Chart
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add the CSS animation for the alert */}
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

export default Dashboard;
