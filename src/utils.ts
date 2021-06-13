export const getPixRatio = (context: CanvasRenderingContext2D) => {
  const backingStore: number = context.backingStorePixelRatio ||
    context.webkitBackingStorePixelRatio ||
    context.mozBackingStorePixelRatio || 1
  return (window.devicePixelRatio || 1) / backingStore
}

export const getRandInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export const delayCall = (fn?: Function, data?: any, delay: number = 100) => {
  fn && setTimeout(() => {
    fn(data)
  }, delay)
}

export const imgLoader = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve(img)
    }
    img.onerror = reject
    img.src = src
  })
}

export const genArr = (len: number, val: any) => Array(len).fill(val)

export const getCenterAppr = (num: number) => {
  const result = Math.sqrt(num)
  if (Number.isInteger(result)) {
    return [result, result]
  }
  for (let i = Math.floor(result); i > 0; i--) {
    if (num % i === 0) {
      return [i, num / i]
    }
  }
}
