/**
 * Storage Utilities for Data Exports
 * Handles file uploads to Supabase Storage and signed URL generation
 */

import { getSupabaseServerClient } from '@/lib/supabase/server';

const EXPORTS_BUCKET = 'data-exports';
const SIGNED_URL_EXPIRY = 24 * 60 * 60; // 24 hours in seconds

/**
 * Initialize exports storage bucket (run once during setup)
 */
export async function initializeExportsBucket() {
  const supabase = await getSupabaseServerClient();

  // Create bucket if it doesn't exist
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === EXPORTS_BUCKET);

  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket(EXPORTS_BUCKET, {
      public: false, // Private bucket
      fileSizeLimit: 52428800, // 50MB limit
      allowedMimeTypes: ['application/json'],
    });

    if (error) {
      console.error('Failed to create exports bucket:', error);
      throw error;
    }
  }
}

/**
 * Upload export data to storage
 * @param userId - User ID
 * @param exportId - Export request ID
 * @param data - JSON data to export
 * @returns File path in storage
 */
export async function uploadExportData(
  userId: string,
  exportId: string,
  data: object
): Promise<string> {
  const supabase = await getSupabaseServerClient();

  // Create file path: exports/{userId}/{exportId}.json
  const filePath = `exports/${userId}/${exportId}.json`;

  // Convert data to JSON string
  const jsonData = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });

  // Upload to storage
  const { error } = await supabase.storage
    .from(EXPORTS_BUCKET)
    .upload(filePath, blob, {
      contentType: 'application/json',
      upsert: true, // Replace if exists
    });

  if (error) {
    console.error('Failed to upload export:', error);
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  return filePath;
}

/**
 * Generate a signed URL for downloading export
 * @param filePath - File path in storage
 * @param expiresIn - Expiry time in seconds (default 24 hours)
 * @returns Signed URL
 */
export async function getExportDownloadUrl(
  filePath: string,
  expiresIn: number = SIGNED_URL_EXPIRY
): Promise<string> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase.storage
    .from(EXPORTS_BUCKET)
    .createSignedUrl(filePath, expiresIn);

  if (error || !data) {
    console.error('Failed to create signed URL:', error);
    throw new Error(`Failed to generate download URL: ${error?.message}`);
  }

  return data.signedUrl;
}

/**
 * Delete export file from storage
 * @param filePath - File path in storage
 */
export async function deleteExportFile(filePath: string): Promise<void> {
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase.storage
    .from(EXPORTS_BUCKET)
    .remove([filePath]);

  if (error) {
    console.error('Failed to delete export file:', error);
    // Don't throw - file might already be deleted
  }
}

/**
 * Delete all export files for a user
 * @param userId - User ID
 */
export async function deleteAllUserExports(userId: string): Promise<void> {
  const supabase = await getSupabaseServerClient();

  // List all files for user
  const { data: files, error: listError } = await supabase.storage
    .from(EXPORTS_BUCKET)
    .list(`exports/${userId}`);

  if (listError) {
    console.error('Failed to list user exports:', listError);
    return;
  }

  if (!files || files.length === 0) {
    return;
  }

  // Delete all files
  const filePaths = files.map(f => `exports/${userId}/${f.name}`);
  const { error: deleteError } = await supabase.storage
    .from(EXPORTS_BUCKET)
    .remove(filePaths);

  if (deleteError) {
    console.error('Failed to delete user exports:', deleteError);
  }
}

/**
 * Check if export file exists
 * @param filePath - File path in storage
 */
export async function exportFileExists(filePath: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase.storage
    .from(EXPORTS_BUCKET)
    .list(filePath.split('/').slice(0, -1).join('/'));

  if (error || !data) {
    return false;
  }

  const fileName = filePath.split('/').pop();
  return data.some(file => file.name === fileName);
}

/**
 * Get file size for an export
 * @param filePath - File path in storage
 * @returns File size in bytes
 */
export async function getExportFileSize(filePath: string): Promise<number> {
  const supabase = await getSupabaseServerClient();

  const pathParts = filePath.split('/');
  const fileName = pathParts.pop();
  const folder = pathParts.join('/');

  const { data, error } = await supabase.storage
    .from(EXPORTS_BUCKET)
    .list(folder);

  if (error || !data) {
    return 0;
  }

  const file = data.find(f => f.name === fileName);
  return file?.metadata?.size || 0;
}
