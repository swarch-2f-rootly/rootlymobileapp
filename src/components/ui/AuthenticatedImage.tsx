import React, { useEffect, useState } from 'react';
import { Image, ImageProps, ActivityIndicator, View, StyleSheet } from 'react-native';
import RNFS from 'react-native-fs';
import { useAuthStore } from '../../stores/authStore';
import { Buffer } from 'buffer';

interface AuthenticatedImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  fallbackUri?: string;
}

/**
 * Component to display images that require authentication
 * Handles fetching the image with auth headers and converting to base64
 */
export const AuthenticatedImage: React.FC<AuthenticatedImageProps> = ({
  uri,
  fallbackUri = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
  style,
  ...props
}) => {
  const [imageData, setImageData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { tokens } = useAuthStore();

  useEffect(() => {
    const fetchImage = async () => {
      if (!uri || uri.startsWith('https://images.unsplash.com')) {
        setImageData(uri);
        setIsLoading(false);
        return;
      }

      const tempFilePath = `${RNFS.CachesDirectoryPath}/${Date.now()}.jpg`;

      try {
        setIsLoading(true);
        setHasError(false);

        console.log('📷 Fetching authenticated image:', uri);

        const downloadResult = await RNFS.downloadFile({
          fromUrl: uri,
          toFile: tempFilePath,
          headers: {
            Authorization: `Bearer ${tokens?.access_token}`,
          },
        }).promise;

        if (downloadResult.statusCode === 200) {
          const base64 = await RNFS.readFile(tempFilePath, 'base64');

          if (base64 && base64.length > 0) {
            console.log(`📏 Base64 length: ${base64.length}`);
            const mimeType = detectImageFormat(base64);
            if (!mimeType) {
              throw new Error('Unable to detect image format');
            }
            setImageData(`data:${mimeType};base64,${base64}`);
            console.log(`🖼️ Detected MIME type: ${mimeType}`);
            console.log('✅ Image loaded successfully');
          } else {
            throw new Error('Downloaded file is empty or could not be read as base64');
          }
        } else {
          throw new Error(`HTTP error! status: ${downloadResult.statusCode}`);
        }
      } catch (error) {
        console.error('❌ Error fetching authenticated image:', error);
        setHasError(true);
        setImageData(fallbackUri);
      } finally {
        setIsLoading(false);
        // Clean up the temp file
        RNFS.exists(tempFilePath).then((exists) => {
          if (exists) {
            RNFS.unlink(tempFilePath).catch(() => {});
          }
        });
      }
    };

    fetchImage();
  }, [uri, tokens?.access_token, fallbackUri]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, style]}>
        <ActivityIndicator size="small" color="#22c55e" />
      </View>
    );
  }

  if (hasError || !imageData) {
    return (
      <View style={style}>
        <Image
          {...props}
          source={{ uri: fallbackUri }}
          style={styles.image}
          onError={(error) => {
            console.error('❌ Fallback image render error:', error.nativeEvent.error);
          }}
        />
      </View>
    );
  }

  return (
    <View style={style}>
      <Image
        {...props}
        source={{ uri: imageData }}
        style={styles.image}
        onError={(error) => {
          console.error('❌ Image render error:', error.nativeEvent.error);
          setHasError(true);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

function detectImageFormat(base64: string): string | null {
  // Decode first few bytes
  const buffer = Buffer.from(base64.slice(0, 32), 'base64');
  const bytes = new Uint8Array(buffer);

  console.log(`🔍 First 8 bytes: ${Array.from(bytes.slice(0,8)).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);

  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47 &&
      bytes[4] === 0x0D && bytes[5] === 0x0A && bytes[6] === 0x1A && bytes[7] === 0x0A) {
    return 'image/png';
  }

  // GIF: 47 49 46 38
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return 'image/gif';
  }

  // WebP: 52 49 46 46 .... 57 45 42 50 (RIFF .... WEBP)
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return 'image/webp';
  }

  // Add more formats if needed
  console.warn('⚠️ No known image format detected, defaulting to JPEG');
  return 'image/jpeg';
}

