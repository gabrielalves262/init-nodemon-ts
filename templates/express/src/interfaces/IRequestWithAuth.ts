import { Request } from "express";

export interface IRequestWithAuth extends Request {
  user: { 
    id: string
    name: string
  }
}