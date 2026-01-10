import { Staff } from "./types";
import { CreateStaffInput } from "@/lib/zod.schema/create-staff";

export function mapStaffToFormData(staff: Staff): Partial<CreateStaffInput> {
  if (staff.role !== "salesman" && staff.role !== "delivery_boy") {
    throw new Error("Invalid staff role for edit");
  }

  return {
    name: staff.name,
    email: staff.email,
    mobile: staff.mobile,
    altMobile: staff.altMobile ?? "",
    role: staff.role,
  };
}
