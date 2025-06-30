import React, { useState } from 'react'
import { Smartphone, Download, Check } from 'lucide-react'
import { Product } from '../types'

interface PreviewProps {
  products: Product[]
  onConfirmed: () => void
  onGoBack: () => void
}

const Preview: React.FC<PreviewProps> = ({ products, onConfirmed, onGoBack }) => {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // 画像読み込みエラー時のフォールバック
    const target = e.target as HTMLImageElement
    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTE2LjU2OSA3MCAxMzAgODMuNDMxIDEzMCAxMDBDMTMwIDExNi41NjkgMTE2LjU2OSAxMzAgMTAwIDEzMEM4My40MzEgMTMwIDcwIDExNi41NjkgNzAgMTAwQzcwIDgzLjQzMSA4My40MzEgNzAgMTAwIDcwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTAwIDE0MEMxMTYuNTY5IDE0MCAxMzAgMTUzLjQzMSAxMzAgMTcwQzEzMCAxODYuNTY5IDExNi41NjkgMjAwIDEwMCAyMDBDODMuNDMxIDIwMCA3MCAxODYuNTY5IDcwIDE3MEM3MCAxNTMuNDMxIDgzLjQzMSAxNDAgMTAwIDE0MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          プレビュー
        </h2>
        <p className="text-gray-600">
          生成された縦型チラシの最終確認を行ってください
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* スマホプレビュー */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Smartphone className="w-5 h-5 mr-2" />
                スマホ表示プレビュー
              </h3>
              <button
                onClick={toggleFullscreen}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {isFullscreen ? '縮小' : '全画面表示'}
              </button>
            </div>

            <div className="flex justify-center">
              <div
                className={`bg-white border-2 border-gray-300 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
                  isFullscreen ? 'w-full max-w-md' : 'w-80'
                }`}
              >
                <div className="bg-gray-100 px-4 py-2 text-center text-sm text-gray-600">
                  縦型チラシ
                </div>
                
                <div className="p-4 space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-sm">
                      <div className="bg-gray-200" style={{ height: '200px' }}>
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                        />
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-gray-900 text-sm mb-1">
                          {product.name}
                        </h4>
                        <p className="text-lg font-bold text-red-600">
                          {product.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 情報パネル */}
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              チラシ情報
            </h4>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex justify-between">
                <span>商品数:</span>
                <span className="font-medium">{products.length}個</span>
              </div>
              <div className="flex justify-between">
                <span>横幅:</span>
                <span className="font-medium">375px</span>
              </div>
              <div className="flex justify-between">
                <span>高さ:</span>
                <span className="font-medium">可変</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2 flex items-center">
              <Check className="w-4 h-4 mr-2" />
              最適化完了
            </h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• スマホ表示に最適化</li>
              <li>• 商品画像リサイズ済み</li>
              <li>• 縦型レイアウト適用</li>
              <li>• 読み込み速度最適化</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">
              注意事項
            </h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• 商品の切り抜き精度は90%程度</li>
              <li>• 手動調整が必要な場合があります</li>
              <li>• リンク設定は後から追加可能</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={onGoBack}
          className="px-6 py-3 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 transition-colors"
        >
          戻る
        </button>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            プレビューに問題がなければ、次のステップに進んでください
          </div>
          <button
            onClick={onConfirmed}
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            出力へ進む
          </button>
        </div>
      </div>
    </div>
  )
}

export default Preview 