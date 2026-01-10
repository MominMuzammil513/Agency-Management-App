export type StaffRole =
  | "salesman"
  | "delivery_boy"
  | "owner_admin"
  | "super_admin";

export type Staff = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  altMobile: string | null; // ✅ match DB
  role: StaffRole; // ✅ match DB
  isActive: boolean;
  createdAt: string;
};

export type StaffFormData = {
  name: string;
  email: string;
  mobile: string;
  altMobile?: string;
  role: "salesman" | "delivery_boy";
};
