import * as rp from "request-promise-native";
import { rpOptions } from "../rpOptions";

export interface ISequence {
  description: string;
  events: string[];
  id: string;
  name: string;
  url: string;
}

export class Sequences {
  constructor(private sequencesUrl: string) { }

  public getList(): Promise<ISequence[]> {
    return rp(rpOptions("GET", this.sequencesUrl));
  }

  public getOne(url: string): Promise<ISequence> {
    return rp(rpOptions("GET", url));
  }

  public create(body: { description: string, name: string, events: string[] }): Promise<string> {
    return rp(rpOptions("POST", this.sequencesUrl, body));
  }

  public update(url: string, body: { description: string, name: string, events: string[] }): Promise<ISequence> {
    return rp(rpOptions("PUT", url, body));
  }

  public deleteOne(url: string): Promise<any> {
    return rp(rpOptions("DELETE", url));
  }

  public updateUrl(url: string) {
    this.sequencesUrl = url;
  }
}
