import Router from 'express';
import passport from 'passport';

import LoveController from '../controllers/love_controller.js';
import checkPermissions from '../middlewares/checkPermissions.js'

import validateMongoId from '../middlewares/validateMongoId.js';
import validateSchema from '../middlewares/validate-schema.js';
import validator from '../validators/love/index.js'

const router = Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get("/", checkPermissions('read', 'all'), LoveController.getAllLove);

router.post("/", checkPermissions('read', 'all'), validateSchema(validator.loveCreateSchema), LoveController.createNewLove)

router.get("/:id", checkPermissions('read', 'all'), validateMongoId, LoveController.getLoveById)

router.patch("/:id", checkPermissions('read', 'all'), validateMongoId, validateSchema(validator.loveUpdateSchema), LoveController.updateLove)

router.delete("/:id", checkPermissions('read', 'all'), validateMongoId, LoveController.deleteLove);
    
export default router;
    