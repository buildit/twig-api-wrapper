import * as rp from "request-promise-native";
import config from "./config";
import { rpOptions } from "./rpOptions";
export { Model } from "./model";
export { Twiglet } from "./twiglet";

export function login(email: string, password: string) {
  return rp(rpOptions("POST", `${config.apiUrl}/login`, { email, password }));
}
