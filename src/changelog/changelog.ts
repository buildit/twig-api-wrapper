import { merge, pick } from "ramda";
import * as rp from "request-promise-native";
import { Observable } from "rxjs/Observable";
import config from "../config";
import { rpOptions } from "../rpOptions";

export interface IChangelog {
  message: string;
  user: string;
  timestamp: string;
  replacement?: boolean;
}

export class Changelog {

  constructor(private url: string) {}

  public getLogs(): Promise<IChangelog[]> {
    return rp(rpOptions("GET", this.url))
    .then((object: { changelog: IChangelog[] }) => object.changelog);
  }

  public updateUrl(url: string) {
    this.url = url;
  }
}
