import React, { useMemo } from 'react';
import { InvoiceData } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { DollarSign, FileText, Receipt, TrendingUp } from 'lucide-react';

interface DashboardStatsProps {
  invoices: InvoiceData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const DashboardStats: React.FC<DashboardStatsProps> = ({ invoices }) => {
  const stats = useMemo(() => {
    if (invoices.length === 0) return null;

    const totalAmount = invoices.reduce((sum, inv) => sum + (inv.total_factura || 0), 0);
    const totalCount = invoices.length;
    
    // Group by category
    const categoryMap: Record<string, number> = {};
    invoices.forEach(inv => {
      const cat = inv.categoria_gasto || 'Otros';
      categoryMap[cat] = (categoryMap[cat] || 0) + (inv.total_factura || 0);
    });

    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value
    }));

    // Most recent issuer
    const lastInvoice = invoices.reduce((prev, current) => {
        return (prev.fecha_emision || '') > (current.fecha_emision || '') ? prev : current;
    }, invoices[0]);


    return {
      totalAmount,
      totalCount,
      categoryData,
      lastIssuer: lastInvoice.nombre_emisor
    };
  }, [invoices]);

  if (!stats) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Gastado</p>
            <h3 className="text-2xl font-bold text-slate-800">${stats.totalAmount.toFixed(2)}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <Receipt size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Facturas Procesadas</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.totalCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Categoría Principal</p>
            <h3 className="text-lg font-bold text-slate-800 truncate max-w-[150px]">
               {stats.categoryData.sort((a,b) => b.value - a.value)[0]?.name || 'N/A'}
            </h3>
          </div>
        </div>

         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Último Proveedor</p>
            <h3 className="text-lg font-bold text-slate-800 truncate max-w-[150px]">
               {stats.lastIssuer || 'N/A'}
            </h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-semibold mb-4 text-slate-800">Gastos por Categoría</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <h4 className="text-lg font-semibold mb-4 text-slate-800">Distribución de Importes</h4>
           <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={stats.categoryData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
                 <XAxis dataKey="name" tick={{fontSize: 12}} />
                 <YAxis tickFormatter={(value) => `$${value}`} />
                 <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} cursor={{fill: 'transparent'}} />
                 <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};
