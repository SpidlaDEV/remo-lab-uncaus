import React, { useState, useEffect } from 'react';
import { Beaker, Search, Filter, Play, Clock, Thermometer, Gauge, Droplets, AlertTriangle, BarChart3, User, Lock, ChevronRight, Activity } from 'lucide-react';

const RemoteLaboratoryPlatform = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [institutionFilter, setInstitutionFilter] = useState('');
  
  // Lab experiment state
  const [isExperimentRunning, setIsExperimentRunning] = useState(false);
  const [experimentTime, setExperimentTime] = useState(0);
  const [motorRPM, setMotorRPM] = useState(150);
  const [currentTemp, setCurrentTemp] = useState(25);
  const [setTemp, setSetTemp] = useState(80);
  const [liquidLevel, setLiquidLevel] = useState(45);
  const [conductivity, setConductivity] = useState(1.2);
  const [container1Level, setContainer1Level] = useState(70);
  const [container2Level, setContainer2Level] = useState(45);

  // Mock data
  const laboratories = [
    { id: 1, name: 'CIP - Clean In Place', program: 'food', institution: 'Main Campus', description: 'Industrial cleaning process simulation' },
    { id: 2, name: 'Process Control Lab', program: 'industrial', institution: 'Main Campus', description: 'PID controller and automation systems' },
    { id: 3, name: 'Chemical Reactor Analysis', program: 'chemistry', institution: 'Partner University A', description: 'Chemical reaction kinetics and thermodynamics' },
    { id: 4, name: 'SCADA Systems Lab', program: 'systems', institution: 'Main Campus', description: 'Supervisory control and data acquisition' },
    { id: 5, name: 'Food Processing Unit', program: 'food', institution: 'Partner University B', description: 'Food preservation and processing techniques' },
    { id: 6, name: 'Industrial Automation', program: 'industrial', institution: 'Partner University A', description: 'PLC programming and industrial networks' },
  ];

  const experimentHistory = [
    { id: 1, institution: 'Main Campus', instructor: 'Dr. Maria Garcia', student: 'Juan Perez', duration: '45 min', temp: 82, conductivity: 1.5, status: 'success' },
    { id: 2, institution: 'Partner University A', instructor: 'Dr. Carlos Lopez', student: 'Ana Martinez', duration: '38 min', temp: 79, conductivity: 1.3, status: 'success' },
    { id: 3, institution: 'Main Campus', instructor: 'Dr. Maria Garcia', student: 'Luis Rodriguez', duration: '52 min', temp: 85, conductivity: 1.8, status: 'warning' },
    { id: 4, institution: 'Partner University B', instructor: 'Dr. Sofia Torres', student: 'Carmen Diaz', duration: '41 min', temp: 80, conductivity: 1.4, status: 'success' },
  ];

  useEffect(() => {
    let interval;
    if (isExperimentRunning) {
      interval = setInterval(() => {
        setExperimentTime(prev => prev + 1);
        setCurrentTemp(prev => Math.min(setTemp, prev + 0.5));
        setLiquidLevel(prev => Math.min(100, prev + 0.3));
        setConductivity(prev => prev + (Math.random() - 0.5) * 0.05);
        setContainer1Level(prev => Math.max(20, prev - 0.2));
        setContainer2Level(prev => Math.min(100, prev + 0.2));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isExperimentRunning, setTemp]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username && password) {
      setIsLoggedIn(true);
      setCurrentScreen('labs');
    }
  };

  const filteredLabs = laboratories.filter(lab => {
    const matchesProgram = selectedProgram === 'all' || lab.program === selectedProgram;
    const matchesSearch = lab.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesInstitution = lab.institution.toLowerCase().includes(institutionFilter.toLowerCase());
    return matchesProgram && matchesSearch && matchesInstitution;
  });

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Home Screen
  if (currentScreen === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Beaker className="w-8 h-8 text-green-600" />
                <span className="text-2xl font-bold text-gray-800">Remote Lab Platform</span>
              </div>
              <button
                onClick={() => setCurrentScreen('login')}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Access Platform
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Remote Laboratory Access for Students
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Perform practical activities in state-of-the-art laboratories from anywhere. Access both institutional and partner university laboratories for hands-on learning experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="h-64 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <Activity className="w-32 h-32 text-white opacity-80" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Guided Practical Activities</h3>
                <p className="text-gray-600">
                  Work with real equipment under instructor supervision. Perform experiments with SCADA systems, industrial processes, and advanced laboratory equipment.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="h-64 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <Beaker className="w-32 h-32 text-white opacity-80" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Multi-Institution Network</h3>
                <p className="text-gray-600">
                  Access laboratories from partner institutions. Expand your learning opportunities beyond your campus with shared resources and collaborative research.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">How to Access</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Login</h4>
                <p className="text-sm text-gray-600">Access with your institutional credentials</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Browse Labs</h4>
                <p className="text-sm text-gray-600">Filter by program and institution</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Select Lab</h4>
                <p className="text-sm text-gray-600">Choose your practice activity</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">4</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Perform</h4>
                <p className="text-sm text-gray-600">Execute your experiment remotely</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl shadow-lg p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Available Programs</h2>
            <div className="grid md:grid-cols-4 gap-6 mt-8">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <p className="font-semibold">Systems Engineering</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <p className="font-semibold">Chemistry</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <p className="font-semibold">Food Engineering</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <p className="font-semibold">Industrial Engineering</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login Screen
  if (currentScreen === 'login' && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-12 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-full mb-4">
              <Beaker className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Remote Lab Platform</h1>
            <p className="text-gray-600 mt-2">Sign in to access laboratories</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-green-600 border-gray-300 rounded" />
                <span className="ml-2 text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-blue-600 hover:text-blue-700">Forgot password?</a>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-lg"
            >
              Sign In
            </button>
          </form>

          <button
            onClick={() => setCurrentScreen('home')}
            className="w-full mt-4 text-gray-600 hover:text-gray-800 transition"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Laboratory List Screen
  if (currentScreen === 'labs') {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Beaker className="w-8 h-8 text-green-600" />
                <span className="text-2xl font-bold text-gray-800">Remote Lab Platform</span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentScreen('history')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Experiment History
                </button>
                <span className="text-gray-600">Welcome, {username}</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Available Laboratories</h1>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search laboratories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Filter by institution..."
                  value={institutionFilter}
                  onChange={(e) => setInstitutionFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={() => setSelectedProgram('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedProgram === 'all'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Programs
              </button>
              <button
                onClick={() => setSelectedProgram('systems')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedProgram === 'systems'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Systems Engineering
              </button>
              <button
                onClick={() => setSelectedProgram('chemistry')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedProgram === 'chemistry'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Chemistry
              </button>
              <button
                onClick={() => setSelectedProgram('food')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedProgram === 'food'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Food Engineering
              </button>
              <button
                onClick={() => setSelectedProgram('industrial')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedProgram === 'industrial'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Industrial Engineering
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLabs.map(lab => (
              <div key={lab.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                  <Beaker className="w-16 h-16 text-white opacity-80" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{lab.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{lab.description}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{lab.institution}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (lab.id === 1) {
                        setCurrentScreen('experiment');
                      }
                    }}
                    className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center space-x-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>Access Laboratory</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Experiment Screen (CIP)
  if (currentScreen === 'experiment') {
    return (
      <div className="min-h-screen bg-gray-900">
        <nav className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Beaker className="w-6 h-6 text-green-400" />
                <span className="text-xl font-bold text-white">CIP - Clean In Place Laboratory</span>
              </div>
              <button
                onClick={() => setCurrentScreen('labs')}
                className="text-gray-300 hover:text-white transition"
              >
                ← Back to Labs
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* SCADA Visualization */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6">Process Visualization</h2>
                
                <div className="relative h-96 bg-gray-900 rounded-lg p-8 border-2 border-gray-700">
                  {/* Container 1 - Supply Tank */}
                  <div className="absolute left-16 top-8 w-32">
                    <div className="text-center text-gray-400 text-sm mb-2">Supply Tank</div>
                    <div className="relative w-32 h-48 border-4 border-blue-500 rounded-lg overflow-hidden bg-gray-800">
                      <div
                        className="absolute bottom-0 w-full bg-blue-400 transition-all duration-1000"
                        style={{ height: `${container1Level}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-bold text-lg z-10">{container1Level.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Pipe from Container 1 to Reactor */}
                  <div className="absolute left-36 top-32 w-24 h-1 bg-blue-500"></div>
                  {isExperimentRunning && (
                    <div className="absolute left-36 top-32 w-2 h-2 bg-blue-300 rounded-full animate-ping"></div>
                  )}

                  {/* Reactor - Container 2 */}
                  <div className="absolute left-64 top-8 w-40">
                    <div className="text-center text-green-400 text-sm mb-2">Reactor</div>
                    <div className="relative w-40 h-48 border-4 border-green-500 rounded-lg overflow-hidden bg-gray-800">
                      <div
                        className="absolute bottom-0 w-full bg-green-400 transition-all duration-1000"
                        style={{ height: `${container2Level}%` }}
                      />
                      {/* Agitator animation */}
                      {isExperimentRunning && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-1 bg-white animate-spin origin-center"></div>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-end justify-center pb-4">
                        <span className="text-white font-bold text-lg z-10">{container2Level.toFixed(0)}%</span>
                      </div>
                    </div>
                    {motorRPM > 0 && (
                      <div className="text-center text-yellow-400 text-xs mt-2">
                        Mixing: {motorRPM} RPM
                      </div>
                    )}
                  </div>

                  {/* Warning indicators */}
                  {(currentTemp > setTemp + 2 || conductivity > 2) && (
                    <div className="absolute top-4 right-4 flex items-center space-x-2 text-red-400 bg-red-900 bg-opacity-50 px-3 py-2 rounded">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="text-sm">Warning: Parameter out of range</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Metrics Dashboard */}
              <div className="bg-gray-800 rounded-xl p-6 shadow-xl mt-6">
                <h2 className="text-xl font-bold text-white mb-4">Real-Time Metrics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-400" />
                      <span className="text-gray-400 text-sm">Duration</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{formatTime(experimentTime)}</div>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <Thermometer className="w-5 h-5 text-red-400" />
                      <span className="text-gray-400 text-sm">Temperature</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{currentTemp.toFixed(1)}°C</div>
                    <div className="text-xs text-gray-500">Target: {setTemp}°C</div>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <Gauge className="w-5 h-5 text-green-400" />
                      <span className="text-gray-400 text-sm">Motor RPM</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{motorRPM}</div>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <Droplets className="w-5 h-5 text-cyan-400" />
                      <span className="text-gray-400 text-sm">Conductivity</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{conductivity.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">mS/cm</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Control Panel */}
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6">Control Panel</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Set Temperature (°C)</label>
                    <input
                      type="number"
                      value={setTemp}
                      onChange={(e) => setSetTemp(Number(e.target.value))}
                      disabled={isExperimentRunning}
                      className="w-full bg-gray-900 text-white px-4 py-2 rounded border border-gray-700 focus:border-green-500 disabled:opacity-50"
                      min="20"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Motor RPM</label>
                    <input
                      type="range"
                      value={motorRPM}
                      onChange={(e) => setMotorRPM(Number(e.target.value))}
                      disabled={isExperimentRunning}
                      className="w-full"
                      min="0"
                      max="300"
                      step="10"
                    />
                    <div className="text-right text-white text-sm mt-1">{motorRPM} RPM</div>
                  </div>

                  <div className="pt-4 space-y-3">
                    {!isExperimentRunning ? (
                      <button
                        onClick={() => setIsExperimentRunning(true)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition flex items-center justify-center space-x-2"
                      >
                        <Play className="w-5 h-5" />
                        <span>Start Experiment</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsExperimentRunning(false)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition"
                      >
                        Stop Experiment
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        setIsExperimentRunning(false);
                        setExperimentTime(0);
                        setCurrentTemp(25);
                        setLiquidLevel(45);
                        setConductivity(1.2);
                        setContainer1Level(70);
                        setContainer2Level(45);
                      }}
                      className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4">Process Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Liquid Level:</span>
                    <span className="text-white font-bold">{liquidLevel.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${liquidLevel}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-gray-400">Temperature Progress:</span>
                    <span className="text-white font-bold">
                      {((currentTemp / setTemp) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(currentTemp / setTemp) * 100}%` }}
                    />
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${isExperimentRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></div>
                      <span className="text-gray-300">
                        {isExperimentRunning ? 'Experiment Running' : 'Experiment Stopped'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Experiment History Screen
  if (currentScreen === 'history') {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Beaker className="w-8 h-8 text-green-600" />
                <span className="text-2xl font-bold text-gray-800">Remote Lab Platform</span>
              </div>
              <button
                onClick={() => setCurrentScreen('labs')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Labs
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Experiment History</h1>
            <div className="flex items-center space-x-2 text-gray-600">
              <BarChart3 className="w-5 h-5" />
              <span>{experimentHistory.length} Total Experiments</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Institution</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Instructor</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Student</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Duration</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Temp (°C)</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Conductivity</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {experimentHistory.map(exp => (
                    <tr key={exp.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-800">{exp.institution}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{exp.instructor}</td>
                      <td className="px-6 py-4 text-sm text-gray-800 font-medium">{exp.student}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{exp.duration}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={exp.temp >= 78 && exp.temp <= 82 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {exp.temp}°C
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={exp.conductivity <= 1.6 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {exp.conductivity} mS/cm
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          exp.status === 'success' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {exp.status === 'success' ? '✓ Success' : '⚠ Warning'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Temperature Distribution</h3>
              <div className="space-y-3">
                {experimentHistory.map(exp => (
                  <div key={exp.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{exp.student}</span>
                      <span className="text-gray-800 font-medium">{exp.temp}°C</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${exp.temp >= 78 && exp.temp <= 82 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${(exp.temp / 100) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Success Rate</h3>
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <div className="text-6xl font-bold text-green-600 mb-2">
                    {((experimentHistory.filter(e => e.status === 'success').length / experimentHistory.length) * 100).toFixed(0)}%
                  </div>
                  <div className="text-gray-600">Successful Experiments</div>
                  <div className="text-sm text-gray-500 mt-2">
                    {experimentHistory.filter(e => e.status === 'success').length} of {experimentHistory.length} experiments
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default RemoteLaboratoryPlatform;