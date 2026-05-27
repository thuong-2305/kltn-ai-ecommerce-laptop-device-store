import { useEffect } from 'react'

/**
 * useDocumentTitle — Custom React hook for dynamic SEO title and meta description updates
 */
export function useDocumentTitle(title, description = '') {
  useEffect(() => {
    // 1. Update document title
    if (title) {
      document.title = `${title} | LAPTOP DEVICE STORE`
    } else {
      document.title = 'LAPTOP DEVICE STORE | Công nghệ cho cuộc sống'
    }

    // 2. Update meta description
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]')
      if (!metaDesc) {
        metaDesc = document.createElement('meta')
        metaDesc.name = 'description'
        document.head.appendChild(metaDesc)
      }
      metaDesc.setAttribute('content', description)
    }

    // 3. Update Open Graph Title
    let ogTitle = document.querySelector('meta[property="og:title"]')
    if (!ogTitle) {
      ogTitle = document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      document.head.appendChild(ogTitle)
    }
    ogTitle.setAttribute('content', title ? `${title} | LAPTOP DEVICE STORE` : 'LAPTOP DEVICE STORE')

    // 4. Update Open Graph Description
    if (description) {
      let ogDesc = document.querySelector('meta[property="og:description"]')
      if (!ogDesc) {
        ogDesc = document.createElement('meta')
        ogDesc.setAttribute('property', 'og:description')
        document.head.appendChild(ogDesc)
      }
      ogDesc.setAttribute('content', description)
    }

    // 5. Update Open Graph Type
    let ogType = document.querySelector('meta[property="og:type"]')
    if (!ogType) {
      ogType = document.createElement('meta')
      ogType.setAttribute('property', 'og:type')
      document.head.appendChild(ogType)
    }
    ogType.setAttribute('content', 'website')
  }, [title, description])
}
