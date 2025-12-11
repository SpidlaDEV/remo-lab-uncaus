import { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronRight, Building2, User, Clock, Beaker } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import React from 'react';

interface ExperimentHistoryProps {
  onBack: () => void;
}

interface Experiment {
  id: string;
  institution: string;
  instructor: string;
  student: string;
  duration: number;
  date: string;
  laboratory: string;
  status: 'success' | 'warning' | 'error';
  metrics: {
    avgTemperature: number;
    maxTemperature: number;
    avgConductivity: number;
    avgRPM: number;
    totalVolume: number;
  };
  timeSeriesData?: Array<{
    time: number;
    temperature: number;
    conductivity: number;
    rpm: number;
  }>;
}

const mockExperiments: Experiment[] = [
  {
    id: 'EXP-001',
    institution: 'Main Institution',
    instructor: 'Dr. Maria Garcia',
    student: 'John Smith',
    duration: 1845,
    date: '2025-12-08',
    laboratory: 'CIP System',
    status: 'success',
    metrics: {
      avgTemperature: 78.5,
      maxTemperature: 82.1,
      avgConductivity: 1.8,
      avgRPM: 145,
      totalVolume: 450
    },
    timeSeriesData: [
      { time: 0, temperature: 25, conductivity: 1.2, rpm: 0 },
      { time: 300, temperature: 45, conductivity: 1.4, rpm: 145 },
      { time: 600, temperature: 65, conductivity: 1.6, rpm: 145 },
      { time: 900, temperature: 75, conductivity: 1.8, rpm: 145 },
      { time: 1200, temperature: 80, conductivity: 1.9, rpm: 145 },
      { time: 1500, temperature: 82, conductivity: 1.8, rpm: 145 },
      { time: 1800, temperature: 80, conductivity: 1.7, rpm: 145 }
    ]
  },
  {
    id: 'EXP-002',
    institution: 'Partner University A',
    instructor: 'Prof. Robert Chen',
    student: 'Emma Johnson',
    duration: 2140,
    date: '2025-12-07',
    laboratory: 'CIP System',
    status: 'success',
    metrics: {
      avgTemperature: 82.3,
      maxTemperature: 85.4,
      avgConductivity: 2.1,
      avgRPM: 160,
      totalVolume: 500
    }
  },
  {
    id: 'EXP-003',
    institution: 'Main Institution',
    instructor: 'Dr. Maria Garcia',
    student: 'Michael Brown',
    duration: 1520,
    date: '2025-12-07',
    laboratory: 'CIP System',
    status: 'warning',
    metrics: {
      avgTemperature: 75.2,
      maxTemperature: 79.8,
      avgConductivity: 2.6,
      avgRPM: 175,
      totalVolume: 420
    }
  },
  {
    id: 'EXP-004',
    institution: 'Partner University B',
    instructor: 'Dr. Sarah Williams',
    student: 'Sofia Martinez',
    duration: 1980,
    date: '2025-12-06',
    laboratory: 'CIP System',
    status: 'success',
    metrics: {
      avgTemperature: 80.1,
      maxTemperature: 83.5,
      avgConductivity: 1.9,
      avgRPM: 150,
      totalVolume: 475
    }
  },
  {
    id: 'EXP-005',
    institution: 'Main Institution',
    instructor: 'Prof. David Lee',
    student: 'Oliver Davis',
    duration: 890,
    date: '2025-12-06',
    laboratory: 'CIP System',
    status: 'error',
    metrics: {
      avgTemperature: 45.2,
      maxTemperature: 48.1,
      avgConductivity: 1.3,
      avgRPM: 85,
      totalVolume: 320
    }
  },
  {
    id: 'EXP-006',
    institution: 'Partner University A',
    instructor: 'Prof. Robert Chen',
    student: 'Ava Wilson',
    duration: 2250,
    date: '2025-12-05',
    laboratory: 'CIP System',
    status: 'success',
    metrics: {
      avgTemperature: 81.5,
      maxTemperature: 84.2,
      avgConductivity: 2.0,
      avgRPM: 155,
      totalVolume: 490
    }
  }
];

