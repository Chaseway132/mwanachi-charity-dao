import { toast } from 'react-hot-toast';

export const safeToast = {
  success: (message: string) => {
    try {
      toast.success(message);
    } catch (e) {
      console.error('Toast error:', e);
      console.log('Toast message was:', message);
    }
  },
  error: (message: string) => {
    try {
      toast.error(message);
    } catch (e) {
      console.error('Toast error:', e);
      console.log('Toast message was:', message);
    }
  },
  info: (message: string) => {
    try {
      toast(message);
    } catch (e) {
      console.error('Toast error:', e);
      console.log('Toast message was:', message);
    }
  },
  warning: (message: string) => {
    try {
      toast(message, { icon: '⚠️' });
    } catch (e) {
      console.error('Toast error:', e);
      console.log('Toast message was:', message);
    }
  }
}; 