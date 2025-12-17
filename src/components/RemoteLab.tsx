import {useEffect, useState} from 'react';
import {
    AlertTriangle,
    ArrowDown,
    ArrowLeft,
    ArrowUp,
    Clock,
    Droplet,
    Flame,
    Microscope,
    OctagonX,
    Play,
    RotateCw,
    Square,
    Star,
    Thermometer,
    Zap
} from 'lucide-react';
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import video from '../public/Chemical_Reactor_Video_Generation.mp4';

interface RemoteLabProps {
    labId: string;
    onBack: () => void;
    onViewHistory: () => void;
}

interface MetricData {
    time: number;
    value: number;
}

enum ProcessState {
    INITIAL = 0,
    COMPLETED = 1,
    TANK_MIXING = 10,
    TANK_MIXED = 11,
    TRANSFERRING = 20,
    TRANSFERRING_COMPLETED = 21,
    REACTOR_MIXING = 30,
    REACTOR_DRAIN = 31,
}

// Tank capacities
const SUPPLY_MAX = 20;                        // Max 20 liters
const SUPPLY_MIN = 8;                         // Min 8 liters
const REACTOR_MAX = 6;                        // Max 6 liters
const REACTOR_TARGET = 5;                     // Target 5 liters
const REACTOR_MIN = 4;                        // Min 4 liters
const REACTOR_RPM_MAX = 1200;                 // 1200 RPM
const REACTOR_TEMP_MAX = 125;                 // 125 °C

