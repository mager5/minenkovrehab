'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
function PaymentStatus() {
  const params=useSearchParams();
  const invoice=params?.get('InvId')||params?.get('invId');
  const [status,setStatus]=useState('Проверяем статус заказа…');
  useEffect(()=>{
    let stopped=false;
    const check=async()=>{
      if(!invoice){setStatus('Номер заказа не указан.');return;}
      try {
        const response=await fetch(`/api/robokassa/orders/${encodeURIComponent(invoice)}/status`,{credentials:'same-origin',cache:'no-store'});
        const payload=await response.json();
        if(!stopped)setStatus(response.ok&&payload.data.status==='paid'?'Оплата подтверждена. Доступ открыт в личном кабинете.':response.ok?'Заказ ожидает подтверждения оплаты.':'Войдите в аккаунт покупателя для проверки заказа.');
      }catch{if(!stopped)setStatus('Не удалось проверить статус. Попробуйте позже.');}
    };
    check();const timer=setInterval(check,5000);
    return()=>{stopped=true;clearInterval(timer);};
  },[invoice]);
  return <main className='mx-auto max-w-xl px-6 py-20'><h1 className='text-2xl font-bold'>Статус заказа</h1><p role='status' className='my-6'>{status}</p><Link href='/dashboard'>Личный кабинет</Link></main>;
}

export default function PaymentSuccessPage(){return <Suspense fallback={<p>Проверяем статус заказа…</p>}><PaymentStatus /></Suspense>;}
