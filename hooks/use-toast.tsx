'use client';

import { toast as sonnerToast } from 'sonner';

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000; // Keep your custom delay

type ToastProps = {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
};

// Track active toasts for limit enforcement
let activeToasts: string[] = [];

function toast({ title, description, action, variant = 'default' }: ToastProps) {
  // Enforce toast limit - dismiss oldest if limit reached
  if (activeToasts.length >= TOAST_LIMIT) {
    const oldestToastId = activeToasts[0];
    sonnerToast.dismiss(oldestToastId);
    activeToasts.shift();
  }

  const message = (
    <div className="flex flex-col gap-1">
      {title && <div className="font-semibold">{title}</div>}
      {description && <div className="text-sm opacity-90">{description}</div>}
    </div>
  );

  const options = {
    duration: TOAST_REMOVE_DELAY,
    ...(action
      ? {
          action: {
            label: action.label,
            onClick: action.onClick,
          },
        }
      : {}),
    onDismiss: (t: any) => {
      // Remove from active toasts when dismissed
      activeToasts = activeToasts.filter((id) => id !== t.id);
    },
    onAutoClose: (t: any) => {
      // Remove from active toasts when auto-closed
      activeToasts = activeToasts.filter((id) => id !== t.id);
    },
  };

  let toastId: string | number;

  switch (variant) {
    case 'success':
      toastId = sonnerToast.success(message, options);
      break;
    case 'error':
      toastId = sonnerToast.error(message, options);
      break;
    case 'warning':
      toastId = sonnerToast.warning(message, options);
      break;
    case 'info':
      toastId = sonnerToast.info(message, options);
      break;
    default:
      toastId = sonnerToast(message, options);
  }

  // Track this toast
  activeToasts.push(String(toastId));

  return {
    id: String(toastId),
    dismiss: () => sonnerToast.dismiss(toastId),
    update: (newProps: ToastProps) => {
      // Dismiss old and create new (Sonner doesn't have direct update)
      sonnerToast.dismiss(toastId);
      return toast(newProps);
    },
  };
}

function useToast() {
  return {
    toast,
    dismiss: (toastId?: string | number) => {
      if (toastId) {
        sonnerToast.dismiss(toastId);
        activeToasts = activeToasts.filter((id) => id !== String(toastId));
      } else {
        sonnerToast.dismiss();
        activeToasts = [];
      }
    },
  };
}

export { useToast, toast };