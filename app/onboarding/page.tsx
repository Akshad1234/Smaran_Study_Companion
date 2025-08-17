"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Brain, GraduationCap, BookOpen, Mic, Bell, ArrowRight, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

const steps = [
  {
    title: "Study Level",
    description: "Help us personalize your experience",
    component: StudyLevelStep,
  },
  {
    title: "First Subject",
    description: "Create your first study subject",
    component: FirstSubjectStep,
  },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [studyLevel, setStudyLevel] = useState("")
  const [subjectName, setSubjectName] = useState("")
  const [subjectColor, setSubjectColor] = useState("#6C5CE7")
  const router = useRouter()

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete onboarding
      const userData = JSON.parse(localStorage.getItem("smaran_user") || "{}")
      localStorage.setItem(
        "smaran_user",
        JSON.stringify({
          ...userData,
          studyLevel,
          onboarded: true,
        }),
      )

      // Create first subject if provided
      if (subjectName) {
        const subjects = [
          {
            id: Math.random().toString(36).substr(2, 9),
            name: subjectName,
            color: subjectColor,
            createdAt: new Date().toISOString(),
            fileCount: 0,
          },
        ]
        localStorage.setItem("smaran_subjects", JSON.stringify(subjects))
      }

      router.push("/dashboard")
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const CurrentStepComponent = steps[currentStep].component

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">Smaran</span>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-12 rounded-full transition-colors ${
                  index <= currentStep ? "bg-indigo-600" : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">{steps[currentStep].title}</h1>
          <p className="text-slate-600">{steps[currentStep].description}</p>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CurrentStepComponent
              studyLevel={studyLevel}
              setStudyLevel={setStudyLevel}
              subjectName={subjectName}
              setSubjectName={setSubjectName}
              subjectColor={subjectColor}
              setSubjectColor={setSubjectColor}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={nextStep}
            className="bg-indigo-600 hover:bg-indigo-700 flex items-center"
            disabled={currentStep === 0 && !studyLevel}
          >
            {currentStep === steps.length - 1 ? "Get Started" : "Continue"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function StudyLevelStep({
  studyLevel,
  setStudyLevel,
}: {
  studyLevel: string
  setStudyLevel: (level: string) => void
}) {
  const levels = [
    { id: "high-school", label: "High School", icon: GraduationCap },
    { id: "undergraduate", label: "Undergraduate", icon: BookOpen },
    { id: "graduate", label: "Graduate/Professional", icon: Brain },
  ]

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>What's your study level?</CardTitle>
        <CardDescription>This helps us tailor the content complexity and exam focus</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={studyLevel} onValueChange={setStudyLevel}>
          <div className="space-y-4">
            {levels.map((level) => (
              <div
                key={level.id}
                className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-slate-50 transition-colors"
              >
                <RadioGroupItem value={level.id} id={level.id} />
                <level.icon className="h-6 w-6 text-indigo-600" />
                <Label htmlFor={level.id} className="flex-1 cursor-pointer font-medium">
                  {level.label}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}

function FirstSubjectStep({
  subjectName,
  setSubjectName,
  subjectColor,
  setSubjectColor,
}: {
  subjectName: string
  setSubjectName: (name: string) => void
  subjectColor: string
  setSubjectColor: (color: string) => void
}) {
  const colors = ["#6C5CE7", "#00B894", "#E17055", "#FDCB6E", "#A29BFE"]

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Create your first subject</CardTitle>
        <CardDescription>You can always add more subjects later</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="subject-name">Subject Name</Label>
          <Input
            id="subject-name"
            placeholder="e.g., Calculus, Biology, History..."
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Choose a color</Label>
          <div className="flex space-x-3">
           {colors.map((color, index) => (
              <button
                key={`${color}-${index}`}
                onClick={() => setSubjectColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  subjectColor === color ? "border-slate-400 scale-110" : "border-slate-200"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="text-sm text-slate-500">
          Don't worry, you can skip this and create subjects later from your dashboard.
        </div>
      </CardContent>
    </Card>
  )
}


