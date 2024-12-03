import { ReactNode } from "react";

function StoreLayout ({children} : {readonly children: ReactNode}) {
  return (
    <main>
      {children}
    </main>
  )
}

export default StoreLayout;