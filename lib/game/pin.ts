import { customAlphabet, nanoid } from "nanoid";

const pinGen = customAlphabet("0123456789", 6);

export function generatePin(): string {
  return pinGen();
}

export function generateHostToken(): string {
  return nanoid(24);
}
