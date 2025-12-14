'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Tipos de inscripción
const TIPOS_INSCRIPCION = [
  { id: 'dominio', nombre: 'Inscripcion de Dominio', descripcion: 'Transferencia de propiedad (compraventa, donacion, herencia)', base: 0.2, minimo: 15000 },
  { id: 'hipoteca', nombre: 'Hipoteca', descripcion: 'Garantia hipotecaria sobre un inmueble', base: 0.1, minimo: 10000 },
  { id: 'prohibicion', nombre: 'Prohibicion', descripcion: 'Prohibicion de gravar y enajenar', base: 0.05, minimo: 8000 },
  { id: 'cancelacion', nombre: 'Cancelacion Hipoteca', descripcion: 'Alzamiento de hipoteca', fijo: 12000 },
  { id: 'usufructo', nombre: 'Usufructo', descripcion: 'Derecho de uso y goce', base: 0.15, minimo: 12000 },
  { id: 'servidumbre', nombre: 'Servidumbre', descripcion: 'Servidumbre de paso u otra', fijo: 15000 },
  { id: 'subdivision', nombre: 'Subdivision', descripcion: 'Division de un predio', fijo: 25000 },
  { id: 'fusion', nombre: 'Fusion', descripcion: 'Union de predios', fijo: 25000 }
];

// Aranceles base (aproximados 2024)
const ARANCEL_BASE = {
  inscripcion: 0.002, // 0.2% del valor
  certificado: 5500,
  copiaInscripcion: 3500,
  vigencia: 4500,
  dominio: 6000,
  hipotecasGravamenes: 5500,
  litigios: 4000
};

// Conservadores por región
const CONSERVADORES = [
  { region: 'Metropolitana', oficinas: [
    { nombre: 'Conservador de Santiago', direccion: 'Morandé 440, Santiago', telefono: '(2) 2387 5000', comunas: 'Santiago Centro y otras' },
    { nombre: 'Conservador de Providencia', direccion: 'Pedro de Valdivia 100, Providencia', telefono: '(2) 2231 1000', comunas: 'Providencia, Ñuñoa, La Reina' },
    { nombre: 'Conservador de Las Condes', direccion: 'Apoquindo 4501, Las Condes', telefono: '(2) 2207 2000', comunas: 'Las Condes, Vitacura, Lo Barnechea' },
    { nombre: 'Conservador de Puente Alto', direccion: 'Concha y Toro 461, Puente Alto', telefono: '(2) 2850 5000', comunas: 'Puente Alto, La Florida, Pirque' },
    { nombre: 'Conservador de San Miguel', direccion: 'Gran Avenida 5631, San Miguel', telefono: '(2) 2522 3000', comunas: 'San Miguel, La Cisterna, El Bosque' },
    { nombre: 'Conservador de Maipu', direccion: 'Av. Pajaritos 3195, Maipu', telefono: '(2) 2531 6000', comunas: 'Maipu, Cerrillos, Padre Hurtado' }
  ]},
  { region: 'Valparaiso', oficinas: [
    { nombre: 'Conservador de Valparaiso', direccion: 'Prat 827, Valparaiso', telefono: '(32) 225 0000', comunas: 'Valparaiso, Viña del Mar' },
    { nombre: 'Conservador de Viña del Mar', direccion: 'Arlegui 340, Viña del Mar', telefono: '(32) 268 8000', comunas: 'Viña del Mar, Concón' }
  ]},
  { region: 'Biobio', oficinas: [
    { nombre: 'Conservador de Concepcion', direccion: 'Barros Arana 541, Concepcion', telefono: '(41) 222 5000', comunas: 'Concepcion, Talcahuano' }
  ]},
  { region: 'Araucania', oficinas: [
    { nombre: 'Conservador de Temuco', direccion: 'Claro Solar 865, Temuco', telefono: '(45) 221 2000', comunas: 'Temuco, Padre Las Casas' }
  ]},
  { region: 'Los Lagos', oficinas: [
    { nombre: 'Conservador de Puerto Montt', direccion: 'Urmeneta 509, Puerto Montt', telefono: '(65) 225 3000', comunas: 'Puerto Montt, Puerto Varas' }
  ]}
];

// Documentos requeridos por trámite
const DOCUMENTOS = {
  compraventa: [
    'Escritura publica de compraventa',
    'Certificado de dominio vigente',
    'Certificado de hipotecas y gravamenes',
    'Certificado de numero municipal',
    'Pago de contribuciones al dia',
    'Formulario 2890 del SII'
  ],
  hipoteca: [
    'Escritura publica de hipoteca',
    'Certificado de dominio vigente',
    'Tasacion del inmueble',
    'Certificado de avaluo fiscal'
  ],
  herencia: [
    'Posesion efectiva',
    'Certificado de defuncion',
    'Inscripcion de herencia',
    'Pago de impuesto a la herencia',
    'Certificados de nacimiento de herederos'
  ],
  subdivision: [
    'Plano de subdivision aprobado',
    'Certificado de informes previos',
    'Resolucion de la DOM',
    'Escritura de subdivision'
  ]
};

