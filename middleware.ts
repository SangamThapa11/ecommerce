import { NextRequest, NextResponse } from "next/server";


async function validationToken(): Promise<boolean>{
  try {
    const accessToken = localStorage.getItem('_at_43');
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL+"/me",{
      method: 'GET',
      headers: {
        Authorization: "Bearer " + accessToken
      }
    })
    // loggenInUser Profile
  
    return response.ok;
  }catch(exception){
    console.error(exception)
    return false; 
  }
}

export async function middleware(request: NextRequest) {
  //const isAuthenticated = request.cookies.get('token');
  //console.log(isAuthenticated)
  const isAuthenticated = await validationToken();
  if(!isAuthenticated && request.nextUrl.pathname.startsWith('/admin')||
  request.nextUrl.pathname.startsWith('/seller')){
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next()
}
export const config= {
  matcher: ['/admin/:path*', '/customer/:path*', '/seller/:path*']
}