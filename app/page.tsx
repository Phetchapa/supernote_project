'use client'
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function Login(event: any) {
    event.preventDefault(); // Prevent the page from refreshing
    console.log("email", email);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API}/login`, {
        email: email,
        password: password,
      }, {
        withCredentials: true, // สำคัญมาก: เพื่อให้คุกกี้ถูกส่งและรับกลับมา
      });

      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: 'You have successfully logged in!',
        confirmButtonColor: '#38bdf8', 
        customClass: {
          confirmButton: 'text-white', 
        }
      })
      .then(() => {
        router.push('/note/all'); // ใช้ router navigation ที่ถูกต้อง
      });

    } catch (error) {
      console.log("dfghjk");
      console.error(error);

      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: 'Please check your email and password.',
        confirmButtonColor: '#38bdf8', 
        customClass: {
          confirmButton: 'text-white', 
        }
      });
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">My Note</h1>
      <div className="w-full max-w-md">
        <form className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4" onSubmit={Login}>
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
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="กรอกรหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Link className="inline-block underline text-sm text-sky-400 hover:text-sky-700" href="./register">
              Register
            </Link>
            <Link className="inline-block underline align-baseline text-sm text-gray-400 hover:text-sky-700" href="./forgot_password">
              Forgot Password?
            </Link>
            <button
              className="btn custom-green hover:bg-sky-700 bg-sky-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
