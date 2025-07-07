import Spinner from './Spinner';

interface LoadingOverlayProps {
  message?: string;
  isVisible: boolean;
}

export default function LoadingOverlay({ 
  message = 'Cargando...', 
  isVisible 
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
      <div className="text-center">
        <Spinner size="xl" className="mb-4" />
        <p className="text-blue-700 font-medium text-lg">{message}</p>
      </div>
    </div>
  );
} 