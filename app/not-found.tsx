import Link from 'next/link'
import { Metadata } from 'next'
import { generateMetaTags } from './utils/meta-tags'

export const metadata: Metadata = generateMetaTags({
  title: 'Page Not Found - Bible Annals',
  description: 'The page you are looking for could not be found. Return to the main timeline to explore biblical history.',
  url: '/404/',
})

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. 
            Let&apos;s get you back on track to explore biblical history.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            🏠 Return to Timeline
          </Link>
          
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/periods/creation-pre-flood-era/"
              className="block bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
            >
              📅 Creation Era
            </Link>
            <Link
              href="/periods/new-testament-era/"
              className="block bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
            >
              ✝️ New Testament
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Popular destinations:
          </p>
          <div className="space-y-2 text-sm">
            <Link
              href="/people/JESUS/"
              className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
            >
              👤 Jesus Christ
            </Link>
            <Link
              href="/people/MOSES/"
              className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
            >
              👤 Moses
            </Link>
            <Link
              href="/events/CREATION_OF_WORLD/"
              className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
            >
              📅 Creation of the World
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}