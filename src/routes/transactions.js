import Router from 'express';
import passport from 'passport';

import TransactionController from '../controllers/transactions.js';
import checkPermissions from '../middlewares/checkPermissions.js'

import validateMongoId from '../middlewares/validateMongoId.js';
import validateSchema from '../middlewares/validate-schema.js';
import validator from '../validators/transaction/index.js'

const router = Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get("/", checkPermissions('read', 'all'), TransactionController.getAll);

router.post("/", checkPermissions('read', 'all'), validateSchema(validator.transactionCreateSchema), TransactionController.create);

router.get("/:id", checkPermissions('read', 'all'), validateMongoId, TransactionController.getById);

router.patch("/:id", checkPermissions('read', 'all'), validateMongoId, validateSchema(validator.transactionUpdateSchema), TransactionController.update);

router.delete("/:id", checkPermissions('read', 'all'), validateMongoId, TransactionController.delete);

router.patch("/:id/confirm", checkPermissions('read', 'all'), validateMongoId, TransactionController.confirmTransaction);
    
export default router;
    