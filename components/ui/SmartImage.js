import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

/**
 * next/image wrapper that renders a branded placeholder when no image is set
 * (e.g. products the admin has not photographed yet).
 */
export default function SmartImage({ src, alt = '', className = '', sizes = '(max-width: 768px) 100vw, 33vw', fill = true, preload = false, quality, ...rest }) {
  if (!src) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-champagne-100 to-champagne-200 text-champagne-600 ${className}`} role="img" aria-label={alt}>
        <ImageIcon className="h-10 w-10 opacity-60" strokeWidth={1.4} aria-hidden />
      </div>
    );
  }
  return <Image src={src} alt={alt} fill={fill} sizes={sizes} className={`object-cover ${className}`} preload={preload} quality={quality} {...rest} />;
}
