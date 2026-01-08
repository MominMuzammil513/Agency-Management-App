import { Link } from 'lucide-react';
import { DefaultSession } from 'next-auth';
import React from 'react'
import AreaList from './Area/area-list';

interface User {
  id?: string | undefined | null;
  name?: string | undefined | null;
  email?: string | undefined | null;
  image?: string | null | undefined;
  role: "super_admin" | "owner_admin" | "salesman" | "delivery_boy";
}

export type AreaListType = {
    id: string;
    name: string;
}[]


const MainSales = ({
  user,
  areaList,
}: {
  user: User;
  areaList: AreaListType;
}) => {
  if (
    !user ||
    user.role !== "salesman" ||
    !user.name ||
    !user.id ||
    !user.email
  ) {
    return (
      <div>
        <h1 className="text-red-500 font-bold text-center mt-10">
          Unauthorized Access
        </h1>
        <p className="text-center mt-4">
          You do not have permission to view this page.
        </p>
        <Link
          href="/login"
          className="text-blue-500 underline mt-6 block text-center"
        >
          Please Login Again
        </Link>
      </div>
    );
  }
  return (
    <div className="pb-24 animate-in fade-in">
      {/* ID Card */}
      <div className="bg-linear-to-r from-orange-600 to-orange-500 text-white p-6 rounded-b-3xl shadow-lg mb-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold border-2 border-white/30">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.name.toUpperCase()}</h2>
            <p className="text-orange-100 text-sm font-medium uppercase tracking-wider">
              {user.role.replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
      <AreaList areaList={areaList}/>
    </div>
  );
};

export default MainSales