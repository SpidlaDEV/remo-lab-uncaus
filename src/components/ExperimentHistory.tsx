import { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronRight, Building2, User, Clock, Beaker } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import React from 'react';

interface HistorialExperimentosProps {
  onBack: () => void;
}

const experimentosMock: Experimento[] = [
  {
    id: 'EXP-001',
    institucion: 'Universidad Nacional del Chaco Austral',
    instructor: 'Dra. María García',
    estudiante: 'Juan Pérez',
    duracion: 1845,
    fecha: '2025-12-08',
    laboratorio: 'Sistema CIP',
    estado: 'exito',
    metodos: {
      temperaturaPromedio: 78.5,
      temperaturaMaxima: 82.1,
      conductividadPromedio: 1.8,
      rpmPromedio: 145,
      volumenTotal: 450
    },
    datosSerieTemporal: [
      { tiempo: 0, temperatura: 25, conductividad: 1.2, rpm: 0 },
      { tiempo: 300, temperatura: 45, conductividad: 1.4, rpm: 145 },
      { tiempo: 600, temperatura: 65, conductividad: 1.6, rpm: 145 },
      { tiempo: 900, temperatura: 75, conductividad: 1.8, rpm: 145 },
      { tiempo: 1200, temperatura: 80, conductividad: 1.9, rpm: 145 },
      { tiempo: 1500, temperatura: 82, conductividad: 1.8, rpm: 145 },
      { tiempo: 1800, temperatura: 80, conductividad: 1.7, rpm: 145 }
    ]
  },
  {
    id: 'EXP-002',
    institucion: 'UTN - Santa Fé',
    instructor: 'Prof. Roberto Chen',
    estudiante: 'Emma Johnson',
    duracion: 2140,
    fecha: '2025-12-07',
    laboratorio: 'Sistema CIP',
    estado: 'exito',
    metodos: {
      temperaturaPromedio: 82.3,
      temperaturaMaxima: 85.4,
      conductividadPromedio: 2.1,
      rpmPromedio: 160,
      volumenTotal: 5.00
    },
    datosSerieTemporal: [
      { tiempo: 0, temperatura: 28, conductividad: 1.9, rpm: 0 },
      { tiempo: 300, temperatura: 52, conductividad: 2.0, rpm: 160 },
      { tiempo: 600, temperatura: 70, conductividad: 2.1, rpm: 160 },
      { tiempo: 900, temperatura: 80, conductividad: 2.2, rpm: 160 },
      { tiempo: 1200, temperatura: 84, conductividad: 2.3, rpm: 160 },
      { tiempo: 1500, temperatura: 85, conductividad: 2.4, rpm: 160 },
      { tiempo: 1800, temperatura: 84, conductividad: 2.3, rpm: 160 },
      { tiempo: 2100, temperatura: 82, conductividad: 2.2, rpm: 160 }
    ]
  },
  {
    id: 'EXP-003',
    institucion: 'Universidad Nacional del Chaco Austral',
    instructor: 'Dra. María García',
    estudiante: 'Miguel Rodríguez',
    duracion: 1520,
    fecha: '2025-12-07',
    laboratorio: 'Sistema CIP',
    estado: 'advertencia',
    metodos: {
      temperaturaPromedio: 75.2,
      temperaturaMaxima: 79.8,
      conductividadPromedio: 2.6,
      rpmPromedio: 175,
      volumenTotal: 5.2
    },
    datosSerieTemporal: [
      { tiempo: 0, temperatura: 23, conductividad: 2.4, rpm: 0 },
      { tiempo: 300, temperatura: 48, conductividad: 2.5, rpm: 175 },
      { tiempo: 600, temperatura: 65, conductividad: 2.6, rpm: 175 },
      { tiempo: 900, temperatura: 74, conductividad: 2.7, rpm: 175 },
      { tiempo: 1200, temperatura: 78, conductividad: 2.8, rpm: 175 },
      { tiempo: 1500, temperatura: 79, conductividad: 2.6, rpm: 175 }
    ]
  },
  {
    id: 'EXP-004',
    institucion: 'Universidad Nacional de La Plata',
    instructor: 'Dra. Sara Williams',
    estudiante: 'Sofía Martínez',
    duracion: 1980,
    fecha: '2025-12-06',
    laboratorio: 'Sistema CIP',
    estado: 'exito',
    metodos: {
      temperaturaPromedio: 80.1,
      temperaturaMaxima: 83.5,
      conductividadPromedio: 1.9,
      rpmPromedio: 150,
      volumenTotal: 4.75
    },
    datosSerieTemporal: [
      { tiempo: 0, temperatura: 26, conductividad: 1.5, rpm: 0 },
      { tiempo: 300, temperatura: 50, conductividad: 1.6, rpm: 150 },
      { tiempo: 600, temperatura: 70, conductividad: 1.7, rpm: 150 },
      { tiempo: 900, temperatura: 80, conductividad: 1.8, rpm: 150 },
      { tiempo: 1200, temperatura: 82, conductividad: 1.9, rpm: 150 },
      { tiempo: 1500, temperatura: 83, conductividad: 2.0, rpm: 150 },
      { tiempo: 1800, temperatura: 81, conductividad: 1.9, rpm: 150 },
      { tiempo: 1950, temperatura: 80, conductividad: 1.8, rpm: 150 }
    ]
  },
  {
    id: 'EXP-005',
    institucion: 'Universidad Nacional del Chaco Austral',
    instructor: 'Prof. David Lee',
    estudiante: 'Oliver Davis',
    duracion: 890,
    fecha: '2025-12-06',
    laboratorio: 'Sistema CIP',
    estado: 'error',
    metodos: {
      temperaturaPromedio: 45.2,
      temperaturaMaxima: 48.1,
      conductividadPromedio: 1.3,
      rpmPromedio: 185,
      volumenTotal: 5.2
    },
    datosSerieTemporal: [
      { tiempo: 0, temperatura: 22, conductividad: 1.0, rpm: 0 },
      { tiempo: 300, temperatura: 35, conductividad: 1.2, rpm: 85 },
      { tiempo: 600, temperatura: 42, conductividad: 1.3, rpm: 85 },
      { tiempo: 890, temperatura: 45, conductividad: 1.4, rpm: 85 }
    ]
  },
  {
    id: 'EXP-006',
    institucion: 'UTN - Santa Fé',
    instructor: 'Prof. Roberto Chen',
    estudiante: 'Ava Wilson',
    duracion: 2250,
    fecha: '2025-12-05',
    laboratorio: 'Sistema CIP',
    estado: 'exito',
    metodos: {
      temperaturaPromedio: 81.5,
      temperaturaMaxima: 84.2,
      conductividadPromedio: 2.0,
      rpmPromedio: 155,
      volumenTotal: 4.9
    },
    datosSerieTemporal: [
      { tiempo: 0, temperatura: 30, conductividad: 1.8, rpm: 0 },
      { tiempo: 300, temperatura: 55, conductividad: 1.9, rpm: 155 },
      { tiempo: 600, temperatura: 70, conductividad: 2.0, rpm: 155 },
      { tiempo: 900, temperatura: 80, conductividad: 2.1, rpm: 155 },
      { tiempo: 1200, temperatura: 82, conductividad: 2.2, rpm: 155 },
      { tiempo: 1500, temperatura: 84, conductividad: 2.3, rpm: 155 },
      { tiempo: 1800, temperatura: 83, conductividad: 2.2, rpm: 155 },
      { tiempo: 2100, temperatura: 81, conductividad: 2.1, rpm: 155 }
    ]
  },
  {
    id: 'EXP-007',
    institucion: 'Universidad Nacional de Córdoba',
    instructor: 'Dra. Laura Martínez',
    estudiante: 'Carlos Gómez',
    duracion: 2030,
    fecha: '2025-12-10',
    laboratorio: 'Sistema CIP',
    estado: 'exito',
    metodos: {
      temperaturaPromedio: 79.0,
      temperaturaMaxima: 83.0,
      conductividadPromedio: 2.3,
      rpmPromedio: 170,
      volumenTotal: 4.6
    },
    datosSerieTemporal: [
      { tiempo: 0, temperatura: 24, conductividad: 2.1, rpm: 0 },
      { tiempo: 300, temperatura: 48, conductividad: 2.2, rpm: 150 },
      { tiempo: 600, temperatura: 65, conductividad: 2.3, rpm: 150 },
      { tiempo: 900, temperatura: 74, conductividad: 2.4, rpm: 150 },
      { tiempo: 1200, temperatura: 80, conductividad: 2.5, rpm: 150 },
      { tiempo: 1500, temperatura: 82, conductividad: 2.6, rpm: 150 },
      { tiempo: 1800, temperatura: 83, conductividad: 2.6, rpm: 150 },
      { tiempo: 2000, temperatura: 81, conductividad: 2.4, rpm: 150 }
    ]
  }
];


