import { NextResponse } from 'next/server'

export function middleware(request) {
    const token = request.cookies.get('token');

    if (token) {
        // ถ้ามีคุกกี้ชื่อ 'token'
    } else {
        // ถ้าไม่มีคุกกี้ชื่อ 'token'
        return NextResponse.redirect(new URL('/', request.url));
    }
}

export const config = {
    matcher: '/note/:path*', // เปลี่ยนเส้นทางสำหรับเส้นทางที่ตรงตามนี้
}