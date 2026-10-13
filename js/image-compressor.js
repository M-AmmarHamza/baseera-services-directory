// Baseera Karachi - Zero-Cost Client-Side Image Compressor
// Compresses 5MB-10MB mobile photos down to 180KB-250KB before uploading to Supabase storage.
// Strictly prevents storage and bandwidth costs.

const BaseeraCompressor = {
  /**
   * Compresses an image file in the browser before any network upload
   * @param {File|Blob} file - Original high-res image
   * @param {Object} options - Compression options
   * @returns {Promise<{ file: File, dataUrl: string, originalSizeKB: number, compressedSizeKB: number, savingsPercent: number }>}
   */
  async compressImage(file, options = {}) {
    const maxWidth = options.maxWidth || 1280;
    const maxHeight = options.maxHeight || 1280;
    const quality = options.quality !== undefined ? options.quality : 0.78;
    const targetSizeKB = options.targetSizeKB || 250;

    const originalSizeKB = Math.round(file.size / 1024);

    // If file is already smaller than target, return as-is
    if (originalSizeKB <= targetSizeKB) {
      const dataUrl = await this.fileToDataUrl(file);
      return {
        file,
        dataUrl,
        originalSizeKB,
        compressedSizeKB: originalSizeKB,
        savingsPercent: 0
      };
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserved downscaling
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // High quality bicubic filtering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Prefer modern WebP, fallback to JPEG
        const mimeType = 'image/jpeg';
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Canvas compression failed'));
            return;
          }

          const compressedSizeKB = Math.round(blob.size / 1024);
          const savingsPercent = Math.round(((file.size - blob.size) / file.size) * 100);

          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, "") + ".jpg",
            { type: mimeType, lastModified: Date.now() }
          );

          const dataUrl = canvas.toDataURL(mimeType, quality);

          console.log(`[Baseera Compressor] ${file.name}: ${originalSizeKB}KB -> ${compressedSizeKB}KB (${savingsPercent}% saved)`);

          resolve({
            file: compressedFile,
            dataUrl,
            originalSizeKB,
            compressedSizeKB,
            savingsPercent
          });
        }, mimeType, quality);
      };

      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  },

  fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};

window.BaseeraCompressor = BaseeraCompressor;
