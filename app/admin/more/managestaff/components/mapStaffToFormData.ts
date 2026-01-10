import { Staff, StaffFormData } from "./types";

export function mapStaffToFormData(staff: Staff): StaffFormData {
  if (staff.role !== "salesman" && staff.role !== "delivery_boy") {
    throw new Error("Invalid staff role for edit");
  }

  return {
    name: staff.name,
    email: staff.email,
    mobile: staff.mobile,
    altMobile: staff.altMobile ?? "",
    role: staff.role,
    password: "", // ✅ Initialize as empty string for Edit mode
  };
}