import { merge, pick } from "ramda";
import * as rp from "request-promise-native";
import { Changelog } from "../changelog";
import config from "../config";
import { Events } from "../events";
import {
  ILatestCommit,
  ILink,
  INode,
  ITwigletListResponse,
  ITwigletResponse,
  ITwigletUpdate,
} from "../interfaces";
import { rpOptions } from "../rpOptions";
import { Sequences } from "../sequences";
import { TwigletModel } from "../twigletModel";

export class Twiglet {
  public static getList(): Promise<ITwigletListResponse[]> {
    return rp(rpOptions("GET", `${config.apiUrl}/twiglets`))
    .then((list: ITwigletListResponse[]) => {
      return list.map((entry) => pick(["name", "description", "url"], entry) as ITwigletListResponse);
    });
  }

  public static create(body: {
        name: string;
        description: string;
        model?: string;
        json?: string;
        cloneTwiglet?: string;
        commitMessage: string;
      }): Promise<Twiglet> {
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
  public model: TwigletModel;
  public events: Events;
  public sequences: Sequences;
  private _rev: string; // tslint:disable-line variable-name
  private url: string;

  constructor(twiglet: ITwigletResponse) {
    this.changelog = new Changelog(twiglet.changelog_url);
    this.model = new TwigletModel(twiglet.model_url);
    this.events = new Events(twiglet.events_url);
    this.sequences = new Sequences(twiglet.sequences_url);
    this.assignIn(twiglet);
  }

  public update(body: {
        name?: string;
        description?: string;
        commitMessage: string;
        nodes?: INode[];
        links?: ILink[];
      }) {
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
    this.model.updateUrl(twiglet.model_url);
    this.events.updateUrl(twiglet.events_url);
    this.sequences.updateUrl(twiglet.sequences_url);
    this._rev = twiglet._rev;
    this.url = twiglet.url;
  }
}
