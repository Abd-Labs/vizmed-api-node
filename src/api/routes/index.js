import { Router } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import { serve, setup } from 'swagger-ui-express';
  import { specs, swaggerConfig } from '../../config/index.js';
  import user from './user.js';
  import patients from './patients.js';
  import callback from './callbacks.js';

  const router = Router();

  const specDoc = swaggerJsdoc(swaggerConfig);

  router.use(specs, serve);
  router.get(specs, setup(specDoc, { explorer: true }));

  router.use('/user', user);
  router.use('/patients',patients)
  router.use('/callback', callback)

  export default router;