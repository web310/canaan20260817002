import React, { useState, useEffect, useCallback } from 'react';
import { Language, GalleryPhoto, GalleryCategory, GoogleAlbum } from '../types';
import { INITIAL_GALLERY_PHOTOS, INITIAL_GOOGLE_ALBUMS, GALLERY_CATEGORIES, GOOGLE_SITES_GALLERY_URL, GOOGLE_PHOTOS_HISTORICAL_ALBUM_URL, isPhotoInCategory } from '../data/galleryData';
import { GooglePhotosAISyncModal } from './GooglePhotosAISyncModal';
import { CategoryManagerModal } from './CategoryManagerModal';
import { PhotoEditModal } from './PhotoEditModal';
import { BatchPhotoEditModal } from './BatchPhotoEditModal';
import { GalleryGitHubSyncModal } from './GalleryGitHubSyncModal';
import { GoogleAlbumModal } from './GoogleAlbumModal';
import { 
  Images, 
  ExternalLink, 
  Plus, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  MapPin, 
  Maximize2, 
  Download, 
  Trash2, 
  Sparkles, 
  Church, 
  Heart, 
  Award, 
  Sun, 
  History, 
  FolderHeart, 
  Upload, 
  Tag, 
  CheckCircle2, 
  HelpCircle, 
  Link as LinkIcon, 
  Share2, 
  Info, 
  Loader2, 
  RefreshCw, 
  Zap, 
  ShieldCheck, 
  Check, 
  Search, 
  Users, 
  Bot, 
  Gift, 
  Trees, 
  Utensils, 
  Settings, 
  Edit2, 
  Edit3, 
  BookOpen, 
  Music, 
  Camera,
  Github,
  Globe,
  Layers,
  FileImage,
  SlidersHorizontal,
  CheckCircle,
  CheckSquare,
  Square,
  Wand2
} from 'lucide-react';

interface PhotoGalleryProps {
  lang: Language;
  adminEmail?: string | null;
}

interface UploadQueueItem {
  id: string;
  imageUrl: string;
  titleZh: string;
  titleEn: string;
  category: string;
  date: string;
  albumNameZh: string;
  albumNameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  locationZh: string;
  locationEn: string;
  isAiAnalyzed?: boolean;
  isAnalyzing?: boolean;
}

