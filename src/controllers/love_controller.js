import Love from '../models/love.js';
import catchAsync from "../utils/catchAsync.js";
import RequestUtil from '../utils/requestUtils.js';

const LoveController = {

  getAllLove: catchAsync(async (req, res, next) => {

    const listLove = await Love.find();

    return res.sendResponse(listLove, 'List of love',200);
  
  }),
  getLoveById: catchAsync(async (req, res, next) => {
          
    const love = await Love.findById(req.params.id);

    if(!love){

      return res.status(404).json(RequestUtil.prepareResponse('error', {}, 'Love not found'));

    }
        
    res.status(200).json(RequestUtil.prepareResponse('success', love, 'Love by id'));

  }),
  createNewLove: catchAsync(async (req, res, next) => {
    
    const newLove = new Love(req.body);
    
    await newLove.save();
    
    return res.sendResponse(newLove, 'Love created', 201);
  
  }),
  updateLove: catchAsync(async (req, res, next) => {

    const love = await Love.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if(!love){

      return res.status(404).json(RequestUtil.prepareResponse('error', {}, 'Love not found'));

    }
    
    res.status(200).json(RequestUtil.prepareResponse('success', love, 'Love updated'));
  
  }),
  deleteLove: catchAsync(async (req, res, next) => {

    const love = await Love.findByIdAndDelete(req.params.id);

    if(!love){

      return res.status(404).json(RequestUtil.prepareResponse('error', {}, 'Love not found'));

    }

    res.status(200).json(RequestUtil.prepareResponse('success', { ok: true }, 'Love deleted'));

  })
};

export default LoveController;