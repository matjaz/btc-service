import "websocket-polyfill";
import {
  PrismaClient,
  User as PrismaUser,
  Transaction as PrismaTransaction,
} from "@prisma/client";
import User from "./User";
import Transaction from "./Transaction";

export type User = PrismaUser;
export type Transaction = PrismaTransaction;

const prisma = new PrismaClient().$extends(User).$extends(Transaction);

export default prisma;
