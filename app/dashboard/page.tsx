"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Brain,
  Plus,
  Search,
  Settings,
  UserIcon,
  BookOpen,
  Upload,
  Play,
  MoreVertical,
  FileText,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Subject {
  id: string
  name: string
  color: string
  createdAt: string
  fileCount: number
}

interface User {
  id: string
  name: string
  email: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateSubject, setShowCreateSubject] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState("")
  const [newSubjectColor, setNewSubjectColor] = useState("#6C5CE7")
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem("smaran_user")
    if (!userData) {
      router.push("/auth")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    // Load subjects
    const subjectsData = localStorage.getItem("smaran_subjects")
    if (subjectsData) {
      setSubjects(JSON.parse(subjectsData))
    }
  }, [router])

  const createSubject = () => {
    if (!newSubjectName.trim()) return

    const newSubject: Subject = {
      id: Math.random().toString(36).substr(2, 9),
      name: newSubjectName,
      color: newSubjectColor,
      createdAt: new Date().toISOString(),
      fileCount: 0,
    }

    const updatedSubjects = [...subjects, newSubject]
    setSubjects(updatedSubjects)
    localStorage.setItem("smaran_subjects", JSON.stringify(updatedSubjects))

    setNewSubjectName("")
    setShowCreateSubject(false)
  }

  const deleteSubject = (subjectId: string) => {
    const updatedSubjects = subjects.filter((s) => s.id !== subjectId)
    setSubjects(updatedSubjects)
    localStorage.setItem("smaran_subjects", JSON.stringify(updatedSubjects))
  }

  const filteredSubjects = subjects.filter((subject) => subject.name.toLowerCase().includes(searchQuery.toLowerCase()))

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Smaran</span>
            </Link>

            <div className="relative ml-8">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-white/50"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button onClick={() => setShowCreateSubject(true)} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Subject
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-indigo-100 text-indigo-600">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    localStorage.removeItem("smaran_user")
                    localStorage.removeItem("smaran_subjects")
                    router.push("/")
                  }}
                >
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {user.name}!</h1>
          <p className="text-slate-600">Ready to turn your study materials into engaging audio content?</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Subjects</p>
                  <p className="text-2xl font-bold text-slate-900">{subjects.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Files Processed</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {subjects.reduce((acc, s) => acc + s.fileCount, 0)}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Study Time</p>
                  <p className="text-2xl font-bold text-slate-900">2.5h</p>
                </div>
                <Clock className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subjects Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Your Subjects</h2>

          {filteredSubjects.length === 0 && !showCreateSubject ? (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No subjects yet</h3>
                <p className="text-slate-600 mb-6">
                  Create your first subject to start organizing your study materials
                </p>
                <Button onClick={() => setShowCreateSubject(true)} className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Subject
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Create Subject Card */}
              {showCreateSubject && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-2 border-dashed border-indigo-300 shadow-lg">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <Input
                          placeholder="Subject name..."
                          value={newSubjectName}
                          onChange={(e) => setNewSubjectName(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && createSubject()}
                        />
                        <div className="flex space-x-2">
                          {["#6C5CE7", "#00B894", "#E17055", "#FDCB6E", "#A29BFE", "#FD79A8"].map((color) => (
                            <button
                              key={color}
                              onClick={() => setNewSubjectColor(color)}
                              className={`w-6 h-6 rounded-full border-2 ${
                                newSubjectColor === color ? "border-slate-400" : "border-slate-200"
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <Button onClick={createSubject} size="sm" className="flex-1">
                            Create
                          </Button>
                          <Button onClick={() => setShowCreateSubject(false)} variant="outline" size="sm">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Subject Cards */}
              {filteredSubjects.map((subject, index) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <SubjectCard subject={subject} onDelete={() => deleteSubject(subject.id)} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function SubjectCard({ subject, onDelete }: { subject: Subject; onDelete: () => void }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: subject.color }}
            >
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{subject.name}</CardTitle>
              <CardDescription>
                {subject.fileCount} files • Created {new Date(subject.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex space-x-2">
          <Link href={`/subject/${subject.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </Link>
          <Button variant="outline" size="sm" disabled={subject.fileCount === 0}>
            <Play className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
