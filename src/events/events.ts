import * as rp from "request-promise-native";
import { ILink, INode } from "../interfaces";
import { rpOptions } from "../rpOptions";

export interface IEventListResponse {
  description: string;
  id: string;
  name: string;
  url: string;
}

export interface IEventResponse extends IEventListResponse {
  links: ILink[];
  nodes: INode[];
}

export class Events {
  constructor(private eventsUrl: string) { }

  public getList(): Promise<IEventListResponse[]> {
    return rp(rpOptions("GET", this.eventsUrl));
  }

  public getOne(url: string): Promise<IEventResponse> {
    return rp(rpOptions("GET", url));
  }

  public create(body: { name: string, description: string}): Promise<string> {
    return rp(rpOptions("POST", this.eventsUrl, body));
  }

  public deleteOne(url: string): Promise<any> {
    return rp(rpOptions("DELETE", url));
  }

  public deleteAll(): Promise<any> {
    return rp(rpOptions("DELETE", this.eventsUrl));
  }

  public updateUrl(url: string) {
    this.eventsUrl = url;
  }
}
