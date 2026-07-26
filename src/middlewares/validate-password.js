import messageErrors from '../utils/messages_errors.js';
import AppError from '../utils/appError.js';

const validatePassword = async (password, { req }) => {
    
    const confirm_password = req.body.confirm_password;

    if (!confirm_password) {
      throw new AppError(
          400, 
          messageErrors.CONFIRM_PASSWORD_REQUIRED,
          'FAIL'
      );
    }

    if (password !== confirm_password) {
      throw new AppError(
          404,
          messageErrors.CONTRASENA_NO_COINCIDE
      )
    }

    return true;

};

export default validatePassword;

