import { atomWithStorage } from "jotai/utils";

export const mainBalance = atomWithStorage("balance-main", 0);
export const privateBalance = atomWithStorage("balance-private", 0);
