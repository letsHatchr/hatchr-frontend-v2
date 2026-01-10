import { toast as sonnerToast } from 'sonner';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
    description?: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

/**
 * Wrapper around Sonner toast for consistent usage
 */
export const toast = {
    success: (message: string, options?: ToastOptions) => {
        sonnerToast.success(message, {
            description: options?.description,
            duration: options?.duration,
            action: options?.action ? {
                label: options.action.label,
                onClick: options.action.onClick,
            } : undefined,
        });
    },

    error: (message: string, options?: ToastOptions) => {
        sonnerToast.error(message, {
            description: options?.description,
            duration: options?.duration ?? 5000,
            action: options?.action ? {
                label: options.action.label,
                onClick: options.action.onClick,
            } : undefined,
        });
    },

    info: (message: string, options?: ToastOptions) => {
        sonnerToast.info(message, {
            description: options?.description,
            duration: options?.duration,
            action: options?.action ? {
                label: options.action.label,
                onClick: options.action.onClick,
            } : undefined,
        });
    },

    warning: (message: string, options?: ToastOptions) => {
        sonnerToast.warning(message, {
            description: options?.description,
            duration: options?.duration ?? 4000,
            action: options?.action ? {
                label: options.action.label,
                onClick: options.action.onClick,
            } : undefined,
        });
    },

    loading: (message: string) => {
        return sonnerToast.loading(message);
    },

    dismiss: (toastId?: string | number) => {
        sonnerToast.dismiss(toastId);
    },

    promise: <T>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string;
            error: string;
        }
    ) => {
        return sonnerToast.promise(promise, messages);
    },
};

export default toast;
