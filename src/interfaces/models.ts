export interface IEntity {
  class: string;
  color?: string;
  image: string;
  size?: number;
  type?: string;
  attributes: IEntityAttribute[];
}

export interface IEntityAttribute {
  name: string;
  dataType: string;
  required: boolean;
}
