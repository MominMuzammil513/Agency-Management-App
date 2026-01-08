import React from 'react'
import OwnerAdminForm from './components/owner-admin-form';

const page = async({
  params,
}: {
  params: Promise<{ alhamdullilah: string }>
}) => {
  const { alhamdullilah } = await params;
  return (
    <div>
      <OwnerAdminForm/>
    </div>
  )
}

export default page