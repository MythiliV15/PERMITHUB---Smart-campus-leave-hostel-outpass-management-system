import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { authApi } from '../../api'
import { Shield } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [resetLink, setResetLink] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit } = useForm()

  const onSubmit = async ({ email }) => {
    setLoading(true); setError(''); setResetLink(''); setInfoMessage('')
    try {
      const res = await authApi.forgotPassword({ email })
      setSent(true)
      setInfoMessage(res.data?.message || '')
      // Backend only returns a URL when SMTP failed (fallback); after a successful send, data is null.
      const data = res.data?.data
      if (typeof data === 'string' && data.startsWith('http')) setResetLink(data)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to send reset email')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-300 rounded-xl mb-4">
            <Shield size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Forgot password</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter the email address on your account. We will send a secure link to reset your password (valid for 2 hours).
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          {!sent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email Address</label>
                <input type="email" required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-300"
                  placeholder="your@college.edu"
                  {...register('email', { required: true })} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition">
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
              <Link to="/login" className="block text-center text-xs text-gray-500 hover:underline mt-2">Back to login</Link>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-4xl">✅</div>
              <p className="text-sm font-semibold text-gray-800">Check your email</p>
              {infoMessage && (
                <p className="text-xs text-gray-600 leading-relaxed">{infoMessage}</p>
              )}
              {!infoMessage && (
                <p className="text-xs text-gray-500">
                  If an account exists for that address, we sent an email with a link to choose a new password. The link expires in 2 hours.
                </p>
              )}

              {resetLink ? (
                <div className="mt-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-left">
                    <p className="text-xs font-semibold text-amber-800 mb-1">Email could not be sent — use this one-time link only in a trusted environment, or fix SMTP in backend/.env:</p>
                    <a href={resetLink}
                      className="text-xs text-blue-600 underline break-all hover:text-blue-800">
                      {resetLink}
                    </a>
                  </div>
                  <a href={resetLink}
                    className="mt-3 block w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 text-center transition">
                    Open reset page
                  </a>
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  Follow the link in the email, then set a new password on the secure reset page.
                </p>
              )}

              <Link to="/login" className="block text-xs text-gray-500 hover:underline">Back to login</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
