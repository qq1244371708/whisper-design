export interface UploadedFile extends File {
  id: string; // Unique ID for the file
  preview?: string; // URL for image preview
}

export interface FileUploadProps {
  onFilesChange: (files: UploadedFile[]) => void;
  acceptedFileTypes?: string; // Comma-separated string of accepted file types (e.g., "image/*,.pdf,.xlsx")
  maxFiles?: number;
  value?: UploadedFile[]; // Controlled component value
  disabled?: boolean;
}
