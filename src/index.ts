import * as rp from "request-promise-native";
import config from "./config";
import { Config } from "./config";
import { rpOptions } from "./rpOptions";
export { Model } from "./model";
export { Twiglet } from "./twiglet";

/**
 * Used to login to twig-api and set the cookie needed for future requests. Only needs to be called
 * once.
 *
 * @export
 * @param {string} email
 * @param {string} password
 * @returns {Promise<string>} API currently responds with OK
 */
export function login(email: string, password: string): Promise<string> {
  return rp(rpOptions("POST", `${config.apiUrl}/login`, { email, password }));
}

/**
 * Returns the config object. Call this to get the instance that every other class/method uses
 * as a configuration object
 *
 * @export
 * @returns {Config} the instance used throughout the program for configuration.
 */
export function getConfig(): Config {
  return config;
}
