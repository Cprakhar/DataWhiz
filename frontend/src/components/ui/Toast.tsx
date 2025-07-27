import { toast, ToastContainer, ToastOptions, Id } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import React from "react";

// ToastContainer for global use (place once in _app.tsx or root layout)
export const AppToastContainer = () => (
  <ToastContainer
    position="bottom-right"
    autoClose={4000}
    hideProgressBar={false}
    newestOnTop={false}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="light"
  />
);

// Utility functions for showing toasts
export const showToast = {
  success: (msg: string, options?: ToastOptions) => toast.success(msg, options),
  error: (msg: string, options?: ToastOptions) => toast.error(msg, options),
  info: (msg: string, options?: ToastOptions) => toast.info(msg, options),
  warn: (msg: string, options?: ToastOptions) => toast.warn(msg, options),
  loading: (msg: string, options?: ToastOptions & { toastId?: Id }) => toast.loading(msg, options),
  update: (toastId: Id, options: ToastOptions & { render?: React.ReactNode; isLoading?: boolean }) => toast.update(toastId, options),
  custom: (content: React.ReactNode, options?: ToastOptions) => toast(content, options),
  dismiss: (toastId?: Id) => toast.dismiss(toastId),
};

export function toastPromise<T>(
  promise: Promise<T>,
  messages: {
    pending: string;
    success: string;
    error: string;
  },
  options?: ToastOptions
) {
  return toast.promise(
    promise,
    {
      pending: messages.pending,
      success: messages.success,
      error: messages.error
    },
    options
  );
}

// Example: Custom content component for advanced use
export type CustomToastProps = {
  closeToast?: () => void;
  data?: {title: string, msg: string};
};

export const CustomToast: React.FC<CustomToastProps> = ({ closeToast, data }) => (
  <div className="flex flex-col gap-1">
    <span className="font-semibold">{data?.title || "Notification"}</span>
    <span>{data?.msg || ""}</span>
    <button className="text-xs text-blue-600 mt-1 self-end" onClick={closeToast}>Close</button>
  </div>
);


export const DefaultToastOptions: ToastOptions = {
  pauseOnHover: false,
  autoClose: 5000,
  closeOnClick: true,
};