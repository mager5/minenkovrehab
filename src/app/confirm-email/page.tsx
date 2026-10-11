'use client';
import {useState} from 'react';import {authPost} from '@/lib/auth-client';
export default function ConfirmEmail(){
 const [email,setEmail]=useState('');const [message,setMessage]=useState('');
 async function request(event:React.FormEvent){event.preventDefault();try{const response=await authPost('/api/auth/request-confirmation',{email});setMessage(response.ok?'Если подтверждение необходимо, инструкция поставлена в очередь.':'Запрос временно недоступен.');}catch{setMessage('Сервис временно недоступен.');}}
 async function confirm(){const token=new URLSearchParams(window.location.hash.slice(1)).get('token');window.history.replaceState(null,'',window.location.pathname);try{const response=await authPost('/api/auth/confirm-email',{token});setMessage(response.ok?'Email подтверждён. Теперь можно войти.':'Ссылка недействительна или истекла.');}catch{setMessage('Сервис временно недоступен.');}}
 return <main className='mx-auto max-w-lg p-8'><h1>Подтверждение email</h1><form onSubmit={request}><label>Email<input type='email' required value={email} onChange={e=>setEmail(e.target.value)} /></label><button type='submit'>Запросить подтверждение</button></form><button onClick={confirm}>Подтвердить по ссылке из письма</button><p role='status'>{message}</p><a href='/auth'>Войти</a></main>;
}
