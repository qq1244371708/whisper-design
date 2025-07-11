import React, { useRef, useState, useEffect } from 'react'; // Removed useMemo
import { v4 as uuid } from 'uuid';
import type { FileUploadProps, UploadedFile } from './interfaces'; // Changed to import type
import './FileUpload.scss';

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesChange,
  acceptedFileTypes = 'image/*,.pdf,.xlsx,.docx',
  maxFiles = 5,
  value, // Controlled component value
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [internalFiles, setInternalFiles] = useState<UploadedFile[]>(value || []);

  // Effect to keep internal state in sync with controlled 'value' prop
  useEffect(() => {
    if (value !== undefined) {
      setInternalFiles(value);
    }
  }, [value]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const selectedFiles = Array.from(event.target.files || []);
    const newFiles: UploadedFile[] = [];

    selectedFiles.forEach(file => {
      if (internalFiles.length + newFiles.length < maxFiles) {
        // Basic type validation
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        const isAccepted = acceptedFileTypes.split(',').some(type => {
          type = type.trim().toLowerCase();
          if (type.startsWith('.')) {
            // Extension check
            return fileExtension === type;
          } else if (type.endsWith('/*')) {
            // Wildcard MIME type
            return file.type.startsWith(type.slice(0, -1));
          }
          return file.type === type; // Exact MIME type
        });

        if (isAccepted) {
          const uploadedFile: UploadedFile = {
            ...file,
            id: uuid(),
            ...(file.type.startsWith('image/') && { preview: URL.createObjectURL(file) }),
          } as UploadedFile;
          newFiles.push(uploadedFile);
        } else {
          console.warn(`File type not accepted: ${file.name} (${file.type})`);
        }
      } else {
        console.warn(`Max files reached (${maxFiles}). Skipping ${file.name}.`);
      }
    });

    const updatedFiles = [...internalFiles, ...newFiles];
    setInternalFiles(updatedFiles);
    onFilesChange?.(updatedFiles);

    // Clear the input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileRemove = (id: string) => {
    if (disabled) return;
    const updatedFiles = internalFiles.filter(file => file.id !== id);
    setInternalFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  const getFileIcon = (file: UploadedFile) => {
    if (file.type.startsWith('image/')) return '🖼️';
    if (file.type === 'application/pdf') return '📄';
    if (
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.name.endsWith('.xlsx')
    )
      return '📊';
    return '📎'; // Generic attachment icon
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isMaxFilesReached = internalFiles.length >= maxFiles;

  return (
    <div className="file-upload-container">
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept={acceptedFileTypes}
        onChange={handleFileSelect}
        disabled={disabled || isMaxFilesReached}
        style={{ display: 'none' }} // Hide the default input
      />
      <button
        type="button"
        className="file-upload-button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isMaxFilesReached}
      >
        {isMaxFilesReached ? 'Max files reached' : 'Select Files'}
      </button>

      {internalFiles.length > 0 && (
        <div className="file-list">
          {internalFiles.map(file => (
            <div key={file.id} className="file-card">
              <span className="file-icon">{getFileIcon(file)}</span>
              {file.preview && <img src={file.preview} alt="preview" className="file-preview" />}
              <div className="file-info">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatFileSize(file.size)}</span>
              </div>
              <button
                type="button"
                className="file-remove-button"
                onClick={() => handleFileRemove(file.id)}
                disabled={disabled}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
