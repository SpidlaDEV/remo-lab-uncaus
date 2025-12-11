import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Play,
  Square,
  AlertTriangle,
  Thermometer,
  Zap,
  Clock,
  Flame,
  ArrowDown,
  RotateCw,
  Microscope, ArrowUp, Settings, Droplet
} from 'lucide-react';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend} from 'recharts';

interface RemoteLabProps {
  labId: string;
  onBack: () => void;
  onViewHistory: () => void;
}

interface MetricData {
  time: number;
  value: number;
}

// type ProcessStage = 0 | 1 | 2 | 3 | 'drain' | 5;
// initial .......................... 0
// tank-mixing ...................... 1
// transferring ..................... 2
// reactor-recirculation ............ 3
// drain ............................ 4
// completed ........................ 5
// stopped .......................... 6

export function RemoteLab({ labId, onBack, onViewHistory }: RemoteLabProps) {
  // Process stage
  const [isRunning, setIsRunning] = useState(false);
  const [stage, setStage] = useState<number>(0);
  const [duration, setDuration] = useState(0);
  const [cycles, setCycles] = useState(1);

  // Tank levels (in liters)
  const [supplyTankLevel, setSupplyTankLevel] = useState(15); // Start with 12L
  const [reactorLevel, setReactorLevel] = useState(0);

  // Controls
  const [tankRecirculating, setTankRecirculating] = useState(false);
  const [transferActive, setTransferActive] = useState(false);
  const [reactorHeating, setReactorHeating] = useState(false);
  const [reactorMotor, setReactorMotor] = useState(false);
  const [reactorRecirculating, setReactorRecirculating] = useState(false);

  // Current values
  const [targetTemp, setTargetTemp] = useState(85);
  const [targetRPM, setTargetRPM] = useState(150);

  // Measurements
  const [temperature, setTemperature] = useState(25);
  const [conductivity, setConductivity] = useState(2.5);
  const [motorRPM, setMotorRPM] = useState(0);

  // Chart data
  const [tempData, setTempData] = useState<MetricData[]>([]);
  const [conductivityData, setConductivityData] = useState<MetricData[]>([]);
  const [rpmData, setRpmData] = useState<MetricData[]>([]);

  // Tank capacities
  const REACTOR_RPM_MAX = 1200; // 125 °C
  const REACTOR_TEMP_MAX = 125; // 125 °C
  const SUPPLY_TANK_MAX = 20; // 20 liters max
  const REACTOR_MAX = 6; // 6 liters max
  const REACTOR_TARGET = 5; // Target 5 liters
  const REACTOR_MIN = 4; // Minimum 4 liters
  const SUPPLY_MIN = 8; // Minimum 10 liters

  // Warnings
  const supplyLevelWarning = supplyTankLevel < (SUPPLY_MIN - reactorLevel);
  const reactorLevelWarning = stage == 3 && reactorLevel < REACTOR_MIN;
  const conductivityWarning = conductivity > 3.0;
  const tempWarning = Math.abs(temperature - setTemperature) > 10 && isRunning;
  const rpmWarning = motorRPM > REACTOR_RPM_MAX;

  // Process simulation
  useEffect(() => {
    let interval: number;

    if (isRunning) {
      interval = window.setInterval(() => {
        setDuration(prev => prev + 1);

        if (tankRecirculating && stage === 3) {
          // Mixing improves conductivity slightly
          setConductivity(prev => Math.max(prev - 0.01, 1.5));
        }

        // Transfer from tank to reactor (Stage 2)
        if (transferActive && stage == 2) {
          if (supplyTankLevel > 0 && reactorLevel < REACTOR_TARGET) {
            const options = [0, 0.1, 0.15, 0.2, 0.25, 0.3];
            const transferRate = options[Math.floor(Math.random() * options.length)];
            setSupplyTankLevel(prev => Math.max(prev - transferRate, 0));

            setReactorLevel(prev => {
              const newLevel = prev + transferRate;
              // Auto-stop at 5L
              if (newLevel >= REACTOR_TARGET) {
                setTransferActive(false);
                setStage(3);
                setReactorRecirculating(true);
              }
              return newLevel;
            });
          }
        }

        // Reactor motor
        if (reactorRecirculating) {
          setMotorRPM(prev => Math.min(prev + 5, targetRPM));
        } else {
          setMotorRPM(prev => Math.max(prev - 10, 0));
        }

        // Reactor heating
        if (reactorHeating && reactorLevel > 0) {
          setTemperature(prev => Math.min(prev + 0.5, targetTemp));
        } else {
          setTemperature(prev => Math.max(prev - 0.3, 25));
        }

        // Reactor recirculation (Stage 3)
        if (stage === 3) {
          // Recirculation reduces conductivity
          setConductivity(prev => {
            if (prev <= 1.76 && cycles == 1) {
              setStage(4);
              setReactorHeating(false);
              setReactorRecirculating(false);
              setReactorMotor(false);
              return prev;
            }

            const newValue = Math.max(prev - 0.02, 0);

            // End practice when conductivity near zero
            if (newValue <= 0.1) {
              setStage(5);
              setIsRunning(false);
              setReactorRecirculating(false);
              setReactorHeating(false);
            }
            return newValue;
          });
        }

        if (stage === 4) {
          const options = [0, 0.1, 0.15, 0.2, 0.25, 0.3];
          const transferRate = options[Math.floor(Math.random() * options.length)];
          setReactorLevel(prev => {
            const newLevel = Math.max(prev - transferRate, 0);
            // Auto-stop at 5L
            if (newLevel <= 0) {
              setStage(6);
              setCycles(p => p + 1);
              setReactorMotor(false);
            }
            return newLevel;
          });
        }

        if (stage == 6) {
          setStage(1)
        }

        // Update chart data
        setTempData(prev => {
          const newData = [...prev, {time: duration, value: temperature}];
          return newData.slice(-30);
        });

        setConductivityData(prev => {
          const newData = [...prev, {time: duration, value: conductivity}];
          return newData.slice(-30);
        });

        setRpmData(prev => {
          const newData = [...prev, {time: duration, value: motorRPM}];
          return newData.slice(-30);
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [duration, tankRecirculating, transferActive, reactorHeating, reactorRecirculating, stage, supplyTankLevel, reactorLevel, temperature, conductivity, motorRPM]);

  const handleStartTankRecirculation = () => {
    if (supplyTankLevel >= SUPPLY_MIN) {
      setIsRunning(true);
      setCycles((c: number): number => c++);
      setTankRecirculating(true);
      setStage(1);
    }
  };

  const handleStopTankRecirculation = () => {
    setTankRecirculating(false);
  };

  const handleStartTransfer = () => {
    if (supplyTankLevel >= SUPPLY_MIN && stage === 1) {
      setTransferActive(true);
      setStage(2);
      setReactorMotor(true); // Auto-start reactor motor during transfer
      setReactorHeating(true);
    }
  };

  const handleToggleHeating = () => {
    if (reactorLevel >= REACTOR_MIN) {
      setReactorHeating(!reactorHeating);
    }
  };

  const handleToggleReactorRecirculation = () => {
    if (reactorLevel >= REACTOR_MIN && stage >= 2 && stage <= 4) {
      setReactorRecirculating(!reactorRecirculating);
    }
  };

  const handleToggleReactorMotor = () => {
    if (reactorLevel >= REACTOR_MIN && stage >= 2 && stage <= 4) {
      setReactorMotor(!reactorMotor);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStageDescription = () => {
    switch (stage) {
      case 0:
        return 'Listo para comenzar - Inicia la recirculación del tanque';
      case 1:
        return `Ciclo ${cycles} - Etapa 1: Mezclando la sustancia en el tanque de suministro`;
      case 2:
        return `Ciclo ${cycles} - Etapa 2: Transfiriendo al reactor`;
      case 3:
        return `Ciclo ${cycles} - Etapa 3: Recirculación del reactor hasta que la conductividad ≈ 0`;
      case 4:
      case 6:
        return `Ciclo ${cycles} - Etapa 4: Drenaje`;
      case 5:
        return '¡Práctica completada!';
      default:
        return '';
    }
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

        <div className="max-w-7xl mx-auto px-6 mt-4">
          <div className="max-w-7xl mx-auto px-6">
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
                {(supplyLevelWarning || reactorLevelWarning || tempWarning || rpmWarning || conductivityWarning) && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-600 rounded-lg w-32">
                      <AlertTriangle className="w-5 h-5" />
                      <span>Advertencia</span>
                    </div>
                )}
                <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-mono">{formatTime(duration)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Stage Indicator */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl p-6 mb-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Paso actual</p>
                <h3 className="text-white">{getStageDescription()}</h3>
              </div>
              <div className="text-4xl font-bold opacity-90">
                {stage === 1 && '1'}
                {stage === 2 && '2'}
                {stage === 3 && '3'}
                {stage === 5 && '✓'}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* SCADA Visualization */}
            <div className="lg:col-span-2 space-y-6">
              {/* Process Overview */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-white">Visión general del proceso</h4>
                  <div className={`flex items-center gap-2 px-3 py-1.5  text-white rounded-lg ${duration <= 0 ? 'bg-green-500' : isRunning ? 'bg-orange-500' : 'bg-red-500'}`}>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    { duration <= 0 ? 'Preparado' : isRunning ? 'En ejecución' : 'Pausado' }
                  </div>
                </div>

                <div className="flex items-center justify-around py-8">
                  {/* Supply Tank */}
                  <div className="relative">
                    <div className="text-white text-sm mb-3 text-center">Tanque de suministro</div>
                    <div className="w-40 h-72 bg-gray-700 rounded-lg relative overflow-hidden border-4 border-gray-600">
                      {/* Water Level */}
                      <div
                          className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-1000"
                          style={{ height: `${(supplyTankLevel / SUPPLY_TANK_MAX) * 100}%` }}
                      >
                        <div className="absolute inset-0 opacity-30">
                          <div className="w-full h-2 bg-blue-300 animate-pulse" />
                        </div>
                      </div>

                      {/* Tank Recirculation Animation */}
                      {tankRecirculating && (
                          <div className="absolute top-4 left-1/2 -translate-x-1/2">
                            <RotateCw className="w-8 h-8 text-blue-300 animate-spin" />
                          </div>
                      )}

                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-white text-3xl font-bold drop-shadow-lg">
                          {supplyTankLevel.toFixed(1)}L
                        </div>
                        <div className="text-blue-200 text-sm mt-1">
                          {((supplyTankLevel / SUPPLY_TANK_MAX) * 100).toFixed(0)}%
                        </div>
                      </div>

                      {/* Level indicator */}
                      {supplyLevelWarning && (
                          <div className="absolute top-2 right-2">
                            <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
                          </div>
                      )}
                    </div>

                    {/* Outlet pipe to reactor */}
                    <div className="absolute -right-12 bottom-24">
                      <div className={`w-12 h-2 ${transferActive ? 'bg-blue-400' : 'bg-gray-600'} transition-colors`} />
                      {transferActive && (
                          <ArrowDown className="w-6 h-6 text-blue-400 absolute -right-8 top-1/2 -translate-y-1/2 animate-bounce" />
                      )}
                    </div>
                  </div>

                  {/* Reactor */}
                  <div className="relative">
                    <div className="text-white text-sm mb-3 text-center">Reactor</div>
                    <div className="w-40 h-72 bg-gray-700 rounded-lg relative overflow-hidden border-4 border-gray-600">
                      {/* Water Level */}
                      <div
                          className="absolute bottom-0 w-full bg-gradient-to-t from-green-500 to-green-400 transition-all duration-1000"
                          style={{ height: `${(reactorLevel / REACTOR_MAX) * 100}%` }}
                      >
                        <div className="absolute inset-0 opacity-30">
                          <div className="w-full h-2 bg-green-300 animate-pulse" />
                        </div>
                      </div>

                      {/* Mixer Animation */}
                      {reactorMotor && reactorLevel > 0 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin" style={{ animationDuration: '1s' }}>
                              <div className="relative w-24 h-24">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-300 rounded-full z-10" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-1.5 bg-gray-300 rounded" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-20 bg-gray-300 rounded" />
                              </div>
                            </div>
                          </div>
                      )}

                      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center">
                        <div className="text-white text-3xl font-bold drop-shadow-lg">
                          {reactorLevel.toFixed(1)}L
                        </div>
                        <div className="text-green-200 text-sm mt-1">
                          {((reactorLevel / REACTOR_MAX) * 100).toFixed(0)}%
                        </div>
                      </div>

                      {/* Heating indicator */}
                      {reactorHeating && (
                          <div className="absolute bottom-4 left-1/4 -translate-x-1/2">
                            <Flame className="w-8 h-8 text-orange-400 animate-pulse" />
                          </div>
                      )}


                      {/* Reactor Recirculation Indicator */}
                      {reactorRecirculating && (
                          <div className="absolute bottom-4 left-3/4 -translate-x-1/2">
                            <RotateCw className="w-8 h-8 text-green-700 animate-spin" style={{ animationDuration: '2s' }} />
                          </div>
                      )}

                      {/* Level warning */}
                      {reactorLevelWarning && (
                          <div className="absolute top-2 right-2">
                            <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
                          </div>
                      )}
                    </div>

                    {/* Inlet pipe */}
                    <div className="absolute -left-12 bottom-24">
                      {transferActive && (
                          <ArrowUp className="w-6 h-6 text-blue-400 absolute -left-8 top-1/2 -translate-y-1/2 animate-bounce" />
                      )}
                      <div className={`w-12 h-2 ${transferActive ? 'bg-blue-400' : 'bg-gray-600'} transition-colors`} />
                    </div>

                    {/* Motor indicator */}
                    <div className={`absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                        reactorMotor ? 'bg-yellow-500' : 'bg-gray-700'
                    } transition-colors`}>
                      <Zap className={`w-4 h-4 ${reactorMotor ? 'text-white' : 'text-gray-400'}`} />
                      <span className="text-xs text-white">Turbina</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Three Separate Graphs */}
              <div className="grid gap-4">
                {/* Conductivity Graph */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h4 className="text-gray-900 mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-500" />
                    Conductividad
                  </h4>
                  <div className={`text-2xl font-bold mb-2 ${conductivityWarning ? 'text-red-600' : 'text-purple-600'}`}>
                    {conductivity.toFixed(2)} mS/cm
                  </div>
                  <div className="h-32 min-h-[256px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={conductivityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="time"
                            label={{ value: 'Tiempo (min)', position: 'insideBottom', offset: -5 }}
                            tickFormatter={(value) => {
                              const minutes = Math.floor(value / 60); // Convertir segundos a minutos
                              const seconds = value % 60; // El resto de segundos
                              return `${minutes}m ${seconds}s`; // Mostrar en formato "X minutos Y segundos"
                            }}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#a855f7" name="Conductividad (mS/cm)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Temperature Graph */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h4 className="text-gray-900 mb-3 flex items-center gap-2">
                    <Thermometer className="w-5 h-5 text-orange-500" />
                    Temperatura
                  </h4>
                  <div className="text-2xl font-bold text-orange-600 mb-2">
                    {temperature.toFixed(1)}°C
                  </div>
                  <div className="h-32 min-h-[256px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={tempData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="time"
                            label={{ value: 'Tiempo (min)', position: 'insideBottom', offset: -5 }}
                            tickFormatter={(value) => {
                              const minutes = Math.floor(value / 60); // Convertir segundos a minutos
                              const seconds = value % 60; // El resto de segundos
                              return `${minutes}m ${seconds}s`; // Mostrar en formato "X minutos Y segundos"
                            }}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#f97316" name="Temperatura (°C)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* RPM Graph */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h4 className="text-gray-900 mb-3 flex items-center gap-2">
                    <RotateCw className="w-5 h-5 text-blue-500" />
                    Turbina RPM
                  </h4>
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {Math.round(motorRPM)}
                  </div>
                  <div className="h-32 min-h-[256px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={rpmData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="time"
                            label={{ value: 'Tiempo (min)', position: 'insideBottom', offset: -5 }}
                            tickFormatter={(value) => {
                              const minutes = Math.floor(value / 60); // Convertir segundos a minutos
                              const seconds = value % 60; // El resto de segundos
                              return `${minutes}m ${seconds}s`; // Mostrar en formato "X minutos Y segundos"
                            }}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#3b82f6" name="RPM" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Panel */}
            <div className="space-y-6">
              {/* Stage 1: Tank Recirculation */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    1
                  </div>
                  Homogeneización de la solución
                </h4>

                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    Tanque de suministro: <span className={`font-bold ${supplyLevelWarning ? 'text-red-600' : 'text-green-600'}`}>
                    {supplyTankLevel.toFixed(1)}L
                  </span>
                    {supplyLevelWarning && (
                        <span className="text-red-600 text-xs block mt-1">
                      ⚠ Se requiere un mínimo de 10 litros
                    </span>
                    )}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                      onClick={handleStartTankRecirculation}
                      disabled={tankRecirculating || (stage != 0 && stage != 1) || supplyLevelWarning}
                      className={`w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                          tankRecirculating || (stage != 0 && stage != 1) || supplyLevelWarning
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md'
                      }`}
                  >
                    <Play className="w-5 h-5" />
                    Iniciar recirculación
                  </button>

                  <button
                      onClick={handleStopTankRecirculation}
                      disabled={!tankRecirculating}
                      className={`w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                          !tankRecirculating
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-red-500 hover:bg-red-600 text-white shadow-md'
                      }`}
                  >
                    <Square className="w-5 h-5" />
                    Detener recirculación
                  </button>
                </div>
              </div>

              {/* Stage 2: Transfer to Reactor */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    2
                  </div>
                  Transferencia al reactor
                </h4>

                <div className="mb-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    Reactor: <span className={`font-bold ${reactorLevel >= REACTOR_MIN ? 'text-green-600' : 'text-orange-600'}`}>
                    {reactorLevel.toFixed(1)}L / {REACTOR_TARGET}L
                  </span>
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Auto-stop a los 5 litros
                  </p>
                </div>

                <button
                    onClick={handleStartTransfer}
                    disabled={tankRecirculating || transferActive || stage !== 1 || supplyLevelWarning || reactorLevel >= REACTOR_TARGET}
                    className={`w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                        tankRecirculating || transferActive || stage !== 1 || supplyLevelWarning || reactorLevel >= REACTOR_TARGET
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600 text-white shadow-md'
                    }`}
                >
                  <ArrowDown className="w-5 h-5" />
                  {transferActive ? 'Transfiriendo...' : 'Iniciar transferencia'}
                </button>
              </div>

              {/* Stage 3: Reactor Controls */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                    3
                  </div>
                  Panel de control del reactor
                </h4>

                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Temperatura (°C)</label>
                    <input
                        type="number"
                        value={targetTemp}
                        disabled={stage < 2 && stage > 3}
                        onChange={(e) => setTargetTemp(Number(e.target.value))}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                            stage < 2 && stage > 3 ?
                              'text-gray-400 border-gray-200' : 'text-gray-600 border-gray-300' 
                        }`}
                        min="0"
                        max={REACTOR_TEMP_MAX}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">RPM</label>
                    <input
                        type="number"
                        value={targetRPM}
                        disabled={stage < 2 && stage > 3}
                        onChange={(e) => setTargetRPM(Number(e.target.value))}
                        className={`w-full px-4 py-2 border text rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                            stage < 2 && stage > 3 ?
                              'text-gray-400 border-gray-200' : 'text-gray-600 border-gray-300' 
                        }`}
                        min="0"
                        max={REACTOR_RPM_MAX}
                    />
                  </div>
                </div>

                {reactorLevelWarning && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Minimum 4L required
                      </p>
                    </div>
                )}

                <div className="space-y-3">
                  <button
                      onClick={handleToggleHeating}
                      disabled={stage < 2 && stage > 3}
                      className={`w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                          stage < 2 && stage > 3
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : reactorHeating
                                  ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md'
                                  : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                      }`}
                  >
                    <Flame className="w-5 h-5" />
                    Calentamiento: {reactorHeating ? 'ON' : 'OFF'}
                  </button>

                  <button
                      onClick={handleToggleReactorRecirculation}
                      disabled={stage !== 2 && stage !== 3}
                      className={`w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                          stage !== 2 && stage !== 3
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : reactorRecirculating
                                  ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-md'
                                  : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                      }`}
                  >
                    <RotateCw className="w-5 h-5" />
                    Recirculation: {reactorRecirculating ? 'ON' : 'OFF'}
                  </button>

                  <button
                      onClick={handleToggleReactorMotor}
                      disabled={stage !== 2 && stage !== 3}
                      className={`w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                          stage !== 2 && stage !== 3
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : reactorMotor
                                  ? 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-md'
                                  : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                      }`}
                  >
                    <RotateCw className="w-5 h-5" />
                    Turbina: {reactorMotor ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>


              {/* Indicators */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="text-gray-900 mb-4">Indicadores</h4>
                <div className="space-y-4">
                  {/* Motor RPM */}
                  <div className={`p-4 rounded-lg ${rpmWarning ? 'bg-red-50 border-2 border-red-200' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Zap className={`w-5 h-5 ${rpmWarning ? 'text-red-500' : 'text-yellow-500'}`} />
                        <span>Turbina RPM</span>
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
                        <span>Temperatura</span>
                        {tempWarning && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">{temperature.toFixed(1)}°C</div>
                        <div className="text-xs text-gray-500">Configurado: {targetTemp}°C</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                          className="bg-orange-500 h-2 rounded-full transition-all"
                          style={{ width: `${(temperature / REACTOR_TEMP_MAX) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Liquid Quantity */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Droplet className="w-5 h-5 text-blue-500" />
                        <span>Volumen del reactor</span>
                      </div>
                      <span className="text-xl font-bold text-gray-900">{reactorLevel.toFixed(1)} litros</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${(reactorLevel / REACTOR_MAX) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Conductivity */}
                  <div className={`p-4 rounded-lg ${conductivityWarning ? 'bg-red-50 border-2 border-red-200' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Zap className={`w-5 h-5 ${conductivityWarning ? 'text-red-500' : 'text-purple-500'}`} />
                        <span>Conductividad</span>
                        {conductivityWarning && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      </div>
                      <span className="text-xl font-bold text-gray-900">{stage == 3 || stage == 5 ? conductivity.toFixed(2) : 0} mS/cm</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                          className={`h-2 rounded-full transition-all ${conductivityWarning ? 'bg-red-500' : 'bg-purple-500'}`}
                          style={{ width: `${Math.min(((stage == 3 || stage == 5 ? conductivity.toFixed(2) : 0) / 5) * 100, 100)}%` }}
                      />
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
