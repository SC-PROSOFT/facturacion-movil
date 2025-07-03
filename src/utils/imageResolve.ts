// hooks/useOtaImage.ts
import {useEffect, useState} from 'react';
import RNFS from 'react-native-fs';
import {Platform, ImageURISource} from 'react-native';
import OtaUpdater from 'react-native-ota-hot-update';

interface OtaImageOptions {
  prefix?: string; // Si se quiere ruta fija
  dpiList?: string[]; // Lista de carpetas a probar
  lowercase?: boolean;
}

type ImageSource = ImageURISource | number;

const imageCache = new Map<string, ImageSource>();

export function useOtaImage(
  filename: string,
  fallback: number,
  options?: OtaImageOptions,
): ImageSource {
  const [source, setSource] = useState<ImageSource>(() => {
    return imageCache.get(filename) ?? fallback;
  });

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const resolve = async () => {
      if (imageCache.has(filename)) {
        setSource(imageCache.get(filename)!);
        return;
      }

      const versionOta = (await OtaUpdater.getCurrentVersion()).toString();

      const name =
        options?.lowercase === false ? filename : filename.toLowerCase();
      const sanitizedName = name.replace(/[^a-z0-9_.-]/gi, '');
      const dpiFolders = options?.dpiList ?? [
        'drawable-xxxhdpi',
        'drawable-xxhdpi',
        'drawable-xhdpi',
        'drawable-mdpi',
      ];
      const testPaths = options?.prefix
        ? [`${RNFS.DocumentDirectoryPath}/${options.prefix}${sanitizedName}`]
        : dpiFolders.map(
            dpi =>
              `${RNFS.DocumentDirectoryPath}/bundle_${versionOta}/assets/${dpi}/assets_${sanitizedName}`,
          );

      for (const path of testPaths) {
        const exists = await RNFS.exists(path);
        if (exists) {
          const resolved = {uri: `file://${path}`};
          imageCache.set(filename, resolved);
          setSource(resolved);
          return;
        }
      }

      imageCache.set(filename, fallback);
      setSource(fallback);
    };

    resolve();
  }, [filename]);

  return source;
}
