"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  Upload,
  FileText,
  ImageIcon,
  File,
  Play,
  ArrowLeft,
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
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null) // hidden input ref

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

  // File upload → FastAPI
  const handleFileUpload = async (fileList: File[]) => {
    const newFiles: UploadedFile[] = fileList.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      status: "uploading",
      uploadedAt: new Date().toISOString(),
    }))

    const updatedFiles = [...files, ...newFiles]
    setFiles(updatedFiles)
    localStorage.setItem(`smaran_files_${params.id}`, JSON.stringify(updatedFiles))

    for (const file of fileList) {
      const formData = new FormData()
      formData.append("file", file)

      try {
        const res = await fetch("http://127.0.0.1:8000/upload/", {
          method: "POST",
          body: formData,
        })

        if (!res.ok) throw new Error("Upload failed")
        await res.json()

        setFiles((prev) =>
          prev.map((f) =>
            f.name === file.name ? { ...f, status: "ready", processingProgress: 100 } : f,
          ),
        )
      } catch {
        setFiles((prev) =>
          prev.map((f) => (f.name === file.name ? { ...f, status: "error" } : f)),
        )
      }
    }
  }

  // Trigger hidden file input
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(Array.from(e.target.files))
    }
  }

  // Preprocess → Generate audio
  const generatePodcast = async () => {
    try {
      const preprocessRes = await fetch("http://127.0.0.1:8000/preprocess/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Combine all uploaded files into study notes" }),
      })

      const preprocessData = await preprocessRes.json()

      const script = preprocessData.segments.map((s: any) => s.content).join("\n\n")

      const audioRes = await fetch("http://127.0.0.1:8000/generate-audio/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: script }),
      })

      if (!audioRes.ok) throw new Error("Audio generation failed")
      const blob = await audioRes.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
    } catch (err) {
      console.error("❌ Error:", err)
    }
  }

  if (!subject) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="flex items-center text-slate-600 hover:text-slate-900"
            >
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

          <div className="flex space-x-3">
            <Button
              className="bg-slate-200 text-slate-700 hover:bg-slate-300"
              onClick={triggerFileInput}
            >
              <Upload className="h-4 w-4 mr-2" /> Upload File
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={generatePodcast}>
              <Play className="h-4 w-4 mr-2" /> Generate Podcast
            </Button>
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            multiple
            hidden
            onChange={onFileChange}
          />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Files List */}
        <div className="lg:col-span-2 space-y-6">
          {files.length > 0 && (
            <Card className="bg-white/80 border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Uploaded Files</CardTitle>
              </CardHeader>
              <CardContent>
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-4 p-4 rounded-lg border bg-white/50"
                  >
                    <div className="text-slate-600">
                      {file.type.startsWith("image/") ? (
                        <ImageIcon />
                      ) : file.type === "application/pdf" ? (
                        <FileText />
                      ) : (
                        <File />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{file.name}</p>
                    </div>
                    <Badge>{file.status}</Badge>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Audio Player */}
        <div>
          {audioUrl ? (
            <Card className="bg-white/80 border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Study Podcast</CardTitle>
              </CardHeader>
              <CardContent>
                <audio ref={audioRef} src={audioUrl} controls className="w-full" />
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/80 border-0 shadow-lg">
              <CardContent className="text-center p-8 text-slate-600">
                No audio yet. Upload files & generate your podcast.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