export function RemoteLab({labId, onBack, onViewHistory}: RemoteLabProps) {
    // Process stage
    const [running, setRunning] = useState(false);
    const [stage, setStage] = useState<ProcessState>(ProcessState.INITIAL);
    const [duration, setDuration] = useState(0);
    const [cycles, setCycles] = useState(1);

    // Tank levels (in liters)
    const [supplyTankLevel, setSupplyTankLevel] = useState(18); // Start with 18 litros
    const [reactorLevel, setReactorLevel] = useState(0);

    // Controls
    const [tankRecirculating, setTankRecirculating] = useState(false);
    const [transferActive, setTransferActive] = useState(false);
    const [reactorHeating, setReactorHeating] = useState(false);
    const [reactorAgitador, setReactorAgitador] = useState(false);
    const [reactorRecirculating, setReactorRecirculating] = useState(false);

    // Current values
    const [targetTemp, setTargetTemp] = useState(85);
    const [targetRPM, setTargetRPM] = useState(550);

    // Measurements
    const [temperature, setTemperature] = useState(25);
    const [conductivity, setConductivity] = useState(0);
    const [conductivityMax, setConductivityMax] = useState(0);
    const [agitadorRPM, setAgitadorRPM] = useState(0);

    // Chart data
    const [tempData, setTempData] = useState<MetricData[]>([]);
    const [conductivityData, setConductivityData] = useState<MetricData[]>([]);
    const [rpmData, setRpmData] = useState<MetricData[]>([]);

    // Warnings
    const supplyLevelWarning: boolean = supplyTankLevel < (SUPPLY_MIN - reactorLevel);
    const reactorLevelWarning: boolean = stage == ProcessState.REACTOR_MIXING && reactorLevel < REACTOR_MIN;
    const tempWarning: boolean = Math.abs(temperature - setTemperature) > 10 && running;
    const rpmWarning: boolean = agitadorRPM > REACTOR_RPM_MAX;

    // Get States Simulation
    const isRunning: boolean = running && stage != ProcessState.INITIAL;
    const isStopped: boolean = !running && stage != ProcessState.INITIAL;

    const canSupplyMixing: boolean = (stage == ProcessState.TANK_MIXING || stage == ProcessState.TANK_MIXED) && !supplyLevelWarning;
    const canTransfer: boolean = [ProcessState.TANK_MIXED, ProcessState.TRANSFERRING, ProcessState.TRANSFERRING_COMPLETED].includes(stage);

    const isReactorInLimits: boolean = reactorLevel >= REACTOR_MIN && reactorLevel < REACTOR_MAX;
    const canStopTransfer: boolean = transferActive && isReactorInLimits;

    const canReactorAction: boolean = isRunning && [ProcessState.TRANSFERRING, ProcessState.TRANSFERRING_COMPLETED, ProcessState.REACTOR_MIXING, ProcessState.REACTOR_DRAIN].includes(stage);
    const canReactorRecirculation: boolean = isRunning && [ProcessState.TRANSFERRING_COMPLETED, ProcessState.REACTOR_MIXING].includes(stage);
    const canReactorDrain: boolean = isRunning && [ProcessState.REACTOR_MIXING, ProcessState.REACTOR_DRAIN].includes(stage);

    // Process simulation
    useEffect(() => {
        let interval: number;

        if (running) {
            interval = window.setInterval(() => {
                setDuration(t => t + 1);

                if (stage == ProcessState.TRANSFERRING) {
                    // Transfer from tank to reactor
                    if (transferActive) {
                        if (supplyTankLevel >= SUPPLY_MIN && reactorLevel < REACTOR_MAX) {
                            const transferAmount: number = Math.min(supplyTankLevel, (REACTOR_MAX - reactorLevel), randomBetween());

                            if (transferAmount > 0) {
                                setSupplyTankLevel(prev => prev - transferAmount);
                                setReactorLevel(prev => prev + transferAmount);
                            }

                            if (reactorLevel + transferAmount >= REACTOR_MAX) {
                                setTransferActive(false);
                                setStage(ProcessState.REACTOR_MIXING);
                            }
                        }
                    }

                    if (reactorLevel > 0 && transferActive) {
                        if (cycles > 1) return;
                        // Calcula el valor de Y para una curva de crecimiento logarítmico.
                        // conductivityData es el valor de entrada
                        // Amplitud de 5 para valores "altos", es el factor para escalar qué tan "alto" llega la curva
                        const value: number = (5 + randomBetween()) * Math.log(conductivityData.length + 1);
                        setConductivity(value);
                        if (conductivity > conductivityMax) setConductivityMax(value);
                    }
                }

                // Reactor recirculation. Recirculation reduces conductivity
                if (stage == ProcessState.TRANSFERRING_COMPLETED || stage == ProcessState.REACTOR_MIXING) {
                    setConductivity(c => {
                        let decrement: number = 0;

                        const limit: number = conductivityMax * 0.55;

                        if (c <= limit) {
                            decrement = randomBetween(0.0, 0.1);
                        } else {
                            if (reactorAgitador && reactorHeating && reactorRecirculating) {
                                decrement = randomBetween(0.5, 1.2);
                            } else if (reactorRecirculating && (reactorAgitador || reactorHeating)) {
                                decrement = randomBetween(0.4, 1.0);
                            } else if (reactorRecirculating) {
                                decrement = randomBetween(0.4, 0.8);
                            } else if (reactorAgitador && reactorHeating) {
                                decrement = randomBetween(0.3, 0.5);
                            } else if (reactorAgitador || reactorHeating) {
                                decrement = randomBetween(0.0, 0.1);
                            }
                        }

                        // Asegurarse que no baje de 0
                        const newValue = Math.max(c - decrement, 0);

                        // End practice when conductivity near zero
                        if (newValue <= 0.1) {
                            setStage(ProcessState.COMPLETED);
                            setRunning(false);
                            setReactorRecirculating(false);
                            setReactorHeating(false);
                            setReactorAgitador(false);
                        }

                        return newValue;
                    });
                }

                // Reactor agitador
                if (reactorAgitador) {
                    setAgitadorRPM(prev => Math.min(prev + 5, targetRPM));
                } else {
                    setAgitadorRPM(prev => Math.max(prev - 10, 0));
                }

                // Reactor heating
                if (reactorHeating && reactorLevel > 0) {
                    setTemperature(prev => Math.min(prev + 0.5, targetTemp));
                } else {
                    setTemperature(prev => Math.max(prev - 0.3, 25));
                }

                if (stage == ProcessState.REACTOR_DRAIN) {
                    setReactorLevel(l => {
                        const newLevel: number = Math.max(l - randomBetween(), 0);
                        if (newLevel <= 0) {
                            setStage(ProcessState.TANK_MIXING);
                            setCycles(p => p + 1);
                            setReactorAgitador(false);
                            setReactorHeating(false);
                            setConductivityMax(conductivity);
                        }
                        return newLevel;
                    });
                }

                // Update chart data
                setTempData(prev => [...prev, {time: duration, value: temperature}].slice(-30));
                setConductivityData(prev => [...prev, {time: duration, value: conductivity}].slice(-30));
                setRpmData(prev => [...prev, {time: duration, value: agitadorRPM}].slice(-30));
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [duration, tankRecirculating, transferActive, reactorHeating, reactorRecirculating, stage, supplyTankLevel, reactorLevel, temperature, conductivity, agitadorRPM]);

    const handleStartExperience = (): void => {
        if (!isRunning) {
            setRunning(true);
            setStage(ProcessState.TANK_MIXING);
        } else {
            setRunning(false);
            setTankRecirculating(false);
            setTransferActive(false);
            setReactorRecirculating(false);
            setReactorHeating(false);
            setReactorAgitador(false);
        }
    }

    const handleTankRecirculation = (): void => {
        setTankRecirculating(!tankRecirculating);
        setStage(tankRecirculating ? ProcessState.TANK_MIXED : ProcessState.TANK_MIXING);
    };

    const handleStartTransfer = (): void => {
        if (![ProcessState.TANK_MIXED, ProcessState.TRANSFERRING, ProcessState.TRANSFERRING_COMPLETED].includes(stage) && supplyTankLevel < SUPPLY_MIN) return;
        if (reactorLevel > 0 && !isReactorInLimits) return;

        if (transferActive) {
            setTransferActive(false);
            setStage(isReactorInLimits ? ProcessState.TRANSFERRING_COMPLETED : ProcessState.TANK_MIXED);

            if (reactorLevel <= REACTOR_MIN) {
                setReactorAgitador(false);
                setReactorHeating(false);
            }
        } else {
            setStage(ProcessState.TRANSFERRING);
            setTransferActive(true);
            // Activación automática de la camisa térmica y del agitador
            setReactorAgitador(true);
            setReactorHeating(true);
        }
    };

    const handleToggleHeating = (): void => {
        setReactorHeating(!reactorHeating);
    };

    const handleToggleReactorRecirculation = (): void => {
        if (stage != ProcessState.REACTOR_MIXING || stage != ProcessState.REACTOR_DRAIN) {
            setStage(ProcessState.REACTOR_MIXING);
        }
        setReactorRecirculating(!reactorRecirculating);
    };

    const handleToggleReactorAgitador = (): void => {
        setReactorAgitador(!reactorAgitador);
    };

    const handleDrainReactor = (): void => {
        setStage(ProcessState.REACTOR_DRAIN);
        setReactorRecirculating(false);
    }

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getStageDescription = (): string => {
        switch (stage) {
            case ProcessState.INITIAL:
                return 'Listo para comenzar - Inicia la recirculación del tanque';
            case ProcessState.TANK_MIXING:
            case ProcessState.TANK_MIXED:
                return `Ciclo ${cycles} - Etapa 1: Mezclando la sustancia en el tanque de suministro`;
            case ProcessState.TRANSFERRING:
            case ProcessState.TRANSFERRING_COMPLETED:
                return `Ciclo ${cycles} - Etapa 2: Transfiriendo al reactor`;
            case ProcessState.REACTOR_MIXING:
                return `Ciclo ${cycles} - Etapa 3: Recirculación del reactor hasta que la conductividad ≈ 0`;
            case ProcessState.REACTOR_DRAIN:
                return `Ciclo ${cycles} - Etapa 4: Drenaje`;
            case ProcessState.COMPLETED:
                return '¡Práctica completada!';
            default:
                return '';
        }
    };

    // Intervals
    const randomBetween = (min: number = 0.1, max: number = 0.3): number => {
        return +(Math.random() * (max - min) + min).toFixed(2);
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                                <Microscope className="w-6 h-6 text-white"/>
                            </div>
                            <div>
                                <h3 className="text-green-600">LabRemote</h3>
                                <p className="text-xs text-gray-500">Universidad Nacional del Chaco Austral</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="mx-auto px-6 mt-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5"/>
                        </button>

                        <div>
                            <h3 className="text-gray-900">Sistema CIP (Limpieza en el Lugar)</h3>
                            <p className="text-sm text-gray-500">Sistema de limpieza industrial para procesos
                                alimentarios y químicos con control automatizado</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {(supplyLevelWarning || reactorLevelWarning || tempWarning || rpmWarning) && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-600 rounded-lg w-32">
                                <AlertTriangle className="w-5 h-5"/>
                                <span>Advertencia</span>
                            </div>
                        )}
                        <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg flex items-center gap-2">
                            <Clock className="w-5 h-5"/>
                            <span className="font-mono">{formatTime(duration)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto px-3 py-4">
                <div className="grid lg:grid-cols-5 gap-6">
                    {/* SCADA Visualization */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Stage Indicator */}
                        <div
                            className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl p-3 mb-4 shadow-lg">
                            <div className="items-center justify-between">
                                <p className="text-sm opacity-90">Paso actual</p>
                                <h3 className="text-white">{getStageDescription()}</h3>
                            </div>
                        </div>

                        <div className="scada-container">
                            <div className="video-container">
                                <video className="video" controls autoPlay muted loop>
                                    <source src={video} type="video/mp4"/>
                                    Tu navegador no soporta el formato de video.
                                </video>

                                <video className="video" controls autoPlay muted loop>
                                    <source src={video} type="video/mp4"/>
                                    Tu navegador no soporta el formato de video.
                                </video>
                            </div>

                            {/* Process Overview */}
                            <div
                                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-3 shadow-xl process-container">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-white">Visión general del proceso</h4>

                                    <div className="flex items-center gap-2 text-white">
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500">
                                            {conductivity.toFixed(2)} mS/cm
                                        </div>
                                        <div
                                            className="flex items-center w-20 gap-2 px-3 py-1.5 rounded-lg bg-orange-500">
                                            {temperature.toFixed(1)} °C
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-around py-8">
                                    {/* Supply Tank */}
                                    <div className="relative">
                                        <div className="text-white text-sm mb-3 text-center">Tanque de suministro</div>
                                        <div
                                            className="w-40 h-72 bg-gray-700 rounded-lg relative overflow-hidden border-4 border-gray-600">
                                            {/* Water Level */}
                                            <div
                                                className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-1000"
                                                style={{height: `${(supplyTankLevel / SUPPLY_MAX) * 100}%`}}
                                            >
                                                <div className="absolute inset-0 opacity-30">
                                                    <div className="w-full h-2 bg-blue-300 animate-pulse"/>
                                                </div>
                                            </div>

                                            {/* Tank Recirculation Animation */}
                                            {tankRecirculating && (
                                                <div className="absolute top-4 left-1/2 -translate-x-1/2">
                                                    <RotateCw className="w-8 h-8 text-blue-300 animate-spin"/>
                                                </div>
                                            )}

                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <div className="text-white text-3xl font-bold drop-shadow-lg">
                                                    {supplyTankLevel.toFixed(1)}L
                                                </div>
                                                <div className="text-blue-200 text-sm mt-1">
                                                    {((supplyTankLevel / SUPPLY_MAX) * 100).toFixed(0)}%
                                                </div>
                                            </div>

                                            {/* Level indicator */}
                                            {supplyLevelWarning && (
                                                <div className="absolute top-2 right-2">
                                                    <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse"/>
                                                </div>
                                            )}
                                        </div>

                                        {/* Outlet pipe to reactor */}
                                        <div className="absolute -right-12 bottom-24">
                                            <div
                                                className={`w-12 h-2 ${transferActive ? 'bg-blue-400' : 'bg-gray-600'} transition-colors`}/>
                                            {transferActive && (
                                                <ArrowDown
                                                    className="w-6 h-6 text-blue-400 absolute -right-8 top-1/2 -translate-y-1/2 animate-bounce"/>
                                            )}
                                        </div>
                                    </div>

                                    {/* Reactor */}
                                    <div className="relative">
                                        <div className="text-white text-sm mb-3 text-center">Reactor</div>
                                        <div
                                            className="w-40 h-72 bg-gray-700 rounded-lg relative overflow-hidden border-4 border-gray-600">
                                            {/* Water Level */}
                                            <div
                                                className="absolute bottom-0 w-full bg-gradient-to-t from-green-500 to-green-400 transition-all duration-1000"
                                                style={{height: `${(reactorLevel / REACTOR_MAX) * 100}%`}}
                                            >
                                                <div className="absolute inset-0 opacity-30">
                                                    <div className="w-full h-2 bg-green-300 animate-pulse"/>
                                                </div>
                                            </div>

                                            {/* Mixer Animation */}
                                            {reactorAgitador && reactorLevel > 0 && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="animate-spin" style={{animationDuration: '1s'}}>
                                                        <div className="relative w-24 h-24">
                                                            <div
                                                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-300 rounded-full z-10"/>
                                                            <div
                                                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-1.5 bg-gray-300 rounded"/>
                                                            <div
                                                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-20 bg-gray-300 rounded"/>
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
                                                    <Flame className="w-8 h-8 text-orange-400 animate-pulse"/>
                                                </div>
                                            )}


                                            {/* Reactor Recirculation Indicator */}
                                            {reactorRecirculating && (
                                                <div className="absolute bottom-4 left-3/4 -translate-x-1/2">
                                                    <RotateCw className="w-8 h-8 text-green-700 animate-spin"
                                                              style={{animationDuration: '2s'}}/>
                                                </div>
                                            )}

                                            {/* Level warning */}
                                            {reactorLevelWarning && (
                                                <div className="absolute top-2 right-2">
                                                    <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse"/>
                                                </div>
                                            )}
                                        </div>

                                        {/* Inlet pipe */}
                                        <div className="absolute -left-12 bottom-24">
                                            {transferActive && (
                                                <ArrowUp
                                                    className="w-6 h-6 text-blue-400 absolute -left-8 top-1/2 -translate-y-1/2 animate-bounce"/>
                                            )}
                                            <div
                                                className={`w-12 h-2 ${transferActive ? 'bg-blue-400' : 'bg-gray-600'} transition-colors`}/>
                                        </div>

                                        {/* Agitador indicator */}
                                        <div
                                            className={`absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                                                reactorAgitador ? 'bg-yellow-500' : 'bg-gray-700'
                                            } transition-colors`}>
                                            <Zap
                                                className={`w-4 h-4 ${reactorAgitador ? 'text-white' : 'text-gray-400'}`}/>
                                            <span className="text-xs text-white">Agitador</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Three Separate Graphs */}
                        <div className="grid gap-4">
                            {/* Conductivity Graph */}
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <h4 className="text-gray-900 mb-3 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-purple-500"/>
                                    Conductividad
                                </h4>
                                <div className="text-2xl font-bold mb-2 text-purple-600">
                                    {conductivity.toFixed(2)} mS/cm
                                </div>
                                <div className="h-32 min-h-[256px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={conductivityData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                                            <XAxis
                                                dataKey="time"
                                                label={{value: 'Tiempo (min)', position: 'insideBottom', offset: -5}}
                                                tickFormatter={(value) => {
                                                    const minutes = Math.floor(value / 60); // Convertir segundos a minutos
                                                    const seconds = value % 60; // El resto de segundos
                                                    return `${minutes}m ${seconds}s`; // Mostrar en formato "X minutos Y segundos"
                                                }}
                                            />
                                            <YAxis/>
                                            <Tooltip/>
                                            <Legend/>
                                            <Line type="monotone" dataKey="value" stroke="#a855f7"
                                                  name="Conductividad (mS/cm)" strokeWidth={2}/>
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Temperature Graph */}
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <h4 className="text-gray-900 mb-3 flex items-center gap-2">
                                    <Thermometer className="w-5 h-5 text-orange-500"/>
                                    Temperatura
                                </h4>
                                <div className="text-2xl font-bold text-orange-600 mb-2">
                                    {temperature.toFixed(1)}°C
                                </div>
                                <div className="h-32 min-h-[256px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={tempData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                                            <XAxis
                                                dataKey="time"
                                                label={{value: 'Tiempo (min)', position: 'insideBottom', offset: -5}}
                                                tickFormatter={(value) => {
                                                    const minutes = Math.floor(value / 60); // Convertir segundos a minutos
                                                    const seconds = value % 60; // El resto de segundos
                                                    return `${minutes}m ${seconds}s`; // Mostrar en formato "X minutos Y segundos"
                                                }}
                                            />
                                            <YAxis/>
                                            <Tooltip/>
                                            <Legend/>
                                            <Line type="monotone" dataKey="value" stroke="#f97316"
                                                  name="Temperatura (°C)" strokeWidth={2}/>
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* RPM Graph */}
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <h4 className="text-gray-900 mb-3 flex items-center gap-2">
                                    <RotateCw className="w-5 h-5 text-blue-500"/>
                                    Agitador RPM
                                </h4>
                                <div className="text-2xl font-bold text-blue-600 mb-2">
                                    {Math.round(agitadorRPM)}
                                </div>
                                <div className="h-32 min-h-[256px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={rpmData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                                            <XAxis
                                                dataKey="time"
                                                label={{value: 'Tiempo (min)', position: 'insideBottom', offset: -5}}
                                                tickFormatter={(value) => {
                                                    const minutes = Math.floor(value / 60); // Convertir segundos a minutos
                                                    const seconds = value % 60; // El resto de segundos
                                                    return `${minutes}m ${seconds}s`; // Mostrar en formato "X minutos Y segundos"
                                                }}
                                            />
                                            <YAxis/>
                                            <Tooltip/>
                                            <Legend/>
                                            <Line type="monotone" dataKey="value" stroke="#3b82f6" name="RPM"
                                                  strokeWidth={2}/>
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Controls Panel */}
                    <div className="space-y-6">
                        {/* Stage Initial: Start Experience */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h4 className="text-gray-900 mb-4 flex items-center gap-2">
                                <div
                                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-blue-600">
                                    {(stage == ProcessState.INITIAL) && (
                                        <Star className="text-yellow-400"/>
                                    )}
                                    {(isRunning) && (
                                        <RotateCw className="text-blue-500 animate-spin"/>
                                    )}
                                    {(isStopped) && (
                                        <OctagonX className="text-red-500"/>
                                    )}
                                </div>
                                {stage == 0 ? "¿Listo para empezar?" : running ? "Experiencia en proceso" : "Experiencia detenida"}
                            </h4>

                            <div className="space-y-3">
                                <button onClick={handleStartExperience} disabled={isStopped}
                                        className={`w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                                            stage == ProcessState.INITIAL
                                                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md'
                                                : running
                                                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-md'
                                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        }`}>
                                    {stage == ProcessState.INITIAL && <Play/>}
                                    {stage != ProcessState.INITIAL && <Square className="w-5 h-5"/>}
                                    {stage == ProcessState.INITIAL ? "Iniciar experiencia" : "Detener experiencia"}
                                </button>
                            </div>
                        </div>

                        {/* Stage 1: Tank Recirculation */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h4 className="text-gray-900 mb-4 flex items-center gap-2">
                                <div
                                    className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                    1
                                </div>
                                Homogeneización de la solución
                            </h4>

                            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-gray-700">
                                    Tanque de suministro:
                                    <span
                                        className={`ml-1 font-bold ${supplyLevelWarning ? 'text-red-600' : 'text-green-600'}`}>
                      {supplyTankLevel.toFixed(1)}L
                    </span>
                                    {supplyLevelWarning && (
                                        <span className="text-red-600 text-xs block mt-1">
                        ⚠ Se requiere un mínimo de {SUPPLY_MIN} litros
                    </span>
                                    )}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button onClick={handleTankRecirculation} disabled={!canSupplyMixing}
                                        className={`w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                                            tankRecirculating
                                                ? 'bg-red-500 hover:bg-red-600 text-white shadow-md'
                                                : canSupplyMixing
                                                    ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md'
                                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        }`}>
                                    {stage == ProcessState.TANK_MIXING && tankRecirculating && <Square/>}
                                    {stage == ProcessState.TRANSFERRING && !tankRecirculating && <Play/>}
                                    {tankRecirculating ? 'Detener' : 'Iniciar'} recirculación
                                </button>
                            </div>
                        </div>

                        {/* Stage 2: Transfer to Reactor */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h4 className="text-gray-900 mb-4 flex items-center gap-2">
                                <div
                                    className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                    2
                                </div>
                                Transferencia al reactor
                            </h4>

                            <div className="mb-4 p-3 bg-green-50 rounded-lg">
                                <p className="text-sm text-gray-700">
                                    Reactor: <span
                                    className={`font-bold ${reactorLevel >= REACTOR_MIN ? 'text-green-600' : 'text-orange-600'}`}>
                    {reactorLevel.toFixed(1)}L / {REACTOR_TARGET}L
                  </span>
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                    Auto-stop a los {REACTOR_MAX} litros
                                </p>
                            </div>

                            <button
                                onClick={handleStartTransfer}
                                disabled={!canTransfer && !isReactorInLimits}
                                className={`w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                                    transferActive
                                        ? isReactorInLimits
                                            ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md'
                                            : 'bg-orange-200 text-orange-500 cursor-not-allowed'
                                        : canTransfer
                                            ? 'bg-green-500 hover:bg-green-600 text-white shadow-md'
                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                <ArrowDown className="w-5 h-5"/>
                                {transferActive ? 'Detener transferencia' : 'Iniciar transferencia'}
                            </button>
                        </div>

                        {/* Stage 3: Reactor Controls */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h4 className="text-gray-900 mb-4 flex items-center gap-2">
                                <div
                                    className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                                    3
                                </div>
                                Panel de control del reactor
                            </h4>

                            <div className="space-y-4 mb-4">
                                <div>
                                    <label className="block text-gray-700 mb-2">Temperatura (°C)</label>
                                    <input type="number" value={targetTemp} disabled={!isRunning} min="0"
                                           max={REACTOR_TEMP_MAX}
                                           onChange={(e) => setTargetTemp(Number(e.target.value))}
                                           className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                               isRunning ? 'text-gray-600 border-gray-300' : 'text-gray-400 border-gray-200'
                                           }`}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2">RPM</label>
                                    <input type="number" value={targetRPM} disabled={!isRunning} min="0"
                                           max={REACTOR_RPM_MAX}
                                           onChange={(e) => setTargetRPM(Number(e.target.value))}
                                           className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                               isRunning ? 'text-gray-600 border-gray-300' : 'text-gray-400 border-gray-200'
                                           }`}
                                    />
                                </div>
                            </div>

                            {reactorLevelWarning && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4"/>
                                        Minimum 4L required
                                    </p>
                                </div>
                            )}

                            <div className="space-y-3">
                                <button onClick={handleToggleHeating} disabled={!canReactorAction}
                                        className={`w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                                            canReactorAction
                                                ? reactorHeating
                                                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md'
                                                    : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        }`}>
                                    <Flame className="w-5 h-5"/>
                                    Calentamiento: {reactorHeating ? 'ON' : 'OFF'}
                                </button>

                                <button onClick={handleToggleReactorAgitador} disabled={!canReactorAction}
                                        className={`w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                                            canReactorAction
                                                ? reactorAgitador
                                                    ? 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-md'
                                                    : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        }`}>
                                    <RotateCw className="w-5 h-5"/>
                                    Agitador: {reactorAgitador ? 'ON' : 'OFF'}
                                </button>

                                <button onClick={handleToggleReactorRecirculation} disabled={!canReactorRecirculation}
                                        className={`w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                                            canReactorRecirculation
                                                ? reactorRecirculating
                                                    ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-md'
                                                    : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        }`}>
                                    <RotateCw className="w-5 h-5"/>
                                    Recirculation: {reactorRecirculating ? 'ON' : 'OFF'}
                                </button>

                                <button onClick={handleDrainReactor} disabled={!canReactorDrain}
                                        className={`w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                                            canReactorDrain
                                                ? stage == ProcessState.REACTOR_DRAIN
                                                    ? 'bg-green-300 hover:bg-green-400 text-gray-700'
                                                    : 'bg-green-500 hover:bg-green-600 text-white shadow-md'
                                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        }`}>
                                    <ArrowDown className="w-5 h-5"/>
                                    {stage == ProcessState.REACTOR_DRAIN ? 'Drenando...' : 'Iniciar drenaje'}
                                </button>
                            </div>
                        </div>


                        {/* Indicators */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h4 className="text-gray-900 mb-4">Indicadores</h4>
                            <div className="space-y-4">
                                {/* Agitador RPM */}
                                <div
                                    className={`p-4 rounded-lg ${rpmWarning ? 'bg-red-50 border-2 border-red-200' : 'bg-gray-50'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Zap
                                                className={`w-5 h-5 ${rpmWarning ? 'text-red-500' : 'text-yellow-500'}`}/>
                                            <span>Agitador RPM</span>
                                            {rpmWarning && <AlertTriangle className="w-4 h-4 text-red-500"/>}
                                        </div>
                                        <span
                                            className="text-xl font-bold text-gray-900">{Math.round(agitadorRPM)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all ${rpmWarning ? 'bg-red-500' : 'bg-yellow-500'}`}
                                            style={{width: `${Math.min((agitadorRPM / 250) * 100, 100)}%`}}
                                        />
                                    </div>
                                </div>

                                {/* Temperature */}
                                <div
                                    className={`p-4 rounded-lg ${tempWarning ? 'bg-red-50 border-2 border-red-200' : 'bg-gray-50'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Thermometer
                                                className={`w-5 h-5 ${tempWarning ? 'text-red-500' : 'text-orange-500'}`}/>
                                            <span>Temperatura</span>
                                            {tempWarning && <AlertTriangle className="w-4 h-4 text-red-500"/>}
                                        </div>
                                        <div className="text-right">
                                            <div
                                                className="text-xl font-bold text-gray-900">{temperature.toFixed(1)}°C
                                            </div>
                                            <div className="text-xs text-gray-500">Configurado: {targetTemp}°C</div>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-orange-500 h-2 rounded-full transition-all"
                                            style={{width: `${(temperature / REACTOR_TEMP_MAX) * 100}%`}}
                                        />
                                    </div>
                                </div>

                                {/* Liquid Quantity */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Droplet className="w-5 h-5 text-blue-500"/>
                                            <span>Volumen del reactor</span>
                                        </div>
                                        <span
                                            className="text-xl font-bold text-gray-900">{reactorLevel.toFixed(1)} litros</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full transition-all"
                                            style={{width: `${(reactorLevel / REACTOR_MAX) * 100}%`}}
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
