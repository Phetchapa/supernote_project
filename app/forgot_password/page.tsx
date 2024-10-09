'use client';
import axios from "axios";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState(""); // ใช้ useState เพื่อจัดการกับค่าของอีเมล

  async function Send() {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API}/forgotpassword`, {
        email: email,
      });
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Please check your email to reset your password.',
        confirmButtonColor: '#38bdf8', 
        customClass: {
          confirmButton: 'text-white', 
        }
      }).then(() => {
        router.push('/'); // ใช้ router navigation ที่ถูกต้อง
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'There was an error sending the email. Please try again later.',
        confirmButtonColor: '#38bdf8', 
        customClass: {
          confirmButton: 'text-white', 
        }
      });
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
          <div className="flex items-center justify-center">
            <h1 className="text-3xl font-bold mb-8">Forgot Password</h1>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="กรอกอีเมล"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // จัดการกับการเปลี่ยนแปลงของฟิลด์อินพุต
            />
          </div>
          <div className="flex items-center justify-between">
            <Link className="text-sm text-sky-400 hover:text-sky-700" href="/">&larr; Back</Link>
            <button onClick={Send} className="btn custom-green hover:bg-sky-700 bg-sky-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
