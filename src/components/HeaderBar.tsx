import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Bell, Settings, LogOut, Edit, HelpCircle, Mail } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const HeaderBar = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<string[]>([
    "Your essay was analyzed.",
    "New assignment shared with your class.",
    "System maintenance scheduled tonight."
  ]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<{ username: string; avatarDataUrl?: string }>({ username: "dinoTeacher" });

  useEffect(() => {
    const storedProfile = localStorage.getItem('user_profile');
    if (storedProfile) {
      try { setProfile(JSON.parse(storedProfile)); } catch {/* ignore */}
    }
  }, []);

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
    localStorage.removeItem('user_profile');
    navigate('/login');
  };

  return (
    <header className="bg-primary text-primary-foreground px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Home className="w-6 h-6 cursor-pointer" onClick={() => navigate('/dashboard')} />
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
    </header>
  );
};

export default HeaderBar;
