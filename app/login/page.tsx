import Link from 'next/link'
import { AuthForm } from '@/components/AuthForm'

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900">Sign in</h1>
      <p className="mt-2 text-slate-600">
        Welcome back to CafeStake. Demo accounts are pre-created for you.
      </p>
      <div className="mt-8">
        <AuthForm mode="login" />
      </div>
      <p className="mt-6 text-sm text-slate-500">
        Don't have an account?{' '}
        <Link href="/signup" className="font-medium text-amber-700 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}