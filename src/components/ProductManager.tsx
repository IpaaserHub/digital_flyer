import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { GripVertical, Trash2, Edit3, Smartphone, Settings, Eye } from 'lucide-react'
import { Product, LayoutSettings } from '../types'

interface ProductManagerProps {
  products: Product[]
  selectedProducts: Product[]
  onProductsUpdated: (products: Product[]) => void
  onLayoutGenerated: () => void
  onGoBack: () => void
}

const ProductManager: React.FC<ProductManagerProps> = ({
  products,
  selectedProducts,
  onProductsUpdated,
  onLayoutGenerated,
  onGoBack
}) => {
  const [settings, setSettings] = useState<LayoutSettings>({
    width: 375,
    spacing: 16,
    backgroundColor: '#ffffff',
    textColor: '#000000',
    showDescription: true,
    fontSize: 14,
    imageHeight: 200
  })

  const [showSettings, setShowSettings] = useState(false)

  const handleToggleSelection = (productId: string) => {
    const updatedProducts = selectedProducts.map(product =>
      product.id === productId
        ? { ...product, isSelected: !product.isSelected }
        : product
    )
    onProductsUpdated(updatedProducts.filter(p => p.isSelected))
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(selectedProducts)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    const updatedProducts = items.map((item, index) => ({
      ...item,
      order: index
    }))

    onProductsUpdated(updatedProducts)
  }

  const handleProductChange = (productId: string, field: 'name' | 'price' | 'description', value: string) => {
    const updatedProducts = selectedProducts.map(product =>
      product.id === productId
        ? { ...product, [field]: value }
        : product
    )
    onProductsUpdated(updatedProducts)
  }

  const handleRemoveProduct = (productId: string) => {
    const updatedProducts = selectedProducts.filter(p => p.id !== productId)
    onProductsUpdated(updatedProducts)
  }

  const handleSettingChange = (key: keyof LayoutSettings, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // 画像読み込みエラー時のフォールバック
    const target = e.target as HTMLImageElement
    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAyMkM0MC44MzY2IDIyIDQ4IDI5LjE2MzQgNDggMzhDNDggNDYuODM2NiA0MC44MzY2IDU0IDMyIDU0QzIzLjE2MzQgNTQgMTYgNDYuODM2NiAxNiAzOEMxNiAyOS4xNjM0IDIzLjE2MzQgMjIgMzIgMjJaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0zMiA0NEM0MC44MzY2IDQ0IDQ4IDUxLjE2MzQgNDggNjBDNDggNjguODM2NiA0MC44MzY2IDc2IDMyIDc2QzIzLjE2MzQgNzYgMTYgNjguODM2NiAxNiA2MEMxNiA1MS4xNjM0IDIzLjE2MzQgNDQgMzIgNDRaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPg=='
  }

  const handlePreviewImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // プレビュー用画像読み込みエラー時のフォールバック
    const target = e.target as HTMLImageElement
    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDM1MCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzNTAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgNzBDMjE5LjE4MyA3MCAyNTUgMTA1LjgxNyAyNTUgMTUwQzI1NSAxOTQuMTgzIDIxOS4xODMgMjIwIDE3NSAyMjBDMTMwLjgxNyAyMjAgOTUgMTk0LjE4MyA5NSAxNTBDOTUgMTA1LjgxNyAxMzAuODE3IDcwIDE3NSA3MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTE3NSAxNzBDMjE5LjE4MyAxNzAgMjU1IDE5NS44MTcgMjU1IDI0MEMyNTUgMjg0LjE4MyAyMTkuMTgzIDMxMCAxNzUgMzEwQzEzMC44MTcgMzEwIDk1IDI4NC4xODMgOTUgMjQwQzk1IDE5NS44MTcgMTMwLjgxNyAxNzAgMTc1IDE3MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          商品管理・レイアウト生成
        </h2>
        <p className="text-gray-600">
          商品を編集・並び替えて、リアルタイムでプレビューを確認できます
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* 商品管理パネル */}
        <div className="xl:col-span-1">
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                商品管理 ({selectedProducts.length})
              </h3>
              <div className="text-sm text-gray-500">
                ドラッグ&ドロップで並び順変更
              </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="products">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3 max-h-96 overflow-y-auto"
                  >
                    {selectedProducts.map((product, index) => (
                      <Draggable
                        key={product.id}
                        draggableId={product.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`bg-gray-50 border rounded-lg p-3 shadow-sm ${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                {...provided.dragHandleProps}
                                className="text-gray-400 hover:text-gray-600 cursor-grab"
                              >
                                <GripVertical className="w-4 h-4" />
                              </div>

                              <div className="flex-shrink-0">
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded-md"
                                  onError={handleImageError}
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    value={product.name}
                                    onChange={(e) => handleProductChange(product.id, 'name', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="商品名"
                                  />
                                  <input
                                    type="text"
                                    value={product.price}
                                    onChange={(e) => handleProductChange(product.id, 'price', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="価格"
                                  />
                                  <textarea
                                    value={product.description || ''}
                                    onChange={(e) => handleProductChange(product.id, 'description', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="商品説明（任意）"
                                    rows={2}
                                  />
                                </div>
                              </div>

                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => handleRemoveProduct(product.id)}
                                  className="p-1 text-gray-400 hover:text-red-600"
                                  title="削除"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>

        {/* レイアウト設定パネル */}
        <div className="xl:col-span-1">
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                レイアウト設定
              </h3>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {showSettings ? '設定を隠す' : '詳細設定'}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  横幅
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="320"
                    max="414"
                    value={settings.width}
                    onChange={(e) => handleSettingChange('width', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 w-12">
                    {settings.width}px
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  商品間の余白
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="8"
                    max="32"
                    value={settings.spacing}
                    onChange={(e) => handleSettingChange('spacing', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 w-12">
                    {settings.spacing}px
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  画像の高さ
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="150"
                    max="300"
                    value={settings.imageHeight}
                    onChange={(e) => handleSettingChange('imageHeight', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 w-12">
                    {settings.imageHeight}px
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  フォントサイズ
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="12"
                    max="20"
                    value={settings.fontSize}
                    onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 w-12">
                    {settings.fontSize}px
                  </span>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showDescription"
                  checked={settings.showDescription}
                  onChange={(e) => handleSettingChange('showDescription', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="showDescription" className="text-sm font-medium text-gray-700">
                  商品説明を表示
                </label>
              </div>

              {showSettings && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      背景色
                    </label>
                    <input
                      type="color"
                      value={settings.backgroundColor}
                      onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                      className="w-full h-8 border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      テキスト色
                    </label>
                    <input
                      type="color"
                      value={settings.textColor}
                      onChange={(e) => handleSettingChange('textColor', e.target.value)}
                      className="w-full h-8 border border-gray-300 rounded"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* リアルタイムプレビュー */}
        <div className="xl:col-span-1">
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Smartphone className="w-5 h-5 mr-2" />
                リアルタイムプレビュー
              </h3>
              <div className="text-sm text-gray-500">
                {selectedProducts.length}個の商品
              </div>
            </div>

            <div className="flex justify-center">
              <div
                className="bg-white border-2 border-gray-300 rounded-lg shadow-lg overflow-hidden"
                style={{ width: `${settings.width}px` }}
              >
                <div className="bg-gray-100 px-3 py-1 text-center text-xs text-gray-600">
                  スマホ表示プレビュー
                </div>
                
                <div
                  className="p-3"
                  style={{
                    backgroundColor: settings.backgroundColor,
                    color: settings.textColor
                  }}
                >
                  {selectedProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="mb-3 last:mb-0"
                      style={{ marginBottom: index < selectedProducts.length - 1 ? `${settings.spacing}px` : 0 }}
                    >
                      <div className="bg-gray-200 rounded-lg overflow-hidden" style={{ height: `${settings.imageHeight}px` }}>
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={handlePreviewImageError}
                        />
                      </div>
                      <div className="mt-2">
                        <h4 
                          className="font-medium truncate"
                          style={{ fontSize: `${settings.fontSize}px` }}
                        >
                          {product.name}
                        </h4>
                        <p 
                          className="font-bold text-red-600"
                          style={{ fontSize: `${settings.fontSize + 2}px` }}
                        >
                          {product.price}
                        </p>
                        {settings.showDescription && product.description && (
                          <p 
                            className="text-gray-600 mt-1 line-clamp-2"
                            style={{ fontSize: `${settings.fontSize - 2}px` }}
                          >
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3 text-center">
              <p className="text-xs text-gray-600">
                横幅: {settings.width}px × 高さ: 可変
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Eye className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">
              機能説明
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 商品名・価格・説明文をリアルタイム編集可能</li>
              <li>• ドラッグ&ドロップで商品の並び順を変更</li>
              <li>• レイアウト設定を変更すると即座にプレビューに反映</li>
              <li>• スマホ画面サイズに最適化された縦型レイアウト</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={onGoBack}
          className="px-6 py-3 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 transition-colors"
        >
          戻る
        </button>
        <button
          onClick={onLayoutGenerated}
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
        >
          出力ページへ進む
        </button>
      </div>
    </div>
  )
}

export default ProductManager 