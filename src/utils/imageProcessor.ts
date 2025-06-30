// 画像処理用のユーティリティ関数

export interface ImageRegion {
  x: number
  y: number
  width: number
  height: number
}

export interface ProcessedProduct {
  id: string
  name: string
  price: string
  imageUrl: string
  position: ImageRegion
}

// 画像から商品領域を切り取る関数
export const cropImageRegion = (
  imageUrl: string,
  region: ImageRegion,
  targetWidth: number = 350
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }

        // 領域の境界チェック
        if (region.x < 0 || region.y < 0 || 
            region.x + region.width > img.width || 
            region.y + region.height > img.height) {
          console.warn('領域が画像の境界を超えています。領域を調整します:', region)
          // 領域を画像内に収める
          const adjustedRegion = {
            x: Math.max(0, Math.min(region.x, img.width - region.width)),
            y: Math.max(0, Math.min(region.y, img.height - region.height)),
            width: Math.min(region.width, img.width - region.x),
            height: Math.min(region.height, img.height - region.y)
          }
          region = adjustedRegion
        }

        // アスペクト比を維持してリサイズ
        const aspectRatio = region.width / region.height
        const targetHeight = targetWidth / aspectRatio
        
        canvas.width = targetWidth
        canvas.height = targetHeight
        
        // 画像を切り取ってリサイズ
        ctx.drawImage(
          img,
          region.x, region.y, region.width, region.height,
          0, 0, targetWidth, targetHeight
        )
        
        const result = canvas.toDataURL('image/jpeg', 0.9)
        resolve(result)
      } catch (error) {
        reject(new Error(`画像切り取りエラー: ${error}`))
      }
    }
    
    img.onerror = () => {
      reject(new Error('画像の読み込みに失敗しました'))
    }
    
    img.src = imageUrl
  })
}

// 複数の商品領域を切り取る関数
export const cropMultipleRegions = async (
  imageUrl: string,
  regions: ImageRegion[],
  targetWidth: number = 350
): Promise<string[]> => {
  const promises = regions.map(region => 
    cropImageRegion(imageUrl, region, targetWidth)
  )
  return Promise.all(promises)
}

// 画像の品質をチェックする関数
export const checkImageQuality = (imageUrl: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      // 最小サイズチェック（100x100ピクセル以上）
      const isValid = img.width >= 100 && img.height >= 100
      resolve(isValid)
    }
    img.onerror = () => resolve(false)
    img.src = imageUrl
  })
}

// 画像のメタデータを取得する関数
export const getImageMetadata = (imageUrl: string): Promise<{
  width: number
  height: number
  aspectRatio: number
}> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      try {
        resolve({
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height
        })
      } catch (error) {
        reject(new Error(`メタデータ取得エラー: ${error}`))
      }
    }
    img.onerror = () => reject(new Error('画像の読み込みに失敗しました'))
    img.src = imageUrl
  })
} 