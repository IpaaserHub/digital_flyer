import React, { useState, useRef } from 'react'
import { FileImage, FileText, Code, Share2 } from 'lucide-react'
import { Product } from '../types'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface OutputGeneratorProps {
  products: Product[]
  onGoBack: () => void
}

const OutputGenerator: React.FC<OutputGeneratorProps> = ({ products, onGoBack }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedFiles, setGeneratedFiles] = useState<{
    image?: string
    pdf?: string
    html?: string
  }>({})
  const flyerRef = useRef<HTMLDivElement>(null)

  const generateImage = async () => {
    if (!flyerRef.current) return

    setIsGenerating(true)
    try {
      const canvas = await html2canvas(flyerRef.current, {
        width: 375,
        height: flyerRef.current.scrollHeight,
        scale: 2,
        backgroundColor: '#ffffff'
      })
      
      const imageUrl = canvas.toDataURL('image/png')
      setGeneratedFiles(prev => ({ ...prev, image: imageUrl }))
    } catch (error) {
      console.error('画像生成エラー:', error)
      alert('画像の生成中にエラーが発生しました')
    } finally {
      setIsGenerating(false)
    }
  }

  const generatePDF = async () => {
    if (!flyerRef.current) return

    setIsGenerating(true)
    try {
      const canvas = await html2canvas(flyerRef.current, {
        width: 375,
        height: flyerRef.current.scrollHeight,
        scale: 2,
        backgroundColor: '#ffffff'
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 295 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      const pdfBlob = pdf.output('blob')
      const pdfUrl = URL.createObjectURL(pdfBlob)
      setGeneratedFiles(prev => ({ ...prev, pdf: pdfUrl }))
    } catch (error) {
      console.error('PDF生成エラー:', error)
      alert('PDFの生成中にエラーが発生しました')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>縦型チラシ</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f5f5f5;
        }
        .flyer {
            max-width: 375px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .product {
            margin-bottom: 16px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .product-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
        }
        .product-info {
            padding: 12px;
        }
        .product-name {
            font-weight: 500;
            margin-bottom: 4px;
            color: #333;
        }
        .product-price {
            font-size: 18px;
            font-weight: bold;
            color: #dc2626;
        }
    </style>
</head>
<body>
    <div class="flyer">
        ${products.map(product => `
            <div class="product">
                <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">${product.price}</div>
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>`

    const blob = new Blob([htmlContent], { type: 'text/html' })
    const htmlUrl = URL.createObjectURL(blob)
    setGeneratedFiles(prev => ({ ...prev, html: htmlUrl }))
  }

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const shareFile = async (url: string, type: string) => {
    if (navigator.share) {
      try {
        const response = await fetch(url)
        const blob = await response.blob()
        const file = new File([blob], `flyer.${type}`, { type: blob.type })
        
        await navigator.share({
          title: '縦型チラシ',
          text: '生成された縦型チラシです',
          files: [file]
        })
      } catch (error) {
        console.error('共有エラー:', error)
      }
    } else {
      // フォールバック: URLをクリップボードにコピー
      navigator.clipboard.writeText(url)
      alert('URLをクリップボードにコピーしました')
    }
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // 画像読み込みエラー時のフォールバック
    const target = e.target as HTMLImageElement
    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDM1MCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzNTAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgNzBDMjE5LjE4MyA3MCAyNTUgMTA1LjgxNyAyNTUgMTUwQzI1NSAxOTQuMTgzIDIxOS4xODMgMjIwIDE3NSAyMjBDMTMwLjgxNyAyMjAgOTUgMTk0LjE4MyA5NSAxNTBDOTUgMTA1LjgxNyAxMzAuODE3IDcwIDE3NSA3MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTE3NSAxNzBDMjE5LjE4MyAxNzAgMjU1IDE5NS44MTcgMjU1IDI0MEMyNTUgMjg0LjE4MyAyMTkuMTgzIDMxMCAxNzUgMzEwQzEzMC44MTcgMzEwIDk1IDI4NC4xODMgOTUgMjQwQzk1IDE5NS44MTcgMTMwLjgxNyAxNzAgMTc1IDE3MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          出力
        </h2>
        <p className="text-gray-600">
          生成された縦型チラシを様々な形式で出力できます
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 出力オプション */}
        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              出力形式
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center">
                  <FileImage className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">画像 (PNG)</h4>
                    <p className="text-sm text-gray-600">高解像度画像ファイル</p>
                  </div>
                </div>
                <button
                  onClick={generateImage}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isGenerating ? '生成中...' : '生成'}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">PDF</h4>
                    <p className="text-sm text-gray-600">印刷用PDFファイル</p>
                  </div>
                </div>
                <button
                  onClick={generatePDF}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isGenerating ? '生成中...' : '生成'}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center">
                  <Code className="w-5 h-5 text-purple-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">HTML</h4>
                    <p className="text-sm text-gray-600">Web表示用HTML</p>
                  </div>
                </div>
                <button
                  onClick={generateHTML}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  生成
                </button>
              </div>
            </div>
          </div>

          {/* 生成されたファイル */}
          {Object.keys(generatedFiles).length > 0 && (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                生成されたファイル
              </h3>
              
              <div className="space-y-3">
                {generatedFiles.image && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">画像ファイル</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadFile(generatedFiles.image!, 'flyer.png')}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        ダウンロード
                      </button>
                      <button
                        onClick={() => shareFile(generatedFiles.image!, 'png')}
                        className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
                      >
                        <Share2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {generatedFiles.pdf && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">PDFファイル</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadFile(generatedFiles.pdf!, 'flyer.pdf')}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        ダウンロード
                      </button>
                      <button
                        onClick={() => shareFile(generatedFiles.pdf!, 'pdf')}
                        className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
                      >
                        <Share2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {generatedFiles.html && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">HTMLファイル</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadFile(generatedFiles.html!, 'flyer.html')}
                        className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
                      >
                        ダウンロード
                      </button>
                      <a
                        href={generatedFiles.html}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
                      >
                        プレビュー
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* プレビュー */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            最終プレビュー
          </h3>
          
          <div className="flex justify-center">
            <div
              ref={flyerRef}
              className="w-80 bg-white border-2 border-gray-300 rounded-lg shadow-lg overflow-hidden"
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

      <div className="mt-8 flex justify-center">
        <button
          onClick={onGoBack}
          className="px-6 py-3 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 transition-colors"
        >
          戻る
        </button>
      </div>
    </div>
  )
}

export default OutputGenerator 