import React from 'react';
import { InvoiceData } from '../types';
import { Download } from 'lucide-react';

interface ResultsTableProps {
  data: InvoiceData[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ data }) => {
  if (data.length === 0) return null;

  const handleExportCSV = () => {
    const headers = [
      "Fecha", "Emisor", "ID Fiscal", "Nº Factura", "Categoría", "Moneda", "Total", "Items"
    ];
    const rows = data.map(inv => [
      inv.fecha_emision,
      `"${inv.nombre_emisor}"`,
      inv.identificacion_fiscal,
      inv.numero_factura,
      inv.categoria_gasto,
      inv.moneda,
      inv.total_factura,
      `"${inv.items_compra}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reporte_gastos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mt-8">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-semibold text-slate-800">Detalle de Facturas</h3>
        <button 
          onClick={handleExportCSV}
          className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <Download size={16} />
          <span>Exportar CSV</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Emisor</th>
              <th className="px-6 py-3">ID Fiscal</th>
              <th className="px-6 py-3">Factura #</th>
              <th className="px-6 py-3">Categoría</th>
              <th className="px-6 py-3 text-right">Total</th>
              <th className="px-6 py-3">Items</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="bg-white border-b hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                  {item.fecha_emision || '-'}
                </td>
                <td className="px-6 py-4 truncate max-w-[200px]">
                  {item.nombre_emisor || 'Desconocido'}
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {item.identificacion_fiscal || 'N/A'}
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {item.numero_factura || 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${item.categoria_gasto === 'Alimentos' ? 'bg-green-100 text-green-700' : 
                      item.categoria_gasto === 'Transporte' ? 'bg-yellow-100 text-yellow-700' :
                      item.categoria_gasto === 'Oficina' ? 'bg-blue-100 text-blue-700' :
                      item.categoria_gasto === 'Servicios' ? 'bg-purple-100 text-purple-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                    {item.categoria_gasto || 'Otros'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-medium text-slate-900">
                   {item.moneda} {item.total_factura?.toFixed(2)}
                </td>
                 <td className="px-6 py-4 truncate max-w-[200px] text-slate-500" title={item.items_compra || ''}>
                  {item.items_compra || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
