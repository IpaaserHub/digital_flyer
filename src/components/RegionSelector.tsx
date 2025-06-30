import React, { useState, useRef, useEffect } from 'react'
import { Crop, Move } from 'lucide-react'
import { ImageRegion } from '../utils/imageProcessor'

interface RegionSelectorProps {
  imageUrl: string
  regions: ImageRegion[]
  onRegionsChange: (regions: ImageRegion[]) => void
  onConfirm: () => void
  onGoBack?: () => void
}

const RegionSelector: React.FC<RegionSelectorProps> = ({
  imageUrl,
  regions,
  onRegionsChange,
  onConfirm,
  onGoBack
}) => {
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<'nw' | 'ne' | 'sw' | 'se' | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height })
      
      // キャンバスサイズを設定（最大800px）
      const maxSize = 800
      const aspectRatio = img.width / img.height
      
      let canvasWidth, canvasHeight
      if (img.width > img.height) {
        canvasWidth = Math.min(img.width, maxSize)
        canvasHeight = canvasWidth / aspectRatio
      } else {
        canvasHeight = Math.min(img.height, maxSize)
        canvasWidth = canvasHeight * aspectRatio
      }
      
      setCanvasSize({ width: canvasWidth, height: canvasHeight })
      drawCanvas()
    }
    img.src = imageUrl
  }, [imageUrl])

  const drawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 画像を描画
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvasSize.width, canvasSize.height)

      // 領域を描画
      regions.forEach((region, index) => {
        const scaleX = canvasSize.width / imageSize.width
        const scaleY = canvasSize.height / imageSize.height
        
        const x = region.x * scaleX
        const y = region.y * scaleY
        const width = region.width * scaleX
        const height = region.height * scaleY

        // 選択された領域は強調表示
        if (index === selectedRegion) {
          ctx.strokeStyle = '#3b82f6'
          ctx.lineWidth = 3
        } else {
          ctx.strokeStyle = '#6b7280'
          ctx.lineWidth = 2
        }

        ctx.strokeRect(x, y, width, height)

        // 領域番号を表示
        ctx.fillStyle = index === selectedRegion ? '#3b82f6' : '#6b7280'
        ctx.font = '16px Arial'
        ctx.fillText(`${index + 1}`, x + 5, y + 20)

        // 選択された領域にリサイズハンドルを描画
        if (index === selectedRegion) {
          const handleSize = 8
          const handles = [
            { x: x, y: y, cursor: 'nw-resize' }, // 左上
            { x: x + width - handleSize, y: y, cursor: 'ne-resize' }, // 右上
            { x: x, y: y + height - handleSize, cursor: 'sw-resize' }, // 左下
            { x: x + width - handleSize, y: y + height - handleSize, cursor: 'se-resize' } // 右下
          ]

          handles.forEach(handle => {
            ctx.fillStyle = '#3b82f6'
            ctx.fillRect(handle.x, handle.y, handleSize, handleSize)
            ctx.strokeStyle = '#ffffff'
            ctx.lineWidth = 1
            ctx.strokeRect(handle.x, handle.y, handleSize, handleSize)
          })
        }
      })
    }
    img.src = imageUrl
  }

  useEffect(() => {
    drawCanvas()
  }, [regions, selectedRegion, canvasSize])

  const getMousePos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const getResizeHandle = (mousePos: { x: number, y: number }): 'nw' | 'ne' | 'sw' | 'se' | null => {
    if (selectedRegion === null) return null

    const region = regions[selectedRegion]
    const scaleX = canvasSize.width / imageSize.width
    const scaleY = canvasSize.height / imageSize.height
    
    const x = region.x * scaleX
    const y = region.y * scaleY
    const width = region.width * scaleX
    const height = region.height * scaleY
    const handleSize = 8

    // 各ハンドルの位置をチェック
    if (mousePos.x >= x && mousePos.x <= x + handleSize && 
        mousePos.y >= y && mousePos.y <= y + handleSize) {
      return 'nw'
    }
    if (mousePos.x >= x + width - handleSize && mousePos.x <= x + width && 
        mousePos.y >= y && mousePos.y <= y + handleSize) {
      return 'ne'
    }
    if (mousePos.x >= x && mousePos.x <= x + handleSize && 
        mousePos.y >= y + height - handleSize && mousePos.y <= y + height) {
      return 'sw'
    }
    if (mousePos.x >= x + width - handleSize && mousePos.x <= x + width && 
        mousePos.y >= y + height - handleSize && mousePos.y <= y + height) {
      return 'se'
    }

    return null
  }

  const getCursorStyle = (mousePos: { x: number, y: number }): string => {
    // リサイズハンドルのチェック
    const handle = getResizeHandle(mousePos)
    if (handle) {
      switch (handle) {
        case 'nw': return 'nw-resize'
        case 'ne': return 'ne-resize'
        case 'sw': return 'sw-resize'
        case 'se': return 'se-resize'
        default: return 'default'
      }
    }

    // 領域内のチェック
    for (let i = regions.length - 1; i >= 0; i--) {
      const region = regions[i]
      const scaleX = canvasSize.width / imageSize.width
      const scaleY = canvasSize.height / imageSize.height
      
      const x = region.x * scaleX
      const y = region.y * scaleY
      const width = region.width * scaleX
      const height = region.height * scaleY

      if (
        mousePos.x >= x && mousePos.x <= x + width &&
        mousePos.y >= y && mousePos.y <= y + height
      ) {
        return 'move'
      }
    }

    return 'default'
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const mousePos = getMousePos(e)
    const scaleX = imageSize.width / canvasSize.width
    const scaleY = imageSize.height / canvasSize.height

    // リサイズハンドルのチェック
    const handle = getResizeHandle(mousePos)
    if (handle && selectedRegion !== null) {
      setIsResizing(true)
      setResizeHandle(handle)
      setDragStart(mousePos)
      return
    }

    // クリックされた領域を検出
    for (let i = regions.length - 1; i >= 0; i--) {
      const region = regions[i]
      const x = region.x * (canvasSize.width / imageSize.width)
      const y = region.y * (canvasSize.height / imageSize.height)
      const width = region.width * (canvasSize.width / imageSize.width)
      const height = region.height * (canvasSize.height / imageSize.height)

      if (
        mousePos.x >= x && mousePos.x <= x + width &&
        mousePos.y >= y && mousePos.y <= y + height
      ) {
        setSelectedRegion(i)
        setIsDragging(true)
        setDragStart({
          x: mousePos.x - x,
          y: mousePos.y - y
        })
        break
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const mousePos = getMousePos(e)
    const scaleX = imageSize.width / canvasSize.width
    const scaleY = imageSize.height / canvasSize.height

    // カーソルスタイルを更新
    const cursorStyle = getCursorStyle(mousePos)
    if (canvasRef.current) {
      canvasRef.current.style.cursor = cursorStyle
    }

    if (isResizing && selectedRegion !== null && resizeHandle) {
      const newRegions = [...regions]
      const region = newRegions[selectedRegion]
      const deltaX = (mousePos.x - dragStart.x) * scaleX
      const deltaY = (mousePos.y - dragStart.y) * scaleY

      switch (resizeHandle) {
        case 'nw':
          region.x = Math.max(0, region.x + deltaX)
          region.y = Math.max(0, region.y + deltaY)
          region.width = Math.max(50, region.width - deltaX)
          region.height = Math.max(50, region.height - deltaY)
          break
        case 'ne':
          region.y = Math.max(0, region.y + deltaY)
          region.width = Math.max(50, region.width + deltaX)
          region.height = Math.max(50, region.height - deltaY)
          break
        case 'sw':
          region.x = Math.max(0, region.x + deltaX)
          region.width = Math.max(50, region.width - deltaX)
          region.height = Math.max(50, region.height + deltaY)
          break
        case 'se':
          region.width = Math.max(50, region.width + deltaX)
          region.height = Math.max(50, region.height + deltaY)
          break
      }

      // 境界チェック
      region.x = Math.min(region.x, imageSize.width - region.width)
      region.y = Math.min(region.y, imageSize.height - region.height)
      region.width = Math.min(region.width, imageSize.width - region.x)
      region.height = Math.min(region.height, imageSize.height - region.y)

      onRegionsChange(newRegions)
      setDragStart(mousePos)
    } else if (isDragging && selectedRegion !== null) {
      const newRegions = [...regions]
      const newX = Math.max(0, (mousePos.x - dragStart.x) * scaleX)
      const newY = Math.max(0, (mousePos.y - dragStart.y) * scaleY)

      newRegions[selectedRegion] = {
        ...newRegions[selectedRegion],
        x: Math.min(newX, imageSize.width - newRegions[selectedRegion].width),
        y: Math.min(newY, imageSize.height - newRegions[selectedRegion].height)
      }

      onRegionsChange(newRegions)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
    setResizeHandle(null)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
    setIsResizing(false)
    setResizeHandle(null)
    // カーソルをデフォルトに戻す
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'default'
    }
  }

  const addRegion = () => {
    const newRegion: ImageRegion = {
      x: imageSize.width * 0.1,
      y: imageSize.height * 0.1,
      width: imageSize.width * 0.3,
      height: imageSize.height * 0.3
    }
    onRegionsChange([...regions, newRegion])
    setSelectedRegion(regions.length)
  }

  const removeRegion = () => {
    if (selectedRegion !== null) {
      const newRegions = regions.filter((_, index) => index !== selectedRegion)
      onRegionsChange(newRegions)
      setSelectedRegion(null)
    }
  }

  const resizeRegion = (direction: 'width' | 'height', delta: number) => {
    if (selectedRegion === null) return

    const newRegions = [...regions]
    const region = newRegions[selectedRegion]

    if (direction === 'width') {
      const newWidth = Math.max(50, region.width + delta)
      if (region.x + newWidth <= imageSize.width) {
        region.width = newWidth
      }
    } else {
      const newHeight = Math.max(50, region.height + delta)
      if (region.y + newHeight <= imageSize.height) {
        region.height = newHeight
      }
    }

    onRegionsChange(newRegions)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          商品領域の選択・調整
        </h3>
        <p className="text-gray-600 mb-4">
          画像上の商品領域をドラッグして移動し、角のハンドルでサイズを調整できます
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 画像表示エリア */}
        <div className="lg:col-span-2">
          <div className="bg-gray-100 rounded-lg p-4">
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              className="max-w-full h-auto border border-gray-300 rounded"
              style={{ cursor: 'default' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            />
          </div>
        </div>

        {/* コントロールパネル */}
        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">操作</h4>
            <div className="space-y-2">
              <button
                onClick={addRegion}
                className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                <Crop className="w-4 h-4 inline mr-2" />
                領域を追加
              </button>
              <button
                onClick={removeRegion}
                disabled={selectedRegion === null}
                className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                選択領域を削除
              </button>
            </div>
          </div>

          {selectedRegion !== null && (
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">
                領域 {selectedRegion + 1} の調整
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    幅
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => resizeRegion('width', -10)}
                      className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded">
                      {regions[selectedRegion].width}px
                    </span>
                    <button
                      onClick={() => resizeRegion('width', 10)}
                      className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    高さ
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => resizeRegion('height', -10)}
                      className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded">
                      {regions[selectedRegion].height}px
                    </span>
                    <button
                      onClick={() => resizeRegion('height', 10)}
                      className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">ヒント</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 領域をクリックして選択</li>
              <li>• ドラッグで移動（カーソルが移動アイコンに変化）</li>
              <li>• 角のハンドルでサイズ調整（カーソルがリサイズアイコンに変化）</li>
              <li>• ボタンでもサイズ調整可能</li>
              <li>• 複数の領域を追加可能</li>
            </ul>
          </div>

          <button
            onClick={onConfirm}
            className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700"
          >
            商品抽出を実行
          </button>

          {onGoBack && (
            <button
              onClick={onGoBack}
              className="w-full px-4 py-3 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 mt-3"
            >
              戻る
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default RegionSelector 