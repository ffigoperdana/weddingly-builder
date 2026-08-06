// Media Storage utilities for MinIO + imgproxy
// MinIO: S3-compatible object storage for files
// imgproxy: On-the-fly image processing

export interface UploadResult {
  success: boolean;
  url: string;
  objectKey: string;
  bucket: string;
  contentType: string;
  error?: string;
}

export interface MinioConfig {
  endpoint: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
  useSSL: boolean;
}

/**
 * Generate a unique object key for uploaded files
 */
export function generateObjectKey(filename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  const sanitizedName = filename
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[^a-zA-Z0-9]/g, '-') // Replace special chars
    .substring(0, 50); // Limit length
  
  return `${timestamp}-${random}-${sanitizedName}.${extension}`;
}

/**
 * Upload a file to MinIO via presigned URL or direct upload
 * This is called from the server-side API
 */
export async function uploadToMinio(
  file: File | Buffer,
  objectKey: string,
  contentType: string,
): Promise<UploadResult> {
  const endpoint = import.meta.env.MINIO_ENDPOINT;
  const accessKey = import.meta.env.MINIO_ACCESS_KEY;
  const secretKey = import.meta.env.MINIO_SECRET_KEY;
  const bucket = import.meta.env.MINIO_BUCKET || 'weddingly';

  if (!endpoint || !accessKey || !secretKey) {
    return {
      success: false,
      url: '',
      objectKey: '',
      bucket: '',
      contentType: '',
      error: 'MinIO configuration missing',
    };
  }

  // Note: Actual MinIO upload is done in the API route using AWS SDK
  // This function is mainly for type definitions and helpers

  return {
    success: true,
    url: getPublicUrl(objectKey),
    objectKey,
    bucket,
    contentType,
  };
}

/**
 * Get the public MinIO URL for a file (direct access, no processing)
 */
export function getPublicUrl(objectKey: string): string {
  const minioPublicUrl = import.meta.env.PUBLIC_MINIO_URL || import.meta.env.MINIO_PUBLIC_URL;
  const bucket = import.meta.env.MINIO_BUCKET || 'weddingly';

  if (!minioPublicUrl) {
    console.error('MinIO public URL not configured');
    return '';
  }

  return `${minioPublicUrl}/${bucket}/${objectKey}`;
}

/**
 * Generate imgproxy URL for image transformations
 * 
 * imgproxy URL format: /{processing_options}/{encoded_source_url}
 * For S3: /rs:fit:300:300/plain/s3://bucket/path/to/image.jpg
 * 
 * @see https://docs.imgproxy.net/usage/processing
 */
export function getImgproxyUrl(
  objectKey: string,
  options?: {
    width?: number;
    height?: number;
    resizeType?: 'fit' | 'fill' | 'auto' | 'force';
    gravity?: 'sm' | 'no' | 'so' | 'ea' | 'we' | 'noea' | 'nowe' | 'soea' | 'sowe' | 'ce';
    quality?: number;
    format?: 'jpg' | 'png' | 'webp' | 'avif';
    blur?: number;
  },
): string {
  const imgproxyUrl = import.meta.env.PUBLIC_IMGPROXY_URL || import.meta.env.IMGPROXY_URL;
  const bucket = import.meta.env.MINIO_BUCKET || 'weddingly';

  if (!imgproxyUrl) {
    // Fallback to direct MinIO URL if imgproxy not configured
    return getPublicUrl(objectKey);
  }

  // Build processing options
  const processingOptions: string[] = [];

  // Resize
  if (options?.width || options?.height) {
    const resizeType = options.resizeType || 'fit';
    const width = options.width || 0;
    const height = options.height || 0;
    processingOptions.push(`rs:${resizeType}:${width}:${height}`);
  }

  // Gravity (for cropping)
  if (options?.gravity) {
    processingOptions.push(`g:${options.gravity}`);
  }

  // Quality
  if (options?.quality) {
    processingOptions.push(`q:${options.quality}`);
  }

  // Format
  if (options?.format) {
    processingOptions.push(`f:${options.format}`);
  }

  // Blur
  if (options?.blur) {
    processingOptions.push(`bl:${options.blur}`);
  }

  // Default options if none specified
  if (processingOptions.length === 0) {
    processingOptions.push('q:80'); // Default quality
  }

  const optionsString = processingOptions.join('/');
  
  // Use S3 source URL format for imgproxy
  const sourceUrl = `s3://${bucket}/${objectKey}`;

  return `${imgproxyUrl}/${optionsString}/plain/${sourceUrl}`;
}

/**
 * Get a thumbnail URL for an image
 */
export function getThumbnailUrl(objectKey: string, size: number = 300): string {
  return getImgproxyUrl(objectKey, {
    width: size,
    height: size,
    resizeType: 'fill',
    quality: 80,
    format: 'webp',
  });
}

/**
 * Get an optimized URL for displaying images
 */
export function getOptimizedUrl(
  objectKey: string,
  maxWidth: number = 1200,
): string {
  return getImgproxyUrl(objectKey, {
    width: maxWidth,
    height: 0, // Auto height
    resizeType: 'fit',
    quality: 85,
    format: 'webp',
  });
}

/**
 * Upload an image file (client-side helper)
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload image');
    }

    return await response.json();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to upload image';
    return {
      success: false,
      url: '',
      objectKey: '',
      bucket: '',
      contentType: '',
      error: message,
    };
  }
}

/**
 * Validate image file before upload
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 10MB',
    };
  }

  // Check file extension
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !validExtensions.includes(extension)) {
    return {
      valid: false,
      error: `File must be one of: ${validExtensions.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Validate audio file before upload
 */
export function validateAudioFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file type
  const validTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/m4a',
    'audio/ogg',
    'audio/x-m4a',
  ];

  const isValidType =
    validTypes.includes(file.type) ||
    !!file.name.match(/\.(mp3|wav|m4a|ogg)$/i);

  if (!isValidType) {
    return {
      valid: false,
      error: 'File must be an audio file (MP3, WAV, M4A, or OGG)',
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 10MB',
    };
  }

  return { valid: true };
}

/**
 * Extract object key from a storage URL
 */
export function extractObjectKey(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // Handle imgproxy URLs: /{options}/plain/s3://bucket/key
    const plainIndex = pathParts.indexOf('plain');
    if (plainIndex !== -1) {
      const s3Path = pathParts.slice(plainIndex + 1).join('/');
      // s3://bucket/key -> key
      const match = s3Path.match(/s3:\/\/[^/]+\/(.+)/);
      return match ? match[1] : null;
    }
    
    // Handle direct MinIO URLs: /bucket/key
    const bucket = import.meta.env.MINIO_BUCKET || 'weddingly';
    const bucketIndex = pathParts.indexOf(bucket);
    if (bucketIndex !== -1) {
      return pathParts.slice(bucketIndex + 1).join('/');
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Format file size to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
