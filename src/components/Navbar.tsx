import { getAuthSession } from '@/lib/nextauth';
import React from 'react'



const Navbar = async () => {
  const session = await getAuthSession();
  if(session?.user){
    return <pre>{JSON.stringify(session.user, null, 2)}</pre>
  }else{
    return (
        <div>
            Not Signed In
        </div>
    )
  }
   
}

export default Navbar