'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Card from "../components/card";
import Image from "next/image";
import Swal from 'sweetalert2';
import axios from 'axios';
import { useRouter } from "next/navigation";
import debounce from 'lodash.debounce';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faBell, faBellSlash } from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from '../components/LoadingSpinner';
import { faCircle as faCircleSolid } from '@fortawesome/free-solid-svg-icons'; // Solid circle
import { faCircle as faCircleRegular } from '@fortawesome/free-regular-svg-icons';

export default function Home() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [cardColor, setCardColor] = useState('bg-white');
  const [date, setDate] = useState('2020-08-03');

  const [status, setStatus] = useState(false); // สร้าง state สำหรับเก็บค่า
  const [notificationTimeStatus, setNotificationTimeStatus] = useState(false); // สร้าง state สำหรับเก็บค่า
  const [notificationTime, setNotificationTime] = useState(
    new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 16) // แปลงเป็นรูปแบบที่ใช้ได้กับ input type datetime-local
  );
  const [selectedColor, setSelectedColor] = useState('bg-white');
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);  // ระบุชนิดของ ref ที่นี่
  const [cards, setCards] = useState<{ cardId: string; title: string; content: string; cardColor: string; date: string; status: boolean; notificationTimeStatus: boolean; notificationTime: Date; userId: string; isEditing: boolean }[]>([]);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm); // สร้าง state แยกเพื่อใช้กับ debounce
  const titleInputRef = useRef<HTMLInputElement>(null);

  //addbypond 
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false); // สถานะของป๊อปอัป
  const [userEmail, setUserEmail] = useState(''); // เก็บอีเมลของผู้ใช้

  const handleProfileClick = () => {
    setIsProfilePopupOpen(!isProfilePopupOpen); // เปิด/ปิดป๊อปอัปเมื่อกดปุ่มโปรไฟล์
  };

  // เรียกใช้ API เพื่อดึงข้อมูลอีเมลของผู้ใช้
  useEffect(() => {
    async function fetchUserEmail() {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/user/${userId}/email`, { withCredentials: true });
        setUserEmail(response.data.email);
      } catch (error) {
        console.error('Error fetching user email:', error);
      }
    }
    if (userId) {
      fetchUserEmail();
    }
  }, [userId]);

  //end pond

  function handleColorChange(color: string) {
    setCardColor(color);
    setSelectedColor(color);
  }

  function handleCreateCard() {
    setIsPopupOpen(true);
  }

  function handleClosePopup() {
    setTitle("");
    setContent("");
    setCardColor('bg-white');
    setStatus(false);
    setNotificationTimeStatus(false);
    setNotificationTime(new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 16)); // รีเซ็ต notificationTime เป็นค่าเริ่มต้น
    setIsPopupOpen(false);
  }

  async function handleSaveCard() {
    let selectedDateTime = new Date(notificationTime);

    if (notificationTimeStatus && notificationTime) {


      const currentDateTime = new Date();
      // console.log('currentDateTime:', currentDateTime);
      // console.log('selectedDateTime:', selectedDateTime);
      // console.log('currentDateTime.getTime():', new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 16));



      // ถ้าผู้ใช้เลือกวันเวลาในอดีต
      if (selectedDateTime < currentDateTime) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Notification time cannot be in the past. Please choose a future time.',
          confirmButtonColor: '#38bdf8',
          customClass: {
            confirmButton: 'text-white',
          },
        });
        return; // หยุดการทำงานถ้าพบว่าเป็นเวลาในอดีต
      }
    }


    if (title.trim() === "") {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please enter a title for the card!',
        confirmButtonColor: '#38bdf8',
        customClass: {
          confirmButton: 'text-white',
        }
      });
      return;
    }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API}/notes`, {
        title: title,
        content: content,
        color: cardColor,
        status: status,
        notificationTimeStatus: notificationTimeStatus,
        notificationTime: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString(), // ส่งเป็น ISO string ไปยัง backend
        userId: userId
      }, {
        withCredentials: true
      });

      const newId = await response.data.noteId;

      // แปลง notificationTime จาก string เป็น Date object ก่อนเก็บใน state
      setCards([
        {
          cardId: newId,
          title: title.trim(),
          content: content,
          cardColor: cardColor,
          date: new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, // ถ้าคุณต้องการใช้เวลาแบบ 24 ชั่วโมง
            timeZone: 'Asia/Bangkok', // ตั้งค่าโซนเวลาเป็นประเทศไทย
          }).format(new Date()), // แปลงฟอร์แมตของวันที่
          status: status,
          notificationTimeStatus: notificationTimeStatus,
          notificationTime: new Date(notificationTime), // แปลงเป็น Date object ก่อนเก็บ
          userId: userId,
          isEditing: false
        },
        ...cards // นำการ์ดใหม่มาไว้ที่ตำแหน่งแรก
      ]);


    } catch (error) {
      console.error('There was an error fetching the notes:', error);
    }

    setTitle("");
    setContent("");
    setCardColor('bg-white');
    setStatus(false);
    setNotificationTimeStatus(false);
    setNotificationTime(new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 16)); // รีเซ็ต notificationTime เป็นค่าเริ่มต้น
    setIsPopupOpen(false);
  }

  const fetchData = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_WEB}/api/getCookie`);
      return response.data.userId;
    } catch (error) {
      console.error('There was an error fetching the notes:', error);
    }
  };

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const userId = await fetchData();
        setUserId(userId);
        console.log("sssssssssssssssssssssssss");

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/notes/${userId}`,
          {
            withCredentials: true
          }
        );
        console.log("dddddddddddddddddddddd");
        const fetchedCards = response.data
          .filter((note: any) => note.status === true)  // กรอง status เป็น true
          .map((note: any) => ({
            cardId: note.noteId,
            title: note.title,
            content: note.content,
            cardColor: note.color,
            date: note.date,
            status: note.status,
            notificationTimeStatus: note.notificationTimeStatus,
            notificationTime: new Date(new Date(note.notificationTime).getTime()).toISOString().slice(0, 16),
            userId: note.userId,
            isEditing: false
          }));

        setCards(fetchedCards);
      } catch (error) {
        console.error('There was an error fetching the notes:', error);
      }
    };

    if (userId !== null) {
      fetchNotes();
    }
  }, [userId]);

  useEffect(() => {
    if (isPopupOpen && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isPopupOpen]);

  function handleLogout() {
    Swal.fire({
      icon: 'success',
      title: 'Logged Out',
      text: 'You have successfully logged out!',
      confirmButtonColor: '#38bdf8',
      customClass: {
        confirmButton: 'text-white',
      }
    });
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_WEB}/api/removeCookie`);
      } catch (error) {
        console.error('There was an error logging out:', error);
      }
    };
    fetchData().then(() => {
      router.push('/');
    });
  }

  function handleDeleteCard(id: string) {

    // ใช้ prevState ในการอัพเดต state เพื่อแน่ใจว่า state ที่อัพเดตเป็นตัวล่าสุด
    setCards(prevCards => prevCards.filter(card => card.cardId !== id));

  }
  useEffect(() => {
  }, [cards]);

  // ใช้ useEffect สำหรับ debounce เพื่อเลื่อนการค้นหา
  useEffect(() => {
    const debouncedHandler = debounce(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    debouncedHandler();

    return () => {
      debouncedHandler.cancel();
    };
  }, [searchTerm]);

  const filteredCards = useMemo(() => {
    if (!searchTerm.trim()) {
      return cards; // ถ้าไม่มีคำค้นหา ให้แสดงผลทั้งหมด
    }

    const searchLower = searchTerm.toLowerCase().trim(); // แปลงคำค้นหาเป็นตัวพิมพ์เล็กและลบช่องว่าง

    return cards.filter((card) => {
      // แปลง title และ content เป็นตัวพิมพ์เล็ก
      const titleLower = card.title.toLowerCase();
      const contentLower = card.content.toLowerCase();

      // ตรวจสอบว่าคำค้นหา (searchTerm) อยู่ใน title หรือ content หรือไม่
      return titleLower.includes(searchLower) || contentLower.includes(searchLower);
    });
  }, [cards, searchTerm]);

  const handleClearSearch = () => {
    setSearchTerm('');
    inputRef.current?.focus(); // ให้ focus กลับไปยัง input หลังจากเคลียร์ searchTerm
  };
  interface CardProps {
    status: boolean;
    cardId: string; title: string; content: string; cardColor: string; date: string; userId: string; isEditing: boolean
  }
  const handleUpdateCard = (updatedCard: CardProps) => {
    setCards(prevCards => {
      // ถ้า status เป็น false ให้กรองการ์ดนั้นออก
      if (updatedCard.status === false) {
        return prevCards.filter(card => card.cardId !== updatedCard.cardId);
      }

      // ถ้า status เป็น true ให้ทำการอัปเดตการ์ด
      return prevCards.map(card =>
        card.cardId === updatedCard.cardId
          ? { ...card, ...updatedCard }
          : card
      );
    });
  };


  return (
    !userId ? (
      <LoadingSpinner />
    ) : (
      <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100">
        {/* Container สำหรับจัดปุ่มให้อยู่ในบรรทัดเดียวกัน */}
        <div className="absolute top-4 right-4 flex items-center space-x-4">
          {/* ปุ่ม Log Out */}
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Log Out
          </button>

          {/* ปุ่มโปรไฟล์ */}
          <div className="relative">
            <div
              onClick={handleProfileClick}
              className="w-10 h-10 bg-gray-400 rounded-full flex justify-center items-center cursor-pointer"
            >
              {/* ดึงตัวอักษรแรกของอีเมล */}
              <span className="text-white font-bold">
                {userEmail ? userEmail.charAt(0).toUpperCase() : ''}
              </span>
            </div>
            {isProfilePopupOpen && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg p-4 z-50 max-w-max">  {/* เพิ่ม z-50 และ max-w-max */}
                <p className="text-gray-600 whitespace-nowrap">Logged in as:</p>  {/* ใช้ whitespace-nowrap */}
                <p className="text-gray-800 font-semibold">{userEmail}</p>
              </div>
            )}
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-8 mt-12">My Note</h1>

        <div className="relative mb-6 w-2/3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg w-full"
            placeholder="Search cards by title or content"
            ref={inputRef}  // ผูก ref ไปยัง input
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch} // ใช้ฟังก์ชัน handleClearSearch สำหรับการคลิก
              className="absolute right-1 top-[12%] bg-gray-200 px-2 py-1 rounded"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex justify-center items-center w-full px-8">
          <Link
            href="/note/all"
            className="flex-1 px-4 py-2 text-center transition duration-300  text-black hover:text-gray-500"
          >
            <FontAwesomeIcon icon={faCircleSolid} className='pe-1' />
            All
          </Link>

          <Link
            href="/note"
            className="flex-1 px-4 py-2 text-center transition duration-300  text-black hover:text-gray-500"
          >
            <FontAwesomeIcon icon={faCircleRegular} className='pe-1' />
            Uncompleted
          </Link>

          <Link
            href="/note/archive"
            className="flex-1 px-4 py-2 text-center  transition duration-300 border-b-2 text-sky-400 border-sky-400"
          >
            <FontAwesomeIcon icon={faCircleCheck} className='pe-1' />
            Completed
          </Link>
        </div>

        <div className="px-8 mb-2 w-full">
          <hr className="border border-gray-300" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full px-4">
          {filteredCards.length > 0 ? (
            filteredCards.map((card) => (
              <Card
                key={card.cardId}
                cardId={card.cardId}
                title={card.title}
                content={card.content}
                cardColor={card.cardColor}
                date={card.date}

                status={card.status}
                notificationTimeStatus={card.notificationTimeStatus}
                notificationTime={card.notificationTime}

                userId={card.userId}
                onDelete={handleDeleteCard}
                onUpdate={handleUpdateCard}
              />
            ))
          ) : (
            <p></p>
          )}

        </div>




      </div>
    )

  );
}