type Vista = 'calculadora' | 'conservadores' | 'documentos' | 'guia';

export default function Conservador() {
  const [vista, setVista] = useState<Vista>('calculadora');
  const [tipoInscripcion, setTipoInscripcion] = useState('dominio');
  const [valorPropiedad, setValorPropiedad] = useState<number>(100000000);
  const [incluyeCertificados, setIncluyeCertificados] = useState(true);
  const [regionSeleccionada, setRegionSeleccionada] = useState('Metropolitana');

  // Calcular costos
  const calcularCostos = () => {
    const tipo = TIPOS_INSCRIPCION.find(t => t.id === tipoInscripcion);
    if (!tipo) return { inscripcion: 0, certificados: 0, total: 0 };

    let costoInscripcion = 0;
    if (tipo.fijo) {
      costoInscripcion = tipo.fijo;
    } else if (tipo.base) {
      costoInscripcion = Math.max(valorPropiedad * (tipo.base / 100), tipo.minimo || 0);
    }

    const certificados = incluyeCertificados ? (
      ARANCEL_BASE.certificado +
      ARANCEL_BASE.dominio +
      ARANCEL_BASE.hipotecasGravamenes +
      ARANCEL_BASE.vigencia
    ) : 0;

    return {
      inscripcion: Math.round(costoInscripcion),
      certificados: Math.round(certificados),
      total: Math.round(costoInscripcion + certificados)
    };
  };

  const costos = calcularCostos();

  const formatCLP = (valor: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(valor);
  };

  const renderCalculadora = () => (
    <div className="space-y-6">
      {/* Calculadora */}
      <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span>🧮</span> Calculadora de Aranceles
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Tipo de Inscripcion</label>
              <select
                value={tipoInscripcion}
                onChange={(e) => setTipoInscripcion(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {TIPOS_INSCRIPCION.map(tipo => (
                  <option key={tipo.id} value={tipo.id} className="bg-slate-800">
                    {tipo.nombre}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {TIPOS_INSCRIPCION.find(t => t.id === tipoInscripcion)?.descripcion}
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Valor de la Propiedad (CLP)</label>
              <input
                type="number"
                value={valorPropiedad}
                onChange={(e) => setValorPropiedad(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formatCLP(valorPropiedad)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="certificados"
                checked={incluyeCertificados}
                onChange={(e) => setIncluyeCertificados(e.target.checked)}
                className="w-5 h-5 rounded bg-white/10 border-white/20 text-amber-500"
              />
              <label htmlFor="certificados" className="text-gray-300">
                Incluir certificados necesarios
              </label>
            </div>
          </div>

          {/* Resultados */}
          <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl p-6 border border-amber-500/30">
            <h4 className="text-lg font-bold text-white mb-4">Costo Estimado</h4>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Inscripcion</span>
                <span className="text-white font-mono">{formatCLP(costos.inscripcion)}</span>
              </div>

              {incluyeCertificados && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Certificados</span>
                  <span className="text-white font-mono">{formatCLP(costos.certificados)}</span>
                </div>
              )}

              <div className="border-t border-white/20 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold">Total Estimado</span>
                  <span className="text-2xl font-bold text-amber-400">{formatCLP(costos.total)}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              * Valores aproximados. Consulte directamente en el Conservador para valores exactos.
            </p>
          </div>
        </div>
      </div>

      {/* Desglose de certificados */}
      <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>📜</span> Aranceles de Certificados (2024)
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { nombre: 'Certificado de Dominio Vigente', precio: ARANCEL_BASE.dominio },
            { nombre: 'Certificado de Hipotecas y Gravamenes', precio: ARANCEL_BASE.hipotecasGravamenes },
            { nombre: 'Certificado de Vigencia', precio: ARANCEL_BASE.vigencia },
            { nombre: 'Certificado de Litigios', precio: ARANCEL_BASE.litigios },
            { nombre: 'Copia de Inscripcion', precio: ARANCEL_BASE.copiaInscripcion },
            { nombre: 'Certificado General', precio: ARANCEL_BASE.certificado }
          ].map((cert) => (
            <div key={cert.nombre} className="bg-white/5 rounded-lg p-4 flex justify-between items-center">
              <span className="text-gray-300 text-sm">{cert.nombre}</span>
              <span className="text-amber-400 font-mono font-bold">{formatCLP(cert.precio)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Comparador compra propiedad */}
      <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl p-6 border border-blue-500/30">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🏠</span> Costos Totales Compra Propiedad
        </h3>
        <p className="text-gray-300 mb-4">Para una propiedad de {formatCLP(valorPropiedad)}:</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { concepto: 'Conservador', valor: costos.total, porcentaje: (costos.total / valorPropiedad * 100).toFixed(2) },
            { concepto: 'Notaria (estimado)', valor: valorPropiedad * 0.003, porcentaje: '0.30' },
            { concepto: 'Impuesto Timbre', valor: valorPropiedad * 0.008, porcentaje: '0.80' },
            { concepto: 'Estudio Titulos', valor: 150000, porcentaje: (150000 / valorPropiedad * 100).toFixed(2) }
          ].map((item) => (
            <div key={item.concepto} className="bg-white/10 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm">{item.concepto}</p>
              <p className="text-xl font-bold text-white mt-1">{formatCLP(item.valor)}</p>
              <p className="text-xs text-blue-400">{item.porcentaje}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderConservadores = () => (
    <div className="space-y-6">
      {/* Selector de región */}
      <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🏛️</span> Buscar Conservador
        </h3>

        <div className="flex flex-wrap gap-2">
          {CONSERVADORES.map(c => (
            <button
              key={c.region}
              onClick={() => setRegionSeleccionada(c.region)}
              className={`px-4 py-2 rounded-xl transition-all ${
                regionSeleccionada === c.region
                  ? 'bg-amber-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {c.region}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de conservadores */}
      <div className="space-y-4">
        {CONSERVADORES.find(c => c.region === regionSeleccionada)?.oficinas.map((oficina, i) => (
          <motion.div
            key={oficina.nombre}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/10 backdrop-blur rounded-xl p-5 border border-white/20"
          >
            <h4 className="text-white font-bold text-lg mb-3">{oficina.nombre}</h4>

            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-gray-500">📍</span>
                <span className="text-gray-300">{oficina.direccion}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-500">📞</span>
                <span className="text-gray-300">{oficina.telefono}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-500">🏘️</span>
                <span className="text-gray-300">{oficina.comunas}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Información importante */}
      <div className="bg-yellow-500/20 rounded-xl p-4 border border-yellow-500/30">
        <h4 className="text-yellow-300 font-bold mb-2 flex items-center gap-2">
          <span>⚠️</span> Importante
        </h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Las inscripciones deben hacerse en el Conservador donde esta ubicado el inmueble</li>
          <li>• Horario general: Lunes a Viernes 9:00 a 14:00</li>
          <li>• Muchos tramites se pueden iniciar online en fojas.cl</li>
        </ul>
      </div>
    </div>
  );

  const renderDocumentos = () => (
    <div className="space-y-6">
      {/* Compraventa */}
      <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🏠</span> Compraventa de Propiedad
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {DOCUMENTOS.compraventa.map((doc, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
              <span className="text-green-400">✓</span>
              <span className="text-gray-300 text-sm">{doc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hipoteca */}
      <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🏦</span> Constitucion de Hipoteca
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {DOCUMENTOS.hipoteca.map((doc, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
              <span className="text-green-400">✓</span>
              <span className="text-gray-300 text-sm">{doc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Herencia */}
      <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>📜</span> Herencia
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {DOCUMENTOS.herencia.map((doc, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
              <span className="text-green-400">✓</span>
              <span className="text-gray-300 text-sm">{doc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Subdivisión */}
      <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>📐</span> Subdivision de Terreno
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {DOCUMENTOS.subdivision.map((doc, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
              <span className="text-green-400">✓</span>
              <span className="text-gray-300 text-sm">{doc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGuia = () => (
    <div className="space-y-6">
      {/* Proceso de compra */}
      <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span>📋</span> Proceso de Compra de Propiedad
        </h3>

        <div className="space-y-4">
          {[
            { paso: '1', titulo: 'Estudio de Titulos', desc: 'Abogado revisa los ultimos 10 años de inscripciones', tiempo: '3-5 dias' },
            { paso: '2', titulo: 'Promesa de Compraventa', desc: 'Contrato preliminar ante notario', tiempo: '1 dia' },
            { paso: '3', titulo: 'Escritura Publica', desc: 'Firma de la escritura definitiva en notaria', tiempo: '1 dia' },
            { paso: '4', titulo: 'Pago de Impuestos', desc: 'Pago de impuesto de timbres y estampillas', tiempo: '1 dia' },
            { paso: '5', titulo: 'Inscripcion en Conservador', desc: 'Ingreso de la escritura al Conservador', tiempo: '5-15 dias' },
            { paso: '6', titulo: 'Entrega de Propiedad', desc: 'Una vez inscrita, la propiedad es tuya', tiempo: '-' }
          ].map((item, i) => (
            <motion.div
              key={item.paso}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4 bg-white/5 rounded-xl p-4"
            >
              <div className="w-10 h-10 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center shrink-0">
                {item.paso}
              </div>
              <div className="flex-1">
                <h4 className="text-white font-bold">{item.titulo}</h4>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
              <span className="text-amber-400 text-sm whitespace-nowrap">{item.tiempo}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tipos de registros */}
      <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>📚</span> Libros del Conservador
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { libro: 'Registro de Propiedad', desc: 'Transferencias de dominio', icon: '🏠' },
            { libro: 'Registro de Hipotecas', desc: 'Hipotecas y gravamenes', icon: '🏦' },
            { libro: 'Registro de Prohibiciones', desc: 'Prohibiciones de enajenar', icon: '🚫' },
            { libro: 'Registro de Comercio', desc: 'Sociedades y comercio', icon: '🏢' }
          ].map((item) => (
            <div key={item.libro} className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl p-4 text-center border border-amber-500/20">
              <span className="text-3xl mb-2 block">{item.icon}</span>
              <h4 className="text-white font-bold text-sm">{item.libro}</h4>
              <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Glosario */}
      <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>📖</span> Glosario
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            { termino: 'Foja', definicion: 'Numero de pagina en el libro del Conservador' },
            { termino: 'Numero', definicion: 'Numero correlativo de la inscripcion' },
            { termino: 'Año', definicion: 'Año en que se realizo la inscripcion' },
            { termino: 'Rol', definicion: 'Identificador del predio para el SII' },
            { termino: 'Dominio', definicion: 'Derecho de propiedad sobre un bien' },
            { termino: 'Gravamen', definicion: 'Carga que afecta a un inmueble (hipoteca, servidumbre)' },
            { termino: 'Tradicion', definicion: 'Modo de adquirir el dominio mediante inscripcion' },
            { termino: 'Alzamiento', definicion: 'Cancelacion de una hipoteca o prohibicion' }
          ].map((item) => (
            <div key={item.termino} className="bg-white/5 rounded-lg p-4">
              <h4 className="text-amber-400 font-bold mb-1">{item.termino}</h4>
              <p className="text-gray-300 text-sm">{item.definicion}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Links útiles */}
      <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl p-6 border border-green-500/30">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🔗</span> Recursos Online
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            { nombre: 'Fojas.cl', url: 'https://www.fojas.cl', desc: 'Portal de tramites online' },
            { nombre: 'Conservador de Santiago', url: 'https://www.conservador.cl', desc: 'Sitio oficial' },
            { nombre: 'SII - Avaluo Fiscal', url: 'https://www.sii.cl', desc: 'Consulta de avaluo' },
            { nombre: 'Registro Civil', url: 'https://www.registrocivil.cl', desc: 'Certificados de nacimiento' }
          ].map((link) => (
            <a
              key={link.nombre}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 rounded-lg p-4 hover:bg-white/15 transition-all group"
            >
              <h4 className="text-white font-bold group-hover:text-green-400 transition-colors">{link.nombre}</h4>
              <p className="text-sm text-gray-400">{link.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent" />
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <span className="text-6xl mb-4 block">🏛️</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Conservador de <span className="text-amber-400">Bienes Raices</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Calculadora de aranceles, documentos y guia para inscripciones
            </p>

            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <span className="px-4 py-2 bg-white/10 rounded-full text-sm text-gray-300">
                🧮 Calculadora Aranceles
              </span>
              <span className="px-4 py-2 bg-white/10 rounded-full text-sm text-gray-300">
                🏛️ Buscador Oficinas
              </span>
              <span className="px-4 py-2 bg-white/10 rounded-full text-sm text-gray-300">
                📋 Documentos
              </span>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {[
              { id: 'calculadora', label: 'Calculadora', icon: '🧮' },
              { id: 'conservadores', label: 'Oficinas', icon: '🏛️' },
              { id: 'documentos', label: 'Documentos', icon: '📄' },
              { id: 'guia', label: 'Guia', icon: '📋' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setVista(tab.id as Vista)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  vista === tab.id
                    ? 'bg-amber-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={vista}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {vista === 'calculadora' && renderCalculadora()}
            {vista === 'conservadores' && renderConservadores()}
            {vista === 'documentos' && renderDocumentos()}
            {vista === 'guia' && renderGuia()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            Conservador de Bienes Raices - Modulo de{' '}
            <a href="https://newcool-informada.vercel.app" className="text-amber-400 hover:underline">
              NewCooltura Informada
            </a>
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Portal educativo. Para tramites oficiales consulte en fojas.cl
          </p>
        </div>
      </footer>
    </div>
  );
}
