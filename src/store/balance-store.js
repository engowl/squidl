import { atomWithStorage } from "jotai/utils";

export const mainBalance = atomWithStorage("balance-main", 3000);
export const privateBalance = atomWithStorage("balance-private", 3000);
