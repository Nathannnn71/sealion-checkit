import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Home, Upload, Check, X, Plus, FileText, UserPlus, Trash2 } from "lucide-react";
import DocumentUpload from "@/components/DocumentUpload";
import { useI18n } from "@/lib/i18n";
import HeaderBar from "@/components/HeaderBar";

interface Student {
  id: string;
  name: string;
  studentId: string;
  submitted: boolean;
  essay?: string;
}

const Assignment = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useI18n();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedEssay, setUploadedEssay] = useState<string | null>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  
  // Students list now persisted per-assignment in localStorage
  const [students, setStudents] = useState<Student[]>([]);
  const storageKey = id ? `assignment_students_${id}` : null;

  useEffect(() => {
    if (!storageKey) return;
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed: Student[] = JSON.parse(raw);
        setStudents(parsed);
        return;
      } catch {
        // fall through to seeding
      }
    }
    // Seed with sample data on first load only
    const seed: Student[] = [
      { id: "1", name: "Alice Johnson", studentId: "STU001", submitted: true },
      { id: "2", name: "Bob Smith", studentId: "STU002", submitted: true },
      { id: "3", name: "Carol Brown", studentId: "STU003", submitted: true },
      { id: "4", name: "David Wilson", studentId: "STU004", submitted: true },
      { id: "5", name: "Emma Davis", studentId: "STU005", submitted: true },
      { id: "6", name: "Frank Miller", studentId: "STU006", submitted: true },
      { id: "7", name: "Grace Lee", studentId: "STU007", submitted: true },
      { id: "8", name: "Henry Taylor", studentId: "STU008", submitted: true },
      { id: "9", name: "Ivy Chen", studentId: "STU009", submitted: true },
      { id: "10", name: "Jack Anderson", studentId: "STU010", submitted: true },
      { id: "11", name: "Kate Rodriguez", studentId: "STU011", submitted: false },
      { id: "12", name: "Luke Martinez", studentId: "STU012", submitted: false }
    ];
    setStudents(seed);
    localStorage.setItem(storageKey, JSON.stringify(seed));
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    // Persist only after initial load/seed
    localStorage.setItem(storageKey, JSON.stringify(students));
  }, [students, storageKey]);

  // Add Student Form State
  const [newStudent, setNewStudent] = useState({
    name: "",
    studentId: "",
    essay: ""
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const submittedCount = students.filter(s => s.submitted).length;
  const totalCount = students.length;
  const submissionPercentage = (submittedCount / totalCount) * 100;

  const handleStudentClick = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student?.submitted) {
      // If the student has an essay, pass it to the checker; otherwise clear to allow default.
      if (student.essay && student.essay.trim()) {
        sessionStorage.setItem('uploadedEssay', student.essay);
        sessionStorage.setItem('currentStudentName', student.name);
      } else {
        sessionStorage.removeItem('uploadedEssay');
        sessionStorage.removeItem('currentStudentName');
      }
      // Persist current assignment id for proper back navigation
      if (id) sessionStorage.setItem('currentAssignmentId', id);
      navigate('/essay-checker');
    }
  };

  const handleUploadDocument = () => {
    setShowUploadModal(true);
  };

  // Persist uploaded essay so EssayChecker can pick it up (simple sessionStorage bridge)
  if (uploadedEssay) {
    sessionStorage.setItem('uploadedEssay', uploadedEssay);
  }
  // NEW: Handle Add Student Modal
  const handleAddStudentClick = () => {
    setShowAddStudentModal(true);
  };

  // NEW: Handle File Upload for New Student
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Read file content for essay text (simplified for demo)
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setNewStudent(prev => ({
          ...prev,
          essay: content
        }));
      };
      reader.readAsText(file);
    }
  };

  // NEW: Add New Student
  const handleAddStudent = () => {
    if (newStudent.name.trim() && newStudent.studentId.trim() && newStudent.essay.trim()) {
      const newStudentData: Student = {
        id: crypto.randomUUID(),
        name: newStudent.name.trim(),
        studentId: newStudent.studentId.trim(),
        submitted: true, // Provided essay counts as submitted
        essay: newStudent.essay
      };
      
      setStudents(prev => [...prev, newStudentData]);
      
      // Reset form
      setNewStudent({ name: "", studentId: "", essay: "" });
      setUploadedFile(null);
      setShowAddStudentModal(false);
    }
  };

  // Delete student (non-destructive confirmation can be added later)
  const handleDeleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
    if (selectedStudent === studentId) setSelectedStudent("");
  };

  // NEW: Reset Add Student Form
  const handleCancelAddStudent = () => {
    setNewStudent({ name: "", studentId: "", essay: "" });
    setUploadedFile(null);
    setShowAddStudentModal(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <HeaderBar />

      {/* Main Content */}
      <main className="p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-8">Essay Assignment</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student List */}
          <Card className="bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{t('assignment.studentList')}</h3>
                <span className="text-sm text-muted-foreground">{students.length}</span>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className={`group flex items-center gap-3 p-3 rounded-lg transition-colors border relative ${
                      student.submitted
                        ? 'hover:bg-muted/50 border-border'
                        : 'opacity-50 border-dashed border-muted-foreground/30'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleStudentClick(student.id)}
                      className="flex items-center gap-3 flex-1 text-left"
                    >
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{student.name}</div>
                        <div className="text-xs text-muted-foreground">{student.studentId}</div>
                      </div>
                      {student.submitted ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <X className="w-4 h-4 text-destructive" />
                      )}
                    </button>
                    <button
                      type="button"
                      aria-label="Delete student"
                      onClick={(e) => { e.stopPropagation(); handleDeleteStudent(student.id); }}
                      className="opacity-0 group-hover:opacity-100 absolute right-2 top-2 text-destructive hover:text-destructive/80 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              {/* ENHANCED: Add Student Button with proper functionality */}
              <Button 
                onClick={handleAddStudentClick}
                variant="ghost" 
                className="w-full mt-4 text-primary hover:bg-primary/10 border-2 border-dashed border-primary/30 hover:border-primary/50"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </CardContent>
          </Card>

          {/* Question */}
          <Card className="bg-card">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">{t('assignment.question.title')}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t('assignment.question.prompt')}</p>
              
              {/* Submission Progress */}
              <div className="mt-6">
                <div className="flex items-center justify-center mb-2">
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-muted stroke-current"
                        strokeWidth="3"
                        fill="transparent"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-success stroke-current"
                        strokeWidth="3"
                        strokeDasharray={`${submissionPercentage}, 100`}
                        strokeLinecap="round"
                        fill="transparent"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-semibold">{`${submittedCount}/${totalCount}`}</span>
                    </div>
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">{t('assignment.studentList')}</p>
                
                <div className="flex items-center gap-4 mt-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-success rounded-full"></div>
                    <span>{t('assignment.legend.submitted')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-destructive rounded-full"></div>
                    <span>{t('assignment.legend.notSubmitted')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grading */}
          <Card className="bg-card">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-6">{t('assignment.grading.title')}</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2">
                  <X className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-destructive font-medium">{t('assignment.grading.mistakes',{count:107})}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  <span className="text-sm text-success font-medium">{t('assignment.grading.corrections',{count:37})}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleUploadDocument}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {t('assignment.upload')}
                </Button>
                
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => {
                    if (id) sessionStorage.setItem('currentAssignmentId', id);
                    navigate('/essay-checker');
                  }}
                >
                  {t('assignment.openChecker')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="bg-primary/90 text-primary-foreground border-primary">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-medium">{t('assignment.upload')}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Upload Area */}
            <DocumentUpload
              onParsed={(text) => {
                setUploadedEssay(text);
              }}
            />
            
            {/* Student Name Selection */}
            <div className="space-y-2">
              <Label htmlFor="student" className="text-sm font-medium">{t('checker.student.placeholder')}</Label>
              <select
                id="student"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full p-2 rounded bg-background/20 border border-primary-foreground/30 text-primary-foreground"
              >
                <option value="">{t('checker.student.placeholder')}</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id} className="text-foreground bg-background">
                    {student.name} ({student.studentId})
                  </option>
                ))}
              </select>
            </div>
            
            <Button 
              className="w-full bg-background text-foreground hover:bg-background/80 disabled:opacity-50"
              disabled={!uploadedEssay}
              onClick={() => {
                setShowUploadModal(false);
                if (id) sessionStorage.setItem('currentAssignmentId', id);
                navigate('/essay-checker');
              }}
            >
              {uploadedEssay ? t('assignment.openChecker') : t('checker.analyze') + '...'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* NEW: Add Student Modal */}
      <Dialog open={showAddStudentModal} onOpenChange={setShowAddStudentModal}>
        <DialogContent className="bg-card text-card-foreground border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-medium flex items-center justify-center gap-2">
              <UserPlus className="w-5 h-5" />
              Add New Student
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Student Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentName" className="text-sm font-medium">Student Name</Label>
                <Input
                  id="studentName"
                  placeholder="Enter student name"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-background/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="studentIdNumber" className="text-sm font-medium">Student ID Number</Label>
                <Input
                  id="studentIdNumber"
                  placeholder="e.g., STU013"
                  value={newStudent.studentId}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, studentId: e.target.value }))}
                  className="bg-background/50"
                />
              </div>
            </div>

            {/* Essay Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Upload Essay</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="essayFile"
                  accept=".txt,.doc,.docx,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="essayFile" className="cursor-pointer">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-1">
                    {uploadedFile ? uploadedFile.name : "Click to upload essay file"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: TXT, DOC, DOCX, PDF
                  </p>
                </label>
              </div>
            </div>

            {/* Essay Text Area (if file uploaded or manual entry) */}
            <div className="space-y-2">
              <Label htmlFor="essayText" className="text-sm font-medium">
                Essay Content {uploadedFile && "(from uploaded file)"}
              </Label>
              <Textarea
                id="essayText"
                placeholder="Essay content will appear here after file upload, or enter manually..."
                value={newStudent.essay}
                onChange={(e) => setNewStudent(prev => ({ ...prev, essay: e.target.value }))}
                className="min-h-[200px] bg-background/50"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button 
                variant="outline" 
                onClick={handleCancelAddStudent}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddStudent}
                disabled={!newStudent.name.trim() || !newStudent.studentId.trim() || !newStudent.essay.trim()}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Add Student
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Assignment;

