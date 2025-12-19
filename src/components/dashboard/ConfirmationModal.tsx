import { FiAlertTriangle } from 'react-icons/fi';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111] border border-[#333] rounded-xl p-6 max-w-sm w-full shadow-2xl transform transition-all">
        <div className="flex items-center gap-3 mb-4">
          {isDangerous && (
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
              <FiAlertTriangle size={20} />
            </div>
          )}
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          {message}
        </p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#222] transition-colors text-sm font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDangerous 
                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                : 'bg-white text-black hover:bg-gray-200'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
