export { IEntity, IEntityAttribute } from "./models";
export { IAttribute, ILink, INode } from "./twiglets";

export interface ILatestCommit {
  message: string;
  user: string;
  timestamp: string;
  doReplacement?: boolean;
}
