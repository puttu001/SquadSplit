import { v2 as cloudinary } from 'cloudinary';
import { env } from '../../config/env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key:    env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

function uploadStream(
  buffer: Buffer,
  options: object,
): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: 'image', ...options },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Upload failed'));
        resolve(result.secure_url);
      },
    ).end(buffer);
  });
}

export function uploadAvatar(fileBuffer: Buffer, userId: string): Promise<string> {
  return uploadStream(fileBuffer, {
    folder:         'squadsplit/avatars',
    public_id:      userId,
    overwrite:      true,
    transformation: [{ width: 256, height: 256, crop: 'fill', gravity: 'face' }],
  });
}

export function uploadGroupImage(fileBuffer: Buffer, groupId: string): Promise<string> {
  return uploadStream(fileBuffer, {
    folder:         'squadsplit/groups',
    public_id:      groupId,
    overwrite:      true,
    transformation: [{ width: 512, height: 512, crop: 'fill' }],
  });
}
