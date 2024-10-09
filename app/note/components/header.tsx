import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

interface HeaderProps {
    userId: string;
    userEmail: string;
    setUserEmail: (email: string) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    handleClearSearch: () => void;
    isProfilePopupOpen: boolean;
    setIsProfilePopupOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({
    userId,
    userEmail,
    setUserEmail,
    searchTerm,
    setSearchTerm,
    isProfilePopupOpen,
    setIsProfilePopupOpen
}) => {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    // ฟังก์ชันสำหรับจัดการ popup
    const handleProfileClick = () => {
        setIsProfilePopupOpen(!isProfilePopupOpen);
    };

    // ฟังก์ชันสำหรับ logout
    const handleLogout = () => {
        Swal.fire({
            icon: 'success',
            title: 'Logged Out',
            text: 'You have successfully logged out!',
            confirmButtonColor: '#38bdf8',
            customClass: {
                confirmButton: 'text-white',
            },
        });
        const fetchData = async () => {
            try {
                await axios.get(`${process.env.NEXT_PUBLIC_WEB}/api/removeCookie`);
            } catch (error) {
                console.error('There was an error logging out:', error);
            }
        };
        fetchData().then(() => {
            router.push('/');
        });
    };

    // ดึงอีเมลของผู้ใช้
    useEffect(() => {
        const fetchUserEmail = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/user/${userId}/email`, { withCredentials: true });
                setUserEmail(response.data.email);
            } catch (error) {
                console.error('Error fetching user email:', error);
            }
        };

        if (userId) {
            fetchUserEmail();
        }
    }, [userId, setUserEmail]);

    const handleClearSearch = () => {
        setSearchTerm('');
        inputRef.current?.focus();
    };

    useEffect(() => {
        const fetchUserEmail = async () => {
          try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/user/${userId}/email`, { withCredentials: true });
            setUserEmail(response.data.email);
          } catch (error) {
            console.error('Error fetching user email:', error);
          }
        };
      
        if (userId) {
          fetchUserEmail();
        }
      }, [userId]);
      

    return (
        <div className="w-full">
            <div className="absolute top-4 right-4 flex items-center space-x-4">
                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                    Log Out
                </button>

                <div className="relative">
                    <div
                        onClick={handleProfileClick}
                        className="w-10 h-10 bg-gray-400 rounded-full flex justify-center items-center cursor-pointer"
                    >
                        <span className="text-white font-bold">
                            {userEmail ? userEmail.charAt(0).toUpperCase() : ''}
                        </span>
                    </div>
                    {isProfilePopupOpen && (
                        <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg p-4 z-50 max-w-max">
                            <p className="text-gray-600 whitespace-nowrap">Logged in as:</p>
                            <p className="text-gray-800 font-semibold">{userEmail}</p>
                        </div>
                    )}
                </div>
            </div>

            <h1 className="text-3xl font-bold mb-8 mt-12 text-center">My Note</h1>

            <div className="relative mb-6 w-2/3 mx-auto">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg w-full"
                    placeholder="Search cards by title or content"
                    ref={inputRef}
                />
                {searchTerm && (
                    <button
                        onClick={handleClearSearch}
                        className="absolute right-1 top-[12%] bg-gray-200 px-2 py-1 rounded"
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
};

export default Header;
