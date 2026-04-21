'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image as ImageIcon, 
  Send, 
  X, 
  Loader2, 
  Globe, 
  Lock,
  SmilePlus
} from 'lucide-react';

export default function CreatePost() {
  const { profile } = useAuth();
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const userInitial = profile?.full_name?.[0]?.toUpperCase() || 'S';

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    setMediaType(null);
  };

  const handlePost = async () => {
    if (!content.trim() && !image) return;
    setIsLoading(true);

    try {
      let mediaUrl = null;

      // 1. Handle Image Upload
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `posts/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('campus-media')
          .upload(filePath, image);

        if (uploadError) {
          alert(`Image upload failed: ${uploadError.message}`);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('campus-media')
          .getPublicUrl(filePath);
        
        mediaUrl = publicUrl;
      }

      // 2. Create Post Record
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          content,
          media_url: mediaUrl,
          media_type: mediaType,
          visibility: isPublic ? 'PUBLIC' : 'PRIVATE',
          user_id: profile?.id,
          university_id: profile?.university_id,
        });

      if (postError) {
        alert(`Failed to create post: ${postError.message}`);
        throw postError;
      }

      // Reset
      setContent('');
      removeImage();
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 rounded-2xl mb-8 relative overflow-hidden"
    >
      <div className="flex gap-4">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex-shrink-0 flex items-center justify-center font-bold text-primary">
            {userInitial}
          </div>
        )}
        <div className="flex-1 space-y-4">
          <textarea
            placeholder="Share something with your campus..."
            className="w-full bg-transparent border-none outline-none text-lg resize-none min-h-[100px] placeholder:text-muted-foreground/50"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <AnimatePresence>
            {preview && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative rounded-xl overflow-hidden max-h-[300px] bg-black/20 flex justify-center"
              >
                {mediaType === 'video' ? (
                  <video src={preview} controls className="max-h-[300px] object-contain" />
                ) : (
                  <img src={preview} alt="Upload preview" className="max-h-[300px] object-contain" />
                )}
                <button 
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between border-t border-white/5 pt-4">
            <div className="flex items-center gap-2">
              <label className="p-2.5 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-primary transition-all cursor-pointer group">
                <input type="file" className="hidden" accept="image/*,video/*" onChange={handleImageChange} />
                <ImageIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </label>
              <button className="p-2.5 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-primary transition-all group">
                <SmilePlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
              <div className="h-6 w-px bg-white/10 mx-1" />
              <button 
                onClick={() => setIsPublic(!isPublic)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isPublic ? 'bg-primary/10 text-primary' : 'bg-white/5 text-muted-foreground'
                }`}
              >
                {isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {isPublic ? 'Public' : 'Private'}
              </button>
            </div>

            <button
              onClick={handlePost}
              disabled={isLoading || (!content.trim() && !image)}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 group shadow-lg shadow-primary/20"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {isLoading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
