/**
 * Dynamically scales and optimizes image URLs for Cloudinary and Unsplash.
 * Appends auto-format, auto-quality, and precise dimensions to prevent layout shifts and heavy payload transfers.
 *
 * @param {string} url - Original image URL
 * @param {object} options - Sizing and cropping parameters
 * @param {number} [options.width] - Intended display width in pixels
 * @param {number} [options.height] - Intended display height in pixels
 * @param {string} [options.cropMode='fill'] - Cloudinary cropping behavior
 * @param {object} [options.crop] - Manual crop coordinates (cropX, cropY, cropWidth, cropHeight)
 * @returns {string} Optimized URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url) return '';

  const { width, height, cropMode = 'fill', crop, quality = 'auto:best' } = options;

  // Cloudinary URL Optimization
  if (url.includes('res.cloudinary.com')) {
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex !== -1) {
      const prefix = url.substring(0, uploadIndex + 8);
      const suffix = url.substring(uploadIndex + 8);

      const transformations = [];

      // Apply coordinates crop if supplied
      if (crop && crop.cropX !== undefined && crop.cropX !== null && crop.cropWidth) {
        transformations.push(`c_crop,x_${crop.cropX},y_${crop.cropY},w_${crop.cropWidth},h_${crop.cropHeight}`);
      }

      // Add sizing parameters
      if (width) {
        transformations.push(`w_${width}`);
      }
      if (height) {
        transformations.push(`h_${height}`);
      }
      if (width || height) {
        // Map 'fit' to 'limit' to prevent Cloudinary from upscaling original images
        const finalCropMode = cropMode === 'fit' ? 'limit' : cropMode;
        transformations.push(`c_${finalCropMode}`);
      }

      // Force format auto-detection and modern compression
      transformations.push(`f_auto,q_${quality}`);

      return `${prefix}${transformations.join('/')}/${suffix}`;
    }
  }

  // Unsplash URL Optimization
  if (url.includes('unsplash.com')) {
    try {
      const parsedUrl = new URL(url);
      parsedUrl.searchParams.set('auto', 'format');
      parsedUrl.searchParams.set('q', '80');
      if (width) parsedUrl.searchParams.set('w', width.toString());
      if (height) parsedUrl.searchParams.set('h', height.toString());
      return parsedUrl.toString();
    } catch (e) {
      return url;
    }
  }

  return url;
};

/**
 * Generates a srcset string for Cloudinary images.
 */
export const getCloudinarySrcSet = (url, options = {}) => {
  if (!url || !url.includes('res.cloudinary.com')) return '';

  const { widths = [400, 800, 1500], cropMode = 'limit', crop, quality = 'auto:best' } = options;

  return widths
    .map(w => {
      const optUrl = getOptimizedImageUrl(url, {
        width: w,
        cropMode,
        crop,
        quality
      });
      return `${optUrl} ${w}w`;
    })
    .join(', ');
};

/**
 * Generates a srcset string for Unsplash images.
 */
export const getUnsplashSrcSet = (url, options = {}) => {
  const { widths = [400, 800, 1500] } = options;
  try {
    return widths
      .map(w => {
        const parsedUrl = new URL(url);
        parsedUrl.searchParams.set('auto', 'format');
        parsedUrl.searchParams.set('q', '80');
        parsedUrl.searchParams.set('w', w.toString());
        return `${parsedUrl.toString()} ${w}w`;
      })
      .join(', ');
  } catch (e) {
    return '';
  }
};

/**
 * Unified helper to generate a responsive srcset string.
 */
export const getImageSrcSet = (url, options = {}) => {
  if (!url) return '';
  if (url.includes('res.cloudinary.com')) {
    return getCloudinarySrcSet(url, options);
  }
  if (url.includes('unsplash.com')) {
    return getUnsplashSrcSet(url, options);
  }
  return '';
};