export function ExperimentHistory({ onBack }: ExperimentHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterInstitution, setFilterInstitution] = useState<string>('All');

  const institutions = ['All', ...Array.from(new Set(mockExperiments.map(e => e.institution)))];

  const filteredExperiments = mockExperiments.filter(exp => 
    filterInstitution === 'All' || exp.institution === filterInstitution
  );

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${mins}m ${secs}s`;
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Summary statistics
  const summaryData = [
    {
      name: 'Temperature',
      average: filteredExperiments.reduce((sum, exp) => sum + exp.metrics.avgTemperature, 0) / filteredExperiments.length,
      max: Math.max(...filteredExperiments.map(exp => exp.metrics.maxTemperature))
    },
    {
      name: 'Conductivity',
      average: filteredExperiments.reduce((sum, exp) => sum + exp.metrics.avgConductivity, 0) / filteredExperiments.length,
      max: Math.max(...filteredExperiments.map(exp => exp.metrics.avgConductivity))
    },
    {
      name: 'RPM',
      average: filteredExperiments.reduce((sum, exp) => sum + exp.metrics.avgRPM, 0) / filteredExperiments.length,
      max: Math.max(...filteredExperiments.map(exp => exp.metrics.avgRPM))
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
              <h3 className="text-gray-900">Experiment History</h3>
              <p className="text-sm text-gray-500">Review past laboratory experiments and results</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Statistics */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h4 className="text-gray-900 mb-4">Performance Summary</h4>
          <div className="h-64 min-h-[256px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summaryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="average" fill="#10b981" name="Average" />
                <Bar dataKey="max" fill="#3b82f6" name="Maximum" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <h4 className="text-gray-900">Filter by Institution</h4>
            <select
              value={filterInstitution}
              onChange={(e) => setFilterInstitution(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {institutions.map(inst => (
                <option key={inst} value={inst}>{inst}</option>
              ))}
            </select>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-gray-600">
              Showing {filteredExperiments.length} experiments
            </p>
          </div>
        </div>

        {/* Experiments Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-50 to-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-700">Expand</th>
                  <th className="px-6 py-4 text-left text-gray-700">Experiment ID</th>
                  <th className="px-6 py-4 text-left text-gray-700">Institution</th>
                  <th className="px-6 py-4 text-left text-gray-700">Instructor</th>
                  <th className="px-6 py-4 text-left text-gray-700">Student</th>
                  <th className="px-6 py-4 text-left text-gray-700">Date</th>
                  <th className="px-6 py-4 text-left text-gray-700">Duration</th>
                  <th className="px-6 py-4 text-left text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredExperiments.map((exp) => (
                  <React.Fragment key={exp.id}>
                    <tr 
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleExpand(exp.id)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          {expandedId === exp.id ? (
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
                          {exp.institution}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{exp.instructor}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <User className="w-4 h-4 text-green-600" />
                          {exp.student}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{exp.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-4 h-4 text-gray-500" />
                          {formatDuration(exp.duration)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          exp.status === 'success' ? 'bg-green-100 text-green-700' :
                          exp.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {exp.status.charAt(0).toUpperCase() + exp.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                    
                    {expandedId === exp.id && (
                      <tr>
                        <td colSpan={8} className="px-6 py-6 bg-gray-50">
                          <div className="space-y-6">
                            {/* Metrics Grid */}
                            <div>
                              <h4 className="text-gray-900 mb-4 flex items-center gap-2">
                                <Beaker className="w-5 h-5 text-green-600" />
                                Experiment Metrics
                              </h4>
                              <div className="grid md:grid-cols-5 gap-4">
                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                  <p className="text-sm text-gray-600 mb-1">Avg Temperature</p>
                                  <p className={`text-xl ${
                                    exp.metrics.avgTemperature >= 75 && exp.metrics.avgTemperature <= 85
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }`}>
                                    {exp.metrics.avgTemperature.toFixed(1)}°C
                                  </p>
                                </div>
                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                  <p className="text-sm text-gray-600 mb-1">Max Temperature</p>
                                  <p className={`text-xl ${
                                    exp.metrics.maxTemperature <= 90 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {exp.metrics.maxTemperature.toFixed(1)}°C
                                  </p>
                                </div>
                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                  <p className="text-sm text-gray-600 mb-1">Avg Conductivity</p>
                                  <p className={`text-xl ${
                                    exp.metrics.avgConductivity <= 2.5 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {exp.metrics.avgConductivity.toFixed(2)} mS/cm
                                  </p>
                                </div>
                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                  <p className="text-sm text-gray-600 mb-1">Avg RPM</p>
                                  <p className={`text-xl ${
                                    exp.metrics.avgRPM <= 200 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {Math.round(exp.metrics.avgRPM)}
                                  </p>
                                </div>
                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                  <p className="text-sm text-gray-600 mb-1">Total Volume</p>
                                  <p className="text-xl text-blue-600">
                                    {exp.metrics.totalVolume}L
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Time Series Chart */}
                            {exp.timeSeriesData && (
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <h4 className="text-gray-900 mb-4">Experiment Timeline</h4>
                                <div className="h-64">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={exp.timeSeriesData}>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis 
                                        dataKey="time" 
                                        label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }}
                                      />
                                      <YAxis />
                                      <Tooltip />
                                      <Legend />
                                      <Line 
                                        type="monotone" 
                                        dataKey="temperature" 
                                        stroke="#10b981" 
                                        name="Temperature (°C)" 
                                        strokeWidth={2}
                                      />
                                      <Line 
                                        type="monotone" 
                                        dataKey="conductivity" 
                                        stroke="#3b82f6" 
                                        name="Conductivity (mS/cm)" 
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