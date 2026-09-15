'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createClient } from '@/lib/supabase/client';

type SignupValues = { email: string; password: string };

export default function Signup(){
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<SignupValues>();
  const [message, setMessage] = useState('');
  const submit = async (values: SignupValues) => {
    setMessage('');
    const { error } = await createClient().auth.signUp(values);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage('Account created. If this is the first account after applying the bootstrap migration, it is now an administrator. Otherwise, an administrator must promote it.');
  };

  return <main className="grid min-h-[70vh] place-items-center px-5"><form onSubmit={handleSubmit(submit)} className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-7 shadow-sm"><p className="text-sm font-bold uppercase tracking-wider text-emerald-700">Horizon Realtors</p><h1 className="mt-2 font-serif text-3xl font-bold text-emerald-950">Create account</h1><div className="mt-6 grid gap-4"><input {...register('email',{required:true})} type="email" placeholder="Email" className="rounded border px-3 py-3 text-sm"/><input {...register('password',{required:true,minLength:6})} type="password" placeholder="Password (minimum 6 characters)" className="rounded border px-3 py-3 text-sm"/><button disabled={isSubmitting} className="rounded bg-emerald-800 py-3 text-sm font-bold text-white">{isSubmitting?'Creating account...':'Create account'}</button>{message&&<p role="status" className="text-sm text-stone-600">{message}</p>}<p className="text-center text-sm text-stone-500">Already registered? <Link href="/admin/login" className="font-semibold text-emerald-800">Sign in</Link></p></div></form></main>
}