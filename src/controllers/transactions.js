import Transactions from '../models/transaction.js';
import catchAsync from "../utils/catchAsync.js";
import RequestUtil from '../utils/requestUtils.js';

const TransactionController = {

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
      .select("sender receiver description quantity docType createdAt")
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
    
    const newLove = new Transactions(req.body);
    
    await newLove.save();
    
    return res.sendResponse(newLove, 'Transaction created', 201);
  
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