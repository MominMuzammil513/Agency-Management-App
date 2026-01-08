import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";


const Admin = async() => {
  const session = await getServerSession(authOptions);
console.log(session?.expires);
  return (
    <>
      {/* Header Stats */}
      <div className="bg-slate-900 text-white p-6 rounded-b-3xl shadow-xl">
        <h2 className="text-2xl font-bold">Admin Control</h2>
        <p className="text-slate-400 text-sm">Overview & Management</p>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-slate-800 p-4 rounded-xl">
            <p className="text-slate-400 text-xs uppercase">Today's Sales</p>
            <p className="text-2xl font-bold text-emerald-400">
              12,340 INR
            </p>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl">
            <p className="text-slate-400 text-xs uppercase">Active Staff</p>
            <p className="text-2xl font-bold">Staff</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Admin