'use client'

import Link from 'next/link'

interface ErrorStateProps {
  message: string
  showBackLink?: boolean
  backLinkText?: string
  backLinkHref?: string
  additionalInfo?: string
}

export default function ErrorState({ 
  message, 
  showBackLink = true,
  backLinkText = '返回首页',
  backLinkHref = '/',
  additionalInfo
}: ErrorStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-red-600 text-xl mb-4">❌ {message}</div>
        {additionalInfo && <p className="text-gray-600 mb-4">{additionalInfo}</p>}
        {showBackLink && (
          <Link href={backLinkHref} className="text-blue-600 hover:text-blue-700">
            {backLinkText} →
          </Link>
        )}
      </div>
    </div>
  )
}
