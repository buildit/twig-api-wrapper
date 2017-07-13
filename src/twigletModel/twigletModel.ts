import { merge, pick } from "ramda";
import * as rp from "request-promise-native";
import { rpOptions } from "../rpOptions";
import { IEntity } from "./../interfaces";

export class TwigletModel {
  constructor(private twigletModelUrl: string) { }

  public get(): Promise<{ [key: string]: IEntity }> {
    return rp(rpOptions("GET", this.twigletModelUrl))
    .then((model) => model.entities);
  }

  public update(body: { entities: { [key: string]: IEntity }, commitMessage: string })
      : Promise<{ [key: string]: IEntity }> {
    return rp(rpOptions("GET", this.twigletModelUrl))
    .then((model) => rp(rpOptions("PUT", this.twigletModelUrl, merge(pick(["_rev"], model), body))));
  }

  public updateUrl(url: string) {
    this.twigletModelUrl = url;
  }
}
