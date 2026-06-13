import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

type RequestPart = 'body' | 'query' | 'params';

export function validate(schema: AnyZodObject, part: RequestPart = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req[part] = schema.parse(req[part]);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(422).json({
          success: false,
          message: 'Validation error',
          errors: err.flatten().fieldErrors,
        });
      }
      next(err);
    }
  };
}
