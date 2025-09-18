import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FileText, Home, Bell, Settings, User, Trash2, LogOut, Edit, HelpCircle, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const [notifications, setNotifications] = useState<string[]>([
    "Your essay was analyzed.",
    "New assignment shared with your class.",
    "System maintenance scheduled tonight."
  ]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<{ username: string; avatarDataUrl?: string }>({ username: "dinoTeacher" });
 
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
     // load profile
    const storedProfile = localStorage.getItem('user_profile');
    if (storedProfile) {
      try {
        setProfile(JSON.parse(storedProfile));
      } catch {/* ignore */}
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

  const handleDeleteAssignment = (assignmentId: string) => {
    const next = assignments.filter(a => a.id !== assignmentId);
    persist(next);
    // Clean up any students persisted for this assignment
    localStorage.removeItem(`assignment_students_${assignmentId}`);
  };

  const markAllNotificationsRead = () => setNotifications([]);
  const clearNotifications = () => setNotifications([]);

  const handleAvatarChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const next = { ...profile, avatarDataUrl: reader.result as string };
      setProfile(next);
      localStorage.setItem('user_profile', JSON.stringify(next));
    };
    reader.readAsDataURL(file);
  };

  const handleUsernameChange = (name: string) => {
    const next = { ...profile, username: name };
    setProfile(next);
    localStorage.setItem('user_profile', JSON.stringify(next));
  };

  const handleLogout = () => {
    // Stub: clear local data and return to login
    localStorage.removeItem('user_profile');
    navigate('/login');
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
          <div className="flex items-center gap-2 md:gap-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Notifications">
                  <Bell className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">You're all caught up.</div>
                ) : (
                  <div className="max-h-64 overflow-auto">
                    {notifications.map((n, idx) => (
                      <div key={idx} className="px-3 py-2 text-sm border-b last:border-b-0 border-border/50">
                        {n}
                      </div>
                    ))}
                  </div>
                )}
                <DropdownMenuSeparator />
                <div className="flex gap-2 p-2">
                  <Button variant="secondary" className="h-8 px-2" onClick={markAllNotificationsRead}>Mark all read</Button>
                  <Button variant="ghost" className="h-8 px-2" onClick={clearNotifications}>Clear</Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Settings">
                  <Settings className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <HelpCircle className="w-4 h-4 mr-2" /> Help Center
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Mail className="w-4 h-4 mr-2" /> Contact Us
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2" aria-label="Profile menu">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={profile.avatarDataUrl} alt={profile.username} />
                    <AvatarFallback>{profile.username?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm hidden sm:inline">{profile.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-3 py-2 text-sm">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile.avatarDataUrl} alt={profile.username} />
                      <AvatarFallback>{profile.username?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{profile.username}</div>
                      <div className="text-xs text-muted-foreground">Teacher</div>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => setProfileOpen(true)}>
                  <Edit className="w-4 h-4 mr-2" /> Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-background/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-accent" />
                      </div>
                      <div className="text-sm bg-background/20 px-2 py-1 rounded">
                        {assignment.language}
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-primary-foreground/80 hover:text-destructive"
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Delete assignment"
                          title="Delete assignment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete assignment?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove the assignment and any saved student data linked to it. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAssignment(assignment.id);
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
      
      {/* Profile Edit Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatarDataUrl} alt={profile.username} />
                <AvatarFallback>{profile.username?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleAvatarChange(f);
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">Upload a square image for best results.</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input value={profile.username} onChange={e => handleUsernameChange(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="mt-4 flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setProfileOpen(false)}>Close</Button>
            <Button onClick={() => setProfileOpen(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
