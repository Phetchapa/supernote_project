'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Card from "./components/card";
import Header from './components/Header';
import Image from "next/image";
import Swal from 'sweetalert2';
import axios from 'axios';
import { useRouter } from "next/navigation";
import debounce from 'lodash.debounce';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faBell, faBellSlash } from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from './components/LoadingSpinner';
import { faCircle as faCircleSolid } from '@fortawesome/free-solid-svg-icons'; // Solid circle
import { faCircle as faCircleRegular } from '@fortawesome/free-regular-svg-icons';

export default function Home() {
  const router = useRouter();
  const [userId, setUserId] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);  // ระบุชนิดของ ref ที่นี่
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  //-------------------- สำหรับ header.tsx
  const [userEmail, setUserEmail] = useState(''); // เก็บอีเมลของผู้ใช้
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false); // สถานะของป๊อปอัป
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm); // สร้าง state แยกเพื่อใช้กับ debounce
  const handleClearSearch = () => {
    setSearchTerm('');
    inputRef.current?.focus(); // ให้ focus กลับไปยัง input หลังจากเคลียร์ searchTerm
  };

  useEffect(() => { // ใช้ useEffect สำหรับ debounce เพื่อเลื่อนการค้นหา
    const debouncedHandler = debounce(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    debouncedHandler();

    return () => {
      debouncedHandler.cancel();
    };
  }, [searchTerm]);
  //-------------------- end สำหรับ header.tsx

  //-------------------- สำหรับ card.tsx
  const [cards, setCards] = useState<{ cardId: string; title: string; content: string; cardColor: string; date: string; status: boolean; notificationTimeStatus: boolean; notificationTime: Date; userId: string; isEditing: boolean }[]>([]);
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
  const [filterType, setFilterType] = useState<'all' | 'uncompleted' | 'completed'>('all');

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


  function handleDeleteCard(id: string) {

    // ใช้ prevState ในการอัพเดต state เพื่อแน่ใจว่า state ที่อัพเดตเป็นตัวล่าสุด
    setCards(prevCards => prevCards.filter(card => card.cardId !== id));

  }
  useEffect(() => {
  }, [cards]);


  const filteredCards = useMemo(() => {
    if (!cards) {
      return [];
    }

    let filtered = [...cards];

    // กรองข้อมูลตาม filterType
    if (filterType === 'uncompleted') {
      filtered = filtered.filter(card => !card.status); // กรองเฉพาะการ์ดที่ยังไม่เสร็จ
    } else if (filterType === 'completed') {
      filtered = filtered.filter(card => card.status); // กรองเฉพาะการ์ดที่เสร็จแล้ว
    }

    // กรองข้อมูลตาม searchTerm
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((card) => {
        const titleLower = card.title.toLowerCase();
        const contentLower = card.content.toLowerCase();
        return titleLower.includes(searchLower) || contentLower.includes(searchLower);
      });
    }

    return filtered;
  }, [cards, searchTerm, filterType]);


  interface CardProps {
    status: boolean;
    cardId: string; title: string; content: string; cardColor: string; date: string; userId: string; isEditing: boolean
  }
  const handleUpdateCard = (updatedCard: CardProps) => {
    setCards(prevCards => {
      // ถ้า status เป็น false ให้กรองการ์ดนั้นออก
      if (updatedCard.status === true) {
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
        {/* เรียกใช้ Header โดยส่ง userId, searchTerm และ setSearchTerm ไปให้ */}
        <Header
          userId={userId}
          userEmail={userEmail}
          setUserEmail={setUserEmail}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleClearSearch={handleClearSearch}
          isProfilePopupOpen={isProfilePopupOpen}
          setIsProfilePopupOpen={setIsProfilePopupOpen} // ส่งฟังก์ชันนี้ไปด้วย
        />

        <div className="flex justify-center items-center w-full px-8">
          <button
            onClick={() => setFilterType('all')}
            className={`flex-1 px-4 py-2 text-center transition duration-300 ${filterType === 'all' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-black hover:text-gray-500'}`}
          >
            <FontAwesomeIcon icon={faCircleSolid} className='pe-1' />
            All
          </button>

          <button
            onClick={() => setFilterType('uncompleted')}
            className={`flex-1 px-4 py-2 text-center transition duration-300 ${filterType === 'uncompleted' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-black hover:text-gray-500'}`}
          >
            <FontAwesomeIcon icon={faCircleRegular} className='pe-1' />
            Uncompleted
          </button>

          <button
            onClick={() => setFilterType('completed')}
            className={`flex-1 px-4 py-2 text-center transition duration-300 ${filterType === 'completed' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-black hover:text-gray-500'}`}
          >
            <FontAwesomeIcon icon={faCircleCheck} className='pe-1' />
            Completed
          </button>
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

        <div className="fixed bottom-4 right-4">
          <Image
            width={50}
            height={50}
            src="/plus.png"
            alt="Add Card"
            onClick={handleCreateCard}
          />
        </div>

        {isPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
            <div
              className={`border border-gray-300 rounded-lg shadow-md p-6 m-4 ${cardColor} card-content fixed inset-1/4 w-1/2 h-1/2 z-50 transform scale-105`}>
              <div className='flex flex-col h-full'>
                <div className='flex-grow'>
                  {/* Checkbox สำหรับเลือกเปิด/ปิด Notification Time */}
                  <div className='flex justify-between items-center min-h-12'>
                    <div className='flex justify-center items-center gap-2'>
                      <input
                        type="checkbox"
                        id="notificationTimeStatus"
                        className="hidden"
                        checked={notificationTimeStatus}
                        onChange={() => setNotificationTimeStatus(!notificationTimeStatus)}
                      />
                      <label
                        htmlFor="notificationTimeStatus"
                        className={`relative block w-[60px] h-[30px] rounded-full cursor-pointer transition duration-300 ${notificationTimeStatus ? 'bg-red-600' : 'bg-[#ebebeb]'}`}
                      >
                        <div className={`absolute w-[24px] h-[24px] top-[3px] left-[3px] bg-white rounded-full shadow-md transition-transform duration-300 ${notificationTimeStatus ? 'translate-x-[30px]' : ''}`}></div>

                        {!notificationTimeStatus ? (
                          <FontAwesomeIcon
                            icon={faBellSlash}
                            className="absolute w-[18px] top-[6px] left-[6px] text-gray-500" // Positioned on the left
                          />
                        ) : (
                          <FontAwesomeIcon
                            icon={faBell}
                            className="absolute w-[18px] top-[6px] right-[6px] text-gray-500" // Positioned on the right
                          />
                        )}
                      </label>

                      <label htmlFor="notificationTimeStatus" className="text-sm text-gray-600">
                        Enable Notification Time
                      </label>
                    </div>
                    {notificationTimeStatus && (
                      <div className='flex justify-center items-center gap-2'>
                        <input
                          type="datetime-local"
                          id="notificationTime"
                          value={notificationTime}
                          min={new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                          // value={new Date(new Date(notificationTime).getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 16)} // เพิ่ม 7 ชั่วโมง
                          // min={new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 16)} // กำหนด min เป็นเวลาปัจจุบัน +7 ชั่วโมง
                          onChange={(e) => {
                            setNotificationTime(e.target.value)
                          }} // เก็บค่าที่ผู้ใช้เลือกใน state
                          className="p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  {/* Title Input */}
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border-none bg-transparent outline-none mb-4"
                    placeholder="Title"
                  />
                  <hr />

                  {/* Content Textarea */}
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-full border-none bg-transparent outline-none resize-none"
                    placeholder="Content"
                  />
                </div>

                <div className='flex justify-between items-center mt-4'>
                  {/* Color Picker */}
                  <div className='flex gap-2 border p-2 rounded-2xl bg-white'>
                    <button
                      className={`w-6 h-6 rounded-full border ${selectedColor === 'bg-white' ? 'border-black' : ''} bg-white`}
                      onClick={() => handleColorChange('bg-white')}
                      aria-label="White"
                    />
                    <button
                      className={`w-6 h-6 rounded-full border ${selectedColor === '#B3E5FC' ? 'border-black' : ''} bg-[#B3E5FC]`}
                      onClick={() => handleColorChange('bg-[#B3E5FC]')}
                      aria-label="Light Blue"
                    />
                    <button
                      className={`w-6 h-6 rounded-full border ${selectedColor === '#B9FBC0' ? 'border-black' : ''} bg-[#B9FBC0]`}
                      onClick={() => handleColorChange('bg-[#B9FBC0]')}
                      aria-label="Light Green"
                    />
                    <button
                      className={`w-6 h-6 rounded-full border ${selectedColor === '#FFABAB' ? 'border-black' : ''} bg-[#FFABAB]`}
                      onClick={() => handleColorChange('bg-[#FFABAB]')}
                      aria-label="Light Red"
                    />
                    <button
                      className={`w-6 h-6 rounded-full border ${selectedColor === '#FFF9C4' ? 'border-black' : ''} bg-[#FFF9C4]`}
                      onClick={() => handleColorChange('bg-[#FFF9C4]')}
                      aria-label="Light Yellow"
                    />
                    <button
                      className={`w-6 h-6 rounded-full border ${selectedColor === '#CFD8DC' ? 'border-black' : ''} bg-[#CFD8DC]`}
                      onClick={() => handleColorChange('bg-[#CFD8DC]')}
                      aria-label="Light Gray"
                    />
                  </div>

                  {/* Create and Cancel Buttons */}
                  <div className='flex justify-center items-center gap-4'>
                    <button onClick={handleClosePopup} className="text-gray-400">Cancel</button>
                    <button onClick={handleSaveCard} className="bg-sky-400 hover:bg-sky-700 text-white px-3 py-2 rounded-3xl">Create</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}



      </div>
    )

  );
}
