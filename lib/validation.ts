// validation.ts
import * as Yup from "yup";
import { UserRoles, Gender } from "./constants";

export interface IRegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRoles;
  gender: Gender | null;
  phone: string;
  address: string;
  image: File | null;
}

export const RegisterDefaultValues: IRegisterData = {
  name: "",
  email: '',
  password: '',
  confirmPassword: '',
  role: UserRoles.CUSTOMER, // Default to customer
  gender: null,
  phone: '',
  address: '',
  image: null
};

export const RegisterDTO = Yup.object().shape({
  name: Yup.string().min(2).max(50).required(),
  email: Yup.string().email().required(),
  password: Yup.string().required(),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required(),
  role: Yup.string().equals([UserRoles.CUSTOMER]), // Only allow customer role
  gender: Yup.string().matches(/^(male|female|other)$/).nullable(),
  phone: Yup.string().optional().nullable(),
  address: Yup.string().optional().nullable(),
  image: Yup.mixed().nullable()
});