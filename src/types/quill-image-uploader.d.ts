declare module "quill-image-uploader" {
  export interface ImageUploaderOptions {
    upload: (file: File) => Promise<string>;
  }

  export default class ImageUploader {
    constructor(quill: any, options: ImageUploaderOptions);
  }
}
