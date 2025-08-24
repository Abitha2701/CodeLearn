import { useState, useCallback } from 'react';

const useLoginModal = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [redirectPath, setRedirectPath] = useState('');

  const openLoginModal = useCallback((path = window.location.pathname) => {
    setRedirectPath(path);
    setIsLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  return {
    isLoginModalOpen,
    redirectPath,
    openLoginModal,
    closeLoginModal
  };
};

export default useLoginModal;
