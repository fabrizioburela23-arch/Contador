import React, { useState, useMemo } from 'react';
import { UploadArea } from './components/UploadArea';
import { ResultsTable } from './components/ResultsTable';
import { DashboardStats } from './components/DashboardStats';
import { processInvoices } from './services/geminiService';
import { InvoiceData, ProcessingStatus } from './types';
import { Sparkles, AlertCircle, Settings, Filter, Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [data, setData] = useState<InvoiceData[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedCurrency, setSelectedCurrency] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  
  // Configuration state (simple toggle for now, or just direct action)
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const handleProcess = async (files: File[]) => {
    setStatus(ProcessingStatus.PROCESSING);
    setError(null);
    try {
      const results = await processInvoices(files);
      setData(prev => [...results, ...prev]); // Append new results to history
      setStatus(ProcessingStatus.SUCCESS);
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al procesar las facturas con la IA. Por favor, verifica tu API Key e intenta nuevamente.");
      setStatus(ProcessingStatus.ERROR);
    }
  };

  const handleClearData = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar todo el historial de facturas?')) {
      setData([]);
      setStatus(ProcessingStatus.IDLE);
      setSelectedCurrency('ALL');
      setSelectedCategory('ALL');
      setIsConfigOpen(false);
    }
  };

  // Compute unique values for filters
  const uniqueCurrencies = useMemo(() => {
    const currencies = new Set(data.map(d => d.moneda).filter(Boolean));
    return Array.from(currencies) as string[];
  }, [data]);

  const uniqueCategories = useMemo(() => {
    const categories = new Set(data.map(d => d.categoria_gasto).filter(Boolean));
    return Array.from(categories) as string[];
  }, [data]);

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchCurrency = selectedCurrency === 'ALL' || item.moneda === selectedCurrency;
      const matchCategory = selectedCategory === 'ALL' || item.categoria_gasto === selectedCategory;
      return matchCurrency && matchCategory;
    });
  }, [data, selectedCurrency, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-primary to-indigo-500 text-white p-2 rounded-lg">
              <Sparkles size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
              Contaidor
            </h1>
          </div>
          <div className="flex items-center space-x-4">
             <div className="hidden md:flex text-xs font-medium bg-slate-100 text-slate-500 px-3 py-1 rounded-full border border-slate-200">
               Modelo: Gemini 3 Flash
             </div>
             
             {/* Configuration Button */}
             <div className="relative">
               <button 
                 onClick={() => setIsConfigOpen(!isConfigOpen)}
                 className={`p-2 rounded-full transition-colors ${isConfigOpen ? 'bg-slate-100 text-primary' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
                 title="Configuración"
               >
                 <Settings size={20} />
               </button>
               
               {/* Configuration Dropdown */}
               {isConfigOpen && (
                 <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 animate-fade-in z-50">
                   <button 
                    onClick={handleClearData}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                   >
                     <Trash2 size={16} />
                     <span>Borrar Historial</span>
                   </button>
                 </div>
               )}
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Intro (Only show if no data) */}
        {data.length === 0 && (
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Automatiza tu contabilidad
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Sube fotos de tus facturas o recibos. Nuestra IA extraerá los datos, categorizará los gastos y generará un reporte organizado en segundos.
            </p>
          </div>
        )}

        {/* Upload Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <UploadArea onProcess={handleProcess} status={status} />
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center space-x-2 border border-red-200">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}
        </section>

        {/* Results Section */}
        {data.length > 0 && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 gap-4">
               <div className="flex items-center space-x-2">
                 <h2 className="text-2xl font-bold text-slate-800">Resultados</h2>
                 <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                   {filteredData.length} de {data.length}
                 </span>
               </div>

               {/* Filters */}
               <div className="flex flex-wrap items-center gap-3">
                 <div className="flex items-center space-x-2 bg-white border border-slate-300 rounded-lg px-3 py-2 shadow-sm">
                   <Filter size={16} className="text-slate-400" />
                   <span className="text-sm text-slate-500 font-medium">Moneda:</span>
                   <select 
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="text-sm font-semibold text-slate-700 bg-transparent border-none focus:ring-0 cursor-pointer outline-none"
                   >
                     <option value="ALL">Todas</option>
                     {uniqueCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                 </div>

                 <div className="flex items-center space-x-2 bg-white border border-slate-300 rounded-lg px-3 py-2 shadow-sm">
                   <Filter size={16} className="text-slate-400" />
                   <span className="text-sm text-slate-500 font-medium">Categoría:</span>
                   <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-sm font-semibold text-slate-700 bg-transparent border-none focus:ring-0 cursor-pointer outline-none"
                   >
                     <option value="ALL">Todas</option>
                     {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                 </div>
               </div>
            </div>

            {filteredData.length > 0 ? (
              <>
                <DashboardStats invoices={filteredData} />
                <ResultsTable data={filteredData} />
              </>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <p>No se encontraron facturas con los filtros seleccionados.</p>
                <button 
                  onClick={() => { setSelectedCurrency('ALL'); setSelectedCategory('ALL'); }}
                  className="mt-2 text-primary hover:underline"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </section>
        )}
      </main>
      
      <footer className="bg-white border-t border-slate-200 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>Potenciado por Google Gemini API. Los datos se procesan en tiempo real.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;