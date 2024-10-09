'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Swal from 'sweetalert2';
import axios from 'axios';
import { set } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faBellSlash } from '@fortawesome/free-solid-svg-icons';

interface CardProps {
    cardId: string;
    title: string;
    content: string;
    cardColor: string;
    date: string;
    status: boolean;
    notificationTimeStatus: boolean;
    notificationTime: Date;
    userId: string;
    isEditing: boolean;  // Ensure this property is included if required everywhere
    onDelete: (id: string) => void;
    onUpdate: (updatedCard: CardProps) => void;
}

export default function Card(
    { cardId: initialCardId,
        title: initialTitle,
        content: initialContent,
        cardColor: initialCardColor,
        date: initialDate,

        status: initialStatus,
        notificationTimeStatus: initialNotificationTimeStatus,
        notificationTime: initialNotification,

        userId: initialuserId,
        onDelete,
        onUpdate
    }: {
        cardId: string,
        title: string,
        content: string,
        cardColor: string,
        date: string,

        status: boolean,
        notificationTimeStatus: boolean,
        notificationTime: Date,

        userId: string,
        onDelete: (id: string) => void,
        onUpdate: (card: CardProps) => void
    }) {

    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);
    const [cardColor, setCardColor] = useState(initialCardColor);
    const [date, setDate] = useState(initialDate);

    const [status, setStatus] = useState(initialStatus);
    const [notificationTimeStatus, setNotificationTimeStatus] = useState(initialNotificationTimeStatus);
    const [notificationTime, setNotificationTime] = useState(
        typeof initialNotification === 'string' ? new Date(initialNotification) : initialNotification
    );


    const [userId, setUserid] = useState(initialuserId);
    const [selectedColor, setSelectedColor] = useState(initialCardColor);

    const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

    async function daleteNote() {
        try {
            const response = await axios.delete(`${process.env.NEXT_PUBLIC_API}/notes/${initialuserId}/${initialCardId}`,
                { withCredentials: true }
            );
            // window.location.reload(); // รีเฟรชหน้าเว็บ
        } catch (error) {
            console.error('There was an error deleting the note:', error);
        }
    }

    async function updateStatus(event: React.MouseEvent) {
        event.stopPropagation();
        setStatus(!status);

        try {
            // Clone and add 7 hours to the notificationTime
            let updatedNotificationTime = new Date(notificationTime);
            updatedNotificationTime.setHours(updatedNotificationTime.getHours() + 7);

            const response = await axios.put(`${process.env.NEXT_PUBLIC_API}/notes/${initialuserId}/${initialCardId}`, {
                title: title,
                content: content,
                color: selectedColor,
                status: !status,
                notificationTimeStatus: notificationTimeStatus,
                notificationTime: updatedNotificationTime, // ส่งค่าที่เพิ่ม 7 ชั่วโมงแล้ว
            }, {
                withCredentials: true
            });
        } catch (error) {
            console.error('There was an error updating the note:', error);
        }

        const updatedCard: CardProps = {
            cardId: initialCardId,
            title,
            content,
            cardColor: selectedColor,
            date, // This should already be part of your state or props
            status: !status,
            notificationTimeStatus,
            notificationTime: notificationTime, // ใช้เวลาใหม่ที่บวกไป 7 ชั่วโมง
            userId,
            isEditing: false // Make sure to set a sensible default or current value
            ,
            onDelete: function (id: string): void {
                throw new Error('Function not implemented.');
            },
            onUpdate: function (updatedCard: CardProps): void {
                throw new Error('Function not implemented.');
            }
        };

        onUpdate(updatedCard);
    }

    async function update() {
        try {
            // Clone the notificationTime and add 7 hours
            const updatedNotificationTime = new Date(notificationTime.getTime() + 7 * 60 * 60 * 1000);

            const response = await axios.put(`${process.env.NEXT_PUBLIC_API}/notes/${initialuserId}/${initialCardId}`, {
                title: title,
                content: content,
                color: selectedColor,
                status: status,
                notificationTimeStatus: notificationTimeStatus,
                notificationTime: updatedNotificationTime.toISOString() // แปลงเป็น ISO string ก่อนส่ง
            }, {
                withCredentials: true
            });

            const updatedCard: CardProps = {
                cardId: initialCardId,
                title,
                content,
                cardColor: selectedColor,
                date, // This should already be part of your state or props
                status,
                notificationTimeStatus,
                notificationTime: notificationTime, // ใช้เวลาใหม่ที่บวกไป 7 ชั่วโมง
                userId,
                isEditing: false // Make sure to set a sensible default or current value
                ,
                onDelete: function (id: string): void {
                    throw new Error('Function not implemented.');
                },
                onUpdate: function (updatedCard: CardProps): void {
                    throw new Error('Function not implemented.');
                }
            };

            onUpdate(updatedCard);
            setIsEditing(false);
        } catch (error) {
            console.error('There was an error updating the note:', error);
        }
    }


    async function handleDelete(event: React.MouseEvent) {
        event.stopPropagation();
        Swal.fire({
            title: "Do you want to delete this note?",
            confirmButtonColor: '#38bdf8',
            customClass: {
                confirmButton: 'text-white',
            },
            showDenyButton: true,
            showCancelButton: true,
            showConfirmButton: false,
            denyButtonText: `Delete`,
            cancelButtonText: `Cancel`
        }).then((result) => {
            if (result.isDenied) {
                Swal.fire({
                    icon: "success",
                    title: "Deleted",
                    confirmButtonColor: '#38bdf8',
                    customClass: {
                        confirmButton: 'text-white',
                    },
                    showConfirmButton: true,
                    timer: 1500
                }).then(() => {
                    daleteNote(); // เรียกใช้ฟังก์ชันลบ
                    onDelete(initialCardId); // เรียกใช้ฟังก์ชัน onDelete ที่ส่งมาจาก props
                });
            }
        });
    }

    function handleEditMode() {
        setIsEditing(true);
    }

    function handleCancel() {
        setIsEditing(false);
        update(); // อัปเดตข้อมูลเมื่อออกจากโหมดแก้ไข
    }

    function handleClickOutside(event: React.MouseEvent) {
        if (event.target instanceof HTMLElement) {
            const target = event.target as HTMLElement;
            if (!target.closest('.card-content') && !target.closest('.delete-btn')) {
                handleCancel();
            }
        }
    }

    async function handleColorChange(color: string) {
        setCardColor(color);
        setSelectedColor(color);
    }

    useEffect(() => {
        if (isEditing && contentTextareaRef.current) {
            const textarea = contentTextareaRef.current;
            textarea.focus();
            textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        }
    }, [isEditing]);

    return (
        <div>
            {isEditing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={handleClickOutside} />
            )}
            <div
                className={`border border-gray-300 rounded-lg shadow-md p-6 m-4 ${cardColor} card-content ${isEditing ? 'fixed inset-1/4 w-1/2 h-1/2 z-50 transform scale-105 ' : 'h-64 relative'}`}
                onClick={handleEditMode}
            >
                {!isEditing ? (
                    <div>
                        <h2 className={`text-xl font-semibold mb-4 whitespace-nowrap overflow-hidden text-ellipsis ${status ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {title}
                        </h2>
                        <hr className="mb-4 border-black" />
                        <p className={`text-gray-600 break-words line-clamp-5 ${status ? ' text-gray-500' : ''}`}>
                            {content}
                        </p>
                        <label
                            className='absolute -top-3 -right-3 w-8 h-8 cursor-pointer flex items-center justify-center'
                            onClick={(e) => e.stopPropagation()} // Prevent triggering the edit mode when clicking the label
                        >    <input
                                className='appearance-none w-full h-full rounded-full border-2 border-gray-400 checked:border-sky-400 checked:bg-sky-400 checked:outline-none'
                                type="checkbox"
                                checked={status}
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent triggering the edit mode
                                    updateStatus(e); // Call the function to update status
                                }}
                            />
                            <span className={`absolute w-4 h-4 rounded-full transition duration-200 ${status ? 'bg-sky-400' : 'bg-transparent'}`}></span>
                            {status && (
                                <span className="absolute  text-white text-2xl font-bold " >
                                    ✓
                                </span>
                            )}
                        </label>

                        <div className='delete-btn absolute bottom-4 right-4'>
                            <Image
                                width={25}
                                height={25}
                                src="/deletetrash.png"
                                alt="Delete Trash"
                                onClick={handleDelete}
                            />
                        </div>

                    </div>

                ) : (
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
                                            value={new Date(new Date(notificationTime).getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 16)} // เพิ่ม 7 ชั่วโมง
                                            min={new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 16)} // กำหนด min เป็นเวลาปัจจุบัน +7 ชั่วโมง
                                            onChange={(e) => {
                                                setNotificationTime(new Date(e.target.value))
                                            }} // เก็บค่าที่ผู้ใช้เลือกใน state
                                            className="p-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                )}
                            </div>
                            <label
                                className='absolute -top-3 -right-3 w-8 h-8 cursor-pointer flex items-center justify-center'
                                onClick={(e) => e.stopPropagation()} // Prevent triggering the edit mode when clicking the label
                            >
                                <input
                                    className='appearance-none w-full h-full rounded-full border-2 border-gray-400 checked:border-none checked:bg-sky-400 checked:outline-none'
                                    type="checkbox"
                                    checked={status}
                                    onChange={(e) => {
                                        e.stopPropagation(); // Prevent triggering the edit mode
                                        setStatus(e.target.checked); // Call the function to update status
                                    }}
                                />
                                <span className={`absolute w-4 h-4 rounded-full transition duration-200 ${status ? 'bg-sky-400' : 'bg-transparent'}`}></span>
                                {status && (
                                    <span className="absolute  text-white text-2xl font-bold " >
                                        ✓
                                    </span>
                                )}
                            </label>

                            <div className='grid grid-cols-[3fr_1fr] gap-4 items-center'>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full border-none bg-transparent outline-none mb-4"
                                    placeholder="Title"
                                />
                                <p className='text-gray-400 text-xs text-right'>{date}</p>
                            </div>
                            <hr className="mb-4 border-black" />
                            <textarea
                                ref={contentTextareaRef}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full h-full border-none bg-transparent outline-none resize-none overflow-hidden p-2 max-h-44 " // Added overflow-hidden and padding
                                placeholder="Content"
                            />

                        </div>
                        <div className='flex justify-between items-center mt-2'>
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
                            <div className='flex justify-center items-center'>
                                <Image
                                    width={25}
                                    height={25}
                                    src="/deletetrash.png"
                                    alt="Delete Trash"
                                    onClick={handleDelete}
                                    className='delete-btn'
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        // <ToggleSwitch />
    );
}
