export interface Product {
  id: string
  name: string
  price: string
  description?: string
  imageUrl: string
  originalImageUrl: string
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  isSelected: boolean
  order: number
}

export interface ExtractedProduct {
  id: string
  name: string
  price: string
  description?: string
  imageUrl: string
  position: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface LayoutSettings {
  width: number
  spacing: number
  backgroundColor: string
  textColor: string
  showDescription: boolean
  fontSize: number
  imageHeight: number
} 