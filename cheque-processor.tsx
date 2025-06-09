"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Upload, ImageIcon, Play, CheckCircle, AlertCircle } from "lucide-react"

interface ChequeResult {
  id: string
  filename: string
  status: "processing" | "completed" | "error"
  extractedData?: {
    bankName: string
    accountNumber: string
    routingNumber: string
    amount: string
    payee: string
    date: string
    memo: string
  }
  confidence?: number
}

export default function Component() {
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [results, setResults] = useState<ChequeResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))
    setUploadedImages((prev) => [...prev, ...imageFiles])
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))
    setUploadedImages((prev) => [...prev, ...imageFiles])
  }

  const processCheques = async () => {
    if (uploadedImages.length === 0) return

    setIsProcessing(true)

    // Initialize results with processing status
    const initialResults: ChequeResult[] = uploadedImages.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      filename: file.name,
      status: "processing",
    }))

    setResults(initialResults)

    // Simulate processing each cheque
    for (let i = 0; i < initialResults.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 3000))

      // Mock extracted data
      const mockData = {
        bankName: ["Chase Bank", "Bank of America", "Wells Fargo", "Citibank"][Math.floor(Math.random() * 4)],
        accountNumber: `****${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0")}`,
        routingNumber: `${Math.floor(Math.random() * 900000000) + 100000000}`,
        amount: `$${(Math.random() * 5000 + 100).toFixed(2)}`,
        payee: ["John Smith", "ABC Company", "Jane Doe", "XYZ Corp"][Math.floor(Math.random() * 4)],
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        memo: ["Rent payment", "Invoice #1234", "Salary", "Refund"][Math.floor(Math.random() * 4)],
      }

      setResults((prev) =>
        prev.map((result, index) =>
          index === i
            ? {
                ...result,
                status: Math.random() > 0.1 ? "completed" : "error",
                extractedData: Math.random() > 0.1 ? mockData : undefined,
                confidence: Math.random() > 0.1 ? Math.floor(Math.random() * 20 + 80) : undefined,
              }
            : result,
        ),
      )
    }

    setIsProcessing(false)
  }

  const clearAll = () => {
    setUploadedImages([])
    setResults([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Cheque Processing Interface</h1>
        <p className="text-muted-foreground">Upload cheque images and extract data automatically</p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Cheque Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center space-y-4 hover:border-muted-foreground/50 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <p className="text-lg font-medium">Drag and drop cheque images here</p>
              <p className="text-muted-foreground">or click to browse files</p>
            </div>
            <Button onClick={() => fileInputRef.current?.click()} variant="outline">
              Browse Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {uploadedImages.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Uploaded Images ({uploadedImages.length})</h3>
                <div className="space-x-2">
                  <Button onClick={processCheques} disabled={isProcessing} className="gap-2">
                    <Play className="w-4 h-4" />
                    {isProcessing ? "Processing..." : "Process Cheques"}
                  </Button>
                  <Button onClick={clearAll} variant="outline">
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {uploadedImages.map((file, index) => (
                  <div key={index} className="space-y-2">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={URL.createObjectURL(file) || "/placeholder.svg"}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{file.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Processing Results
              <Badge variant="secondary">{results.length} files</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {results.map((result, index) => (
              <div key={result.id} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="font-mono text-sm text-muted-foreground">[{index + 1}]:</div>
                  <div className="font-medium">{result.filename}</div>
                  <Badge
                    variant={
                      result.status === "completed"
                        ? "default"
                        : result.status === "error"
                          ? "destructive"
                          : "secondary"
                    }
                    className="gap-1"
                  >
                    {result.status === "completed" && <CheckCircle className="w-3 h-3" />}
                    {result.status === "error" && <AlertCircle className="w-3 h-3" />}
                    {result.status === "processing" && (
                      <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    )}
                    {result.status}
                  </Badge>
                  {result.confidence && <Badge variant="outline">{result.confidence}% confidence</Badge>}
                </div>

                {result.status === "completed" && result.extractedData && (
                  <div className="ml-8 bg-muted/30 rounded-lg p-4 font-mono text-sm space-y-2">
                    <div className="text-green-600 font-medium">✓ Extraction completed successfully</div>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-muted-foreground">Bank Name:</div>
                        <div className="font-medium">{result.extractedData.bankName}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Amount:</div>
                        <div className="font-medium text-green-600">{result.extractedData.amount}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Payee:</div>
                        <div className="font-medium">{result.extractedData.payee}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Date:</div>
                        <div className="font-medium">{result.extractedData.date}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Account Number:</div>
                        <div className="font-medium">{result.extractedData.accountNumber}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Routing Number:</div>
                        <div className="font-medium">{result.extractedData.routingNumber}</div>
                      </div>
                      <div className="md:col-span-2">
                        <div className="text-muted-foreground">Memo:</div>
                        <div className="font-medium">{result.extractedData.memo}</div>
                      </div>
                    </div>
                  </div>
                )}

                {result.status === "error" && (
                  <div className="ml-8 bg-red-50 border border-red-200 rounded-lg p-4 font-mono text-sm">
                    <div className="text-red-600 font-medium">✗ Processing failed</div>
                    <div className="text-red-500 mt-1">
                      Unable to extract data from this cheque image. Please ensure the image is clear and properly
                      oriented.
                    </div>
                  </div>
                )}

                {result.status === "processing" && (
                  <div className="ml-8 bg-blue-50 border border-blue-200 rounded-lg p-4 font-mono text-sm">
                    <div className="text-blue-600 font-medium flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      Processing cheque image...
                    </div>
                    <div className="text-blue-500 mt-1">Extracting text and analyzing cheque data</div>
                  </div>
                )}

                {index < results.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
