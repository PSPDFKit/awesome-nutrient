// src/utils/fileSaver.ts
import { saveAs } from 'file-saver';

export const saveBlobToFile = (blob: Blob, fileName: string) => {
  saveAs(blob, fileName);
};
