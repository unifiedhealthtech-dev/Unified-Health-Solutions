// components/RealTimeNotificationToast.js
import { Toast, ToastTitle, ToastDescription, ToastViewport, ToastProvider, ToastClose } from "./toast";
import { CheckCircle2, AlertCircle, Info, XCircle } from "lucide-react";
import { useState, useEffect } from "react";

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const VARIANT_STYLES = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

export default function RealTimeNotificationToast({ notification, onClose }) {
  const [isVisible, setIsVisible] = useState(true);
  const Icon = ICONS[notification.type] || Info;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(), 300); // fade out then remove
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <ToastProvider>
      <Toast className={`border-l-4 animate-in slide-in-from-right ${VARIANT_STYLES[notification.type]}`}>
        <div className="flex items-start gap-3">
          <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="grid gap-1">
            <ToastTitle className="font-semibold">{notification.title}</ToastTitle>
            <ToastDescription className="text-sm">{notification.message}</ToastDescription>
          </div>
          <ToastClose
            className="absolute right-2 top-2"
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose(), 300);
            }}
          />
        </div>
      </Toast>
      <ToastViewport />
    </ToastProvider>
  );
}