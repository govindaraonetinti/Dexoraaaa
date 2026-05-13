import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string; // optional styling
  className?: string
  zIndex?: string
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-md",
  className,
  zIndex,
}: ModalProps) {

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center cursor-pointer ${zIndex ? zIndex : 'z-50'}`}
      onClick={onClose}  // click outside
    >
      <div
        className={` text-white rounded-xl p-6 shadow-lg w-full ${width} relative  ${className ? className : 'bg-neutral-900'}`}
        onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
      >
        <button
          className="absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{title}</h2>

          </div>
        )}

        {/* Modal Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
