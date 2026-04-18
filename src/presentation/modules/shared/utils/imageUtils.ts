export function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  maxSize: number = 512
): Promise<File> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("No se pudo obtener el contexto del canvas"));
        return;
      }

      // Calculamos el factor de escala para mantener el maxSize
      let finalWidth = pixelCrop.width;
      let finalHeight = pixelCrop.height;

      if (finalWidth > maxSize) {
        finalHeight = Math.round((maxSize * finalHeight) / finalWidth);
        finalWidth = maxSize;
      }
      if (finalHeight > maxSize) {
        finalWidth = Math.round((maxSize * finalWidth) / finalHeight);
        finalHeight = maxSize;
      }

      // Configuramos el canvas al tamaño final escalado
      canvas.width = finalWidth;
      canvas.height = finalHeight;

      // Dibujamos la imagen recortada y escalada al mismo tiempo
      // sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        finalWidth,
        finalHeight
      );

      // Exportamos a WebP (0.8 quality)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Error al crear blob del canvas"));
            return;
          }
          const file = new File([blob], "avatar.webp", {
            type: "image/webp",
            lastModified: Date.now(),
          });
          resolve(file);
        },
        "image/webp",
        0.8
      );
    };

    image.onerror = () => {
      reject(new Error("Error cargando la imagen para procesar"));
    };
  });
}
