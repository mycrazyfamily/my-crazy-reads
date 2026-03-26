import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface AvatarDisplayProps {
  imgSrc: string | null;
  avatarUrl: string | null;
  isLoading: boolean;
  isNew: boolean;
  hasError: boolean;
  isRegenerating?: boolean;
  onImageLoad: () => void;
  onImageError: () => void;
  fallback: React.ReactNode;
  alt: string;
  size?: string;
  ageAlert?: { hasAlert: boolean; message: string };
}

const shimmerKeyframes = `
@keyframes avatar-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes avatar-emoji-pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.1); }
}
`;

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  imgSrc,
  avatarUrl,
  isLoading,
  isNew,
  hasError,
  isRegenerating = false,
  onImageLoad,
  onImageError,
  fallback,
  alt,
  size = 'h-16 w-16',
  ageAlert,
}) => {
  const [open, setOpen] = useState(false);
  const hasAvatar = Boolean(avatarUrl?.trim());
  const canOpen = hasAvatar && !hasError;

  // Show shimmer when no avatar OR when regenerating
  const showShimmer = !hasAvatar || isRegenerating;

  if (showShimmer) {
    return (
      <>
        <style>{shimmerKeyframes}</style>
        <div className={cn('relative rounded-full overflow-hidden flex items-center justify-center', size)}>
          <div
            className={cn('absolute inset-0 rounded-full', size)}
            style={{
              background: 'linear-gradient(90deg, hsl(162 39% 64% / 0.2) 0%, hsl(162 39% 64% / 0.4) 50%, hsl(162 39% 64% / 0.2) 100%)',
              backgroundSize: '200% 100%',
              animation: 'avatar-shimmer 1.8s ease-in-out infinite',
            }}
          />
          <span
            className="absolute text-lg"
            style={{
              top: '40%',
              left: '50%',
              animation: 'avatar-emoji-pulse 2s ease-in-out infinite',
            }}
          >
            🎨
          </span>
          <span
            className="absolute bottom-0.5 left-0 right-0 text-center font-light"
            style={{ fontSize: '8px', color: 'hsl(213 91% 54% / 0.6)' }}
          >
            Création...
          </span>
        </div>
      </>
    );
  }

  // Has URL but errored → fallback
  if (hasError) {
    return (
      <div className={cn('relative rounded-full overflow-hidden flex items-center justify-center bg-muted', size)}>
        {fallback}
      </div>
    );
  }

  const showAgeAlert = ageAlert?.hasAlert && !isNew;

  const avatarElement = (
    <div className="relative">
      <div
        className={cn(
          'relative rounded-full overflow-hidden',
          size,
          isNew && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
          showAgeAlert && 'ring-2 ring-orange-400 ring-offset-2',
          canOpen && 'cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all'
        )}
        onClick={() => canOpen && setOpen(true)}
      >
        <img
          src={imgSrc!}
          alt={alt}
          onLoad={onImageLoad}
          onError={onImageError}
          className="h-full w-full rounded-full"
          style={{
            transition: 'opacity 1.2s ease-in-out, transform 1.2s ease-out',
            opacity: 1,
            transform: 'scale(1)',
            objectFit: 'cover',
            objectPosition: 'center top',
          }}
        />
        {isNew && (
          <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-primary border-2 border-background animate-pulse" />
        )}
      </div>

      {showAgeAlert && (
        <span className="absolute -top-1 -right-1 z-10 flex items-center justify-center h-6 w-6 rounded-full bg-orange-500 border-2 border-white text-white text-[11px] font-bold cursor-help shadow-md animate-pulse">
          !
        </span>
      )}
    </div>
  );

  return (
    <>
      {showAgeAlert ? (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              {avatarElement}
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px] text-center text-xs">
              <p>{ageAlert.message}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        avatarElement
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md flex items-center justify-center p-2 bg-background/95">
          <img
            src={imgSrc!}
            alt={alt}
            className="max-h-[70vh] max-w-full object-contain rounded-lg"
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AvatarDisplay;
