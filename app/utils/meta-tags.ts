import { Metadata } from 'next'

export function generateMetaTags({
  title,
  description,
  url,
  type = 'website',
  imageUrl,
  keywords
}: {
  title: string
  description: string
  url: string
  type?: 'website' | 'article'
  imageUrl?: string
  keywords?: string[]
}): Metadata {
  const siteName = 'Bible Annals'
  const baseUrl = 'https://bibleannals.com'
  const fullUrl = `${baseUrl}${url}`
  const defaultImage = `${baseUrl}/og-image.png`

  return {
    title,
    description,
    keywords: keywords?.join(', '),
    authors: [{ name: 'Bible Annals Team' }],
    creator: 'Bible Annals',
    publisher: 'Bible Annals',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type,
      title,
      description,
      url: fullUrl,
      siteName,
      images: [
        {
          url: imageUrl || defaultImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl || defaultImage],
      creator: '@bibleannals',
      site: '@bibleannals',
    },
    alternates: {
      canonical: fullUrl,
    },
    metadataBase: new URL(baseUrl),
  }
}

export const defaultMetaTags = generateMetaTags({
  title: 'Bible Annals - From Creation to the Early Church',
  description: 'A comprehensive journey through biblical history, showcasing key events, influential people, and significant locations from Creation to the early church era.',
  url: '/',
  keywords: ['bible', 'biblical history', 'timeline', 'christianity', 'old testament', 'new testament', 'biblical events', 'biblical people']
})