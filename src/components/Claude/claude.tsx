import React, { useState, useEffect } from 'react';
import { Beaker, Search, Filter, Play, Clock, Thermometer, Gauge, Droplets, AlertTriangle, BarChart3, User, Lock, ChevronRight, Activity, Square, Zap, Power, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RLaboratoryPlatform = () => {
    const [currentScreen, setCurrentScreen] = useState('home');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [selectedProgram, setSelectedProgram] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [institutionFilter, setInstitutionFilter] = useState('');

    // CIP Process States
    const [processStage, setProcessStage] = useState(0); // 0: idle, 1: tank mixing, 2: transfer, 3: reactor recirculation
    const [tankVolume, setTankVolume] = useState(15); // Liters in supply tank
    const [reactorVolume, setReactorVolume] = useState(0); // Liters in reactor
    const [isTankRecirculating, setIsTankRecirculating] = useState(false);
    const [isTransferring, setIsTransferring] = useState(false);
    const [isReactorRecirculating, setIsReactorRecirculating] = useState(false);
    const [reactorMotorOn, setReactorMotorOn] = useState(false);
    const [heatingOn, setHeatingOn] = useState(false);

    // Metrics
    const [temperature, setTemperature] = useState(25);
    const [conductivity, setConductivity] = useState(2.5);
    const [motorRPM, setMotorRPM] = useState(0);
    const [targetRPM, setTargetRPM] = useState(150);
    const [experimentTime, setExperimentTime] = useState(0);

    // Graph data
    const [tempData, setTempData] = useState<{time: number, value: number}[]>([]);
    const [conductivityData, setConductivityData] = useState<{time: number, value: number}[]>([]);
    const [rpmData, setRpmData] = useState<{time: number, value: number}[]>([]);

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

    // Main process simulation
    useEffect(() => {
        let interval: number;

        if (processStage > 0) {
            interval = window.setInterval(() => {
                setExperimentTime(prev => prev + 1);

                // Stage 1: Tank recirculation (mixing)
                if (processStage === 1 && isTankRecirculating) {
                    setConductivity(prev => Math.max(1.8, prev - 0.02)); // Slowly mix
                }

                // Stage 2: Transfer from tank to reactor
                if (processStage === 2 && isTransferring) {
                    if (reactorVolume < 5 && tankVolume > 0) {
                        setReactorVolume(prev => Math.min(5, prev + 0.1));
                        setTankVolume(prev => Math.max(0, prev - 0.1));
                    } else if (reactorVolume >= 5) {
                        // Auto-stop transfer when reactor reaches 5L
                        setIsTransferring(false);
                        setProcessStage(3);
                        setIsReactorRecirculating(true);
                    }
                }

                // Stage 3: Reactor recirculation
                if (processStage === 3 && isReactorRecirculating) {
                    setConductivity(prev => Math.max(0, prev - 0.015));

                    if (conductivity <= 0.1) {
                        // End practice
                        setIsReactorRecirculating(false);
                        setProcessStage(4); // Completed
                    }
                }

                // Reactor motor
                if (reactorMotorOn) {
                    setMotorRPM(prev => Math.min(targetRPM, prev + 5));
                } else {
                    setMotorRPM(prev => Math.max(0, prev - 10));
                }

                // Heating
                if (heatingOn) {
                    setTemperature(prev => Math.min(85, prev + 0.3));
                } else {
                    setTemperature(prev => Math.max(25, prev - 0.2));
                }

                // Update graph data
                setTempData(prev => [...prev.slice(-19), { time: experimentTime, value: temperature }]);
                setConductivityData(prev => [...prev.slice(-19), { time: experimentTime, value: conductivity }]);
                setRpmData(prev => [...prev.slice(-19), { time: experimentTime, value: motorRPM }]);

            }, 1000);
        }

        return () => clearInterval(interval);
    }, [processStage, isTankRecirculating, isTransferring, isReactorRecirculating, reactorMotorOn, heatingOn, tankVolume, reactorVolume, conductivity, targetRPM, experimentTime, temperature, motorRPM]);

    const handleLogin = (e: React.FormEvent) => {
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

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startTankRecirculation = () => {
        if (tankVolume >= 10) {
            setProcessStage(1);
            setIsTankRecirculating(true);
        }
    };

    const stopTankRecirculation = () => {
        setIsTankRecirculating(false);
    };

    const startTransfer = () => {
        if (processStage === 1 && tankVolume >= 4) {
            setProcessStage(2);
            setIsTransferring(true);
            setReactorMotorOn(true); // Auto-start motor during transfer
        }
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

    // CIP Experiment Screen - REDESIGNED
    if (currentScreen === 'experiment') {
        const tankPercentage = (tankVolume / 20) * 100;
        const reactorPercentage = (reactorVolume / 5) * 100;
        const tankStatus = tankVolume >= 10 ? 'acceptable' : 'critical';
        const reactorStatus = reactorVolume >= 4 ? 'acceptable' : reactorVolume >= 5 ? 'optimal' : 'critical';

        return (
            <div className="min-h-screen bg-gray-900">
                <nav className="bg-gray-800 border-b border-gray-700">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Beaker className="w-6 h-6 text-green-400" />
                                <div>
                                    <span className="text-xl font-bold text-white">CIP - Clean In Place Laboratory</span>
                                    <p className="text-xs text-gray-400">Industrial cleaning process system</p>
                                </div>
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
                    {/* Process Stage Indicator */}
                    <div className="bg-gray-800 rounded-xl p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Clock className="w-5 h-5 text-blue-400" />
                                <span className="text-white font-medium">Experiment Time: {formatTime(experimentTime)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className={`px-4 py-2 rounded-lg font-medium ${
                                    processStage === 0 ? 'bg-gray-700 text-gray-300' :
                                        processStage === 1 ? 'bg-blue-600 text-white' :
                                            processStage === 2 ? 'bg-yellow-600 text-white' :
                                                processStage === 3 ? 'bg-green-600 text-white' :
                                                    'bg-purple-600 text-white'
                                }`}>
                                    {processStage === 0 ? 'Idle' :
                                        processStage === 1 ? 'Stage 1: Tank Mixing' :
                                            processStage === 2 ? 'Stage 2: Transfer to Reactor' :
                                                processStage === 3 ? 'Stage 3: Reactor Recirculation' :
                                                    'Completed'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* SCADA Visualization */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
                                <h2 className="text-xl font-bold text-white mb-6">Process Visualization</h2>

                                <div className="relative h-96 bg-gray-900 rounded-lg p-8 border-2 border-gray-700">
                                    {/* Supply Tank */}
                                    <div className="absolute left-16 top-8">
                                        <div className="text-center text-blue-400 text-sm mb-2 font-semibold">Supply Tank</div>
                                        <div className="relative w-32 h-56 border-4 border-blue-500 rounded-lg overflow-hidden bg-gray-800">
                                            <div
                                                className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-1000"
                                                style={{ height: `${tankPercentage}%` }}
                                            >
                                                {isTankRecirculating && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-white font-bold text-2xl z-10">{tankVolume.toFixed(1)}L</span>
                                                <span className="text-white text-sm z-10">{tankPercentage.toFixed(0)}%</span>
                                            </div>
                                            {isTankRecirculating && (
                                                <div className="absolute top-2 left-2 right-2 flex justify-center">
                                                    <Droplets className="w-5 h-5 text-white animate-bounce" />
                                                </div>
                                            )}
                                        </div>
                                        <div className={`mt-2 text-center text-xs font-bold px-2 py-1 rounded ${
                                            tankStatus === 'acceptable' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                                        }`}>
                                            {tankStatus === 'acceptable' ? '✓ Acceptable' : '⚠ Critical'}
                                        </div>
                                    </div>

                                    {/* Transfer Pipe */}
                                    <div className="absolute left-40 top-36 w-28 h-2 bg-gray-700">
                                        {isTransferring && (
                                            <>
                                                <div className="absolute inset-0 bg-blue-400"></div>
                                                <div className="absolute left-0 w-4 h-2 bg-blue-200 animate-pulse"></div>
                                            </>
                                        )}
                                    </div>
                                    <ArrowRight className={`absolute left-52 top-32 w-6 h-6 ${isTransferring ? 'text-blue-400 animate-pulse' : 'text-gray-600'}`} />

                                    {/* Reactor */}
                                    <div className="absolute left-72 top-8">
                                        <div className="text-center text-green-400 text-sm mb-2 font-semibold">Reactor</div>
                                        <div className="relative w-40 h-56 border-4 border-green-500 rounded-lg overflow-hidden bg-gray-800">
                                            <div
                                                className="absolute bottom-0 w-full bg-gradient-to-t from-green-500 to-green-400 transition-all duration-1000"
                                                style={{ height: `${reactorPercentage}%` }}
                                            >
                                                {isReactorRecirculating && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Motor/Mixer Animation */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className={`${reactorMotorOn ? 'animate-spin' : ''}`} style={{ animationDuration: '1s' }}>
                                                    <div className="relative w-20 h-20">
                                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-300 rounded-full z-10" />
                                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-1 bg-gray-300 rounded" />
                                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-16 bg-gray-300 rounded" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center z-20">
                                                <span className="text-white font-bold text-2xl drop-shadow-lg">{reactorVolume.toFixed(1)}L</span>
                                                <br />
                                                <span className="text-white text-sm drop-shadow-lg">{reactorPercentage.toFixed(0)}%</span>
                                            </div>

                                            {reactorMotorOn && (
                                                <div className="absolute top-2 right-2">
                                                    <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
                                                </div>
                                            )}
                                            {heatingOn && (
                                                <div className="absolute top-2 left-2">
                                                    <Thermometer className="w-5 h-5 text-red-400 animate-pulse" />
                                                </div>
                                            )}
                                        </div>
                                        <div className={`mt-2 text-center text-xs font-bold px-2 py-1 rounded ${
                                            reactorStatus === 'optimal' ? 'bg-purple-600 text-white' :
                                                reactorStatus === 'acceptable' ? 'bg-green-600 text-white' :
                                                    'bg-red-600 text-white'
                                        }`}>
                                            {reactorStatus === 'optimal' ? '★ Optimal (5L)' :
                                                reactorStatus === 'acceptable' ? '✓ Acceptable' :
                                                    '⚠ Critical'}
                                        </div>
                                    </div>

                                    {/* Process Warnings */}
                                    {tankVolume < 10 && (
                                        <div className="absolute top-4 right-4 flex items-center space-x-2 text-red-400 bg-red-900 bg-opacity-70 px-3 py-2 rounded">
                                            <AlertTriangle className="w-5 h-5" />
                                            <span className="text-sm">Tank below minimum (10L)</span>
                                        </div>
                                    )}
                                    {processStage === 2 && reactorVolume >= 4.9 && (
                                        <div className="absolute bottom-4 right-4 flex items-center space-x-2 text-green-400 bg-green-900 bg-opacity-70 px-3 py-2 rounded">
                                            <span className="text-sm">Reactor reaching optimal level...</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Individual Graphs */}
                            <div className="grid md:grid-cols-3 gap-4">
                                {/* Temperature Graph */}
                                <div className="bg-gray-800 rounded-xl p-4 shadow-xl">
                                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                        <Thermometer className="w-4 h-4 text-orange-400" />
                                        Temperature
                                    </h3>
                                    <div className="h-32">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={tempData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                                <XAxis dataKey="time" stroke="#9CA3AF" fontSize={10} />
                                                <YAxis stroke="#9CA3AF" fontSize={10} domain={[0, 100]} />
                                                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                                                <Line type="monotone" dataKey="value" stroke="#F97316" strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="text-center mt-2">
                                        <span className="text-2xl font-bold text-white">{temperature.toFixed(1)}°C</span>
                                    </div>
                                </div>

                                {/* Conductivity Graph */}
                                <div className="bg-gray-800 rounded-xl p-4 shadow-xl">
                                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-purple-400" />
                                        Conductivity
                                    </h3>
                                    <div className="h-32">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={conductivityData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                                <XAxis dataKey="time" stroke="#9CA3AF" fontSize={10} />
                                                <YAxis stroke="#9CA3AF" fontSize={10} domain={[0, 3]} />
                                                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                                                <Line type="monotone" dataKey="value" stroke="#A855F7" strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="text-center mt-2">
                                        <span className="text-2xl font-bold text-white">{conductivity.toFixed(2)}</span>
                                        <span className="text-xs text-gray-400 ml-1">mS/cm</span>
                                    </div>
                                </div>

                                {/* RPM Graph */}
                                <div className="bg-gray-800 rounded-xl p-4 shadow-xl">
                                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                        <Gauge className="w-4 h-4 text-yellow-400" />
                                        Motor RPM
                                    </h3>
                                    <div className="h-32">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={rpmData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                                <XAxis dataKey="time" stroke="#9CA3AF" fontSize={10} />
                                                <YAxis stroke="#9CA3AF" fontSize={10} domain={[0, 250]} />
                                                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                                                <Line type="monotone" dataKey="value" stroke="#EAB308" strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="text-center mt-2">
                                        <span className="text-2xl font-bold text-white">{Math.round(motorRPM)}</span>
                                        <span className="text-xs text-gray-400 ml-1">RPM</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Control Panel */}
                        <div className="space-y-6">
                            {/* Stage 1: Tank Recirculation */}
                            <div className="bg-gray-800 rounded-xl p-6 shadow-xl border-2 border-blue-500">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                                    Tank Mixing
                                </h3>
                                <p className="text-gray-400 text-sm mb-4">Mix substance in supply tank. Minimum 10L required.</p>

                                <div className="space-y-3">
                                    <button
                                        onClick={startTankRecirculation}
                                        disabled={tankVolume < 10 || processStage > 0}
                                        className={`w-full py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                                            tankVolume < 10 || processStage > 0
                                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        }`}
                                    >
                                        <Play className="w-4 h-4" />
                                        Start Tank Mixing
                                    </button>

                                    <button
                                        onClick={stopTankRecirculation}
                                        disabled={!isTankRecirculating}
                                        className={`w-full py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                                            !isTankRecirculating
                                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                : 'bg-red-600 hover:bg-red-700 text-white'
                                        }`}
                                    >
                                        <Square className="w-4 h-4" />
                                        Stop Mixing
                                    </button>
                                </div>

                                {tankVolume < 10 && (
                                    <div className="mt-3 text-red-400 text-xs flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        Minimum 10L required in tank
                                    </div>
                                )}
                            </div>

                            {/* Stage 2: Transfer */}
                            <div className="bg-gray-800 rounded-xl p-6 shadow-xl border-2 border-yellow-500">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                                    Transfer to Reactor
                                </h3>
                                <p className="text-gray-400 text-sm mb-4">Transfer liquid to reactor. Auto-stops at 5L.</p>

                                <button
                                    onClick={startTransfer}
                                    disabled={processStage !== 1 || tankVolume < 4}
                                    className={`w-full py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                                        processStage !== 1 || tankVolume < 4
                                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                            : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                    }`}
                                >
                                    <ArrowRight className="w-4 h-4" />
                                    Start Transfer
                                </button>

                                {processStage === 1 && tankVolume < 4 && (
                                    <div className="mt-3 text-red-400 text-xs flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        Minimum 4L required for transfer
                                    </div>
                                )}
                                {isTransferring && (
                                    <div className="mt-3 text-yellow-400 text-xs flex items-center gap-2">
                                        <Activity className="w-4 h-4 animate-pulse" />
                                        Transferring... {reactorVolume.toFixed(1)}L / 5.0L
                                    </div>
                                )}
                            </div>

                            {/* Stage 3: Reactor Controls */}
                            <div className="bg-gray-800 rounded-xl p-6 shadow-xl border-2 border-green-500">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                                    Reactor Controls
                                </h3>

                                <div className="space-y-4">
                                    {/* Motor Control */}
                                    <div>
                                        <label className="text-gray-300 text-sm mb-2 block">Reactor Motor</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => setReactorMotorOn(true)}
                                                disabled={reactorVolume < 1}
                                                className={`py-2 rounded-lg font-medium transition ${
                                                    reactorMotorOn
                                                        ? 'bg-green-600 text-white'
                                                        : reactorVolume < 1
                                                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                            : 'bg-gray-700 hover:bg-gray-600 text-white'
                                                }`}
                                            >
                                                <Power className="w-4 h-4 mx-auto" />
                                            </button>
                                            <button
                                                onClick={() => setReactorMotorOn(false)}
                                                className={`py-2 rounded-lg font-medium transition ${
                                                    !reactorMotorOn
                                                        ? 'bg-red-600 text-white'
                                                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                                                }`}
                                            >
                                                <Square className="w-4 h-4 mx-auto" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* RPM Setting */}
                                    <div>
                                        <label className="text-gray-300 text-sm mb-2 block">Target RPM: {targetRPM}</label>
                                        <input
                                            type="range"
                                            value={targetRPM}
                                            onChange={(e) => setTargetRPM(Number(e.target.value))}
                                            min="0"
                                            max="250"
                                            step="10"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Heating Control */}
                                    <div>
                                        <label className="text-gray-300 text-sm mb-2 block">Heating</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => setHeatingOn(true)}
                                                disabled={reactorVolume < 1}
                                                className={`py-2 rounded-lg font-medium transition ${
                                                    heatingOn
                                                        ? 'bg-orange-600 text-white'
                                                        : reactorVolume < 1
                                                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                            : 'bg-gray-700 hover:bg-gray-600 text-white'
                                                }`}
                                            >
                                                ON
                                            </button>
                                            <button
                                                onClick={() => setHeatingOn(false)}
                                                className={`py-2 rounded-lg font-medium transition ${
                                                    !heatingOn
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                                                }`}
                                            >
                                                OFF
                                            </button>
                                        </div>
                                    </div>

                                    {/* Reactor Recirculation */}
                                    <div>
                                        <label className="text-gray-300 text-sm mb-2 block">Reactor Recirculation</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => {
                                                    if (reactorVolume >= 4) {
                                                        setIsReactorRecirculating(true);
                                                        if (processStage < 3) setProcessStage(3);
                                                    }
                                                }}
                                                disabled={reactorVolume < 4 || isReactorRecirculating}
                                                className={`py-2 rounded-lg font-medium transition ${
                                                    isReactorRecirculating
                                                        ? 'bg-green-600 text-white'
                                                        : reactorVolume < 4
                                                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                            : 'bg-gray-700 hover:bg-gray-600 text-white'
                                                }`}
                                            >
                                                <Play className="w-4 h-4 mx-auto" />
                                            </button>
                                            <button
                                                onClick={() => setIsReactorRecirculating(false)}
                                                disabled={!isReactorRecirculating}
                                                className={`py-2 rounded-lg font-medium transition ${
                                                    !isReactorRecirculating
                                                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                        : 'bg-red-600 hover:bg-red-700 text-white'
                                                }`}
                                            >
                                                <Square className="w-4 h-4 mx-auto" />
                                            </button>
                                        </div>
                                    </div>

                                    {reactorVolume < 4 && (
                                        <div className="text-red-400 text-xs flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            Minimum 4L required in reactor
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status Panel */}
                            <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
                                <h3 className="text-white font-bold mb-4">Process Status</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Tank Mixing:</span>
                                        <span className={`font-medium ${isTankRecirculating ? 'text-blue-400' : 'text-gray-500'}`}>
                      {isTankRecirculating ? '● Active' : '○ Inactive'}
                    </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Transfer:</span>
                                        <span className={`font-medium ${isTransferring ? 'text-yellow-400' : 'text-gray-500'}`}>
                      {isTransferring ? '● Active' : '○ Inactive'}
                    </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Reactor Recirc:</span>
                                        <span className={`font-medium ${isReactorRecirculating ? 'text-green-400' : 'text-gray-500'}`}>
                      {isReactorRecirculating ? '● Active' : '○ Inactive'}
                    </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Conductivity:</span>
                                        <span className={`font-medium ${conductivity < 0.5 ? 'text-green-400' : 'text-white'}`}>
                      {conductivity.toFixed(2)} mS/cm
                    </span>
                                    </div>
                                    {processStage === 3 && conductivity <= 0.1 && (
                                        <div className="mt-4 p-3 bg-purple-900 bg-opacity-50 rounded-lg text-purple-300 text-center">
                                            <span className="font-bold">✓ Practice Complete!</span>
                                            <br />
                                            <span className="text-xs">Conductivity ≈ 0</span>
                                        </div>
                                    )}
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

export default RLaboratoryPlatform;