export interface InvoiceData {
  fecha_emision: string | null;
  nombre_emisor: string | null;
  identificacion_fiscal: string | null;
  numero_factura: string | null;
  categoria_gasto: string | null;
  moneda: string | null;
  total_factura: number | null;
  items_compra: string | null;
}

export interface FileWithPreview extends File {
  preview: string;
}

export enum ProcessingStatus {
  IDLE = 'idle',
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error',
}