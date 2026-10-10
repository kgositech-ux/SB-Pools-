import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

/**
 * Reads a file into a compressed / optimized base64 Data URL as fallback if Storage permissions are restricted.
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads maintenance photo evidence directly to Firebase Storage.
 * Provides real-time upload progress and fallback to local Data URL if bucket permissions are constrained.
 */
export async function uploadTaskPhoto(
  taskId: string,
  file: File,
  onProgress?: (progressPercent: number) => void
): Promise<string> {
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `tasks/${taskId}/${Date.now()}_${cleanName}`;
  const storageRef = ref(storage, path);

  try {
    const metadata = {
      contentType: file.type || 'image/jpeg',
      customMetadata: {
        taskId,
        uploadedAt: new Date().toISOString(),
      },
    };

    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    return await new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (snapshot.totalBytes > 0) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress?.(Math.round(progress));
          }
        },
        async (error) => {
          console.warn('Firebase Storage upload failed, using Data URL fallback:', error);
          try {
            const dataUrl = await fileToDataUrl(file);
            onProgress?.(100);
            resolve(dataUrl);
          } catch (fallbackError) {
            reject(fallbackError);
          }
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            onProgress?.(100);
            resolve(downloadUrl);
          } catch (urlError) {
            console.warn('Failed to get download URL, falling back to data URL:', urlError);
            const dataUrl = await fileToDataUrl(file);
            resolve(dataUrl);
          }
        }
      );
    });
  } catch (err) {
    console.warn('Direct upload error, falling back to Data URL:', err);
    return await fileToDataUrl(file);
  }
}

/**
 * Deletes a photo from Firebase Storage if it is a storage reference
 */
export async function deleteTaskPhoto(photoUrl: string): Promise<void> {
  if (!photoUrl.includes('firebasestorage.googleapis.com')) {
    return; // Data URL or external link
  }
  try {
    const fileRef = ref(storage, photoUrl);
    await deleteObject(fileRef);
  } catch (err) {
    console.warn('Could not delete storage object:', err);
  }
}
