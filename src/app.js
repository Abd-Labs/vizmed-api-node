import { port } from './config/index.js';
import createServer from './server.js';


const app = createServer();

app.listen(port, err => {
  if (err) {
    console.log(err);
    return process.exit(1);
  }
  console.log(`Server is running on ${port}`);
});

export default app