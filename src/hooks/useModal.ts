import { useEffect } from 'react';
import { ModalProps } from '../types';

interface UseModalOptions extends ModalProps {}

export function useModal({
  isOpen,
  onClose,
  enableEscapeKey = true,
  disableBodyScroll = true,
}: UseModalOptions) {
  // ESCキーで閉じる機能
  useEffect(() => {
    if (!isOpen || !enableEscapeKey) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, enableEscapeKey]);

  // スクロールを無効化
  useEffect(() => {
    if (!isOpen || !disableBodyScroll) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen, disableBodyScroll]);

  // 背景クリックで閉じる関数
  const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return {
    handleBackgroundClick,
  };
}
