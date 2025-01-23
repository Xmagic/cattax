'use client'

import dynamic from 'next/dynamic'

// 动态导入 ImageEditor 组件，禁用 SSR
const ImageEditor = dynamic(
  () => import('../components/ImageEditor'),
  { ssr: false }
)

export default function Home() {
  return <ImageEditor />
} 