import { ArrowRight, Microscope, Users, Globe, Shield, Zap, BookOpen } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HomePageProps {
  onLogin: () => void;
  onExplore: () => void;
}

export function HomePage({ onLogin, onExplore }: HomePageProps) {
  const features = [
    {
      icon: <Microscope className="w-8 h-8" />,
      title: 'Equipo Avanzado',
      description: 'Accede remotamente a equipos de laboratorio de vanguardia'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Nueva Forma de Aprender',
      description: 'Realiza actividades prácticas sin limitaciones de tiempo ni lugar'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Red de Socios',
      description: 'Conéctate con laboratorios de diversas instituciones'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Acceso Remoto',
      description: 'Conexiones estables y confiables a todos los laboratorios'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Iniciar sesión',
      description: 'Accede a la plataforma con tus credenciales institucionales'
    },
    {
      number: '02',
      title: 'Seleccionar laboratorio',
      description: 'Explora los laboratorios disponibles de tu institución y socios'
    },
    {
      number: '03',
      title: 'Realizar práctica',
      description: 'Ejecuta actividades prácticas con sistemas en tiempo real'
    },
    {
      number: '04',
      title: 'Revisar resultados',
      description: 'Exportar los resultados del experimento'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Microscope className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-green-600">RemoteLab</h3>
              <p className="text-xs text-gray-500">Universidad Nacional del Chaco Austral</p>
            </div>
          </div>
          <button
            onClick={onLogin}
            className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full mb-6">
                <Zap className="w-4 h-4 inline mr-2" />
                Acceso a los laboratorios remotos
              </div>
              <h1 className="text-gray-900 mb-6">
                Aprendizaje práctico,
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                  donde sea, cuando sea
                </span>
              </h1>
              <p className="text-gray-600 mb-8">
                Acceda a laboratorios de forma remota, tanto de nuestra institución como de otras universidades asociadas. Realice actividades prácticas con equipos reales.
              </p>
              <button
                onClick={onExplore}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all flex items-center gap-2 group"
              >
                Empieza a explorar
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1605781645799-c9c7d820b4ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGxhYm9yYXRvcnklMjBzY2llbmNlfGVufDF8fHx8MTc2NTM3MjY0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Students working in laboratory"
                  className="w-full h-[500px] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                <p className="text-sm text-gray-500 mb-1">Estudiantes activos</p>
                <p className="text-green-600">2,847+</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-gray-900 mb-4">¿Qué es RemoteLab?</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Es una nueva forma de aprendizaje innovadora con acceso a laboratorios de múltiples instituciones
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center text-green-600 mb-4">
                  {feature.icon}
                </div>
                <h4 className="text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SCADA & Labs Showcase */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="rounded-xl overflow-hidden shadow-xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1720036236694-d0a231c52563?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTQ0FEQSUyMGluZHVzdHJpYWwlMjBjb250cm9sfGVufDF8fHx8MTc2NTM3MjY0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="SCADA Control System"
                className="w-full h-[400px] object-cover"
              />
            </div>
            <div>
              <h2 className="text-gray-900 mb-6">Laboratorios remotos</h2>
              <p className="text-gray-600 mb-6">
                Interactúa con sistemas avanzados que permiten el monitoreo y control en tiempo real de equipos de laboratorio. Nuestra plataforma simula entornos reales, preparándote para desafíos profesionales
              </p>
              <ul className="space-y-3">
                {['Visualización de datos en tiempo real', 'Control de procesos de manera remota', 'Sistemas en vivo', 'Exportación de datos'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-700">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-xl overflow-hidden shadow-lg">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1761095596584-34731de3e568?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVtaXN0cnklMjBsYWJvcmF0b3J5JTIwZXF1aXBtZW50fGVufDF8fHx8MTc2NTM3MjY0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Chemistry Laboratory"
                className="w-full h-[300px] object-cover"
              />
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1598981457915-aea220950616?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmdpbmVlcmluZyUyMHN0dWRlbnRzJTIwbGVhcm5pbmd8ZW58MXx8fHwxNzY1MzcyNjQyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Engineering Students"
                className="w-full h-[300px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-gray-900 mb-4">¿Cómo acceder a laboratorios remotos?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Pasos sencillos para comenzar tu viaje de aprendizaje práctico
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 text-white rounded-2xl mb-4 shadow-lg">
                    <span className="text-2xl font-bold">{step.number}</span>
                  </div>
                  <h4 className="text-gray-900 mb-3">{step.title}</h4>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[64%] w-full h-0.5 bg-gradient-to-r from-green-300 to-blue-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-gray-900 mb-4">Programas disponibles</h2>
            <p className="text-gray-600">
              Laboratorios disponibles para múltiples disciplinas de ingeniería
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Ingeniería de Sistemas de Información', labs: 12, color: 'from-blue-500 to-blue-600' },
              { name: 'Ingeniería Química', labs: 8, color: 'from-green-500 to-green-600' },
              { name: 'Ingeniería en Alimentos', labs: 6, color: 'from-teal-500 to-teal-600' },
              { name: 'Ingeniería Industrial', labs: 10, color: 'from-cyan-500 to-cyan-600' }
            ].map((program, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${program.color} rounded-lg flex items-center justify-center text-white mb-4`}>
                  <BookOpen className="w-6 h-6" />
                </div>
                <h4 className="text-gray-900 mb-2">{program.name}</h4>
                <p className="text-gray-600">{program.labs} Laboratories</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Microscope className="w-6 h-6" />
                </div>
                <h4>RemoteLab</h4>
              </div>
              <h5>Universidad Nacional del Chaco Austral</h5>
              <p className="text-gray-400 mt-4">
                Conectando a los estudiantes con instalaciones de laboratorio de clase nacional para un aprendizaje práctico innovador.
              </p>
            </div>
            <div>
              <h4 className="mb-4">Enlaces rápidos</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-green-400 transition-colors">Sobre nosotros</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Laboratorios</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Instituciones asociadas</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Soporte</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4">Contacto</h4>
              <ul className="space-y-2 text-gray-400">
                <li>11 3989-3283</li>
                <li>Comandante Fernandez 755, Pcia.R. Sáez Peña | Chaco | Argentina</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2025 RemoteLab. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
