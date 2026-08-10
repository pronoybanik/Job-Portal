import DataURIParser from "datauri/parser.js";

import path from "path";

const getBufferFromFile = (file: Express.Multer.File): Buffer => {
  const parser = new DataURIParser();

  const extName = path.extname(file.originalname).toString();
  return parser.format(extName, file.buffer).content as unknown as Buffer;
  
};

export default getBufferFromFile;
