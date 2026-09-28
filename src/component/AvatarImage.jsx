import React from 'react';
import { resolveAvatarForName } from '../assets';

// A single resilient avatar primitive keeps broken or blocked profile-photo
// URLs from leaving empty frames across cards, rankings, and profile previews.
export const AvatarImage = ({ src, name = 'Scholar', alt, onError, ...props }) => {
  const fallback = resolveAvatarForName(name);

  const handleError = (event) => {
    const image = event.currentTarget;
    image.onerror = null;
    image.src = fallback;
    onError?.(event);
  };

  return (
    <img
      {...props}
      src={src || fallback}
      alt={alt || name}
      referrerPolicy="no-referrer"
      onError={handleError}
    />
  );
};
