

const LoadingSpinner = ({ size = 'default' }) => {
  const sizeClass = size === 'small' ? 'loading-spinner-sm' : 'loading-spinner';
  
  return <div className={sizeClass}></div>;
};

export default LoadingSpinner;