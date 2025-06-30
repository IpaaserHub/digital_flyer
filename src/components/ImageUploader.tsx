import React, { useState, useRef } from 'react'
import { Upload, FileImage, Loader2, Crop, Settings } from 'lucide-react'
import { Product } from '../types'
import { cropImageRegion, ImageRegion, getImageMetadata } from '../utils/imageProcessor'
import RegionSelector from './RegionSelector'

interface ImageUploaderProps {
  onProductsExtracted: (products: Product[]) => void
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onProductsExtracted }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [imageMetadata, setImageMetadata] = useState<{
    width: number
    height: number
    aspectRatio: number
  } | null>(null)
  const [detectionMode, setDetectionMode] = useState<'auto' | 'manual'>('auto')
  const [manualRegions, setManualRegions] = useState<ImageRegion[]>([])
  const [showRegionSelector, setShowRegionSelector] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください')
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      const imageUrl = e.target?.result as string
      setUploadedImage(imageUrl)
      
      try {
        // 画像のメタデータを取得
        const metadata = await getImageMetadata(imageUrl)
        setImageMetadata(metadata)
        
        // 自動検出モードの場合は処理を開始
        if (detectionMode === 'auto') {
          const regions = generateProductRegions(metadata)
          processImage(imageUrl, regions)
        } else {
          // 手動検出モードの場合は初期領域を生成
          const initialRegions = generateProductRegions(metadata)
          setManualRegions(initialRegions)
          setShowRegionSelector(true)
        }
      } catch (error) {
        console.error('画像メタデータ取得エラー:', error)
        alert('画像の読み込みに失敗しました')
      }
    }
    reader.readAsDataURL(file)
  }

  const processImage = async (imageUrl: string, regions: ImageRegion[]) => {
    setIsProcessing(true)
    
    try {
      console.log('画像処理開始:', { imageUrl: imageUrl.substring(0, 50) + '...', regions })
      
      // 各領域を切り取って商品画像を生成
      const croppedImages = await Promise.all(
        regions.map(async (region, index) => {
          try {
            console.log(`領域${index + 1}の切り取り開始:`, region)
            const croppedImage = await cropImageRegion(imageUrl, region, 350)
            console.log(`領域${index + 1}の切り取り完了`)
            return croppedImage
          } catch (error) {
            console.error(`領域${index + 1}の切り取りエラー:`, error)
            // エラーが発生した場合は元画像をそのまま使用
            return imageUrl
          }
        })
      )
      
      console.log('切り取り完了:', croppedImages.length, '個の画像')
      
      // 商品データを生成
      const products: Product[] = regions.map((region, index) => ({
        id: `product-${index + 1}`,
        name: `商品${index + 1}`,
        price: `¥${Math.floor(Math.random() * 5000) + 500}`,
        description: `商品${index + 1}の詳細説明です。高品質でお得な商品をお届けします。`,
        imageUrl: croppedImages[index],
        originalImageUrl: imageUrl,
        position: region,
        isSelected: true,
        order: index
      }))
      
      console.log('商品データ生成完了:', products)
      onProductsExtracted(products)
    } catch (error) {
      console.error('画像処理エラー:', error)
      alert('画像の処理中にエラーが発生しました: ' + (error as Error).message)
    } finally {
      setIsProcessing(false)
    }
  }

  // 画像のサイズに基づいて商品領域を生成する関数
  const generateProductRegions = (metadata: {
    width: number
    height: number
    aspectRatio: number
  }): ImageRegion[] => {
    const { width, height } = metadata
    const regions: ImageRegion[] = []
    
    console.log('領域生成開始:', { width, height, aspectRatio: metadata.aspectRatio })
    
    // 最小サイズチェック
    if (width < 100 || height < 100) {
      console.warn('画像サイズが小さすぎます:', { width, height })
      // 小さな画像の場合は全体を使用
      regions.push({
        x: 0,
        y: 0,
        width: Math.max(50, width - 10),
        height: Math.max(50, height - 10)
      })
      return regions
    }
    
    // 横型画像の場合の処理
    if (width > height) {
      // 3つの商品領域を生成
      const regionWidth = Math.max(100, Math.floor(width / 3) - 20)
      const regionHeight = Math.max(100, Math.floor(height * 0.6))
      const startY = Math.floor(height * 0.2)
      
      for (let i = 0; i < 3; i++) {
        const x = 10 + i * (regionWidth + 10)
        // 境界チェック
        if (x + regionWidth <= width) {
          regions.push({
            x: x,
            y: startY,
            width: regionWidth,
            height: regionHeight
          })
        }
      }
      
      // 領域が生成されなかった場合は1つの領域を作成
      if (regions.length === 0) {
        regions.push({
          x: 10,
          y: 10,
          width: Math.max(100, width - 20),
          height: Math.max(100, height - 20)
        })
      }
    } else {
      // 縦型画像の場合の処理
      const regionWidth = Math.max(100, Math.floor(width * 0.8))
      const regionHeight = Math.max(100, Math.floor(height / 4))
      const startX = Math.floor(width * 0.1)
      
      for (let i = 0; i < 3; i++) {
        const y = 20 + i * (regionHeight + 20)
        // 境界チェック
        if (y + regionHeight <= height) {
          regions.push({
            x: startX,
            y: y,
            width: regionWidth,
            height: regionHeight
          })
        }
      }
      
      // 領域が生成されなかった場合は1つの領域を作成
      if (regions.length === 0) {
        regions.push({
          x: 10,
          y: 10,
          width: Math.max(100, width - 20),
          height: Math.max(100, height - 20)
        })
      }
    }
    
    console.log('生成された領域:', regions)
    return regions
  }

  const handleManualDetection = () => {
    if (!uploadedImage || !imageMetadata) return
    
    // 手動検出モードで処理
    const regions = generateProductRegions(imageMetadata)
    setManualRegions(regions)
    setShowRegionSelector(true)
  }

  const handleRegionSelectorConfirm = () => {
    if (!uploadedImage) return
    setShowRegionSelector(false)
    processImage(uploadedImage, manualRegions)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  // 手動検出モードが選択された場合の処理
  const handleDetectionModeChange = (mode: 'auto' | 'manual') => {
    setDetectionMode(mode)
    if (uploadedImage && imageMetadata) {
      if (mode === 'auto') {
        // 自動検出モードに切り替え
        setShowRegionSelector(false)
        const regions = generateProductRegions(imageMetadata)
        processImage(uploadedImage, regions)
      } else {
        // 手動検出モードに切り替え
        const regions = generateProductRegions(imageMetadata)
        setManualRegions(regions)
        setShowRegionSelector(true)
      }
    }
  }

  // RegionSelectorが表示されている場合
  if (showRegionSelector && uploadedImage) {
    return (
      <RegionSelector
        imageUrl={uploadedImage}
        regions={manualRegions}
        onRegionsChange={setManualRegions}
        onConfirm={handleRegionSelectorConfirm}
        onGoBack={() => setShowRegionSelector(false)}
      />
    )
  }

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          横型チラシ画像をアップロード
        </h2>
        <p className="text-gray-600">
          PDF、JPG、PNG形式の横型チラシ画像をアップロードしてください
        </p>
      </div>

      {/* 検出モード選択 */}
      <div className="mb-6">
        <div className="flex items-center justify-center space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="auto"
              checked={detectionMode === 'auto'}
              onChange={(e) => handleDetectionModeChange(e.target.value as 'auto' | 'manual')}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">自動検出</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="manual"
              checked={detectionMode === 'manual'}
              onChange={(e) => handleDetectionModeChange(e.target.value as 'auto' | 'manual')}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">手動検出</span>
          </label>
        </div>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              画像を処理中...
            </p>
            <p className="text-gray-600">
              AIが商品を検出しています（最大3分）
            </p>
          </div>
        ) : uploadedImage ? (
          <div className="flex flex-col items-center">
            <FileImage className="w-12 h-12 text-green-500 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              画像がアップロードされました
            </p>
            <img
              src={uploadedImage}
              alt="アップロードされた画像"
              className="max-w-md max-h-64 object-contain rounded-lg shadow-sm mb-4"
            />
            {imageMetadata && (
              <div className="text-sm text-gray-600 mb-4">
                サイズ: {imageMetadata.width} × {imageMetadata.height}px
              </div>
            )}
            {detectionMode === 'manual' && (
              <button
                onClick={handleManualDetection}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <Crop className="w-4 h-4 mr-2" />
                商品領域を検出
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              画像をドラッグ&ドロップ
            </p>
            <p className="text-gray-600 mb-4">
              または
            </p>
            <button
              onClick={openFileDialog}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              ファイルを選択
            </button>
            <p className="text-sm text-gray-500 mt-4">
              対応形式: PDF, JPG, PNG (最大10MB)
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}

export default ImageUploader 