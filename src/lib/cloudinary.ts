export interface CloudinaryOptions {
    width?: number;
    height?: number;
    quality?: string | number;
    format?: string;
    blur?: number;
    crop?: string;
}

/**
 * Optimizes a Cloudinary URL by injecting transformation parameters.
 * If the URL is not a Cloudinary URL, it returns the original URL.
 * 
 * @param url The original image URL
 * @param options Optimization options (width, height, quality, format, blur)
 * @returns The optimized URL
 */
export function optimizeCloudinaryUrl(url: string, options: CloudinaryOptions = {}): string {
    if (!url || !url.includes('cloudinary.com')) return url;

    // Default options
    const defaults = {
        quality: 'auto',
        format: 'auto',
    };

    const config = { ...defaults, ...options };
    const transformations: string[] = [];

    // Add transformations
    if (config.format) transformations.push(`f_${config.format}`);
    if (config.quality) transformations.push(`q_${config.quality}`);
    if (config.width) transformations.push(`w_${config.width}`);
    if (config.height) transformations.push(`h_${config.height}`);
    if (config.blur) transformations.push(`e_blur:${config.blur}`);
    if (config.crop) transformations.push(`c_${config.crop}`);

    const params = transformations.join(',');

    // Insert params after /upload/
    return url.replace('/upload/', `/upload/${params}/`);
}
