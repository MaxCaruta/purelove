import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Lock, Globe, CreditCard, Shield, Trash2, LogOut } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    messageNotifications: true,
    matchNotifications: true,
    likeNotifications: true,
    language: 'english',
    currency: 'usd',
    distanceUnit: 'km',
    showOnlineStatus: true,
    showLastActive: true,
    showProfile: true,
  });
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const handleToggle = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev],
    }));
  };
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };
  
  const handleDeleteAccount = () => {
    // In a real app, this would call an API to delete the account
    console.log('Delete account');
    setShowDeleteConfirm(false);
    signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center gap-2 mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
          
          <div className="space-y-6">
            {/* Notifications */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary-100 h-10 w-10 rounded-full flex items-center justify-center">
                    <Bell className="h-5 w-5 text-primary-600" />
                  </div>
                  <h2 className="text-lg font-semibold">Notifications</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <Switch 
                      checked={settings.emailNotifications} 
                      onCheckedChange={() => handleToggle('emailNotifications')} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-gray-500">Receive notifications on your device</p>
                    </div>
                    <Switch 
                      checked={settings.pushNotifications} 
                      onCheckedChange={() => handleToggle('pushNotifications')} 
                    />
                  </div>
                  
                  <div className="border-t pt-4">
                    <p className="font-medium mb-2">Notification Types</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm">New messages</p>
                        <Switch 
                          checked={settings.messageNotifications} 
                          onCheckedChange={() => handleToggle('messageNotifications')} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm">New matches</p>
                        <Switch 
                          checked={settings.matchNotifications} 
                          onCheckedChange={() => handleToggle('matchNotifications')} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm">New likes</p>
                        <Switch 
                          checked={settings.likeNotifications} 
                          onCheckedChange={() => handleToggle('likeNotifications')} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Preferences */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary-100 h-10 w-10 rounded-full flex items-center justify-center">
                    <Globe className="h-5 w-5 text-primary-600" />
                  </div>
                  <h2 className="text-lg font-semibold">Preferences</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Language</p>
                      <p className="text-sm text-gray-500">Select your preferred language</p>
                    </div>
                    <Select 
                      name="language" 
                      value={settings.language} 
                      onChange={handleSelectChange}
                      className="w-40"
                    >
                      <option value="english">English</option>
                      <option value="russian">Russian</option>
                      <option value="ukrainian">Ukrainian</option>
                      <option value="kazakh">Kazakh</option>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Currency</p>
                      <p className="text-sm text-gray-500">Select your preferred currency</p>
                    </div>
                    <Select 
                      name="currency" 
                      value={settings.currency} 
                      onChange={handleSelectChange}
                      className="w-40"
                    >
                      <option value="usd">USD ($)</option>
                      <option value="eur">EUR (€)</option>
                      <option value="gbp">GBP (£)</option>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Distance Unit</p>
                      <p className="text-sm text-gray-500">Select your preferred distance unit</p>
                    </div>
                    <Select 
                      name="distanceUnit" 
                      value={settings.distanceUnit} 
                      onChange={handleSelectChange}
                      className="w-40"
                    >
                      <option value="km">Kilometers</option>
                      <option value="mi">Miles</option>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Privacy */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary-100 h-10 w-10 rounded-full flex items-center justify-center">
                    <Lock className="h-5 w-5 text-primary-600" />
                  </div>
                  <h2 className="text-lg font-semibold">Privacy</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show Online Status</p>
                      <p className="text-sm text-gray-500">Allow others to see when you're online</p>
                    </div>
                    <Switch 
                      checked={settings.showOnlineStatus} 
                      onCheckedChange={() => handleToggle('showOnlineStatus')} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show Last Active</p>
                      <p className="text-sm text-gray-500">Allow others to see when you were last active</p>
                    </div>
                    <Switch 
                      checked={settings.showLastActive} 
                      onCheckedChange={() => handleToggle('showLastActive')} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show Profile</p>
                      <p className="text-sm text-gray-500">Make your profile visible to others</p>
                    </div>
                    <Switch 
                      checked={settings.showProfile} 
                      onCheckedChange={() => handleToggle('showProfile')} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Payment Methods */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary-100 h-10 w-10 rounded-full flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-primary-600" />
                  </div>
                  <h2 className="text-lg font-semibold">Payment Methods</h2>
                </div>
                
                <p className="text-gray-500 mb-4">Manage your payment methods and subscription</p>
                
                <Button variant="outline">Manage Payment Methods</Button>
              </CardContent>
            </Card>
            
            {/* Security */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary-100 h-10 w-10 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary-600" />
                  </div>
                  <h2 className="text-lg font-semibold">Security</h2>
                </div>
                
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    Change Password
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    Two-Factor Authentication
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Account Actions */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-red-600 mb-4">Account Actions</h2>
                
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="h-5 w-5 mr-2" />
                    Delete Account
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Delete Account Confirmation */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="max-w-md w-full">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-red-600 mb-2">Delete Account</h2>
                  <p className="text-gray-600 mb-4">
                    Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
                  </p>
                  
                  <div className="flex gap-3 justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={handleDeleteAccount}
                    >
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
