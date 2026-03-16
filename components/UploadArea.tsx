import React, { useCallback, useState } from 'react';
import { Upload, X, FileImage, Loader2 } from 'lucide-react';
import { FileWithPreview, ProcessingStatus } from '../types';

interface UploadAreaProps {
  onProcess: (files: File[]) => void;
  status: ProcessingStatus;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onProcess, status }) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Explicitly cast to File[] as Array.from on FileList might be inferred as unknown[]
    const droppedFiles = (Array.from(e.dataTransfer.files) as File[]).filter(file => file.type.startsWith('image/'));
    
    const newFiles = droppedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Explicitly cast to File[] as Array.from on FileList might be inferred as unknown[]
      const selectedFiles = (Array.from(e.target.files) as File[]).filter(file => file.type.startsWith('image/'));
      const newFiles = selectedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleSubmit = () => {
    if (files.length > 0) {
      onProcess(files);
      // Clean up previews after submission if you want, but user might want to see them
      // We keep them for now until success
    }
  };

  const isLoading = status === ProcessingStatus.UPLOADING || status === ProcessingStatus.PROCESSING;

  return (
    <div className="w-full space-y-4">
      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
          ${isDragging ? 'border-primary bg-blue-50' : 'border-slate-300 hover:border-primary/50'}
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input 
          id="file-upload" 
          type="file" 
          multiple 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileInput} 
        />
        
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-4 bg-slate-100 rounded-full text-slate-500">
            <Upload size={32} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-800">
              Arrastra tus facturas aquí
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              o haz clic para explorar archivos (JPG, PNG)
            </p>
          </div>
        </div>
      </div>

      {/* Previews */}
      {files.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
            Archivos seleccionados ({files.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {files.map((file, index) => (
              <div key={index} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-[3/4]">
                <img 
                  src={file.preview} 
                  alt="preview" 
                  className="w-full h-full object-cover"
                />
                {!isLoading && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    <X size={14} />
                  </button>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs text-white truncate">
                  {file.name}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
             <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold text-white shadow-lg transition-all
                ${isLoading 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-primary hover:bg-secondary hover:shadow-xl hover:-translate-y-0.5'
                }`}
             >
               {isLoading ? (
                 <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Procesando...</span>
                 </>
               ) : (
                 <>
                  <FileImage size={20} />
                  <span>Procesar Facturas</span>
                 </>
               )}
             </button>
          </div>
        </div>
      )}
    </div>
  );
};