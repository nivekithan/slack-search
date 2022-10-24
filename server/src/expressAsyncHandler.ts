import { RequestHandler } from "express";

export const expressAsyncHanlder = (
  callback: RequestHandler
): RequestHandler => {
  const newRequestHandler: RequestHandler = (req, res, next) => {
    return Promise.resolve(callback(req, res, next)).catch(next);
  };

  return newRequestHandler;
};
