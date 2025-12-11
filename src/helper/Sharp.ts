import sharp = require("sharp");

export async function cropAndSave(
  x: any,
  y: any,
  width: any,
  height: any,
  imageBuffer: any
) {
  return new Promise((resolve, reject) => {
    try {
      sharp(imageBuffer)
        .extract({
          left: Math.round(x),
          top: Math.round(y),
          width: Math.round(width),
          height: Math.round(height),
        })
        .toBuffer()
        .then((croppedImageBuffer: any) => {
          console.log(croppedImageBuffer);
          resolve(croppedImageBuffer);
        })
        .catch((err: any) => {
          console.error("Error cropping image:", err);
          reject(err);
        });
    } catch (error) {
      console.error("Error:", error);
      reject(error);
    }
  });
}

export async function compressImage(imageBuffer: Buffer): Promise<Buffer> {
  return sharp(imageBuffer)
    .jpeg({
      quality: 70, 
      chromaSubsampling: "4:2:0",
    })
    .toBuffer();
}


