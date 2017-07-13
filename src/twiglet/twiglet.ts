import { merge, pick } from "ramda";
import * as rp from "request-promise-native";
import { Changelog } from "../changelog";
import config from "../config";
import { rpOptions } from "../rpOptions";
import { ILatestCommit, ILink, INode } from "./../interfaces";

export interface ITwigletCreation {
  name: string;
  description: string;
  model?: string;
  json?: string;
  cloneTwiglet?: string;
  commitMessage: string;
}

export interface ITwigletUpdate {
  name?: string;
  description?: string;
  commitMessage: string;
  nodes?: INode[];
  links?: ILink[];
}

export interface ITwigletListResponse {
  name: string;
  description: string;
  url: string;
}

export interface ITwigletResponse {
  nodes: INode[];
  links: ILink[];
  _rev: string;
  name: string;
  description: string;
  latestCommit: ILatestCommit;
  url: string;
  model_url: string;
  changelog_url: string;
  views_url: string;
  json_url: string;
  events_url: string;
  sequences_url: string;
}

export class Twiglet {
  public static getList(): Promise<ITwigletListResponse[]> {
    return rp(rpOptions("GET", `${config.apiUrl}/twiglets`))
    .then((list: ITwigletListResponse[]) => {
      return list.map((entry) => pick(["name", "description", "url"], entry) as ITwigletListResponse);
    });
  }

  public static create(body: ITwigletCreation): Promise<Twiglet> {
    return rp(rpOptions("POST", `${config.apiUrl}/twiglets`, body))
    .then((model: ITwigletResponse) => {
      return new Twiglet(model);
    });
  }

  public static instance(url: string): Promise<Twiglet> {
    return rp(rpOptions("GET", url))
    .then((model: ITwigletResponse) => {
      return new Twiglet(model);
    });
  }

  public nodes: INode[];
  public links: ILink[];
  public name: string;
  public description: string;
  public latestCommit: ILatestCommit;
  public changelog: Changelog;
  private _rev: string; // tslint:disable-line variable-name
  private url: string;
  private modelUrl: string;
  private viewsUrl: string;
  private jsonUrl: string;
  private eventsUrl: string;
  private sequencesUrl: string;

  constructor(twiglet: ITwigletResponse) {
    this.changelog = new Changelog(twiglet.changelog_url);
    this.assignIn(twiglet);
  }

  public update(body: ITwigletUpdate) {
    const toUpdate = pick(["_rev"], this);
    return rp(rpOptions("PATCH", this.url, merge(toUpdate, body)))
    .then((twiglet: ITwigletResponse) => {
      this.assignIn(twiglet);
    });
  }

  public remove() {
    return rp(rpOptions("DELETE", this.url))
    .then(() => {
      this.assignIn({
        _rev: null,
        changelog_url: null,
        description: null,
        events_url: null,
        json_url: null,
        latestCommit: null,
        links: null,
        model_url: null,
        name: null,
        nodes: null,
        sequences_url: null,
        url: null,
        views_url: null,
      });
    });
  }

  private assignIn(twiglet: ITwigletResponse) {
    this.nodes = twiglet.nodes;
    this.links = twiglet.links;
    this.name = twiglet.name;
    this.description = twiglet.description;
    this.latestCommit = twiglet.latestCommit;
    this.changelog.updateUrl(twiglet.changelog_url);
    this._rev = twiglet._rev;
    this.url = twiglet.url;
    this.modelUrl = twiglet.model_url;
    this.viewsUrl = twiglet.views_url;
    this.jsonUrl = twiglet.json_url;
    this.eventsUrl = twiglet.events_url;
    this.sequencesUrl = twiglet.sequences_url;
  }
}
