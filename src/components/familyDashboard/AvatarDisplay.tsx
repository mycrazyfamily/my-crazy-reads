import React, { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface AvatarDisplayProps {
  imgSrc: string | null;
  avatarUrl: string | null;
  isLoading: boolean;
  isNew: boolean;
  hasError: boolean;
  onImageLoad: () => void;
  onImageError: () => void;
  fallback: React.ReactNode;
  alt: string;
  size?: string;
  ageAlert?: { hasAlert: boolean; message: string };
}

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  imgSrc,
  avatarUrl,
  isLoading,
  isNew,
  hasError,
  onImageLoad,
  onImageError,
  fallback,
  alt,
  size = 'h-16 w-16',
  ageAlert,
}) => {
  const [open, setOpen] = useState(false);
  const canOpen = !!avatarUrl && !hasError;

  // No avatar URL at all → generating state
  if (!avatarUrl) {
    return (
      <div className={cn('relative rounded-full overflow-hidden flex items-center justify-center', size)}>
        <Skeleton className={cn('rounded-full', size)} />
        <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] text-muted-foreground bg-background/80 py-0.5">
          🎨 Création...
        </span>
      </div>
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
        {isLoading && (
          <Skeleton className={cn('absolute inset-0 rounded-full', size)} />
        )}
        <img
          src={imgSrc!}
          alt={alt}
          onLoad={onImageLoad}
          onError={onImageError}
          className={cn(
            'h-full w-full object-cover rounded-full transition-opacity duration-500',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
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
              <p className="text-muted-foreground mt-1">Clique sur « Modifier » pour mettre à jour son avatar.</p>
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
