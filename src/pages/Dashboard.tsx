import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FileText, Home, Globe, Settings, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Assignment {
  id: string;
  title: string;
  description: string;
  language: string;
  icon: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', language: '', customLanguage: '' });

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('assignments');
    if (stored) {
      try {
        setAssignments(JSON.parse(stored));
      } catch {
        // ignore parse error
      }
    } else {
      // seed with initial examples once
      const seed: Assignment[] = [
        {
          id: '1',
          title: 'Essay Assignment',
          description: 'Write your opinion on if should prisoners have the right to vote?',
          language: 'English',
          icon: '📝'
        },
        {
          id: '2',
          title: 'Penulisan',
          description: 'Apakah peranan ibu bapa dan keluarga dalam mengatasi dan menangani masalah sosial?',
          language: 'Bahasa Melayu',
          icon: '📝'
        }
      ];
      setAssignments(seed);
      localStorage.setItem('assignments', JSON.stringify(seed));
    }
  }, []);

  const persist = (list: Assignment[]) => {
    setAssignments(list);
    localStorage.setItem('assignments', JSON.stringify(list));
  };

  const resetForm = () => setForm({ title: '', description: '', language: '', customLanguage: '' });

  const handleSave = () => {
    if (!form.title.trim()) return; // minimal validation
    const chosenLanguage = form.language === 'other' && form.customLanguage.trim() ? form.customLanguage.trim() : form.language || 'English';
    const newAssignment: Assignment = {
      id: Date.now().toString(),
      title: form.title.trim(),
      description: form.description.trim(),
      language: chosenLanguage,
      icon: '📝'
    };
    const next = [...assignments, newAssignment];
    persist(next);
    setOpen(false);
    resetForm();
  };

  const handleAssignmentClick = (assignmentId: string) => {
    navigate(`/assignment/${assignmentId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Home className="w-6 h-6" />
            <h1 className="text-xl font-semibold">Checkit ✓</h1>
          </div>
          <div className="flex items-center gap-4">
            <Globe className="w-5 h-5" />
            <Settings className="w-5 h-5" />
            <span className="text-sm">dinoTeacher</span>
            <User className="w-5 h-5" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-foreground">{t('dashboard.assignments')}</h2>
          <Button variant="default" onClick={() => setOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> {t('dashboard.addAssignment')}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <Card 
              key={assignment.id}
              className="bg-primary/80 text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors"
              onClick={() => handleAssignmentClick(assignment.id)}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-background/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-accent" />
                    </div>
                    <div className="text-sm bg-background/20 px-2 py-1 rounded">
                      {assignment.language}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{assignment.title}</h3>
                    <p className="text-sm text-primary-foreground/80 leading-relaxed">
                      {assignment.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {assignments.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-12">
              {t('dashboard.empty')}
            </div>
          )}
        </div>
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dashboard.addAssignment')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('dashboard.form.title')}</label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('dashboard.form.description')}</label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('dashboard.form.language')}</label>
              <Select value={form.language} onValueChange={(val) => setForm(f => ({ ...f, language: val }))}>
                <SelectTrigger>
                  <SelectValue placeholder="English" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Bahasa Melayu">Bahasa Melayu</SelectItem>
                  <SelectItem value="中文">中文</SelectItem>
                  <SelectItem value="ไทย">ไทย</SelectItem>
                  <SelectItem value="தமிழ்">தமிழ்</SelectItem>
                  <SelectItem value="Bahasa Indonesia">Bahasa Indonesia</SelectItem>
                  <SelectItem value="Filipino">Filipino</SelectItem>
                  <SelectItem value="Khmer">Khmer</SelectItem>
                  <SelectItem value="Lao">Lao</SelectItem>
                  <SelectItem value="Burmese">Burmese</SelectItem>
                  <SelectItem value="other">Other...</SelectItem>
                </SelectContent>
              </Select>
              {form.language === 'other' && (
                <Input className="mt-2" placeholder="Enter language" value={form.customLanguage} onChange={e => setForm(f => ({ ...f, customLanguage: e.target.value }))} />
              )}
            </div>
          </div>
          <DialogFooter className="mt-4 flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => { setOpen(false); resetForm(); }}>{t('dashboard.form.cancel')}</Button>
            <Button onClick={handleSave} disabled={!form.title.trim()}>{t('dashboard.form.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
