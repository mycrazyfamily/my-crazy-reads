import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
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
  size?: string; // tailwind size class e.g. "h-16 w-16"
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
}) => {
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

  return (
    <div className={cn('relative rounded-full overflow-hidden', size, isNew && 'ring-2 ring-primary ring-offset-2 ring-offset-background')}>
      {/* Skeleton while image loads */}
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
  );
};

export default AvatarDisplay;
