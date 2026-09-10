import Transactions from '../models/transaction.js';
import catchAsync from "../utils/catchAsync.js";
import RequestUtil from '../utils/requestUtils.js';

const TransactionController = {

  confirmTransaction: catchAsync(async (req, res, next) => {

    const love = await Transactions.findById(req.params.id);

    if(!love){

      return res.sendResponse(null, 'Transaction not found', 404);

    }

    if(love.receiver.toString() !== req.user._id.toString()){

      return res.sendResponse(null, 'You are not authorized to confirm this transaction', 403);

    }

    if(love.confirmed){

      return res.sendResponse(null, 'Transaction already confirmed', 400);

    }

    love.confirmed = true;
    
    await love.save();

    return res.status(204).send();

  }),
  getAll: catchAsync(async (req, res, next) => {

    const userId = req.user?._id || req.user?.id || req.uid;

    if (!userId) {
      return res.status(401).json(
        RequestUtil.prepareResponse(401, 'Usuario no autenticado', {})
      );
    }

    const listLove = await Transactions.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .select("sender receiver description confirmed quantity docType createdAt")
      .populate("sender", "full_name email")
      .populate("receiver", "full_name email")
      .populate("docType", "name description icon");

    const transactions = Transactions.toJSONListForUser(listLove, userId);

    return res.sendResponse(transactions, 'List of transactions', 200);
  
  }),
  getById: catchAsync(async (req, res, next) => {
          
    const love = await Transactions.findById(req.params.id);

    if(!love){

      return res.status(404).json(RequestUtil.prepareResponse('error', {}, 'Transaction not found'));

    }
        
    res.status(200).json(RequestUtil.prepareResponse('success', love, 'Transaction by id'));

  }),
  create: catchAsync(async (req, res, next) => {
    
    const userId = req.user?._id || req.user?.id || req.uid;

    const newLove = new Transactions(req.body);

    await newLove.save();

    const createdLove = await Transactions.findById(newLove._id)
      .select("sender receiver description confirmed quantity docType createdAt")
      .populate("sender", "full_name email")
      .populate("receiver", "full_name email")
      .populate("docType", "name description icon");

    const [transaction] = Transactions.toJSONListForUser([createdLove], userId);

    return res.sendResponse(transaction, 'Transaction created', 201);
  
  }),
  update: catchAsync(async (req, res, next) => {

    const love = await Transactions.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if(!love){

      return res.status(404).json(RequestUtil.prepareResponse('error', {}, 'Transaction not found'));

    }
    
    res.status(200).json(RequestUtil.prepareResponse('success', love, 'Transaction updated'));
  
  }),
  delete: catchAsync(async (req, res, next) => {

    const love = await Transactions.findByIdAndDelete(req.params.id);

    if(!love){

      return res.status(404).json(RequestUtil.prepareResponse('error', {}, 'Transaction not found'));

    }

    res.status(200).json(RequestUtil.prepareResponse('success', { ok: true }, 'Transaction deleted'));

  })
};

export default TransactionController;