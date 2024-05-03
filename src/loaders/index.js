import mongooseLoader from "./mongoose.js";
import expressLoader from "./express.js";

export default async (app) => {
  expressLoader(app);
  await mongooseLoader();
};
