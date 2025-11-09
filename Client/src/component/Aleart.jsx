// Note: We import from 'react-hot-toast'
import { toast } from 'react-hot-toast';

const showToast = (message, type = 'success') => {
  
  const options = {
    position: 'top-center',
    duration: 3000,
  };

  switch (type) {
    case 'success':
      toast.success(message, options);
      break;
    case 'error':
      toast.error(message, options);
      break;
    case 'info':
      // 'info' isn't a default, so we use a standard toast
      toast(message, { ...options, icon: 'ℹ️' });
      break;
    case 'warning':
      // 'warning' isn't a default, so we use a standard toast
      toast(message, { ...options, icon: '⚠️' });
      break;
    default:
      toast(message, options);
  }
};

export default showToast;