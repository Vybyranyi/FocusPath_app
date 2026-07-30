import { Request, Response } from 'express';
import * as authService from '@services/authService';
import { created, ok } from '@utils/apiResponse';
import type { TypedRequest } from '@middlewares/validate';
import type {
    ChangePasswordDto,
    LoginDto,
    RegisterDto,
    UpdateProfileDto,
} from '@validation/authSchemas';

// Handlers translate HTTP into a service call and back. Shape and types are the
// schemas' job, business rules are the service's, and turning a failure into a
// response is the error handler's — so there is nothing left to do here but
// call, and no try/catch, since Express 5 forwards a rejection on its own.

export const register = async (req: TypedRequest<RegisterDto>, res: Response) =>
    created(res, await authService.register(req.body));

export const login = async (req: TypedRequest<LoginDto>, res: Response) =>
    ok(res, await authService.login(req.body));

export const verifyToken = async (req: Request, res: Response) =>
    ok(res, { user: await authService.getProfile(req.userId) });

export const updateProfile = async (req: TypedRequest<UpdateProfileDto>, res: Response) =>
    ok(res, { user: await authService.updateProfile(req.userId, req.body) });

export const changePassword = async (req: TypedRequest<ChangePasswordDto>, res: Response) => {
    await authService.changePassword(req.userId, req.body);
    return ok(res, null);
};

export const deleteAccount = async (req: Request, res: Response) => {
    await authService.deleteAccount(req.userId);
    return ok(res, null);
};
