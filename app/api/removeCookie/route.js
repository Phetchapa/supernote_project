'use server';
import { cookies } from 'next/headers';

export async function GET() {
    // ดึงคุกกี้ทั้งหมดที่ตั้งค่าไว้
    const cookieNames = ['token', 'anotherCookieName']; // ระบุชื่อคุกกี้ที่ต้องการลบ

    // ลบคุกกี้แต่ละตัว
    const loopCount = 10; // จำนวนรอบที่ต้องการ

    for (let i = 0; i < loopCount; i++) {
        cookieNames.forEach(cookieName => {
            cookies().set(cookieName, '', {
                path: '/', // ตรวจสอบให้แน่ใจว่า path ตรงกัน
                domain: '.suphasan.site', // ตรวจสอบให้แน่ใจว่า domain ตรงกัน
                maxAge: 0, // ทำให้คุกกี้หมดอายุทันที
            });
        });
    }


    return new Response(JSON.stringify({ message: "All cookies have been deleted" }), { status: 200 });
}
