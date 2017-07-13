import { merge, pick } from "ramda";
import * as rp from "request-promise-native";
import { Changelog } from "../changelog";
import config from "../config";
import { rpOptions } from "../rpOptions";
import { IEntity, ILatestCommit } from "./../interfaces";

export interface IModelCreation {
  name: string;
  commitMessage: string;
  entities: { [key: string]: IEntity };
}

export interface IModelUpdate {
  name?: string;
  commitMessage: string;
  entities?: { [key: string]: IEntity };
}

export interface IModelListResponse {
  name: string;
  url: string;
}

export interface IModelResponse {
  entities: { [key: string]: IEntity };
  name: string;
  _rev: string;
  latestCommit: ILatestCommit;
  url: string;
  changelog_url: string;
}

export class Model {
  public static getList(): Promise<IModelListResponse[]> {
    return rp(rpOptions("GET", `${config.apiUrl}/models`));
  }

  public static create(body: IModelCreation): Promise<Model> {
    return rp(rpOptions("POST", `${config.apiUrl}/models`, body))
    .then((model: IModelResponse) => {
      return new Model(model);
    });
  }

  public static instance(url: string): Promise<Model> {
    return rp(rpOptions("GET", url))
    .then((model: IModelResponse) => {
      return new Model(model);
    });
  }

  public entities: { [key: string]: IEntity };
  public name: string;
  public latestCommit: ILatestCommit;
  public changelog: Changelog;
  private _rev: string; // tslint:disable-line variable-name
  private url: string;

  constructor(model: IModelResponse) {
    this.changelog = new Changelog(model.changelog_url);
    this.assignIn(model);
  }

  public update(body: IModelUpdate) {
    const toUpdate = pick(["entities", "name", "_rev"], this);
    return rp(rpOptions("PUT", this.url, merge(toUpdate, body)))
    .then((model: IModelResponse) => {
      this.assignIn(model);
    });
  }

  public remove() {
    return rp(rpOptions("DELETE", this.url))
    .then(() => {
      this.assignIn({
        _rev: null,
        changelog_url: null,
        entities: null,
        latestCommit: null,
        name: null,
        url: null,
      });
    });
  }

  private assignIn(model: IModelResponse) {
    this.entities = model.entities;
    this.name = model.name;
    this._rev = model._rev;
    this.latestCommit = model.latestCommit;
    this.url = model.url;
    this.changelog.updateUrl(model.changelog_url);
  }
}
