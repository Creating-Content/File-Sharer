// ui/src/components/FileUpload.tsx
'use client';

import { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { FiUpload, FiFile } from 'react-icons/fi';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isUploading: boolean;
}

export default function FileUpload({ onFileUpload, isUploading }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Drag handlers
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const triggerUpload = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    } else {
      alert("Please select a file first.");
    }
  };
  
  const formattedFileSize = selectedFile 
    ? (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB'
    : '';

  return (
    <div className="space-y-6">
      <div 
        className={`p-8 border-2 border-dashed rounded-lg transition-colors 
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`
        }
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          aria-label="file-input"
          style={{ display: 'none' }}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files)}
          disabled={isUploading}
        />
        
        {selectedFile ? (
            <div className='flex flex-col items-center justify-center text-center'>
                <FiFile className='w-12 h-12 text-blue-600 mb-3'/>
                <p className='font-semibold text-gray-800 break-words'>{selectedFile.name}</p>
                <p className='text-sm text-gray-500'>({formattedFileSize})</p>
                <button 
                  type="button"
                  className='mt-2 text-sm text-red-500 hover:text-red-700'
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                >
                  Change File
                </button>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-3 mb-3">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="text-blue-600 hover:underline font-medium">Choose File</button>
                  <FiUpload className="w-10 h-10 text-gray-500" />
                </div>
                <p className="text-gray-600 font-medium">Drag and drop a file here</p>
                <p className="text-sm text-gray-400 mt-1">Maximum file size: 20 MB</p>
            </div>
        )}
      </div>

      <button
        type="button"
        onClick={triggerUpload}
        className="btn-primary w-full flex items-center justify-center"
        disabled={isUploading || !selectedFile}
      >
        {isUploading ? (
          <span>Uploading...</span>
        ) : (
          <>
            <FiUpload className="mr-2" />
            <span>Securely Upload File</span>
          </>
        )}
      </button>


    </div>
  );
}