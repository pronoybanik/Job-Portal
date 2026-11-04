import multer from "multer";


const storage = multer.memoryStorage();

const uploadFile = multer({ storage: storage }).fields([
  { name: "profilePic", maxCount: 1 },
  { name: "resume", maxCount: 1 },
]);

export default uploadFile;
