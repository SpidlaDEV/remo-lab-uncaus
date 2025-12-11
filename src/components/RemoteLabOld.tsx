import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Play,
  Square,
  AlertTriangle,
  Thermometer,
  Zap,
  Droplet,
  Clock,
  Settings,
  Microscope, History, LogOut
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RemoteLabProps {
  labId: string;
  onBack: () => void;
  onViewHistory: () => void;
}

interface MetricData {
  time: number;
  temperature: number;
  conductivity: number;
  rpm: number;
}

export function RemoteLabOld({ labId, onBack, onViewHistory }: RemoteLabProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [duration, setDuration] = useState(0);

  // Current values
  const [currentTemp, setCurrentTemp] = useState(25);
  const [setTemp, setSetTemp] = useState(80);
  const [motorRPM, setMotorRPM] = useState(0);
  const [targetRPM, setTargetRPM] = useState(150);
  const [reactorLevel, setReactorLevel] = useState(45);
  const [tankLevel, setTankLevel] = useState(85);
  const [conductivity, setConductivity] = useState(1.2);
  const [liquidQuantity, setLiquidQuantity] = useState(450);

  const [metricsData, setMetricsData] = useState<MetricData[]>([]);
  const [showControls, setShowControls] = useState(false);

  // Warnings
  const tempWarning = Math.abs(currentTemp - setTemp) > 10 && isRunning;
  const rpmWarning = motorRPM > 200;
  const conductivityWarning = conductivity > 2.5;

  useEffect(() => {
    let interval: number;

    if (isRunning) {
      interval = window.setInterval(() => {
        setDuration(prev => prev + 1);

        // Simulate temperature rising to set point
        setCurrentTemp(prev => {
          if (prev < setTemp) return Math.min(prev + 0.5, setTemp);
          if (prev > setTemp) return Math.max(prev - 0.5, setTemp);
          return prev;
        });

        // Simulate motor ramping up
        setMotorRPM(prev => {
          if (prev < targetRPM) return Math.min(prev + 5, targetRPM);
          if (prev > targetRPM) return Math.max(prev - 5, targetRPM);
          return prev;
        });

        // Simulate conductivity changes
        setConductivity(prev => prev + (Math.random() - 0.5) * 0.1);

        // Update metrics data
        setMetricsData(prev => {
          const newData = [...prev, {
            time: duration,
            temperature: currentTemp,
            conductivity: conductivity,
            rpm: motorRPM
          }];
          return newData.slice(-20); // Keep last 20 points
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, duration, currentTemp, setTemp, targetRPM, motorRPM, conductivity]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Microscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-green-600">RemoteLab</h3>
                <p className="text-xs text-gray-500">Universidad Nacional del Chaco Austral</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-gray-900">Sistema CIP (Limpieza en el Lugar)</h3>
                <p className="text-sm text-gray-500">Sistema de limpieza industrial para procesos alimentarios y químicos con control automatizado</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {(tempWarning || rpmWarning || conductivityWarning) && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-600 rounded-lg w-32">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Advertencia</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* SCADA Visualization */}
            <div className="lg:col-span-2 space-y-6">
              {/* Main Process View */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white">Visión general del proceso</h3>
                  <div className={`flex items-center gap-2 px-3 py-1.5  text-white rounded-lg ${
                    duration <= 0 ? 'bg-green-500' :
                    isRunning ? 'bg-orange-500' : 'bg-red-500'
                  }`}>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    {
                    duration <= 0 ? 'Preparado' :
                    isRunning ? 'En ejecución' : 'Pausado'
                    }

                  </div>
                </div>

                <div className="flex items-center justify-center gap-12 py-8">
                  {/* Tank 1 - Supply Tank */}
                  <div className="relative">
                    <div className="text-white text-sm mb-2 text-center">Tanque de suministro</div>
                    <div className="w-32 h-64 bg-gray-700 rounded-lg relative overflow-hidden border-4 border-gray-600">
                      <div
                        className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-1000"
                        style={{ height: `${tankLevel}%` }}
                      >
                        <div className="absolute inset-0 opacity-30">
                          <div className="w-full h-2 bg-blue-300 animate-pulse" />
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white text-2xl font-bold drop-shadow-lg">
                          {tankLevel}%
                        </div>
                      </div>
                    </div>
                    <div className="absolute -right-8 top-1/2 w-8 h-2 bg-blue-400" />
                  </div>

                  {/* Reactor with Mixer */}
                  <div className="relative">
                    <div className="text-white text-sm mb-2 text-center">Reactor</div>
                    <div className="w-40 h-64 bg-gray-700 rounded-lg relative overflow-hidden border-4 border-gray-600">
                      {/* Water Level */}
                      <div
                        className="absolute bottom-0 w-full bg-gradient-to-t from-green-500 to-green-400 transition-all duration-1000"
                        style={{ height: `${reactorLevel}%` }}
                      >
                        <div className="absolute inset-0 opacity-30">
                          <div className="w-full h-2 bg-green-300 animate-pulse" />
                        </div>
                      </div>

                      {/* Mixer Animation */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`${isRunning ? 'animate-spin' : ''}`} style={{ animationDuration: motorRPM > 0 ? `${2000 / motorRPM}s` : '2s' }}>
                          <div className="relative w-20 h-20">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gray-400 rounded-full z-10" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-1 bg-gray-300 rounded" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-16 bg-gray-300 rounded" />
                          </div>
                        </div>
                      </div>

                      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-xl font-bold drop-shadow-lg">
                        {reactorLevel}%
                      </div>
                    </div>
                    <div className="absolute -left-8 top-1/2 w-8 h-2 bg-blue-400" />

                    {/* Motor indicator */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white text-xs bg-gray-700 px-3 py-1 rounded">
                      <Zap className="w-3 h-3 text-yellow-400" />
                      Motor
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics Dashboard */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="text-gray-900 mb-4">Real-Time Metrics</h4>
                <div className="h-64 min-h-[256px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metricsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="temperature" stroke="#10b981" name="Temperature (°C)" strokeWidth={2} />
                      <Line type="monotone" dataKey="conductivity" stroke="#3b82f6" name="Conductivity (mS/cm)" strokeWidth={2} />
                      <Line type="monotone" dataKey="rpm" stroke="#f59e0b" name="RPM" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Indicators and Controls */}
            <div className="space-y-6">
              {/* Control Buttons */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Panel de Control
                </h4>

                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Temperatura (°C)</label>
                    <input
                        type="number"
                        value={setTemp}
                        onChange={(e) => setSetTemp(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        min="0"
                        max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">RPM</label>
                    <input
                        type="number"
                        value={targetRPM}
                        onChange={(e) => setTargetRPM(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        min="0"
                        max="250"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleStart}
                    disabled={isRunning}
                    className={`py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                      isRunning
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    <Play className="w-5 h-5" />
                    Start
                  </button>

                  <button
                    onClick={handleStop}
                    disabled={!isRunning}
                    className={`py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                      !isRunning
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    <Square className="w-5 h-5" />
                    Stop
                  </button>
                </div>

                {/* Duration */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-5 h-5" />
                      <span>Duration</span>
                    </div>
                    <span className="text-2xl font-mono text-gray-900">{formatTime(duration)}</span>
                  </div>
                </div>
              </div>

              {/* Gauges */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="text-gray-900 mb-4">Indicators</h4>
                <div className="space-y-4">
                  {/* Motor RPM */}
                  <div className={`p-4 rounded-lg ${rpmWarning ? 'bg-red-50 border-2 border-red-200' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Zap className={`w-5 h-5 ${rpmWarning ? 'text-red-500' : 'text-yellow-500'}`} />
                        <span>Motor RPM</span>
                        {rpmWarning && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      </div>
                      <span className="text-xl font-bold text-gray-900">{Math.round(motorRPM)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${rpmWarning ? 'bg-red-500' : 'bg-yellow-500'}`}
                        style={{ width: `${Math.min((motorRPM / 250) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Temperature */}
                  <div className={`p-4 rounded-lg ${tempWarning ? 'bg-red-50 border-2 border-red-200' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Thermometer className={`w-5 h-5 ${tempWarning ? 'text-red-500' : 'text-orange-500'}`} />
                        <span>Temperature</span>
                        {tempWarning && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">{currentTemp.toFixed(1)}°C</div>
                        <div className="text-xs text-gray-500">Set: {setTemp}°C</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${(currentTemp / 100) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Liquid Quantity */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Droplet className="w-5 h-5 text-blue-500" />
                        <span>Liquid Volume</span>
                      </div>
                      <span className="text-xl font-bold text-gray-900">{liquidQuantity}L</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${(liquidQuantity / 1000) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Conductivity */}
                  <div className={`p-4 rounded-lg ${conductivityWarning ? 'bg-red-50 border-2 border-red-200' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Zap className={`w-5 h-5 ${conductivityWarning ? 'text-red-500' : 'text-purple-500'}`} />
                        <span>Conductivity</span>
                        {conductivityWarning && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      </div>
                      <span className="text-xl font-bold text-gray-900">{conductivity.toFixed(2)} mS/cm</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${conductivityWarning ? 'bg-red-500' : 'bg-purple-500'}`}
                        style={{ width: `${Math.min((conductivity / 3) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Control Panel */}
              <div className="bg-white rounded-xl p-6 shadow-sm">

               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}