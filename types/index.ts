export type OperationType =
  | 'precision-edit'
  | 'style-transfer'
  | 'face-restoration'
  | 'upscale'
  | 'remove-background'
  | 'color-enhance'
  | 'text-to-edit'
  | 'generate-image';

export type StylePreset =
  | 'anime'
  | 'cyberpunk'
  | 'oil-painting'
  | 'watercolor'
  | 'sketch'
  | 'neon'
  | 'vintage';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gradient';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type DialogSize = 'sm' | 'md' | 'lg' | 'fullscreen';
export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
export type ConnectionStatus = 'connected' | 'disconnected' | 'checking';

export interface OperationParams {
  style?: StylePreset;
  upscaleFactor?: 2 | 4;
  prompt?: string;
  negativePrompt?: string;
  guidanceScale?: number;
  imageGuidanceScale?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  temperature?: number;
}

export interface HistoryItem {
  id: string;
  originalImage: string;
  editedImage: string;
  operation: OperationType;
  timestamp: number;
  processingTime: number;
}

export interface ApiResponse {
  success: boolean;
  resultBase64?: string;
  processingTime?: number;
  error?: string;
}

export interface ColabHealthResponse {
  status: 'online' | 'offline';
  colabConnected: boolean;
  timestamp: string;
}

export interface ProcessImageParams {
  imageBase64: string;
  operation: OperationType;
  params: OperationParams;
  maskBase64?: string;
  colabUrl: string;
}

export interface OperationInfo {
  id: OperationType;
  label: string;
  icon: string;
  description: string;
  estimatedTime: string;
  requiresMask: boolean;
}

export interface StylePresetInfo {
  id: StylePreset;
  label: string;
  gradient: string;
}

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  fullWidth?: boolean;
}

export interface InputFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export interface TextareaProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
}

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: DialogSize;
}

export interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  step?: number;
  className?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}
