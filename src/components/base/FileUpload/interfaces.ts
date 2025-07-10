export interface UploadedFile extends File {
  id: string; // Unique ID for the file
  preview?: string; // URL for image preview
}

export interface FileUploadProps {
  onFilesChange?: (files: UploadedFile[]) => void; // Made optional for attachment display mode
  acceptedFileTypes?: string; // Comma-separated string of accepted file types (e.g., "image/*,.pdf,.xlsx")
  maxFiles?: number;
  value?: UploadedFile[]; // Controlled component value
  disabled?: boolean;
  displayMode?: 'input' | 'attachment'; // New prop to control display mode
  // Props for 'attachment' display mode
  fileName?: string;
  fileSize?: number;
  fileType?: string; // e.g., 'image/png', 'application/pdf'
  fileUrl?: string; // URL to download the file
}
