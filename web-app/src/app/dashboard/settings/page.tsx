'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Bell, Lock, User, Shield, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('Edit Profile');

  const tabs = [
    { id: 'Edit Profile', icon: User },
    { id: 'Privacy and Security', icon: Lock },
    { id: 'Notifications', icon: Bell },
    { id: 'Account Status', icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 py-8 px-4 h-[calc(100vh-100px)]">
      {/* Sidebar */}
      <div className="w-full md:w-64 flex flex-col gap-1 border-r border-white/10 pr-4">
        <h1 className="text-xl font-bold mb-4 px-3">Settings</h1>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
              activeTab === tab.id ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.id}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'Edit Profile' && (
          <div className="space-y-8 max-w-lg">
            <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
            <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/10">
              <div className="flex items-center gap-4">
                <img src={profile?.avatar_url || ''} alt="avatar" className="w-14 h-14 rounded-full object-cover bg-primary/20" />
                <div>
                  <h3 className="font-bold">{profile?.username || profile?.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{profile?.full_name}</p>
                </div>
              </div>
              <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all">
                Change photo
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Email</label>
                <input type="email" disabled value={profile?.email || ''} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none text-muted-foreground opacity-50 cursor-not-allowed" />
                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
              </div>

              {/* Other settings can be added here, for now it's mostly placeholders mapped to editData */}
              <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold transition-all mt-4 w-full md:w-auto">
                Submit
              </button>
            </div>
          </div>
        )}

        {activeTab === 'Privacy and Security' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold mb-6">Account Privacy</h2>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
              <div>
                <h3 className="font-bold">Private Account</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-[280px]">When your account is private, only people you approve can see your posts and followers.</p>
              </div>
              <div className="w-12 h-6 bg-white/20 rounded-full relative cursor-pointer">
                <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 transition-all" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-bold text-lg mt-8 mb-4">Interactions</h3>
              {['Comments', 'Mentions', 'Story replies'].map((item) => (
                <button key={item} className="flex items-center justify-between w-full p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all text-left text-sm font-medium">
                  {item} <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Placeholders for notifications and shield */}
        {(activeTab === 'Notifications' || activeTab === 'Account Status') && (
           <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
             {activeTab === 'Notifications' ? <Bell className="w-12 h-12 mb-4 opacity-50" /> : <Shield className="w-12 h-12 mb-4 opacity-50" />}
             <h3 className="text-xl font-bold">Coming Soon</h3>
             <p className="text-sm italic mt-2">These settings will be available in a future update.</p>
           </div>
        )}
      </div>
    </div>
  );
}
