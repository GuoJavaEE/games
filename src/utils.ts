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

export const isStr = (s: any) => typeof s === 'string'

export const imgLoader = (img: string | HTMLImageElement): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    if (isStr(img)) {
      let image = new Image()
      image.onload = () => {
        resolve(image)
        image.onload = null
        image = null as any
      }
      image.onerror = reject
      image.src = img as string
    } else {
      const image = img as HTMLImageElement
      if (image.complete) {
        resolve(image)
      } else {
        const onLoad = function () {
          image.removeEventListener('load', onLoad)
          resolve(image)
        }
        image.addEventListener('load', onLoad)
      }
    }
  })
}

export const genArr = (len: number, val?: any) => Array(len).fill(val)

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

interface NumAnimationOptions {
  moveCount?: number,
  onEnd?: () => void,
  onChange?: (val: number) => void
}

export const createNumAnimation = (a: number, b: number, options: NumAnimationOptions = {}) => {
  let aniFrame: number
  let aniFunc: FrameRequestCallback
  let step = Math.ceil(Math.abs(a - b) / (options.moveCount || 15))
  const { onChange, onEnd } = options
  let { requestAnimationFrame, cancelAnimationFrame } = window
  if (a > b) {
    aniFunc = function () {
      a -= step
      if (a > b) {
        onChange && onChange(a)
        aniFrame = requestAnimationFrame(aniFunc)
      } else {
        onEnd && onEnd()
        cancelAnimationFrame(aniFrame)
      }
    }
  } else {
    aniFunc = function () {
      a += step
      if (a < b) {
        onChange && onChange(a)
        aniFrame = requestAnimationFrame(aniFunc)
      } else {
        onEnd && onEnd()
        cancelAnimationFrame(aniFrame)
      }
    }
  }
  aniFunc(0)
}