export function ExperimentHistory({ onBack }: HistorialExperimentosProps) {
  const [idExpandido, setIdExpandido] = useState<string | null>(null);
  const [filtroInstitucion, setFiltroInstitucion] = useState<string>('Todos');

  const instituciones = ['Todos', ...Array.from(new Set(experimentosMock.map(e => e.institucion)))];

  const experimentosFiltrados = experimentosMock.filter(exp =>
      filtroInstitucion === 'Todos' || exp.institucion === filtroInstitucion
  );

  const formatearDuracion = (segundos: number) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segundosRestantes = segundos % 60;
    return `${horas}h ${minutos}m ${segundosRestantes}s`;
  };

  const alternarExpandir = (id: string) => {
    setIdExpandido(idExpandido === id ? null : id);
  };

  // Estadísticas resumen
  const datosResumen = [
    {
      nombre: 'Temperatura',
      promedio: experimentosFiltrados.reduce((suma, exp) => suma + exp.metodos.temperaturaPromedio, 0) / experimentosFiltrados.length,
      max: Math.max(...experimentosFiltrados.map(exp => exp.metodos.temperaturaMaxima))
    },
    {
      nombre: 'Conductividad',
      promedio: experimentosFiltrados.reduce((suma, exp) => suma + exp.metodos.conductividadPromedio, 0) / experimentosFiltrados.length,
      max: Math.max(...experimentosFiltrados.map(exp => exp.metodos.conductividadPromedio))
    },
    {
      nombre: 'RPM',
      promedio: experimentosFiltrados.reduce((suma, exp) => suma + exp.metodos.rpmPromedio, 0) / experimentosFiltrados.length,
      max: Math.max(...experimentosFiltrados.map(exp => exp.metodos.rpmPromedio))
    }
  ];

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Encabezado */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-gray-900">Historial de Experimentos</h3>
                <p className="text-sm text-gray-500">Revisa los experimentos de laboratorio anteriores y sus resultados</p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Estadísticas de Resumen */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h4 className="text-gray-900 mb-4">Resumen de Desempeño</h4>
            <div className="h-64 min-h-[256px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosResumen}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="promedio" fill="#10b981" name="Promedio" />
                  <Bar dataKey="max" fill="#3b82f6" name="Máximo" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <h4 className="text-gray-900">Filtrar por Institución</h4>
              <select
                  value={filtroInstitucion}
                  onChange={(e) => setFiltroInstitucion(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {instituciones.map(inst => (
                    <option key={inst} value={inst}>{inst}</option>
                ))}
              </select>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                Mostrando {experimentosFiltrados.length} experimentos
              </p>
            </div>
          </div>

          {/* Tabla de Experimentos */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-50 to-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-700">Expandir</th>
                  <th className="px-6 py-4 text-left text-gray-700">ID del Experimento</th>
                  <th className="px-6 py-4 text-left text-gray-700">Institución</th>
                  <th className="px-6 py-4 text-left text-gray-700">Instructor</th>
                  <th className="px-6 py-4 text-left text-gray-700">Estudiante</th>
                  <th className="px-6 py-4 text-left text-gray-700">Fecha</th>
                  <th className="px-6 py-4 text-left text-gray-700">Duración</th>
                  <th className="px-6 py-4 text-left text-gray-700">Estado</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {experimentosFiltrados.map((exp) => (
                    <React.Fragment key={exp.id}>
                      <tr
                          className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <button
                              onClick={() => alternarExpandir(exp.id)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            {idExpandido === exp.id ? (
                                <ChevronDown className="w-5 h-5 text-gray-600" />
                            ) : (
                                <ChevronRight className="w-5 h-5 text-gray-600" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-gray-900">{exp.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Building2 className="w-4 h-4 text-blue-600" />
                            {exp.institucion}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{exp.instructor}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <User className="w-4 h-4 text-green-600" />
                            {exp.estudiante}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{exp.fecha}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="w-4 h-4 text-gray-500" />
                            {formatearDuracion(exp.duracion)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs ${
                            exp.estado === 'exito' ? 'bg-green-100 text-green-700' :
                                exp.estado === 'advertencia' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                        }`}>
                          {exp.estado.charAt(0).toUpperCase() + exp.estado.slice(1)}
                        </span>
                        </td>
                      </tr>

                      {idExpandido === exp.id && (
                          <tr>
                            <td colSpan={8} className="px-6 py-6 bg-gray-50">
                              <div className="space-y-6">
                                {/* Cuadrícula de Métricas */}
                                <div>
                                  <h4 className="text-gray-900 mb-4 flex items-center gap-2">
                                    <Beaker className="w-5 h-5 text-green-600" />
                                    Métricas del Experimento
                                  </h4>
                                  <div className="grid md:grid-cols-5 gap-4">
                                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                                      <p className="text-sm text-gray-600 mb-1">Temp. Promedio</p>
                                      <p className={`text-xl ${
                                          exp.metodos.temperaturaPromedio >= 75 && exp.metodos.temperaturaPromedio <= 85
                                              ? 'text-green-600'
                                              : 'text-red-600'
                                      }`}>
                                        {exp.metodos.temperaturaPromedio.toFixed(1)}°C
                                      </p>
                                    </div>
                                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                                      <p className="text-sm text-gray-600 mb-1">Temp. Máxima</p>
                                      <p className={`text-xl ${
                                          exp.metodos.temperaturaMaxima <= 90 ? 'text-green-600' : 'text-red-600'
                                      }`}>
                                        {exp.metodos.temperaturaMaxima.toFixed(1)}°C
                                      </p>
                                    </div>
                                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                                      <p className="text-sm text-gray-600 mb-1">Conductividad Promedio</p>
                                      <p className={`text-xl ${
                                          exp.metodos.conductividadPromedio <= 2.5 ? 'text-green-600' : 'text-red-600'
                                      }`}>
                                        {exp.metodos.conductividadPromedio.toFixed(2)} mS/cm
                                      </p>
                                    </div>
                                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                                      <p className="text-sm text-gray-600 mb-1">RPM Promedio</p>
                                      <p className={`text-xl ${
                                          exp.metodos.rpmPromedio <= 200 ? 'text-green-600' : 'text-red-600'
                                      }`}>
                                        {Math.round(exp.metodos.rpmPromedio)}
                                      </p>
                                    </div>
                                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                                      <p className="text-sm text-gray-600 mb-1">Volumen Total</p>
                                      <p className="text-xl text-blue-600">
                                        {exp.metodos.volumenTotal} litros
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Gráfico de Serie Temporal */}
                                {exp.datosSerieTemporal && (
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                      <h4 className="text-gray-900 mb-4">Cronología del Experimento</h4>
                                      <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                          <LineChart data={exp.datosSerieTemporal}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="tiempo"
                                                label={{ value: 'Tiempo (s)', position: 'insideBottom', offset: -5 }}
                                            />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="temperatura"
                                                stroke="#10b981"
                                                name="Temperatura (°C)"
                                                strokeWidth={2}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="conductividad"
                                                stroke="#3b82f6"
                                                name="Conductividad (mS/cm)"
                                                strokeWidth={2}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="rpm"
                                                stroke="#f59e0b"
                                                name="RPM"
                                                strokeWidth={2}
                                            />
                                          </LineChart>
                                        </ResponsiveContainer>
                                      </div>
                                    </div>
                                )}
                              </div>
                            </td>
                          </tr>
                      )}
                    </React.Fragment>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
  );
}
