import type { APIRoute } from 'astro';
import { env as runtimeEnv } from 'node:process';
import { requireAuth } from '../../lib/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import {
  generateObjectKey,
  getPublicUrl,
  getImgproxyUrl,
} from '../../lib/media-storage';

// Initialize S3 client for MinIO
function getS3Client(): S3Client {
  const endpoint = runtimeEnv.MINIO_ENDPOINT ?? import.meta.env.MINIO_ENDPOINT;
  const accessKey =
    runtimeEnv.MINIO_ACCESS_KEY ?? import.meta.env.MINIO_ACCESS_KEY;
  const secretKey =
    runtimeEnv.MINIO_SECRET_KEY ?? import.meta.env.MINIO_SECRET_KEY;

  return new S3Client({
    endpoint,
    region: 'us-east-1', // MinIO doesn't care about region, but SDK requires it
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
    forcePathStyle: true, // Required for MinIO
  });
}

export const POST: APIRoute = async (context) => {
  try {
    await requireAuth(context);

    const formData = await context.request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Validate file type (images and audio)
    const isImage = file.type.startsWith('image/');
    const isAudio =
      file.type.startsWith('audio/') ||
      !!file.name.match(/\.(mp3|wav|m4a|ogg)$/i);

    if (!isImage && !isAudio) {
      return new Response(
        JSON.stringify({
          error: 'File must be an image or audio file',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ error: 'File size must be less than 10MB' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Check MinIO configuration
    const endpoint = runtimeEnv.MINIO_ENDPOINT ?? import.meta.env.MINIO_ENDPOINT;
    const accessKey =
      runtimeEnv.MINIO_ACCESS_KEY ?? import.meta.env.MINIO_ACCESS_KEY;
    const secretKey =
      runtimeEnv.MINIO_SECRET_KEY ?? import.meta.env.MINIO_SECRET_KEY;
    const bucket = runtimeEnv.MINIO_BUCKET ?? import.meta.env.MINIO_BUCKET ?? 'weddingly';

    if (!endpoint || !accessKey || !secretKey) {
      return new Response(
        JSON.stringify({
          error: 'Storage configuration missing. Check MINIO_* environment variables.',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Generate unique object key
    const objectKey = generateObjectKey(file.name);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to MinIO
    const s3Client = getS3Client();

    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: objectKey,
          Body: buffer,
          ContentType: file.type,
        }),
      );
    } catch (uploadError) {
      console.error('MinIO upload error:', uploadError);
      return new Response(
        JSON.stringify({
          error: `Failed to upload ${isAudio ? 'audio' : 'image'} to storage`,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Generate the URL for accessing the uploaded file
    // For images, use imgproxy URL for processing
    // For audio, use direct MinIO URL
    const fileUrl = isImage
      ? getImgproxyUrl(objectKey, { quality: 85 })
      : getPublicUrl(objectKey);

    return new Response(
      JSON.stringify({
        success: true,
        url: fileUrl,
        objectKey: objectKey,
        bucket: bucket,
        contentType: file.type,
        // Include legacy fields for backward compatibility
        publicId: objectKey,
        format: file.type.split('/')[1] || 'unknown',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to upload file';
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
