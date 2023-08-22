import { Request, Response, NextFunction } from "express";
// declare module "express" {
//   export interface Request {
//     user: any;
//   }
// }

// interface UpdatedRequest extends Request {
//     user: string
// }
require("dotenv").config();
import jwt from "jsonwebtoken";

function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string,
      (err, payload) => {
        if (err) {
          return res.sendStatus(403);
        }
        if(!payload) {
            return res.sendStatus(403);
        }
        if(typeof payload === "string"){
            return res.sendStatus(403);
        }
        req.headers["id"] = payload.id;
        next();
      }
    );
  } else {
    res.sendStatus(401);
  }
}

export default authenticateToken;
