import { ReactNode } from "react";

function AdminLayout({children} : {readonly children: ReactNode }){
  return(
    <div>
      {children}
    </div>
  )
  }

export default AdminLayout;