// Client-side image resize helper to keep base64 memory and storage performant
const compressAndReadFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxDimension = 1600;
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.88));
            return;
          }
        }
        resolve(result);
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper to get set of deleted photo IDs from localStorage
const getDeletedPhotoIds = (): Set<string> => {
  try {
    const saved = localStorage.getItem('canaan_deleted_photo_ids');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch (e) {
    console.error("Error reading deleted photo IDs:", e);
  }
  return new Set<string>();
};

// Helper to get set of deleted album IDs from localStorage
const getDeletedAlbumIds = (): Set<string> => {
  try {
    const saved = localStorage.getItem('canaan_deleted_album_ids');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch (e) {
    console.error("Error reading deleted album IDs:", e);
  }
  return new Set<string>();
};

export const PhotoGallerySection: React.FC<PhotoGalleryProps> = ({ lang, adminEmail }) => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(() => {
    try {
      const deletedIds = getDeletedPhotoIds();
      const savedAll = localStorage.getItem('canaan_gallery_photos_all');
      if (savedAll) {
        const parsed = JSON.parse(savedAll);
        if (Array.isArray(parsed)) {
          return parsed.filter(p => !deletedIds.has(p.id));
        }
      }
      const savedCustom = localStorage.getItem('canaan_gallery_photos_custom');
      const savedAuto = localStorage.getItem('canaan_gallery_auto_synced_photos');
      let combined: GalleryPhoto[] = [];
      if (savedCustom) {
        combined = [...combined, ...JSON.parse(savedCustom)];
      }
      if (savedAuto) {
        combined = [...combined, ...JSON.parse(savedAuto)];
      }
      if (combined.length > 0) {
        const map = new Map<string, GalleryPhoto>();
        combined.forEach(p => map.set(p.id, p));
        return Array.from(map.values()).filter(p => !deletedIds.has(p.id));
      }
      return INITIAL_GALLERY_PHOTOS.filter(p => !deletedIds.has(p.id));
    } catch (e) {
      console.error("Failed to load saved gallery photos:", e);
    }
    return INITIAL_GALLERY_PHOTOS;
  });

  // Dynamic gallery categories (admin configurable & persistent)
  const [categories, setCategories] = useState<GalleryCategory[]>(() => {
    try {
      const saved = localStorage.getItem('canaan_gallery_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load saved gallery categories:", e);
    }
    return GALLERY_CATEGORIES;
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  // Google Albums State (includes the user's specific 6 albums, editable & addable by admin)
  const [googleAlbums, setGoogleAlbums] = useState<GoogleAlbum[]>(() => {
    try {
      const deletedAlbumIds = getDeletedAlbumIds();
      const saved = localStorage.getItem('canaan_google_albums');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(a => !deletedAlbumIds.has(a.id));
        }
      }
      return INITIAL_GOOGLE_ALBUMS.filter(a => !deletedAlbumIds.has(a.id));
    } catch (e) {
      console.error("Failed to load saved google albums:", e);
    }
    return INITIAL_GOOGLE_ALBUMS;
  });

  const [isGoogleAlbumModalOpen, setIsGoogleAlbumModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<GoogleAlbum | null>(null);
  const [galleryViewMode, setGalleryViewMode] = useState<'all' | 'albums' | 'photos'>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGooglePhotosGuideOpen, setIsGooglePhotosGuideOpen] = useState(false);
  const [isGooglePhotosAIModalOpen, setIsGooglePhotosAIModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isEditPhotoModalOpen, setIsEditPhotoModalOpen] = useState(false);
  const [isBatchEditModalOpen, setIsBatchEditModalOpen] = useState(false);
  const [isGitHubSyncModalOpen, setIsGitHubSyncModalOpen] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [isBatchSelectMode, setIsBatchSelectMode] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAnalyzingSingle, setIsAnalyzingSingle] = useState(false);

  // Google Photos Shared Album URL input & sync state
  const [albumUrlInput, setAlbumUrlInput] = useState('');
  const [isSyncingAlbumUrl, setIsSyncingAlbumUrl] = useState(false);

  // Auto-Sync state for web@canaannewlife.org
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [autoSyncStatus, setAutoSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'auth_needed'>(() => {
    const token = localStorage.getItem('canaan_gp_token');
    return token ? 'idle' : 'auth_needed';
  });
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(() => {
    return localStorage.getItem('canaan_gp_last_sync_time') || null;
  });

  // Multi-file Queue State for manual photo upload
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [urlInputBatch, setUrlInputBatch] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isBatchAIAnalyzing, setIsBatchAIAnalyzing] = useState(false);
  const [batchAIProgress, setBatchAIProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [isReadingFiles, setIsReadingFiles] = useState(false);

  // Common quick batch settings (to easily apply defaults to all items in queue)
  const [batchCommon, setBatchCommon] = useState({
    titleZh: '',
    titleEn: '',
    category: 'worship',
    date: new Date().toISOString().slice(0, 7),
    albumNameZh: '',
    locationZh: '加南新生基督教會',
    locationEn: 'Canaan Shin Sheng Christian Church',
    descriptionZh: '',
    descriptionEn: ''
  });

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Auto-Sync execution function (pulls directly from web@canaannewlife.org & runs AI categorization)
  const triggerAutoSync = useCallback(async (tokenOverride?: string) => {
    const token = tokenOverride || localStorage.getItem('canaan_gp_token');
    setIsAutoSyncing(true);
    setAutoSyncStatus('syncing');

    try {
      if (!token) {
        // If no token yet, simulate / fetch church feed with fallback
        setAutoSyncStatus('auth_needed');
        setIsAutoSyncing(false);
        return;
      }

      // Fetch auto-sync from server endpoint
      const res = await fetch('/api/gallery/auto-sync-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          account: 'web@canaannewlife.org'
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        if (res.status === 401) {
          setAutoSyncStatus('auth_needed');
          localStorage.removeItem('canaan_gp_token');
          throw new Error(lang === 'zh' ? 'Google 授權已過期，請點擊「一鍵重新授權」' : 'Google Token expired, please re-authenticate.');
        }
        throw new Error(errData.error || 'Auto-sync failed');
      }

      const data = await res.json();
      const newSyncedPhotos: GalleryPhoto[] = data.photos || [];

      if (newSyncedPhotos.length > 0) {
        // Merge into state avoiding duplicates
        setPhotos(prev => {
          const map = new Map<string, GalleryPhoto>();
          newSyncedPhotos.forEach(p => map.set(p.id, p));
          prev.forEach(p => {
            if (!map.has(p.id)) map.set(p.id, p);
          });
          const merged = Array.from(map.values());
          localStorage.setItem('canaan_gallery_auto_synced_photos', JSON.stringify(newSyncedPhotos));
          return merged;
        });

        const timeStr = new Date().toLocaleTimeString(lang === 'zh' ? 'zh-TW' : 'en-US', { hour: '2-digit', minute: '2-digit' });
        setLastSyncedTime(timeStr);
        localStorage.setItem('canaan_gp_last_sync_time', timeStr);
        setAutoSyncStatus('success');

        setStatusMessage(
          lang === 'zh'
            ? `⚡ Google 相簿全自動同步完成！已自動載入並 AI 分類 ${newSyncedPhotos.length} 張相片。`
            : `⚡ Auto-sync complete! Automatically ingested & AI-categorized ${newSyncedPhotos.length} photos.`
        );
        setTimeout(() => setStatusMessage(null), 5000);
      } else {
        setAutoSyncStatus('success');
      }
    } catch (err: any) {
      console.error("Auto sync error:", err);
      setStatusMessage(err.message || 'Auto sync encountered an issue');
      setTimeout(() => setStatusMessage(null), 6000);
    } finally {
      setIsAutoSyncing(false);
    }
  }, [lang]);

  // Helper to persist photos both locally and to the backend server API
  const persistGalleryPhotos = (updatedPhotos: GalleryPhoto[]) => {
    try {
      localStorage.setItem('canaan_gallery_photos_all', JSON.stringify(updatedPhotos));
      localStorage.setItem('canaan_gallery_photos_custom', JSON.stringify(updatedPhotos));
    } catch (e) {
      console.warn("Local storage save error:", e);
    }
    // Also sync to backend server API
    fetch('/api/gallery/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photos: updatedPhotos })
    }).catch(err => console.warn("Backend gallery photo sync error:", err));
  };

  // Google Albums save & delete handlers
  const handleSaveGoogleAlbum = async (album: GoogleAlbum) => {
    setGoogleAlbums(prev => {
      const exists = prev.some(a => a.id === album.id);
      let updated: GoogleAlbum[];
      if (exists) {
        updated = prev.map(a => a.id === album.id ? album : a);
      } else {
        updated = [album, ...prev];
      }
      try {
        localStorage.setItem('canaan_google_albums', JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to save google albums to localStorage:", e);
      }
      return updated;
    });

    try {
      await fetch('/api/gallery/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ albums: [album, ...googleAlbums.filter(a => a.id !== album.id)] })
      });
    } catch (err) {
      console.warn("Failed to persist album to server:", err);
    }

    setStatusMessage(
      lang === 'zh'
        ? `✅ 已成功${editingAlbum ? '更新' : '新增'} Google 相簿「${album.titleZh}」！`
        : `✅ Successfully ${editingAlbum ? 'updated' : 'added'} Google Album "${album.titleEn}"!`
    );
    setEditingAlbum(null);
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleDeleteGoogleAlbum = async (albumId: string, albumTitle: string) => {
    if (!window.confirm(lang === 'zh' ? `確定要刪除相簿「${albumTitle}」嗎？` : `Are you sure you want to delete "${albumTitle}"?`)) {
      return;
    }
    const deletedAlbumIds = getDeletedAlbumIds();
    deletedAlbumIds.add(albumId);
    try {
      localStorage.setItem('canaan_deleted_album_ids', JSON.stringify(Array.from(deletedAlbumIds)));
    } catch (e) {
      console.warn("Failed to save deleted album IDs:", e);
    }

    const updated = googleAlbums.filter(a => a.id !== albumId);
    setGoogleAlbums(updated);
    try {
      localStorage.setItem('canaan_google_albums', JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to delete google album in localStorage:", e);
    }
    try {
      await fetch('/api/gallery/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ albums: updated })
      });
    } catch (e) {
      console.warn("Failed to delete album on server:", e);
    }
    setStatusMessage(lang === 'zh' ? `🗑️ 已刪除相簿「${albumTitle}」` : `🗑️ Deleted album "${albumTitle}"`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Load latest photos & albums from backend API on mount
  useEffect(() => {
    fetch('/api/gallery/albums')
      .then(res => {
        const ct = res.headers.get('content-type');
        if (res.ok && ct && ct.includes('application/json')) {
          return res.json();
        }
        return null;
      })
      .then(data => {
        if (data && Array.isArray(data.albums) && data.albums.length > 0) {
          const deletedAlbumIds = getDeletedAlbumIds();
          const filtered = data.albums.filter((a: GoogleAlbum) => !deletedAlbumIds.has(a.id));
          if (filtered.length > 0) {
            setGoogleAlbums(filtered);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Load latest photos from backend API on mount
  useEffect(() => {
    fetch('/api/gallery/photos')
      .then(res => {
        const ct = res.headers.get('content-type');
        if (res.ok && ct && ct.includes('application/json')) {
          return res.json();
        }
        return null;
      })
      .then(data => {
        if (data && Array.isArray(data.photos) && data.photos.length > 0) {
          const deletedIds = getDeletedPhotoIds();
          const filtered = data.photos.filter((p: GalleryPhoto) => !deletedIds.has(p.id));
          if (filtered.length > 0) {
            setPhotos(filtered);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Trigger auto-sync once on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('canaan_gp_token');
    if (token) {
      triggerAutoSync(token);
    }
  }, []);

  // Quick Google Photos Ingestion / Open Sync Modal
  const handleAuthorizeGooglePhotos = () => {
    setIsGooglePhotosAIModalOpen(true);
  };

  // Handle batch import from Google Photos AI Sync Modal if opened manually
  const handleImportPhotos = (importedPhotos: GalleryPhoto[]) => {
    const updated = [...importedPhotos, ...photos];
    setPhotos(updated);
    persistGalleryPhotos(updated);

    setStatusMessage(
      lang === 'zh' 
        ? `✨ 成功從 Google Photos 自動同步 ${importedPhotos.length} 張相片並已由 Gemini AI 自動分類完成！` 
        : `✨ Successfully synced ${importedPhotos.length} photos with Gemini AI auto-classification!`
    );
    setTimeout(() => setStatusMessage(null), 5000);
  };



  // Synchronize a shared Google Photos Album URL with Gemini Vision AI
  const handleSyncAlbumUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumUrlInput.trim()) {
      alert(lang === 'zh' ? '請輸入 Google 相簿分享連結或圖片網址' : 'Please enter a Google Photos album URL or image link');
      return;
    }

    setIsSyncingAlbumUrl(true);
    setStatusMessage(
      lang === 'zh'
        ? '🤖 Gemini AI 正在連線讀取 Google 相簿並進行畫面識別與分類中，請稍候...'
        : '🤖 Gemini AI is fetching Google Photos album and analyzing contents, please wait...'
    );

    try {
      const res = await fetch('/api/gallery/google-photos/sync-album-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ albumUrl: albumUrlInput.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to sync Google Photos album');
      }

      const data = await res.json();
      const newSynced: GalleryPhoto[] = data.photos || [];

      if (newSynced.length > 0) {
        setPhotos(prev => {
          const map = new Map<string, GalleryPhoto>();
          newSynced.forEach(p => map.set(p.id, p));
          prev.forEach(p => {
            if (!map.has(p.id)) map.set(p.id, p);
          });
          const merged = Array.from(map.values());
          persistGalleryPhotos(merged);
          return merged;
        });

        const timeStr = new Date().toLocaleTimeString(lang === 'zh' ? 'zh-TW' : 'en-US', { hour: '2-digit', minute: '2-digit' });
        setLastSyncedTime(timeStr);
        localStorage.setItem('canaan_gp_last_sync_time', timeStr);
        setAlbumUrlInput('');
        setAutoSyncStatus('success');

        setStatusMessage(
          lang === 'zh'
            ? `🎉 成功從 Google 相簿匯入 ${newSynced.length} 張相片！Gemini AI 已全數完成智慧五大分類。`
            : `🎉 Successfully imported ${newSynced.length} Google Photos! All categorized by Gemini AI.`
        );
        setTimeout(() => setStatusMessage(null), 6000);
      } else {
        throw new Error(lang === 'zh' ? '未找到可讀取的相片' : 'No photos found in album');
      }
    } catch (err: any) {
      console.error("Album sync error:", err);
      setStatusMessage(lang === 'zh' ? `⚠️ 相簿匯入失敗: ${err.message}` : `⚠️ Album sync failed: ${err.message}`);
      setTimeout(() => setStatusMessage(null), 7000);
    } finally {
      setIsSyncingAlbumUrl(false);
    }
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;
      if (e.key === 'Escape') setSelectedPhotoIndex(null);
      if (e.key === 'ArrowRight') handleNextPhoto();
      if (e.key === 'ArrowLeft') handlePrevPhoto();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, photos, activeCategory, searchTerm]);

  // Filtered photos
  const filteredPhotos = photos.filter((photo) => {
    const matchesCat = isPhotoInCategory(photo, activeCategory, categories);

    const matchesSearch = searchTerm === '' || 
      (photo.titleZh && photo.titleZh.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (photo.title && photo.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (photo.descriptionZh && photo.descriptionZh.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (photo.albumNameZh && photo.albumNameZh.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (photo.albumName && photo.albumName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleNextPhoto = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prev) => 
      prev !== null && prev < filteredPhotos.length - 1 ? prev + 1 : 0
    );
  };

  const handlePrevPhoto = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prev) => 
      prev !== null && prev > 0 ? prev - 1 : filteredPhotos.length - 1
    );
  };

  // Multi-file selection handler (supports picking multiple images at once)
  const handleMultipleImageFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    setIsReadingFiles(true);
    const defaultCat = batchCommon.category || 'worship';
    const defaultDate = batchCommon.date || new Date().toISOString().slice(0, 7);
    const defaultAlbum = batchCommon.albumNameZh || '';

    const newItems: UploadQueueItem[] = [];
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      try {
        const dataUrl = await compressAndReadFileAsDataUrl(file);
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        newItems.push({
          id: `queue-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
          imageUrl: dataUrl,
          titleZh: cleanName || '主日聚會恩典相片',
          titleEn: cleanName || 'Church Photo',
          category: defaultCat,
          date: defaultDate,
          albumNameZh: defaultAlbum || '加南聚會相簿集',
          albumNameEn: 'Church Gallery',
          descriptionZh: batchCommon.descriptionZh || '在主裡同心同行，數算神豐盛恩典與慈愛。',
          descriptionEn: 'Gathering in faith, counting God’s abundant grace and love.',
          locationZh: batchCommon.locationZh || '加南新生基督教會',
          locationEn: 'Canaan Shin Sheng Christian Church',
          isAiAnalyzed: false,
          isAnalyzing: false
        });
      } catch (err) {
        console.error("Error reading photo file:", err);
      }
    }

    setUploadQueue(prev => [...prev, ...newItems]);
    setIsReadingFiles(false);
  };

  // Add one or multiple image URLs to queue
  const handleAddUrlsToQueue = () => {
    if (!urlInputBatch.trim()) return;
    const urls = urlInputBatch
      .split(/[\n,]+/)
      .map(u => u.trim())
      .filter(u => u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:image/'));

    if (urls.length === 0) {
      alert(lang === 'zh' ? '請輸入有效的圖片網址 (以 http:// 或 https:// 開頭)' : 'Please enter valid image URLs.');
      return;
    }

    const defaultCat = batchCommon.category || 'worship';
    const defaultDate = batchCommon.date || new Date().toISOString().slice(0, 7);
    const defaultAlbum = batchCommon.albumNameZh || '';

    const newItems: UploadQueueItem[] = urls.map((url, idx) => ({
      id: `queue-url-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      imageUrl: url,
      titleZh: '加南聚會相片',
      titleEn: 'Church Photo',
      category: defaultCat,
      date: defaultDate,
      albumNameZh: defaultAlbum || '加南相簿集',
      albumNameEn: 'Church Gallery',
      descriptionZh: '主裡同心同行，分享聚會與事奉喜樂。',
      descriptionEn: 'Walking together in Christ and fellowship.',
      locationZh: batchCommon.locationZh || '加南新生基督教會',
      locationEn: 'Canaan Shin Sheng Christian Church',
      isAiAnalyzed: false,
      isAnalyzing: false
    }));

    setUploadQueue(prev => [...prev, ...newItems]);
    setUrlInputBatch('');
  };

  // Update specific item field in upload queue
  const handleUpdateQueueItem = (id: string, updates: Partial<UploadQueueItem>) => {
    setUploadQueue(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  // Remove specific item from upload queue
  const handleRemoveQueueItem = (id: string) => {
    setUploadQueue(prev => prev.filter(item => item.id !== id));
  };

  // Apply batch field (Title Zh/En, Category, Date, Album, Location, Description) to all current items in queue
  const handleApplyBatchFieldToAll = (
    field: 'titleZh' | 'titleEn' | 'category' | 'date' | 'albumNameZh' | 'locationZh' | 'locationEn' | 'descriptionZh' | 'descriptionEn', 
    value: string
  ) => {
    setUploadQueue(prev => prev.map(item => ({ ...item, [field]: value })));
    setStatusMessage(
      lang === 'zh' 
        ? `✅ 已將「${field === 'titleZh' ? '主題標題 (中文)' : field === 'descriptionZh' ? '照片敘述/感恩紀錄 (中文)' : field}」套用至佇列中所有 ${uploadQueue.length} 張相片`
        : `✅ Applied to all ${uploadQueue.length} photos in queue`
    );
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Run Gemini AI auto-categorization for a single queue item
  const handleRunSingleAI = async (itemId: string) => {
    const item = uploadQueue.find(i => i.id === itemId);
    if (!item) return;

    setUploadQueue(prev => prev.map(p => p.id === itemId ? { ...p, isAnalyzing: true } : p));

    try {
      const res = await fetch('/api/gallery/ai-categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: item.imageUrl.startsWith('data:') ? item.imageUrl : undefined,
          imageUrl: !item.imageUrl.startsWith('data:') ? item.imageUrl : undefined,
          photoContext: {
            account: 'web@canaannewlife.org',
            currentDate: item.date,
            initialTitle: item.titleZh
          }
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'AI analysis failed');
      }

      const { analysis } = await res.json();
      if (analysis) {
        setUploadQueue(prev => prev.map(p => p.id === itemId ? {
          ...p,
          titleZh: analysis.titleZh || p.titleZh,
          titleEn: analysis.titleEn || p.titleEn,
          category: analysis.category || p.category,
          descriptionZh: analysis.descriptionZh || p.descriptionZh,
          descriptionEn: analysis.descriptionEn || p.descriptionEn,
          albumNameZh: analysis.albumNameZh || p.albumNameZh,
          albumNameEn: analysis.albumNameEn || p.albumNameEn,
          locationZh: analysis.locationZh || p.locationZh,
          locationEn: analysis.locationEn || p.locationEn,
          date: analysis.suggestedDate || p.date,
          isAiAnalyzed: true,
          isAnalyzing: false
        } : p));
      }
    } catch (err: any) {
      console.error("AI auto-fill failed for item:", err);
      setUploadQueue(prev => prev.map(p => p.id === itemId ? { ...p, isAnalyzing: false } : p));
      alert(lang === 'zh' ? `AI 分析失敗: ${err.message}` : `AI analysis error: ${err.message}`);
    }
  };

  // Run Gemini AI in batch for all photos in the upload queue
  const handleRunBatchAI = async () => {
    if (uploadQueue.length === 0) return;
    setIsBatchAIAnalyzing(true);
    setBatchAIProgress({ current: 0, total: uploadQueue.length });

    const updated = [...uploadQueue];
    for (let i = 0; i < updated.length; i++) {
      setBatchAIProgress({ current: i + 1, total: updated.length });
      const item = updated[i];
      try {
        const res = await fetch('/api/gallery/ai-categorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: item.imageUrl.startsWith('data:') ? item.imageUrl : undefined,
            imageUrl: !item.imageUrl.startsWith('data:') ? item.imageUrl : undefined,
            photoContext: {
              account: 'web@canaannewlife.org',
              currentDate: item.date,
              initialTitle: item.titleZh
            }
          }),
        });

        if (res.ok) {
          const { analysis } = await res.json();
          if (analysis) {
            updated[i] = {
              ...item,
              titleZh: analysis.titleZh || item.titleZh,
              titleEn: analysis.titleEn || item.titleEn,
              category: analysis.category || item.category,
              descriptionZh: analysis.descriptionZh || item.descriptionZh,
              descriptionEn: analysis.descriptionEn || item.descriptionEn,
              albumNameZh: analysis.albumNameZh || item.albumNameZh,
              albumNameEn: analysis.albumNameEn || item.albumNameEn,
              locationZh: analysis.locationZh || item.locationZh,
              locationEn: analysis.locationEn || item.locationEn,
              date: analysis.suggestedDate || item.date,
              isAiAnalyzed: true,
              isAnalyzing: false
            };
            setUploadQueue([...updated]);
          }
        }
      } catch (err) {
        console.warn(`Batch AI error on photo #${i + 1}:`, err);
      }
    }

    setIsBatchAIAnalyzing(false);
    setStatusMessage(
      lang === 'zh'
        ? `✨ Gemini AI 已為 ${updated.length} 張相片完成自動分類與屬靈圖說填寫！`
        : `✨ Gemini AI completed auto-categorization for all ${updated.length} photos!`
    );
    setTimeout(() => setStatusMessage(null), 4500);
  };

  // Batch Save all queued photos to Gallery
  const handleBatchSaveToGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadQueue.length === 0) {
      alert(lang === 'zh' ? '請先上傳或選擇至少一張照片！' : 'Please upload or select at least one photo first.');
      return;
    }

    const createdPhotos: GalleryPhoto[] = uploadQueue.map((item, idx) => ({
      id: `custom-photo-${Date.now()}-${idx}`,
      title: item.titleEn || item.titleZh,
      titleZh: item.titleZh || item.titleEn,
      category: item.category,
      date: item.date,
      imageUrl: item.imageUrl,
      description: item.descriptionEn || item.descriptionZh,
      descriptionZh: item.descriptionZh || item.descriptionEn,
      albumName: item.albumNameEn || 'General Gallery',
      albumNameZh: item.albumNameZh || '教會相簿集',
      location: item.locationEn,
      locationZh: item.locationZh,
      source: 'local'
    }));

    const updated = [...createdPhotos, ...photos];
    setPhotos(updated);
    persistGalleryPhotos(updated);

    const savedCount = createdPhotos.length;
    setUploadQueue([]);
    setIsAddModalOpen(false);

    setStatusMessage(
      lang === 'zh'
        ? `🎉 成功新增 ${savedCount} 張照片至照片走廊！`
        : `🎉 Successfully added ${savedCount} photos to the gallery!`
    );
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleDeletePhoto = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const photoToDelete = photos.find(p => p.id === id);
    const photoTitle = photoToDelete ? (photoToDelete.titleZh || photoToDelete.title) : '此相片';
    if (!window.confirm(lang === 'zh' ? `確定要從照片走廊中刪除「${photoTitle}」嗎？` : `Are you sure you want to remove "${photoTitle}"?`)) {
      return;
    }

    // Save to deleted IDs set
    const deletedIds = getDeletedPhotoIds();
    deletedIds.add(id);
    try {
      localStorage.setItem('canaan_deleted_photo_ids', JSON.stringify(Array.from(deletedIds)));
    } catch (err) {
      console.warn("Failed to save deleted photo IDs:", err);
    }

    const updated = photos.filter(p => p.id !== id);
    setPhotos(updated);
    persistGalleryPhotos(updated);
    if (selectedPhotoIndex !== null) setSelectedPhotoIndex(null);
    setSelectedPhotoIds(prev => prev.filter(item => item !== id));
    setStatusMessage(lang === 'zh' ? `🗑️ 已成功刪除相片「${photoTitle}」` : `🗑️ Photo deleted successfully`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleSaveCategories = (updatedCategories: GalleryCategory[]) => {
    setCategories(updatedCategories);
    try {
      localStorage.setItem('canaan_gallery_categories', JSON.stringify(updatedCategories));
    } catch (e) {
      console.error("Failed to save categories:", e);
    }
    fetch('/api/gallery/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories: updatedCategories })
    }).catch(err => console.warn("Category sync error:", err));

    setStatusMessage(lang === 'zh' ? '✨ 相簿分類清單與名稱已成功更新！' : '✨ Categories and labels updated successfully!');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleUpdatePhotoCategory = (oldCategoryKey: string, newCategoryKey: string) => {
    setPhotos(prev => {
      const updated = prev.map(p => p.category === oldCategoryKey ? { ...p, category: newCategoryKey } : p);
      persistGalleryPhotos(updated);
      return updated;
    });
  };

  const handleOpenEditPhoto = (photo: GalleryPhoto, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPhoto(photo);
    setIsEditPhotoModalOpen(true);
  };

  const handleSaveEditedPhoto = (updatedPhoto: GalleryPhoto) => {
    setPhotos(prev => {
      const updated = prev.map(p => p.id === updatedPhoto.id ? updatedPhoto : p);
      persistGalleryPhotos(updated);
      return updated;
    });
    setStatusMessage(lang === 'zh' ? `✅ 已成功更新「${updatedPhoto.titleZh || updatedPhoto.title}」之分類與相片資訊！` : `✅ Photo details & category updated successfully!`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Toggle selection for a photo
  const handleToggleSelectPhoto = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedPhotoIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Select all or deselect all photos matching current category filter and search
  const handleSelectAllFiltered = () => {
    const allFilteredIds = filteredPhotos.map(p => p.id);
    const allSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedPhotoIds.includes(id));
    if (allSelected) {
      // Deselect filtered
      setSelectedPhotoIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      // Select all filtered
      setSelectedPhotoIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  // Clear all selections
  const handleClearSelection = () => {
    setSelectedPhotoIds([]);
  };

  // Open batch edit modal
  const handleOpenBatchEditModal = () => {
    if (selectedPhotoIds.length === 0) {
      // If nothing selected yet, automatically select currently filtered photos and open
      if (filteredPhotos.length > 0) {
        setSelectedPhotoIds(filteredPhotos.map(p => p.id));
        setIsBatchEditModalOpen(true);
      } else {
        alert(lang === 'zh' ? '目前分類下無可選取的照片' : 'No photos available to edit');
      }
      return;
    }
    setIsBatchEditModalOpen(true);
  };

  // Save batch edited photos
  const handleSaveBatchEditedPhotos = (updatedPhotos: GalleryPhoto[]) => {
    const updatedMap = new Map<string, GalleryPhoto>();
    updatedPhotos.forEach(p => updatedMap.set(p.id, p));

    setPhotos(prev => {
      const nextPhotos = prev.map(p => updatedMap.has(p.id) ? updatedMap.get(p.id)! : p);
      persistGalleryPhotos(nextPhotos);
      return nextPhotos;
    });

    setStatusMessage(
      lang === 'zh'
        ? `🎉 成功批次更新 ${updatedPhotos.length} 張照片的資訊與分類！`
        : `🎉 Successfully updated ${updatedPhotos.length} photos!`
    );
    setSelectedPhotoIds([]);
    setTimeout(() => setStatusMessage(null), 5000);
  };

  // Delete batch selected photos
  const handleDeleteBatchPhotos = (photoIds: string[]) => {
    const idSet = new Set(photoIds);
    
    // Save to deleted IDs set
    const deletedIds = getDeletedPhotoIds();
    photoIds.forEach(id => deletedIds.add(id));
    try {
      localStorage.setItem('canaan_deleted_photo_ids', JSON.stringify(Array.from(deletedIds)));
    } catch (err) {
      console.warn("Failed to save deleted photo IDs:", err);
    }

    const nextPhotos = photos.filter(p => !idSet.has(p.id));
    setPhotos(nextPhotos);
    persistGalleryPhotos(nextPhotos);

    setStatusMessage(
      lang === 'zh'
        ? `🗑️ 已成功從照片走廊刪除 ${photoIds.length} 張照片`
        : `🗑️ Removed ${photoIds.length} photos from gallery`
    );
    setSelectedPhotoIds([]);
    if (selectedPhotoIndex !== null) setSelectedPhotoIndex(null);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const getCategoryIcon = (icon: string) => {
    switch (icon) {
      case 'Church': return <Church className="w-4 h-4" />;
      case 'Heart': return <Heart className="w-4 h-4" />;
      case 'Award': return <Award className="w-4 h-4" />;
      case 'Sun': return <Sun className="w-4 h-4" />;
      case 'History': return <History className="w-4 h-4" />;
      case 'Users': return <Users className="w-4 h-4" />;
      case 'Bot': return <Bot className="w-4 h-4" />;
      case 'Gift': return <Gift className="w-4 h-4" />;
      case 'Trees': return <Trees className="w-4 h-4" />;
      case 'Utensils': return <Utensils className="w-4 h-4" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4" />;
      case 'Music': return <Music className="w-4 h-4" />;
      case 'Camera': return <Camera className="w-4 h-4" />;
      case 'Globe': return <Globe className="w-4 h-4" />;
      case 'FolderHeart': return <FolderHeart className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const isAdmin = Boolean(adminEmail);
  const currentPhoto = selectedPhotoIndex !== null ? filteredPhotos[selectedPhotoIndex] : null;

  return (
    <section id="gallery" className="py-20 md:py-28 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Decorative Lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Title & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-8 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
              <Images className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'zh' ? '照片走廊 • 恩典足跡' : 'Church Photo Gallery'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              {lang === 'zh' ? '加南照片走廊' : 'Canaan Life in Photos'}
            </h2>
            <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              {lang === 'zh' 
                ? '數算主恩，記錄加南新生基督教會的主日崇拜、聖餐禮拜、團契愛宴、洗禮見證、退修靈修營與節期喜樂時光。相片源自教會官方 Google 相簿 (web@canaannewlife.org)。'
                : 'Counting God’s abundant blessings across Sunday worship, Holy Communion, fellowship lunches, baptisms, church retreats, and celebrations. Photos from the church official Google Photos account (web@canaannewlife.org).'}
            </p>
          </div>

          {/* Action Buttons: Google Photos Historical Album, Google Sites, & Admin controls */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Direct Link to Google Photos Historical Album (photos.app.goo.gl/S4i2xq8Ghh5QwdYg7) */}
            <a
              href={GOOGLE_PHOTOS_HISTORICAL_ALBUM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-600 hover:from-blue-500 hover:to-amber-500 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 hover:scale-[1.02] transition-all border border-indigo-400/40 group"
              title="前往加南 Google 歷年相簿 (photos.app.goo.gl)"
            >
              <FolderHeart className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
              <span>{lang === 'zh' ? '📸 Google 歷年相簿' : '📸 Google Photos Archive'}</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-200" />
            </a>

            <a
              href={GOOGLE_SITES_GALLERY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white px-3.5 py-2.5 rounded-xl border border-slate-700 hover:border-amber-500/40 text-xs sm:text-sm font-semibold transition-all shadow-sm group"
              title="前往 Google Sites 歷年照片走廊專頁"
            >
              <span>{lang === 'zh' ? 'Google Sites 專頁' : 'Google Sites Archive'}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-300 transition-colors" />
            </a>

            {/* Admin-Only Management Buttons */}
            {isAdmin && (
              <>
                <button
                  onClick={() => {
                    setEditingAlbum(null);
                    setIsGoogleAlbumModalOpen(true);
                  }}
                  className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-amber-500/20 transition-all border border-amber-400"
                  title="管理員：新增 Google 相簿連結與封面資訊"
                >
                  <Plus className="w-4 h-4 text-slate-950" />
                  <span>{lang === 'zh' ? '新增 Google 相簿' : 'Add Google Album'}</span>
                </button>

                <button
                  onClick={() => setIsGitHubSyncModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white px-3.5 py-2.5 rounded-xl border border-slate-700 hover:border-amber-500/40 text-xs sm:text-sm font-semibold transition-all shadow-sm"
                  title="管理員：GitHub & Cloudflare 專案相簿更新與備份"
                >
                  <Github className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'zh' ? 'GitHub 備份同步' : 'GitHub Sync'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Admin-Only Google Photos Live Auto-Sync Status Bar & URL Direct Ingest */}
        {isAdmin && (
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-800/95 via-indigo-950/40 to-slate-800/95 border border-indigo-500/30 shadow-lg flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center space-x-3.5">
                <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex-shrink-0">
                  <Zap className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 flex-wrap gap-1">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <h4 className="text-sm sm:text-base font-bold text-white">
                      {lang === 'zh' ? '管理員控制台：Google 相簿同步與串流管理' : 'Admin: Google Photos Sync Management'}
                    </h4>
                    <span className="text-[11px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md border border-blue-500/40 font-mono">
                      {adminEmail || 'web@canaannewlife.org'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {lang === 'zh'
                      ? '✨ 僅管理員可見：在此貼上 Google 相簿公開分享連結以即時同步並由 AI 自動分類，或點擊批次管理。'
                      : '✨ Admin Only: Paste Google Photos Album URL to auto-import & categorize, or manage batch settings.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-700/50 justify-between sm:justify-end">
                <div className="text-right text-[11px] text-slate-400">
                  <div className="text-slate-300 font-semibold">{lastSyncedTime ? `${lang === 'zh' ? '上次同步' : 'Last Sync'}: ${lastSyncedTime}` : (lang === 'zh' ? '同步狀態: 正常運作' : 'Status: Ready')}</div>
                  <div>{lang === 'zh' ? `精選相簿: ${googleAlbums.length} 本` : `${googleAlbums.length} Albums live`}</div>
                </div>

                <button
                  onClick={() => setIsGooglePhotosAIModalOpen(true)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center space-x-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{lang === 'zh' ? 'AI 批次同步' : 'AI Sync'}</span>
                </button>
              </div>
            </div>

            {/* Direct Shared Album Link Ingest Form */}
            <form onSubmit={handleSyncAlbumUrl} className="pt-3 border-t border-slate-700/50 flex flex-col sm:flex-row items-center gap-2.5">
              <div className="relative flex-1 w-full">
                <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={albumUrlInput}
                  onChange={(e) => setAlbumUrlInput(e.target.value)}
                  placeholder={lang === 'zh' ? '貼上 Google 相簿公開分享連結 (例如 https://photos.app.goo.gl/... 或 Google 相片網址)' : 'Paste Google Photos Album URL (e.g. https://photos.app.goo.gl/...)'}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSyncingAlbumUrl || !albumUrlInput.trim()}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center space-x-1.5 shadow-md disabled:opacity-50 transition-all flex-shrink-0"
              >
                {isSyncingAlbumUrl ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{lang === 'zh' ? 'Gemini AI 解析中...' : 'Analyzing...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{lang === 'zh' ? '⚡ 貼上連結 AI 同步' : '⚡ Sync Album URL'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Status Notification */}
        {statusMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-sm flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* Google Photos Featured Albums Showcase (6+ Curated Albums) */}
        {/* ======================================================== */}
        <div className="mb-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-800/80 via-slate-850/60 to-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-750">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-indigo-500/20 border border-amber-500/30 text-amber-400">
                <FolderHeart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center gap-2.5">
                  <span>{lang === 'zh' ? 'Google 相簿精選專區' : 'Featured Google Photo Albums'}</span>
                  <span className="text-xs font-mono bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    {googleAlbums.length} {lang === 'zh' ? '本相簿' : 'Albums'}
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {lang === 'zh'
                    ? '包含加南各項重要特會、野外禮拜、靈修營、節期團契等官方相簿，點擊即可開啟 Google Photos 高畫質相簿瀏覽'
                    : 'Official Google Photos albums of worship retreats, camp fellowships, Thanksgiving potlucks, and community events.'}
                </p>
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={() => {
                  setEditingAlbum(null);
                  setIsGoogleAlbumModalOpen(true);
                }}
                className="self-start sm:self-auto inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md hover:shadow-amber-500/20 transition-all border border-amber-400"
              >
                <Plus className="w-4 h-4" />
                <span>{lang === 'zh' ? '新增 Google 相簿' : 'Add Album'}</span>
              </button>
            )}
          </div>

          {/* Grid of Google Photo Albums */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {googleAlbums.map((album) => (
              <div
                key={album.id}
                className="group relative bg-slate-900/90 rounded-2xl overflow-hidden border border-slate-700/80 hover:border-amber-500/60 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Album Cover & Header Badges */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                  {album.coverImageUrl ? (
                    <img
                      src={album.coverImageUrl}
                      alt={lang === 'zh' ? album.titleZh : album.titleEn}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 text-slate-400">
                      <FolderHeart className="w-12 h-12 text-amber-400/60 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-slate-300 font-semibold">Google Photos</span>
                    </div>
                  )}

                  {/* Top Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Date Badge */}
                  <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700 text-amber-300 text-xs px-2.5 py-1 rounded-lg flex items-center space-x-1.5 shadow-md">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-semibold">{album.date}</span>
                  </div>

                  {/* Admin Edit & Delete buttons */}
                  {isAdmin && (
                    <div className="absolute top-3 right-3 flex items-center space-x-1.5 z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingAlbum(album);
                          setIsGoogleAlbumModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-amber-600 text-slate-200 hover:text-white border border-slate-700 transition shadow"
                        title={lang === 'zh' ? '管理員編輯此相簿' : 'Edit Album'}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGoogleAlbum(album.id, album.titleZh);
                        }}
                        className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-rose-600 text-slate-200 hover:text-white border border-slate-700 transition shadow"
                        title={lang === 'zh' ? '管理員刪除此相簿' : 'Delete Album'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Bottom title overlay on cover */}
                  <div className="absolute bottom-3 left-3.5 right-3.5">
                    <h4 className="text-base sm:text-lg font-bold text-white line-clamp-1 drop-shadow-md group-hover:text-amber-300 transition-colors">
                      {lang === 'zh' ? album.titleZh : album.titleEn}
                    </h4>
                    {album.titleEn && album.titleEn !== album.titleZh && (
                      <p className="text-xs text-slate-300 font-medium line-clamp-1 drop-shadow-sm">
                        {lang === 'zh' ? album.titleEn : album.titleZh}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Content & Action Button */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
                  {(album.descriptionZh || album.descriptionEn) ? (
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {lang === 'zh' ? (album.descriptionZh || album.descriptionEn) : (album.descriptionEn || album.descriptionZh)}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      {lang === 'zh' ? '加南新生基督教會歷年精彩活動相片記錄' : 'Canaan Shin Sheng Christian Church archive photos.'}
                    </p>
                  )}

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1.5">
                      <FolderHeart className="w-3.5 h-3.5 text-amber-400" />
                      <span>Google Photos</span>
                    </span>

                    <a
                      href={album.albumUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md hover:shadow-indigo-600/30 hover:scale-[1.02] transition-all group/btn"
                    >
                      <span>{lang === 'zh' ? '開啟 Google 相簿' : 'Open Album'}</span>
                      <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dual Integration Banners: Google Photos Historical Album & Google Sites Archive */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Google Photos Historical Album Card */}
          <div className="bg-gradient-to-br from-slate-800 via-slate-800/90 to-blue-950/40 rounded-3xl p-6 sm:p-7 border border-blue-500/30 shadow-xl flex flex-col justify-between">
            <div className="flex items-start space-x-4">
              <div className="p-3.5 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-300 flex-shrink-0">
                <Images className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md border border-blue-500/40 font-mono">
                    250+ Photos
                  </span>
                  <span className="text-xs text-amber-400 font-semibold">web@canaannewlife.org</span>
                </div>
                <h4 className="text-lg font-serif font-bold text-white mt-1">
                  {lang === 'zh' ? 'Google 歷年相簿全集' : 'Google Photos Historical Archive'}
                </h4>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {lang === 'zh'
                    ? '瀏覽加南新生基督教會在 Google 相簿上的歷年聚會、洗禮慶典、野外退修會與團契活動完整相片紀錄。'
                    : 'Browse all 250+ full-resolution church photos directly on Google Photos.'}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-end">
              <a
                href={GOOGLE_PHOTOS_HISTORICAL_ALBUM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-600 hover:from-blue-500 hover:to-amber-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md group"
              >
                <span>{lang === 'zh' ? '前往 Google 歷年相簿' : 'Open Google Photos Album'}</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* Google Sites Archive Card */}
          <div className="bg-gradient-to-br from-slate-800 via-slate-800/90 to-amber-950/40 rounded-3xl p-6 sm:p-7 border border-amber-500/30 shadow-xl flex flex-col justify-between">
            <div className="flex items-start space-x-4">
              <div className="p-3.5 rounded-2xl bg-amber-600/20 border border-amber-500/40 text-amber-300 flex-shrink-0">
                <FolderHeart className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-serif font-bold text-white">
                  {lang === 'zh' ? '加南歷年照片走廊 (Google Sites)' : 'Canaan Historical Photo Corridor'}
                </h4>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {lang === 'zh'
                    ? '查閱加南新生基督教會歷年相簿存檔、歷屆野外崇拜與歷史紀念合照。'
                    : 'Explore all archived historical albums and church anniversary photos on Google Sites.'}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-end">
              <a
                href={GOOGLE_SITES_GALLERY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-4 py-2 rounded-xl font-semibold text-xs transition-all shadow-md"
              >
                <span>{lang === 'zh' ? '前往 Google Sites 歷年專頁' : 'Open Google Sites'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox / Fullscreen Modal */}
      {currentPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          {/* Lightbox Header Bar */}
          <div className="flex items-center justify-between text-white pb-3 border-b border-slate-800/80" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center space-x-3 flex-wrap gap-1">
              <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-1 rounded-full border border-amber-500/40">
                {lang === 'zh' ? (currentPhoto.albumNameZh || '加南相簿') : (currentPhoto.albumName || 'Album')}
              </span>
              {(currentPhoto.source === 'google-photos' || currentPhoto.account === 'web@canaannewlife.org' || currentPhoto.id.startsWith('gp-')) && (
                <span className="bg-blue-600/30 text-blue-300 text-[11px] px-2.5 py-1 rounded-full border border-blue-500/40 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Google Photos • web@canaannewlife.org</span>
                </span>
              )}
              <span className="text-xs text-slate-400 hidden sm:inline">
                {selectedPhotoIndex! + 1} / {filteredPhotos.length}
              </span>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              {isAdmin && (
                <>
                  <button
                    onClick={() => {
                      const p = currentPhoto;
                      if (p) {
                        setSelectedPhotoIndex(null);
                        handleOpenEditPhoto(p);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md flex items-center space-x-1.5 transition-all"
                    title={lang === 'zh' ? '管理員：修改此照片與分類' : 'Edit photo details & category'}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{lang === 'zh' ? '修改照片/分類' : 'Edit Photo'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (currentPhoto) {
                        handleDeletePhoto(currentPhoto.id);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-900/90 hover:bg-rose-800 text-rose-200 hover:text-white text-xs font-semibold shadow-md flex items-center space-x-1.5 transition-all border border-rose-700/60"
                    title={lang === 'zh' ? '從網站刪除此照片' : 'Delete photo'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{lang === 'zh' ? '刪除照片' : 'Delete'}</span>
                  </button>
                </>
              )}

              <a
                href={currentPhoto.imageUrl}
                download={`canaan_photo_${currentPhoto.id}.jpg`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title={lang === 'zh' ? '檢視原圖 / 下載' : 'View Full / Download'}
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                onClick={() => setSelectedPhotoIndex(null)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title={lang === 'zh' ? '關閉 (Esc)' : 'Close (Esc)'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Photo Center Display */}
          <div className="flex-1 flex items-center justify-center relative py-4" onClick={(e) => e.stopPropagation()}>
            {/* Prev Button */}
            <button
              onClick={handlePrevPhoto}
              className="absolute left-2 sm:left-4 z-10 p-3 rounded-full bg-slate-900/80 hover:bg-amber-600 text-white border border-slate-700 shadow-xl transition-all transform hover:scale-110"
              title={lang === 'zh' ? '上一張 (←)' : 'Previous (←)'}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Photo Image Frame */}
            <div className="max-w-5xl max-h-[68vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center bg-black">
              <img
                src={currentPhoto.imageUrl}
                alt={lang === 'zh' ? currentPhoto.titleZh : currentPhoto.title}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[68vh] object-contain select-none"
                onError={(e) => {
                  if (currentPhoto.fallbackImageUrl && e.currentTarget.src !== currentPhoto.fallbackImageUrl) {
                    e.currentTarget.src = currentPhoto.fallbackImageUrl;
                  }
                }}
              />
            </div>

            {/* Next Button */}
            <button
              onClick={handleNextPhoto}
              className="absolute right-2 sm:right-4 z-10 p-3 rounded-full bg-slate-900/80 hover:bg-amber-600 text-white border border-slate-700 shadow-xl transition-all transform hover:scale-110"
              title={lang === 'zh' ? '下一張 (→)' : 'Next (→)'}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Footer Caption & Meta */}
          <div 
            className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 max-w-4xl mx-auto w-full border border-slate-800 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-white">
                {lang === 'zh' ? currentPhoto.titleZh : currentPhoto.title}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {lang === 'zh' ? currentPhoto.descriptionZh : currentPhoto.description}
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-2 text-xs text-slate-400 flex-shrink-0">
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-amber-400" />
                {currentPhoto.date}
              </span>
              {currentPhoto.locationZh && (
                <span className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-amber-400" />
                  {lang === 'zh' ? currentPhoto.locationZh : currentPhoto.location}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Google Photos AI Sync & Ingestion Modal */}
      {isGooglePhotosAIModalOpen && (
        <GooglePhotosAISyncModal
          isOpen={isGooglePhotosAIModalOpen}
          onClose={() => setIsGooglePhotosAIModalOpen(false)}
          lang={lang}
          onImportPhotos={handleImportPhotos}
        />
      )}

      {/* Google Photos Guide Modal */}
      {isGooglePhotosGuideOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl border border-blue-500/40 max-w-2xl w-full p-6 sm:p-8 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400">
                  <Zap className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold">
                    {lang === 'zh' ? 'Google 相簿全自動即時同步運作說明' : 'How Google Photos Auto-Sync Works'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {lang === 'zh' ? '免手動匯入 • 自動串流 web@canaannewlife.org' : 'Seamless Streaming & AI Classification'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsGooglePhotosGuideOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 space-y-6 text-sm text-slate-300">
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <p className="font-semibold text-amber-300 mb-1">
                    {lang === 'zh' ? '🎉 什麼是全自動 Google 相簿同步？' : 'What is Auto-Sync?'}
                  </p>
                  <p>
                    {lang === 'zh'
                      ? '您不需要再逐張下載或逐張手動匯入！只要同工在 web@canaannewlife.org 的 Google 相簿建立相簿或拍下照片，加南網站將自動串流讀取最新相片，並透過 Gemini 3.7 Vision AI 即時自動辨識人物、景物、聖餐、敬拜等主題，自動分類至相應專區！'
                      : 'You do not need to upload or import photos one by one! Photos added to the church Google Photos account stream to the website automatically with AI categorization.'}
                  </p>
                </div>
              </div>

              {/* 3 Step Workflow */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 bg-slate-800/60 rounded-xl border border-slate-750">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                  <div className="text-xs text-slate-300">
                    <strong className="text-white block mb-0.5">{lang === 'zh' ? '拍照並存入 Google 相簿' : 'Upload to Google Photos'}</strong>
                    {lang === 'zh' ? '同工用手機或相機拍照後，直接上傳到 web@canaannewlife.org 的 Google Photos。' : 'Ministry team uploads photos directly to web@canaannewlife.org Google Photos.'}
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-slate-800/60 rounded-xl border border-slate-750">
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                  <div className="text-xs text-slate-300">
                    <strong className="text-white block mb-0.5">{lang === 'zh' ? 'Gemini 3.7 AI 自動分析與分類' : 'Gemini AI Vision Categorization'}</strong>
                    {lang === 'zh' ? '系統後台自動分析相片畫面，自動判定是主日崇拜、團契愛宴、洗禮、退修會還是歷史同工，並自動生成中英標題與感恩文字。' : 'AI automatically detects communion, worship, baptism, fellowship, retreats, and generates bilingual captions.'}
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-slate-800/60 rounded-xl border border-slate-750">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                  <div className="text-xs text-slate-300">
                    <strong className="text-white block mb-0.5">{lang === 'zh' ? '網站即時呈現' : 'Instantly Displayed on Website'}</strong>
                    {lang === 'zh' ? '訪客在加南網站點進照片走廊即可即時看見，並支援全螢幕放大高清瀏覽與下載！' : 'Visitors immediately enjoy high-res gallery photos categorized beautifully.'}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 flex flex-wrap items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGooglePhotosGuideOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
                >
                  {lang === 'zh' ? '關閉' : 'Close'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsGooglePhotosGuideOpen(false);
                    triggerAutoSync();
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{lang === 'zh' ? '立即觸發自動同步' : 'Trigger Auto-Sync Now'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Single & Multi-File Batch Add Photo Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl border border-slate-700 max-w-4xl w-full p-5 sm:p-7 shadow-2xl text-white my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center space-x-2">
                    <span>{lang === 'zh' ? '手動新增照片 (支援單張與多張批次上傳)' : 'Add Photos (Single or Multi-File Batch)'}</span>
                    {uploadQueue.length > 0 && (
                      <span className="text-xs bg-amber-500/20 text-amber-300 font-sans px-2.5 py-0.5 rounded-full border border-amber-500/40">
                        {uploadQueue.length} {lang === 'zh' ? '張' : 'photos'}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {lang === 'zh' 
                      ? '可一次選取多個檔案或直接拖曳多張相片，由 Gemini AI 自動辨識分類或批次設定相簿主題' 
                      : 'Select multiple files or drag & drop. Use Gemini AI for auto-classification or batch edit.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setUploadQueue([]);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="關閉"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleBatchSaveToGallery} className="mt-4 flex-1 overflow-y-auto pr-1 space-y-5">
              
              {/* Drag & Drop / Multi-file Select Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleMultipleImageFiles(e.dataTransfer.files);
                  }
                }}
                className={`relative border-2 border-dashed rounded-2xl p-5 sm:p-7 text-center transition-all ${
                  isDraggingOver 
                    ? 'border-amber-400 bg-amber-500/10 shadow-inner' 
                    : 'border-slate-700 hover:border-amber-500/60 bg-slate-800/40'
                }`}
              >
                <label className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                  <div className="p-3.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700 shadow-md">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white">
                      {lang === 'zh' ? '點擊選取檔案，或將多張照片拖曳至此' : 'Click to Browse Files or Drag & Drop Multiple Photos'}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">
                      {lang === 'zh' ? '支援 JPG、PNG、WebP，可同時按住 Ctrl / Shift 或手機多選一次上傳多張照片' : 'Supports JPG, PNG, WebP. Hold Ctrl/Shift or multi-select on mobile.'}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleMultipleImageFiles(e.target.files);
                        e.target.value = '';
                      }
                    }}
                    className="hidden"
                  />
                </label>

                {isReadingFiles && (
                  <div className="mt-3 flex items-center justify-center space-x-2 text-xs text-amber-300">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{lang === 'zh' ? '正在快速載入並優化相片檔案...' : 'Loading & optimizing image files...'}</span>
                  </div>
                )}
              </div>

              {/* Paste Image URLs Accordion/Input */}
              <div className="p-3.5 bg-slate-800/60 border border-slate-700/80 rounded-2xl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'zh' ? '或貼上網路圖片網址 (可多行或逗號分隔一次貼多張)：' : 'Or Paste Online Image URLs (Multi-line or comma-separated):'}</span>
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg..."
                    value={urlInputBatch}
                    onChange={(e) => setUrlInputBatch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddUrlsToQueue();
                      }
                    }}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddUrlsToQueue}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold flex-shrink-0 transition-colors"
                  >
                    {lang === 'zh' ? '加入清單' : 'Add to Queue'}
                  </button>
                </div>
              </div>

              {/* Queue Controls & Batch Toolbar */}
              {uploadQueue.length > 0 && (
                <div className="space-y-4">
                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-800/90 border border-amber-500/30 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs sm:text-sm font-bold text-white">
                        {lang === 'zh' ? `待上傳清單：已選取 ${uploadQueue.length} 張照片` : `Selected ${uploadQueue.length} photos ready to upload`}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* One-click Batch AI Auto-Fill */}
                      <button
                        type="button"
                        onClick={handleRunBatchAI}
                        disabled={isBatchAIAnalyzing}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-600 hover:from-blue-700 hover:to-amber-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow transition-all disabled:opacity-50"
                        title="Gemini AI 批次辨識"
                      >
                        {isBatchAIAnalyzing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                            <span>
                              {lang === 'zh' ? `Gemini AI 分析中 (${batchAIProgress.current}/${batchAIProgress.total})...` : `AI Analyzing (${batchAIProgress.current}/${batchAIProgress.total})...`}
                            </span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>{lang === 'zh' ? '✨ Gemini AI 一鍵分析所有照片' : '✨ Gemini AI Analyze All'}</span>
                          </>
                        )}
                      </button>

                      {/* Clear All Button */}
                      <button
                        type="button"
                        onClick={() => setUploadQueue([])}
                        className="p-1.5 rounded-xl bg-slate-700/80 hover:bg-rose-900/50 text-slate-300 hover:text-rose-200 text-xs transition-colors"
                        title={lang === 'zh' ? '清空所有照片' : 'Clear All'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Batch Quick Apply Bar (Apply settings to all queued photos at once) */}
                  <div className="p-4 bg-slate-850 bg-gradient-to-br from-slate-800/90 via-slate-800/70 to-amber-950/20 border border-amber-500/40 rounded-2xl space-y-3.5 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
                          <SlidersHorizontal className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-bold text-white">
                            {lang === 'zh' ? '⚡ 批次快速套用 (一鍵套用至所有待傳相片)：' : '⚡ Quick Batch Apply to All Photos:'}
                          </span>
                          <span className="text-[10px] text-amber-300 ml-2 hidden sm:inline">
                            {lang === 'zh' ? '填寫後即自動同步套用至清單中所有相片' : 'Auto-syncs to all queued items'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-500/40">
                        {uploadQueue.length} {lang === 'zh' ? '張相片' : 'Photos'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {/* Batch Chinese Title (NEW) */}
                      <div>
                        <label className="block text-[11px] text-amber-300 font-semibold mb-1">
                          {lang === 'zh' ? '主題標題 (中文)' : 'Title (Chinese)'}
                        </label>
                        <input
                          type="text"
                          placeholder={lang === 'zh' ? '例如：2026 主日崇拜與聖餐' : 'Title in Chinese'}
                          value={batchCommon.titleZh}
                          onChange={(e) => {
                            setBatchCommon(prev => ({ ...prev, titleZh: e.target.value }));
                            handleApplyBatchFieldToAll('titleZh', e.target.value);
                          }}
                          className="w-full bg-slate-900 border border-amber-500/50 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                        />
                      </div>

                      {/* Batch English Title */}
                      <div>
                        <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                          {lang === 'zh' ? '主題標題 (英文)' : 'Title (English)'}
                        </label>
                        <input
                          type="text"
                          placeholder={lang === 'zh' ? '例如：Sunday Worship Gathering' : 'Title in English'}
                          value={batchCommon.titleEn}
                          onChange={(e) => {
                            setBatchCommon(prev => ({ ...prev, titleEn: e.target.value }));
                            handleApplyBatchFieldToAll('titleEn', e.target.value);
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Batch Category */}
                      <div>
                        <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                          {lang === 'zh' ? '相簿分類 (Category)' : 'Category'}
                        </label>
                        <select
                          value={batchCommon.category}
                          onChange={(e) => {
                            setBatchCommon(prev => ({ ...prev, category: e.target.value }));
                            handleApplyBatchFieldToAll('category', e.target.value);
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        >
                          {categories
                            .filter(c => c.key !== 'all' && c.key !== 'google-photos')
                            .map(cat => (
                              <option key={cat.key} value={cat.key}>
                                {cat.labelZh} ({cat.labelEn})
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* Batch Date */}
                      <div>
                        <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                          {lang === 'zh' ? '活動/拍攝年月' : 'Date (YYYY-MM)'}
                        </label>
                        <input
                          type="month"
                          value={batchCommon.date}
                          onChange={(e) => {
                            setBatchCommon(prev => ({ ...prev, date: e.target.value }));
                            handleApplyBatchFieldToAll('date', e.target.value);
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                          title="活動年月"
                        />
                      </div>

                      {/* Batch Album Name */}
                      <div>
                        <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                          {lang === 'zh' ? '所屬相簿名稱 (中文)' : 'Album Name (Chinese)'}
                        </label>
                        <input
                          type="text"
                          placeholder={lang === 'zh' ? '例如：2026 夏令營、主日特會' : 'Album Name'}
                          value={batchCommon.albumNameZh}
                          onChange={(e) => {
                            setBatchCommon(prev => ({ ...prev, albumNameZh: e.target.value }));
                            handleApplyBatchFieldToAll('albumNameZh', e.target.value);
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Batch Location (Chinese) */}
                      <div>
                        <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                          {lang === 'zh' ? '地點名稱 (中文)' : 'Location (Chinese)'}
                        </label>
                        <input
                          type="text"
                          placeholder={lang === 'zh' ? '例如：加南新生基督教會 主堂' : 'Location (Chinese)'}
                          value={batchCommon.locationZh}
                          onChange={(e) => {
                            setBatchCommon(prev => ({ ...prev, locationZh: e.target.value }));
                            handleApplyBatchFieldToAll('locationZh', e.target.value);
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Batch Description (English) default */}
                      <div className="sm:col-span-2 lg:col-span-2">
                        <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                          {lang === 'zh' ? '照片敘述 (英文預設)' : 'Description (English default)'}
                        </label>
                        <input
                          type="text"
                          placeholder={lang === 'zh' ? '例如：Praising the Lord together in unity.' : 'English description'}
                          value={batchCommon.descriptionEn}
                          onChange={(e) => {
                            setBatchCommon(prev => ({ ...prev, descriptionEn: e.target.value }));
                            handleApplyBatchFieldToAll('descriptionEn', e.target.value);
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Batch Description / Thanksgiving Record (Chinese) (NEW full width) */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] text-amber-300 font-semibold flex items-center space-x-1.5">
                          <span>{lang === 'zh' ? '照片敘述 / 感恩紀錄 (中文)' : 'Description / Thanksgiving Record (Chinese)'}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{lang === 'zh' ? '(一鍵套用至所有相片)' : '(Apply to all photos)'}</span>
                        </label>
                        {batchCommon.descriptionZh && (
                          <button
                            type="button"
                            onClick={() => {
                              setBatchCommon(prev => ({ ...prev, descriptionZh: '' }));
                              handleApplyBatchFieldToAll('descriptionZh', '');
                            }}
                            className="text-[10px] text-slate-400 hover:text-rose-300 transition-colors"
                          >
                            {lang === 'zh' ? '清空' : 'Clear'}
                          </button>
                        )}
                      </div>
                      <textarea
                        rows={2}
                        placeholder={lang === 'zh' ? '例如：同心合意敬拜讚美主，數算上帝滿滿的恩典與事奉感動...' : 'Enter Chinese description or thanksgiving record to apply to all queued photos...'}
                        value={batchCommon.descriptionZh}
                        onChange={(e) => {
                          setBatchCommon(prev => ({ ...prev, descriptionZh: e.target.value }));
                          handleApplyBatchFieldToAll('descriptionZh', e.target.value);
                        }}
                        className="w-full bg-slate-900 border border-amber-500/50 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Individual Photos Cards in Queue */}
                  <div className="space-y-4">
                    {uploadQueue.map((item, index) => (
                      <div
                        key={item.id}
                        className="p-4 bg-slate-800/85 border border-slate-700 rounded-2xl flex flex-col sm:flex-row gap-4 relative group hover:border-amber-500/40 transition-all shadow-sm"
                      >
                        {/* Thumbnail & Quick Remove */}
                        <div className="relative w-full sm:w-40 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-slate-950 border border-slate-700">
                          <img
                            src={item.imageUrl}
                            alt={item.titleZh}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-1.5 left-1.5 bg-slate-900/85 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm border border-slate-700">
                            #{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveQueueItem(item.id)}
                            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/90 text-rose-300 hover:text-white hover:bg-rose-600 transition-colors"
                            title={lang === 'zh' ? '移除此張照片' : 'Remove Photo'}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          {item.isAiAnalyzed && (
                            <span className="absolute bottom-1.5 left-1.5 bg-indigo-900/90 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center space-x-1 border border-indigo-500/40">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>AI</span>
                            </span>
                          )}
                        </div>

                        {/* Editable details for this photo */}
                        <div className="flex-1 space-y-3 text-xs">
                          {/* Row 1: Chinese Title & English Title */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                                {lang === 'zh' ? '主題標題 (中文) *' : 'Title (Chinese) *'}
                              </label>
                              <input
                                type="text"
                                required
                                value={item.titleZh}
                                onChange={(e) => handleUpdateQueueItem(item.id, { titleZh: e.target.value })}
                                placeholder={lang === 'zh' ? '例如：主日崇拜與聖餐記念' : 'Title in Chinese'}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                                {lang === 'zh' ? '主題標題 (英文)' : 'Title (English)'}
                              </label>
                              <input
                                type="text"
                                value={item.titleEn}
                                onChange={(e) => handleUpdateQueueItem(item.id, { titleEn: e.target.value })}
                                placeholder={lang === 'zh' ? '例如：Sunday Worship & Holy Communion' : 'Title in English'}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>

                          {/* Row 2: Category & Album */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                                {lang === 'zh' ? '所屬相簿分類 (Category)' : 'Category'}
                              </label>
                              <select
                                value={item.category}
                                onChange={(e) => handleUpdateQueueItem(item.id, { category: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                              >
                                {categories
                                  .filter(c => c.key !== 'all' && c.key !== 'google-photos')
                                  .map(cat => (
                                    <option key={cat.key} value={cat.key}>
                                      {cat.labelZh} ({cat.labelEn})
                                    </option>
                                  ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                                {lang === 'zh' ? '所屬相簿名稱 (中文)' : 'Album Name (Chinese)'}
                              </label>
                              <input
                                type="text"
                                value={item.albumNameZh}
                                onChange={(e) => handleUpdateQueueItem(item.id, { albumNameZh: e.target.value })}
                                placeholder={lang === 'zh' ? '例如：2026 主日崇拜、退修營' : 'Album Name'}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>

                          {/* Row 3: Date & Location (Chinese) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[11px] text-slate-300 font-semibold mb-1 flex items-center space-x-1">
                                <Calendar className="w-3 h-3 text-amber-400" />
                                <span>{lang === 'zh' ? '活動/拍攝年月' : 'Date (YYYY-MM)'}</span>
                              </label>
                              <input
                                type="text"
                                value={item.date}
                                placeholder="2026-05"
                                onChange={(e) => handleUpdateQueueItem(item.id, { date: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] text-slate-300 font-semibold mb-1 flex items-center space-x-1">
                                <MapPin className="w-3 h-3 text-amber-400" />
                                <span>{lang === 'zh' ? '地點名稱 (中文)' : 'Location (Chinese)'}</span>
                              </label>
                              <input
                                type="text"
                                value={item.locationZh}
                                onChange={(e) => handleUpdateQueueItem(item.id, { locationZh: e.target.value })}
                                placeholder={lang === 'zh' ? '例如：加南新生基督教會 主堂' : 'Location (Chinese)'}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>

                          {/* Row 4: Description (Chinese) with Single AI Analyze */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] text-slate-300 font-semibold">
                                {lang === 'zh' ? '照片敘述 / 感恩紀錄 (中文)' : 'Description (Chinese)'}
                              </label>
                              <button
                                type="button"
                                onClick={() => handleRunSingleAI(item.id)}
                                disabled={item.isAnalyzing}
                                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center space-x-1 font-semibold disabled:opacity-50"
                              >
                                {item.isAnalyzing ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin text-amber-300" />
                                    <span>AI 分析中...</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-3 h-3 text-amber-400" />
                                    <span>{lang === 'zh' ? '✨ AI 重新辨識此張' : '✨ AI Analyze'}</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <textarea
                              rows={2}
                              value={item.descriptionZh}
                              onChange={(e) => handleUpdateQueueItem(item.id, { descriptionZh: e.target.value })}
                              placeholder={lang === 'zh' ? '聚會回憶、主的恩典與事奉感動 (中文)...' : 'Description in Chinese...'}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                            />
                          </div>

                          {/* Row 5: Description (English) */}
                          <div>
                            <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                              {lang === 'zh' ? '照片敘述 (英文)' : 'Description (English)'}
                            </label>
                            <textarea
                              rows={2}
                              value={item.descriptionEn}
                              onChange={(e) => handleUpdateQueueItem(item.id, { descriptionEn: e.target.value })}
                              placeholder={lang === 'zh' ? '例如：Brothers and sisters worshiping together with joy and thanksgiving.' : 'Description in English...'}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                <div className="text-xs text-slate-400">
                  {uploadQueue.length > 0 ? (
                    <span className="text-amber-300 font-medium">
                      {lang === 'zh' ? `共 ${uploadQueue.length} 張照片準備加入走廊` : `${uploadQueue.length} photos ready`}
                    </span>
                  ) : (
                    <span>{lang === 'zh' ? '請先選取或拖曳相片檔案' : 'Please select or drop photos'}</span>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setUploadQueue([]);
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 transition-colors"
                  >
                    {lang === 'zh' ? '取消' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={uploadQueue.length === 0}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center space-x-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>
                      {uploadQueue.length > 1
                        ? (lang === 'zh' ? `批次儲存全部 (${uploadQueue.length} 張)` : `Save All (${uploadQueue.length} Photos)`)
                        : (lang === 'zh' ? '儲存至照片走廊' : 'Save to Gallery')}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Category Manager Modal */}
      {isCategoryModalOpen && (
        <CategoryManagerModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          lang={lang}
          categories={categories}
          photos={photos}
          onSaveCategories={handleSaveCategories}
          onUpdatePhotoCategory={handleUpdatePhotoCategory}
        />
      )}

      {/* Admin Photo Edit & Re-categorize Modal */}
      {isEditPhotoModalOpen && editingPhoto && (
        <PhotoEditModal
          isOpen={isEditPhotoModalOpen}
          onClose={() => {
            setIsEditPhotoModalOpen(false);
            setEditingPhoto(null);
          }}
          photo={editingPhoto}
          categories={categories}
          lang={lang}
          onSavePhoto={handleSaveEditedPhoto}
          onDeletePhoto={(id) => {
            handleDeletePhoto(id);
            setIsEditPhotoModalOpen(false);
            setEditingPhoto(null);
          }}
        />
      )}

      {/* Admin Batch Photo Edit Modal */}
      {isBatchEditModalOpen && (
        <BatchPhotoEditModal
          isOpen={isBatchEditModalOpen}
          onClose={() => setIsBatchEditModalOpen(false)}
          selectedPhotos={photos.filter(p => selectedPhotoIds.includes(p.id))}
          categories={categories}
          lang={lang}
          onSaveBatchPhotos={handleSaveBatchEditedPhotos}
          onSaveBatch={handleSaveBatchEditedPhotos}
          onDeleteBatchPhotos={handleDeleteBatchPhotos}
          onDeleteBatch={handleDeleteBatchPhotos}
        />
      )}

      {/* Admin GitHub & Cloudflare Sync & Export Modal */}
      {isGitHubSyncModalOpen && (
        <GalleryGitHubSyncModal
          isOpen={isGitHubSyncModalOpen}
          onClose={() => setIsGitHubSyncModalOpen(false)}
          lang={lang}
          photos={photos}
          categories={categories}
          onImportBackup={(importedPhotos, importedCategories) => {
            setPhotos(importedPhotos);
            persistGalleryPhotos(importedPhotos);
            if (importedCategories) {
              setCategories(importedCategories);
              try {
                localStorage.setItem('canaan_gallery_categories', JSON.stringify(importedCategories));
              } catch (e) {
                console.error(e);
              }
            }
            setStatusMessage(
              lang === 'zh'
                ? `✅ 成功還原 ${importedPhotos.length} 張相片！已即時同步到走廊。`
                : `✅ Restored ${importedPhotos.length} photos!`
            );
            setTimeout(() => setStatusMessage(null), 5000);
          }}
        />
      )}

      {/* Admin Add / Edit Google Album Modal */}
      <GoogleAlbumModal
        isOpen={isGoogleAlbumModalOpen}
        onClose={() => {
          setIsGoogleAlbumModalOpen(false);
          setEditingAlbum(null);
        }}
        lang={lang}
        albumToEdit={editingAlbum}
        onSave={handleSaveGoogleAlbum}
        categories={categories}
      />
    </section>
  );
};
