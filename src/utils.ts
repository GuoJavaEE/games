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
