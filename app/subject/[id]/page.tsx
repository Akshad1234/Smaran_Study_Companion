"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  Upload,
  FileText,
  ImageIcon,
  File,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Bookmark,
  ArrowLeft,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  status: "uploading" | "processing" | "ready" | "error"
  uploadedAt: string
  processingProgress?: number
}

interface AudioSegment {
  id: string
  title: string
  startTime: number
  duration: number
  importance: "high" | "medium" | "low"
}

interface Subject {
  id: string
  name: string
  color: string
  createdAt: string
  fileCount: number
}

export default function SubjectPage() {
  const params = useParams()
  const router = useRouter()
  const [subject, setSubject] = useState<Subject | null>(null)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(180) // Mock 3 minutes
  const [currentSegment, setCurrentSegment] = useState(0)

  // Mock audio segments (for demo)
  const audioSegments: AudioSegment[] = [
    { id: "1", title: "Introduction to Calculus", startTime: 0, duration: 45, importance: "high" },
    { id: "2", title: "Derivatives and Limits", startTime: 45, duration: 60, importance: "high" },
    { id: "3", title: "Integration Basics", startTime: 105, duration: 45, importance: "medium" },
    { id: "4", title: "Applications", startTime: 150, duration: 30, importance: "low" },
  ]

  useEffect(() => {
    const subjectsData = localStorage.getItem("smaran_subjects")
    if (subjectsData) {
      const subjects = JSON.parse(subjectsData)
      const currentSubject = subjects.find((s: Subject) => s.id === params.id)
      if (currentSubject) {
        setSubject(currentSubject)
      } else {
        router.push("/dashboard")
      }
    }

    const filesData = localStorage.getItem(`smaran_files_${params.id}`)
    if (filesData) {
      setFiles(JSON.parse(filesData))
    }
  }, [params.id, router])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFileUpload(droppedFiles)
  }, [files])

  // ⬇️ Real upload handler (FastAPI)
  const handleFileUpload = async (fileList: File[]) => {
    const newFiles: UploadedFile[] = fileList.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      status: "uploading",
      uploadedAt: new Date().toISOString(),
      processingProgress: 0,
    }))

    const updatedFiles = [...files, ...newFiles]
    setFiles(updatedFiles)
    localStorage.setItem(`smaran_files_${params.id}`, JSON.stringify(updatedFiles))

    for (const file of fileList) {
      const fileId = Math.random().toString(36).substr(2, 9)
      setFiles((prev) => [
        ...prev,
        {
          id: fileId,
          name: file.name,
          type: file.type,
          size: file.size,
          status: "uploading",
          uploadedAt: new Date().toISOString(),
          processingProgress: 0,
        },
      ])

      const formData = new FormData()
      formData.append("file", file)

      try {
        // Call FastAPI backend
        const res = await fetch("http://127.0.0.1:8000/upload/", {
          method: "POST",
          body: formData,
        })

        if (!res.ok) throw new Error("Upload failed")

        await res.json()

        // Update status to ready
        setFiles((prev) =>
          prev.map((f) =>
            f.name === file.name ? { ...f, status: "ready", processingProgress: 100 } : f,
          ),
        )
      } catch (err) {
        console.error(err)
        setFiles((prev) =>
          prev.map((f) =>
            f.name === file.name ? { ...f, status: "error" } : f,
          ),
        )
      }
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-5 w-5" />
    if (type === "application/pdf") return <FileText className="h-5 w-5" />
    return <File className="h-5 w-5" />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "uploading":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "ready":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const jumpToSegment = (segmentIndex: number) => {
    setCurrentSegment(segmentIndex)
    setCurrentTime(audioSegments[segmentIndex].startTime)
  }

  if (!subject) {
    return <div>Loading...</div>
  }

  const hasReadyFiles = files.some((f) => f.status === "ready")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>

            <div className="flex items-center space-x-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: subject.color }}
              >
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{subject.name}</h1>
                <p className="text-sm text-slate-600">{files.length} files uploaded</p>
              </div>
            </div>
          </div>

          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Upload className="h-4 w-4 mr-2" />
            Upload More
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Area & Files */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Area */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Upload Study Materials</CardTitle>
                <CardDescription>
                  Drop files here or click to browse. Supports images, PDFs, DOCX, TXT, and audio files.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragOver ? "border-indigo-400 bg-indigo-50" : "border-slate-300 hover:border-indigo-400"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-slate-900 mb-2">Drop notes here — photos, PDFs, DOCX, PYQ</p>
                  <p className="text-slate-600 mb-4">Or click to browse your files</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.mp3,.wav"
                    onChange={(e) => e.target.files && handleFileUpload(Array.from(e.target.files))}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button asChild className="cursor-pointer">
                      <span>Browse Files</span>
                    </Button>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Files List */}
            {files.length > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Uploaded Files</CardTitle>
                  <CardDescription>Track the processing status of your study materials</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {files.map((file) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center space-x-4 p-4 rounded-lg border bg-white/50"
                      >
                        <div className="text-slate-600">{getFileIcon(file.type)}</div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{file.name}</p>
                          <p className="text-sm text-slate-600">
                            {(file.size / 1024 / 1024).toFixed(2)} MB • {new Date(file.uploadedAt).toLocaleDateString()}
                          </p>

                          {file.status === "processing" && (
                            <div className="mt-2">
                              <Progress value={file.processingProgress || 0} className="h-2" />
                              <p className="text-xs text-slate-500 mt-1">
                                Processing... {Math.round(file.processingProgress || 0)}%
                              </p>
                            </div>
                          )}
                        </div>

                        <Badge className={getStatusColor(file.status)}>
                          {file.status === "uploading" && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                          {file.status === "processing" && <Clock className="h-3 w-3 mr-1" />}
                          {file.status === "ready" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Audio Player */}
          <div className="space-y-6">
            {hasReadyFiles ? (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Play className="h-5 w-5 mr-2 text-indigo-600" />
                    Study Podcast
                  </CardTitle>
                  <CardDescription>AI-generated audio from your materials</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Timeline Segments */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">Segments</p>
                    <div className="space-y-1">
                      {audioSegments.map((segment, index) => (
                        <button
                          key={segment.id}
                          onClick={() => jumpToSegment(index)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            currentSegment === index
                              ? "bg-indigo-50 border-indigo-200"
                              : "bg-white/50 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900 truncate text-sm">{segment.title}</p>
                              <p className="text-xs text-slate-600">
                                {formatTime(segment.startTime)} • {formatTime(segment.duration)}
                              </p>
                            </div>
                            <Badge
                              variant={segment.importance === "high" ? "default" : "secondary"}
                              className="ml-2 text-xs"
                            >
                              {segment.importance}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                    <Progress value={(currentTime / duration) * 100} className="h-2" />
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center space-x-4">
                    <Button variant="outline" size="sm">
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => setIsPlaying(!isPlaying)} className="bg-indigo-600 hover:bg-indigo-700">
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </Button>
                    <Button variant="outline" size="sm">
                      <SkipForward className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Volume2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Speed Control */}
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-sm text-slate-600">Speed:</span>
                    {["0.75x", "1x", "1.25x", "1.5x"].map((speed) => (
                      <Button
                        key={speed}
                        variant={speed === "1x" ? "default" : "outline"}
                        size="sm"
                        className="text-xs px-2 py-1"
                      >
                        {speed}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <Play className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No audio ready yet</h3>
                  <p className="text-slate-600">Upload and process some files to generate your study podcast</p>
                </CardContent>
              </Card>
            )}

            {/* Processing Status */}
            {files.some((f) => f.status === "processing") && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
                    <div>
                      <p className="font-medium text-slate-900">Processing files...</p>
                      <p className="text-sm text-slate-600">Your audio will be ready soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
