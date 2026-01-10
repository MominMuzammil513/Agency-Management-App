export type StaffRole = 
  | "salesman" 
  | "delivery_boy" 
  | "owner_admin" 
  | "super_admin";

// Matches DB shape
export type Staff = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  altMobile: string | null;
  role: StaffRole;
  isActive: boolean;
  createdAt: string;
};

// Form Data - Password is optional (undefined/empty string allowed on edit)
export type StaffFormData = {
  name: string;
  email: string;
  mobile: string;
  altMobile?: string; 
  role: "salesman" | "delivery_boy";
  password?: string; // ✅ Added optional password
};