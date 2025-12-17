import { useState } from 'react';
import { Search, Filter, Microscope, LogOut, History, ChevronRight, Building2 } from 'lucide-react';

interface Lab {
  id: string;
  name: string;
  description: string;
  institution: string;
  program: string;
  available: boolean;
  type: string;
}

interface LaboratoryListProps {
  onSelectLab: (labId: string) => void;
  onViewHistory: () => void;
  onLogout: () => void;
}

const mockLabs: Lab[] = [
  {
    id: 'cip-001',
    name: 'Sistema CIP (Limpieza en el Lugar)',
    description: 'Sistema de limpieza industrial para procesos alimentarios y químicos con control automatizado',
    institution: 'Universidad Nacional del Chaco Austral',
    program: 'Ingeniería en Alimentos',
    available: true,
    type: 'Control CIP'
  },
  {
    id: 'reactor-001',
    name: 'Control de Reactor Químico',
    description: 'Control de temperatura y presión en reactores químicos por lotes',
    institution: 'Universidad Nacional del Chaco Austral',
    program: 'Ingeniería Química',
    available: true,
    type: 'Control de Procesos'
  },
  {
    id: 'plc-001',
    name: 'Laboratorio de Programación PLC',
    description: 'Programación de PLC Allen-Bradley y sistemas de automatización',
    institution: 'Universidad Nacional de La Matanza (UNLaM)',
    program: 'Ingeniería Industrial',
    available: true,
    type: 'Automatización'
  },
  {
    id: 'network-001',
    name: 'Laboratorio de Seguridad de Redes',
    description: 'Pruebas de ciberseguridad y configuración de redes',
    institution: 'Universidad Socia B',
    program: 'Ingeniería de Sistemas de Información',
    available: true,
    type: 'Redes'
  },
  {
    id: 'spectro-001',
    name: 'Análisis Espectrofotométrico',
    description: 'Espectrofotómetro UV-Vis para análisis químico',
    institution: 'Universidad Nacional del Chaco Austral',
    program: 'Ingeniería Química',
    available: false,
    type: 'Análisis'
  },
  {
    id: 'distillation-001',
    name: 'Columna de Destilación',
    description: 'Proceso de destilación continua con control de temperatura',
    institution: 'Universidad Nacional de La Matanza (UNLaM)',
    program: 'Ingeniería Química',
    available: true,
    type: 'Proceso de Separación'
  },
  {
    id: 'embedded-001',
    name: 'Laboratorio de Sistemas Empotrados',
    description: 'Desarrollo y pruebas con Arduino y Raspberry Pi',
    institution: 'Universidad Nacional del Chaco Austral',
    program: 'Ingeniería de Sistemas de Sistemas',
    available: true,
    type: 'Electrónica'
  },
  {
    id: 'quality-001',
    name: 'Laboratorio de Control de Calidad',
    description: 'Equipos de pruebas de seguridad alimentaria y análisis de calidad',
    institution: 'Universidad Socia C',
    program: 'Ingeniería de Alimentos',
    available: true,
    type: 'Pruebas de Calidad'
  },
  {
    id: 'robotics-001',
    name: 'Robótica Industrial',
    description: 'Programación de brazo robótico y automatización',
    institution: 'Universidad Nacional de La Matanza (UNLaM)',
    program: 'Ingeniería Industrial',
    available: false,
    type: 'Robótica'
  },
  {
    id: 'scada-001',
    name: 'Entrenamiento en Sistemas SCADA',
    description: 'Monitoreo y control de sistemas industriales SCADA',
    institution: 'Universidad Nacional del Chaco Austral',
    program: 'Ingeniería Industrial',
    available: true,
    type: 'Control SCADA'
  }
];

export function LaboratoryList({ onSelectLab, onViewHistory, onLogout }: LaboratoryListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<string>('All');
  const [institutionFilter, setInstitutionFilter] = useState('');

  const programs = ['Todas', 'Ingeniería de Sistemas de Información', 'Ingeniería Química', 'ingeniería en Alimentos', 'Ingeniería Industrial'];

  const filteredLabs = mockLabs.filter(lab => {
    const matchesSearch = lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lab.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lab.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProgram = selectedProgram === 'All' || lab.program === selectedProgram;
    const matchesInstitution = !institutionFilter || lab.institution.toLowerCase().includes(institutionFilter.toLowerCase());
    
    return matchesSearch && matchesProgram && matchesInstitution;
  });

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
                <h3 className="text-green-600">LabRemote</h3>
                <p className="text-xs text-gray-500">Universidad Nacional del Chaco Austral</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onViewHistory}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <History className="w-5 h-5" />
                Historial
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Laboratorios disponibles</h1>
          <p className="text-gray-600">
            Explora y accede a laboratorios remotos de tu institución y universidades asociadas
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-green-600" />
            <h3 className="text-gray-900">Filtros</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search Bar */}
            <div className="md:col-span-3">
              <label className="block text-gray-700 mb-2">Búsqueda</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre de laboratorio, tipo o práctica..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Program Filter */}
            <div>
              <label className="block text-gray-700 mb-2">Carrera</label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {programs.map(program => (
                  <option key={program} value={program}>{program}</option>
                ))}
              </select>
            </div>

            {/* Institution Filter */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">Universidades</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={institutionFilter}
                  onChange={(e) => setInstitutionFilter(e.target.value)}
                  placeholder="Escriba el nombre de la institución..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-gray-600">
              Mostrando {filteredLabs.length} de {mockLabs.length} laboratorios
            </p>
          </div>
        </div>

        {/* Laboratory Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLabs.map(lab => (
            <div
              key={lab.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden border border-gray-200"
            >
              <div className="p-6">
                {/* Lab Header */}
                <div className="flex items-start justify-between mb-3 mr-2">
                  <div className="flex-1">
                    <h4 className="text-gray-900 mb-1">{lab.name}</h4>
                    <p className="text-sm text-gray-500">{lab.type}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs ${
                    lab.available 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {lab.available ? 'Disponible' : 'En uso'}
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {lab.description}
                </p>

                {/* Meta Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    {lab.institution}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    {lab.program}
                  </div>
                </div>

                {/* Access Button */}
                <button
                  onClick={() => onSelectLab(lab.id)}
                  disabled={!lab.available}
                  className={`w-full py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 ${
                    lab.available
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {lab.available ? 'Acceder al laboratorio' : 'Laboratorio no disponible en este momento'}
                  {lab.available && <ChevronRight className="w-5 h-5" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredLabs.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-gray-900 mb-2">No se encontraron laboratorios</h3>
            <p className="text-gray-600">Intente ajustar sus filtros o términos de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
}
