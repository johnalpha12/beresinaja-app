"use client"

import { useEffect, useState } from "react"

export function useSplashTimeout(onComplete: () => void, delayMs = 2000) {
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => {
      setIsComplete(true)
      onComplete()
    }, delayMs)

    return () => clearTimeout(id)
  }, [onComplete, delayMs])

  return isComplete
}
