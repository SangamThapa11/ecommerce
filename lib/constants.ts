export enum UserRoles {
  ADMIN = "admin",
  SELLER = "seller",
  CUSTOMER = "customer"
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other"
}

export enum Status {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum InputType {
  TEXT = "text",
  EMAIL = "email",
  URL = "url",
  NUMBER = "number"
}

export interface IImageType {
  publicId: string,
  imageUrl: string,
  thumbUrl: string,
}