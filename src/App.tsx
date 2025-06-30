import React, { useState } from 'react'
import ImageUploader from './components/ImageUploader'
import ProductManager from './components/ProductManager'
import Preview from './components/Preview'
import OutputGenerator from './components/OutputGenerator'
import { Product } from './types'

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
  const [currentStep, setCurrentStep] = useState<'upload' | 'manage' | 'preview' | 'output'>('upload')

  const handleProductsExtracted = (extractedProducts: Product[]) => {
    console.log('商品抽出完了:', extractedProducts)
    setProducts(extractedProducts)
    setSelectedProducts(extractedProducts)
    setCurrentStep('manage')
  }

  const handleProductsUpdated = (updatedProducts: Product[]) => {
    console.log('商品更新:', updatedProducts)
    setSelectedProducts(updatedProducts)
  }

  const handleLayoutGenerated = () => {
    console.log('レイアウト生成完了')
    setCurrentStep('preview')
  }

  const handlePreviewConfirmed = () => {
    console.log('プレビュー確認完了')
    setCurrentStep('output')
  }

  const resetToUpload = () => {
    console.log('新規作成にリセット')
    setProducts([])
    setSelectedProducts([])
    setCurrentStep('upload')
  }

  const goBack = () => {
    switch (currentStep) {
      case 'manage':
        setCurrentStep('upload')
        break
      case 'preview':
        setCurrentStep('manage')
        break
      case 'output':
        setCurrentStep('preview')
        break
      default:
        break
    }
  }

  const canGoBack = currentStep !== 'upload'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              縦型チラシ自動生成システム
            </h1>
            <div className="flex space-x-3">
              {canGoBack && (
                <button
                  onClick={goBack}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  戻る
                </button>
              )}
              <button
                onClick={resetToUpload}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                新規作成
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ステップインジケーター */}
        <div className="mb-8">
          <nav className="flex items-center justify-center">
            <ol className="flex items-center space-x-4">
              {[
                { key: 'upload', label: '画像アップロード', active: currentStep === 'upload' },
                { key: 'manage', label: '商品管理・レイアウト', active: currentStep === 'manage' },
                { key: 'preview', label: 'プレビュー', active: currentStep === 'preview' },
                { key: 'output', label: '出力', active: currentStep === 'output' }
              ].map((step, index) => (
                <li key={step.key} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step.active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    step.active ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                  {index < 3 && (
                    <div className="ml-4 w-8 h-0.5 bg-gray-200"></div>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* デバッグ情報 */}
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            デバッグ情報: 現在のステップ: {currentStep}, 商品数: {selectedProducts.length}
          </p>
        </div>

        {/* メインコンテンツ */}
        <div className="bg-white rounded-lg shadow">
          {currentStep === 'upload' && (
            <ImageUploader onProductsExtracted={handleProductsExtracted} />
          )}
          
          {currentStep === 'manage' && (
            <ProductManager 
              products={products}
              selectedProducts={selectedProducts}
              onProductsUpdated={handleProductsUpdated}
              onLayoutGenerated={handleLayoutGenerated}
              onGoBack={() => setCurrentStep('upload')}
            />
          )}
          
          {currentStep === 'preview' && (
            <Preview 
              products={selectedProducts}
              onConfirmed={handlePreviewConfirmed}
              onGoBack={() => setCurrentStep('manage')}
            />
          )}
          
          {currentStep === 'output' && (
            <OutputGenerator 
              products={selectedProducts}
              onGoBack={() => setCurrentStep('preview')}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default App 