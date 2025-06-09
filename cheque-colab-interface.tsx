"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, Play, FileImage, Activity, CheckCircle } from "lucide-react"

interface ProcessingStep {
  step: number
  description: string
  status: "pending" | "running" | "completed"
  output?: string[]
}

interface ChequeResult {
  id: string
  filename: string
  chequeNo: string
  status: "processing" | "completed" | "error"
  steps: ProcessingStep[]
  extractedData?: {
    numericalValue: string
    textualValue: string
    confidence: number
  }
  visualizations?: {
    original: string
    processed: string
    numericalRegion: string
    textualRegion: string
  }
}

export default function Component() {
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [results, setResults] = useState<ChequeResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processingSteps = [
    { step: 1, description: "Chargement du dataset", status: "pending" as const },
    { step: 2, description: "Prétraitement de l'image", status: "pending" as const },
    { step: 3, description: "Extraction des régions", status: "pending" as const },
    { step: 4, description: "Analyse par IA", status: "pending" as const },
    { step: 5, description: "Visualisation des résultats", status: "pending" as const },
  ]

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

  const simulateProcessing = async (result: ChequeResult, index: number) => {
    const steps = [...processingSteps]

    for (let i = 0; i < steps.length; i++) {
      // Update current step to running
      steps[i].status = "running"
      setResults((prev) => prev.map((r, idx) => (idx === index ? { ...r, steps: [...steps] } : r)))

      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

      // Generate step-specific output
      let output: string[] = []
      switch (i) {
        case 0:
          output = [`Dataset chargé : 5000 chèques`, `Traitement du chèque : ${result.chequeNo}`]
          break
        case 1:
          output = [
            `Chargement de l'image : ${result.filename}`,
            `Augmentation de la résolution : facteur 2`,
            `Conversion en niveaux de gris`,
            `Seuillage adaptatif appliqué`,
            `Nettoyage morphologique terminé`,
          ]
          break
        case 2:
          output = [
            `Détection des contours : 247 contours trouvés`,
            `Filtrage des régions de texte : 12 régions valides`,
            `Tri des régions par position verticale`,
          ]
          break
        case 3:
          const mockNumerical = Math.floor(Math.random() * 10000) + 1000
          const mockTextual = convertNumberToWords(mockNumerical)
          output = [
            `Analyse de la région numérique...`,
            `Valeur numérique attendue : ${mockNumerical}`,
            `Analyse de la région textuelle...`,
            `Valeur textuelle attendue : ${mockTextual}`,
            `Confiance : ${Math.floor(Math.random() * 20 + 80)}%`,
          ]

          // Store extracted data
          setResults((prev) =>
            prev.map((r, idx) =>
              idx === index
                ? {
                    ...r,
                    extractedData: {
                      numericalValue: mockNumerical.toString(),
                      textualValue: mockTextual,
                      confidence: Math.floor(Math.random() * 20 + 80),
                    },
                  }
                : r,
            ),
          )
          break
        case 4:
          output = [
            `Génération des visualisations...`,
            `Figure créée : 2x2 subplots`,
            `- Chèque Original`,
            `- Image Traitée (Seuillée)`,
            `- Région du Montant Numérique`,
            `- Région du Montant Textuel`,
            `Régions extraites avec succès. Prêtes pour l'analyse par IA.`,
          ]
          break
      }

      steps[i].output = output
      steps[i].status = "completed"

      setResults((prev) => prev.map((r, idx) => (idx === index ? { ...r, steps: [...steps] } : r)))
    }

    // Mark as completed
    setResults((prev) => prev.map((r, idx) => (idx === index ? { ...r, status: "completed" } : r)))
  }

  const convertNumberToWords = (num: number): string => {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ]
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
    const thousands = ["", "Thousand", "Million", "Billion"]

    if (num === 0) return "Zero"

    const convertHundreds = (n: number): string => {
      let result = ""
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + " Hundred"
        n %= 100
        if (n > 0) result += " and "
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)]
        if (n % 10 > 0) result += " " + ones[n % 10]
      } else if (n >= 10) {
        result += teens[n - 10]
      } else if (n > 0) {
        result += ones[n]
      }
      return result
    }

    let result = ""
    let thousandIndex = 0

    while (num > 0) {
      const chunk = num % 1000
      if (chunk > 0) {
        const chunkWords = convertHundreds(chunk)
        if (thousandIndex > 0) {
          result = chunkWords + " " + thousands[thousandIndex] + (result ? " " + result : "")
        } else {
          result = chunkWords
        }
      }
      num = Math.floor(num / 1000)
      thousandIndex++
    }

    return result
  }

  const processCheques = async () => {
    if (uploadedImages.length === 0) return

    setIsProcessing(true)

    // Initialize results
    const initialResults: ChequeResult[] = uploadedImages.map((file, index) => ({
      id: Math.random().toString(36).substr(2, 9),
      filename: file.name,
      chequeNo: `CHQ${(3000 + index).toString().padStart(4, "0")}`,
      status: "processing",
      steps: processingSteps.map((step) => ({ ...step })),
    }))

    setResults(initialResults)

    // Process each cheque
    for (let i = 0; i < initialResults.length; i++) {
      await simulateProcessing(initialResults[i], i)
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
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Cheque Processing - Google Colab Interface</h1>
        <p className="text-muted-foreground">
          Interface basée sur votre code Google Colab pour l'extraction de montants de chèques
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Télécharger les Images de Chèques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center space-y-4 hover:border-muted-foreground/50 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <FileImage className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <p className="text-lg font-medium">Glissez-déposez les images de chèques ici</p>
              <p className="text-muted-foreground">ou cliquez pour parcourir les fichiers</p>
            </div>
            <Button onClick={() => fileInputRef.current?.click()} variant="outline">
              Parcourir les Fichiers
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
                <h3 className="font-medium">Images Téléchargées ({uploadedImages.length})</h3>
                <div className="space-x-2">
                  <Button onClick={processCheques} disabled={isProcessing} className="gap-2">
                    <Play className="w-4 h-4" />
                    {isProcessing ? "Traitement en cours..." : "Lancer le Traitement"}
                  </Button>
                  <Button onClick={clearAll} variant="outline">
                    Effacer Tout
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

      {/* Results Section - Google Colab Style */}
      {results.length > 0 && (
        <div className="space-y-6">
          {results.map((result, resultIndex) => (
            <Card key={result.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="w-5 h-5" />
                    {result.filename} - {result.chequeNo}
                  </CardTitle>
                  <Badge variant={result.status === "completed" ? "default" : "secondary"} className="gap-1">
                    {result.status === "completed" && <CheckCircle className="w-3 h-3" />}
                    {result.status === "processing" && (
                      <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    )}
                    {result.status === "completed" ? "Terminé" : "En cours"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Colab-style execution cells */}
                {result.steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="border-b last:border-b-0">
                    <div className="flex">
                      {/* Input cell */}
                      <div className="w-16 bg-gray-50 flex items-start justify-center py-3 border-r">
                        <div className="text-xs text-muted-foreground font-mono">[{stepIndex + 1}]:</div>
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-sm font-medium">{step.description}</div>
                          {step.status === "running" && (
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          )}
                          {step.status === "completed" && <CheckCircle className="w-4 h-4 text-green-500" />}
                        </div>

                        {/* Output */}
                        {step.output && step.output.length > 0 && (
                          <div className="bg-gray-50 rounded p-3 font-mono text-sm space-y-1">
                            {step.output.map((line, lineIndex) => (
                              <div
                                key={lineIndex}
                                className={
                                  line.includes("Valeur numérique") || line.includes("Valeur textuelle")
                                    ? "text-blue-600 font-semibold"
                                    : line.includes("Confiance")
                                      ? "text-green-600"
                                      : "text-gray-700"
                                }
                              >
                                {line}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Final Results */}
                {result.status === "completed" && result.extractedData && (
                  <div className="bg-green-50 border-t-2 border-green-200 p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Résultats d'Extraction</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-sm">
                      <div className="space-y-2">
                        <div className="text-muted-foreground">Valeur Numérique:</div>
                        <div className="text-2xl font-bold text-blue-600">{result.extractedData.numericalValue}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-muted-foreground">Valeur Textuelle:</div>
                        <div className="text-lg font-semibold text-green-600">{result.extractedData.textualValue}</div>
                      </div>
                      <div className="md:col-span-2 pt-2 border-t">
                        <div className="text-muted-foreground">Confiance:</div>
                        <div className="text-lg font-semibold">{result.extractedData.confidence}%</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Visualization Placeholder */}
                {result.status === "completed" && (
                  <div className="bg-blue-50 border-t p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Visualisations Générées</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded border p-4 text-center">
                        <div className="w-full h-32 bg-gray-200 rounded mb-2 flex items-center justify-center">
                          <span className="text-sm text-muted-foreground">Chèque Original</span>
                        </div>
                      </div>
                      <div className="bg-white rounded border p-4 text-center">
                        <div className="w-full h-32 bg-gray-200 rounded mb-2 flex items-center justify-center">
                          <span className="text-sm text-muted-foreground">Image Traitée</span>
                        </div>
                      </div>
                      <div className="bg-white rounded border p-4 text-center">
                        <div className="w-full h-32 bg-gray-200 rounded mb-2 flex items-center justify-center">
                          <span className="text-sm text-muted-foreground">Région Numérique</span>
                        </div>
                      </div>
                      <div className="bg-white rounded border p-4 text-center">
                        <div className="w-full h-32 bg-gray-200 rounded mb-2 flex items-center justify-center">
                          <span className="text-sm text-muted-foreground">Région Textuelle</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
