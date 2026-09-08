import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  ZoomIn, 
  Maximize2, 
  ExternalLink, 
  Layers, 
  Info, 
  Compass, 
  Utensils, 
  Sparkles, 
  Eye, 
  Check, 
  X,
  Footprints,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface RobertRyanHikingMapGuideProps {
  lang: 'zh' | 'en';
  onOpenZoomModal?: (imageUrl: string, title: string) => void;
  onMapImageChange?: (newUrl: string) => void;
}

export const RobertRyanHikingMapGuide: React.FC<RobertRyanHikingMapGuideProps> = ({
  lang,
  onOpenZoomModal,
  onMapImageChange
}) => {
  const [selectedSpot, setSelectedSpot] = useState<'all' | 'meeting' | 'restroom' | 'outbound' | 'return' | 'scenic'>('all');
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  
  // Custom uploaded map state
  const [customMapUrl, setCustomMapUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem('canaan_custom_hiking_map') || null;
    } catch {
      return null;
    }
  });
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMsg, setUploadMsg] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultMapUrl = '/images/ryan_park_hiking_map.jpg';
  const currentMapUrl = customMapUrl || defaultMapUrl;

  useEffect(() => {
    if (customMapUrl && onMapImageChange) {
      onMapImageChange(customMapUrl);
    }
  }, [customMapUrl, onMapImageChange]);

  // Handle uploading and saving user image
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadStatus('error');
      setUploadMsg(lang === 'zh' ? '請上傳有效的圖片檔案 (PNG, JPG, WebP)' : 'Please upload a valid image file');
      return;
    }

    setUploadStatus('uploading');
    setUploadMsg(lang === 'zh' ? '正在載入並同步儲存圖片...' : 'Loading and saving image...');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) {
          throw new Error('Failed to read file data');
        }

        // 1. Save to local state and localStorage
        setCustomMapUrl(dataUrl);
        try {
          localStorage.setItem('canaan_custom_hiking_map', dataUrl);
        } catch (storageErr) {
          console.warn('LocalStorage quota or access notice:', storageErr);
        }

        if (onMapImageChange) {
          onMapImageChange(dataUrl);
        }

        // 2. Upload to server to persist permanently in public/dist
        try {
          const res = await fetch('/api/upload-hiking-map', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: dataUrl })
          });
          if (!res.ok) {
            console.warn('Server map sync status:', res.status);
          }
        } catch (apiErr) {
          console.warn('Server upload request notice:', apiErr);
        }

        setUploadStatus('success');
        setUploadMsg(
          lang === 'zh' 
            ? `已成功套用您的上傳圖片「${file.name}」！` 
            : `Successfully applied your uploaded image "${file.name}"!`
        );
      };

      reader.onerror = () => {
        setUploadStatus('error');
        setUploadMsg(lang === 'zh' ? '讀取檔案失敗，請再試一次' : 'Failed to read file, please try again');
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadStatus('error');
      setUploadMsg(err.message || 'Error processing image');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // reset input value so re-uploading same file name triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleResetToDefault = () => {
    try {
      localStorage.removeItem('canaan_custom_hiking_map');
    } catch (e) {
      console.warn(e);
    }
    setCustomMapUrl(null);
    setUploadStatus('idle');
    setUploadMsg('');
    if (onMapImageChange) {
      onMapImageChange(defaultMapUrl);
    }
  };

  // Landmarks information matching the user's annotated map
  const spots = {
    meeting: {
      titleZh: '集合與午餐地點（30359 Hawthorne Blvd）',
      titleEn: 'Meeting & Lunch Area (30359 Hawthorne Blvd)',
      descZh: 'Robert Ryan Park 公園內西側野餐區，配有固定圓形石桌椅與樹蔭。9:15 AM 集合，11:00 AM 回到此處享用三明治、水果、沙拉與飲水。',
      descEn: 'West picnic area of Robert Ryan Park with circular stone tables and shade trees. Meet at 9:15 AM, return at 11:00 AM for fellowship lunch.',
      photo: '/images/ryan_park_picnic_tables.jpg',
      photoCaptionZh: 'Robert Ryan Park 圓形野餐桌與綠蔭休息區',
      photoCaptionEn: 'Robert Ryan Park Circular Picnic Tables & Lawn',
      icon: '📍'
    },
    restroom: {
      titleZh: '公園洗手間（Robert Ryan Park 洗手间）',
      titleEn: 'Park Restroom Facility',
      descZh: '位於公園西北側建築物，緊鄰野餐集合區與停車動線，建議健行出發前使用。',
      descEn: 'Located at the northwest building of the park near picnic tables and parking.',
      photo: null,
      icon: '🚻'
    },
    outbound: {
      titleZh: '去程步道路線（深藍色箭頭）',
      titleEn: 'Outbound Hiking Route (Dark Blue Arrows)',
      descZh: '9:30 AM 準時出發，自集合野餐區向南穿過公園綠地，沿 Hawthorne Blvd 東側步道向東南緩坡行進，直達觀景點。',
      descEn: 'Depart 9:30 AM sharp, south across park lawn, down southeastern path along Hawthorne Blvd to Scenic Outlook.',
      photo: null,
      icon: '🥾'
    },
    scenic: {
      titleZh: 'PV 3 峽灣東南觀景點（Pacific Vista / Scenic Outlook）',
      titleEn: 'PV3 Scenic Viewpoint & Pacific Vista',
      descZh: '步道終點觀景點，遠眺蔚藍太平洋、沿岸懸崖峭壁海景，以及 Palos Verdes 壯闊高爾夫海景莊園。',
      descEn: 'Trail destination offering panoramic views of the Pacific Ocean, coastal bluffs, and Palos Verdes golf coast.',
      photo: '/images/palos_verdes_coastal_view.jpg',
      photo2: '/images/palos_verdes_ocean_golf.jpg',
      photoCaptionZh: '東南峽灣懸崖海岸與太平洋蔚藍全景',
      photoCaptionEn: 'Pacific Ocean Coastal Bluff & Golf Panorama',
      icon: '🌊'
    },
    return: {
      titleZh: '回程路線（淺藍色箭頭）',
      titleEn: 'Return Hiking Route (Light Blue Arrows)',
      descZh: '自觀景點轉入 Marne Dr 往北前進，左轉進入 Cartier Dr 向西前行，再接回 Hawthorne Blvd 返抵公園出發野餐區。',
      descEn: 'Loop back north along Marne Dr, turn west onto Cartier Dr, and re-enter Hawthorne Blvd back to picnic tables.',
      photo: null,
      icon: '🔄'
    }
  };

  const handleOpenFullMap = () => {
    if (onOpenZoomModal) {
      onOpenZoomModal(
        currentMapUrl,
        lang === 'zh'
          ? 'Robert Ryan Park 健行路線與集合/午餐野餐區、洗手間及東南峽灣觀景點導覽圖'
          : 'Robert Ryan Park Trail Route Map: Meeting/Lunch Picnic Area, Restrooms & Scenic Overlook'
      );
    } else {
      setActivePhoto(currentMapUrl);
    }
  };

  return (
    <div className="space-y-4 bg-gradient-to-b from-amber-50/80 via-white to-stone-50 rounded-2xl p-4 sm:p-5 border-2 border-amber-300 shadow-sm">
      {/* Hidden File Input for Custom Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*"
        className="hidden"
      />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-amber-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-amber-600 text-white text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {lang === 'zh' ? '路線導覽' : 'Route Guide'}
            </span>
            <h4 className="text-base sm:text-lg font-serif font-black text-amber-950">
              {lang === 'zh' 
                ? 'Robert Ryan Park 健行路線與集合/午餐野餐區、洗手間及東南峽灣觀景點導覽圖' 
                : 'Robert Ryan Park Trail Route & Meeting / Restroom / Scenic Guide'}
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            {lang === 'zh'
              ? '含集合/午餐野餐圓桌、洗手間、去程(深藍)/回程(淺藍)箭頭與 PV3 觀景點'
              : 'Includes meeting/lunch picnic tables, restroom, outbound/return arrows & PV3 viewpoints'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Apply / Upload Screenshot Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3 py-1.5 rounded-xl transition cursor-pointer shadow-2xs"
            title={lang === 'zh' ? '上傳或更換您自訂的截圖檔案' : 'Upload or replace with custom screenshot'}
          >
            <Upload className="w-3.5 h-3.5 text-amber-700" />
            <span>
              {customMapUrl
                ? (lang === 'zh' ? '更換截圖' : 'Replace Image')
                : (lang === 'zh' ? '套用上傳截圖' : 'Apply My Screenshot')}
            </span>
          </button>

          {/* Reset button if custom map is loaded */}
          {customMapUrl && (
            <button
              type="button"
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1.5 rounded-xl transition cursor-pointer border border-stone-200"
              title={lang === 'zh' ? '恢復為預設合成導覽圖' : 'Reset to default map'}
            >
              <RotateCcw className="w-3 h-3" />
              <span>{lang === 'zh' ? '重設' : 'Reset'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenFullMap}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-900 hover:text-amber-950 bg-amber-200 hover:bg-amber-300 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer border border-amber-300/80 shadow-xs"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{lang === 'zh' ? '放大全螢幕' : 'Full Screen'}</span>
          </button>

          <a
            href="https://maps.app.goo.gl/4uYGA8L2s3wAuzHd8"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white bg-amber-700 hover:bg-amber-800 px-3.5 py-1.5 rounded-xl transition-colors shadow-xs"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{lang === 'zh' ? 'Google 導航' : 'Directions'}</span>
          </a>
        </div>
      </div>

      {/* Upload Notification Banner */}
      {uploadStatus !== 'idle' && (
        <div className={`p-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-between border ${
          uploadStatus === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
            : uploadStatus === 'error'
            ? 'bg-rose-50 text-rose-900 border-rose-300'
            : 'bg-amber-50 text-amber-900 border-amber-300 animate-pulse'
        }`}>
          <div className="flex items-center gap-2">
            {uploadStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            {uploadStatus === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            {uploadStatus === 'uploading' && <Upload className="w-4 h-4 text-amber-600 animate-bounce shrink-0" />}
            <span>{uploadMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadStatus('idle')}
            className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Map Viewer with Drag & Drop Zone and Hover Zoom Preview */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group rounded-2xl overflow-hidden border-2 bg-stone-950 shadow-md transition-all ${
          isDragging ? 'border-amber-400 ring-4 ring-amber-400/30' : 'border-amber-400/90'
        }`}
      >
        <img
          src={currentMapUrl}
          alt={lang === 'zh' ? 'Robert Ryan Park 健行路線導覽圖' : 'Robert Ryan Park Hiking Guide Map'}
          referrerPolicy="no-referrer"
          onClick={handleOpenFullMap}
          className="w-full h-auto max-h-[520px] object-contain mx-auto bg-stone-950 cursor-pointer transition-transform duration-300 group-hover:scale-[1.01]"
        />

        {/* Drag and Drop Overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-stone-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center border-4 border-dashed border-amber-400 rounded-2xl z-20 pointer-events-none">
            <Upload className="w-12 h-12 text-amber-400 animate-bounce mb-3" />
            <h5 className="text-lg font-bold text-white mb-1">
              {lang === 'zh' ? '放開以套用您上傳的截圖' : 'Drop your image here to apply'}
            </h5>
            <p className="text-xs text-stone-300">
              {lang === 'zh' ? '支援 PNG, JPG, WebP 格式圖片' : 'Supports PNG, JPG, WebP'}
            </p>
          </div>
        )}

        {/* Hover / Click indicator badge */}
        <div 
          onClick={handleOpenFullMap}
          className="absolute inset-0 bg-stone-900/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer pointer-events-auto"
        >
          <div className="bg-stone-900/95 backdrop-blur-xs text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-2xl border border-white/25">
            <ZoomIn className="w-4 h-4 text-amber-300" />
            <span>{lang === 'zh' ? '點擊檢視超高清全圖與文字標籤' : 'Click for Full Resolution Map'}</span>
          </div>
        </div>

        {/* Floating status badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 pointer-events-none">
          <div className="bg-stone-900/85 backdrop-blur-xs text-amber-200 text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-400/30 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {customMapUrl 
                ? (lang === 'zh' ? '已載入您上傳的原始圖片' : 'Custom Uploaded Screenshot')
                : (lang === 'zh' ? '完整標註導覽衛星圖' : 'Annotated Satellite Guide')}
            </span>
          </div>
          {customMapUrl && (
            <span className="bg-emerald-600/90 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-1 rounded-lg border border-emerald-400/40 flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>{lang === 'zh' ? '用戶圖片' : 'User Image'}</span>
            </span>
          )}
        </div>

        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="bg-stone-900/85 hover:bg-stone-900 text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-lg border border-amber-400/40 flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Upload className="w-3 h-3" />
            <span>{lang === 'zh' ? '拖曳或點此更換圖片' : 'Upload / Replace'}</span>
          </button>
          <div className="bg-stone-900/85 backdrop-blur-xs text-stone-200 text-xs font-semibold px-2.5 py-1 rounded-lg border border-white/15 flex items-center gap-1.5 pointer-events-none">
            <ZoomIn className="w-3 h-3 text-amber-300" />
            <span>{lang === 'zh' ? '可放大全螢幕' : 'Click to enlarge'}</span>
          </div>
        </div>
      </div>

      {/* Interactive Landmark Filters & Highlights */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-stone-600 uppercase tracking-wider">
          <span>{lang === 'zh' ? '點擊標籤查看詳細說明與實景' : 'Click below for landmark details & photos'}</span>
          <span className="text-amber-800 font-semibold">{lang === 'zh' ? '共 5 處重點標註' : '5 Key Highlights'}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setSelectedSpot('all')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer border ${
              selectedSpot === 'all'
                ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-200'
            }`}
          >
            {lang === 'zh' ? '全部導覽重點' : 'All Highlights'}
          </button>

          <button
            type="button"
            onClick={() => setSelectedSpot('meeting')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer border flex items-center gap-1 ${
              selectedSpot === 'meeting'
                ? 'bg-red-600 text-white border-red-700 shadow-xs'
                : 'bg-white text-red-800 hover:bg-red-50 border-red-200'
            }`}
          >
            <span>📍</span>
            <span>{lang === 'zh' ? '集合/午餐野餐地' : 'Meeting / Lunch Spot'}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSpot('restroom')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer border flex items-center gap-1 ${
              selectedSpot === 'restroom'
                ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                : 'bg-white text-blue-800 hover:bg-blue-50 border-blue-200'
            }`}
          >
            <span>🚻</span>
            <span>{lang === 'zh' ? '洗手間位置' : 'Restroom'}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSpot('outbound')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer border flex items-center gap-1 ${
              selectedSpot === 'outbound'
                ? 'bg-sky-800 text-white border-sky-900 shadow-xs'
                : 'bg-white text-sky-900 hover:bg-sky-50 border-sky-300'
            }`}
          >
            <span>🥾</span>
            <span>{lang === 'zh' ? '去程路線 (深藍)' : 'Outbound (Dark Blue)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSpot('scenic')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer border flex items-center gap-1 ${
              selectedSpot === 'scenic'
                ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                : 'bg-white text-emerald-800 hover:bg-emerald-50 border-emerald-200'
            }`}
          >
            <span>🌊</span>
            <span>{lang === 'zh' ? 'PV3 峽灣海景' : 'PV3 Ocean View'}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSpot('return')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer border flex items-center gap-1 ${
              selectedSpot === 'return'
                ? 'bg-cyan-600 text-white border-cyan-700 shadow-xs'
                : 'bg-white text-cyan-800 hover:bg-cyan-50 border-cyan-200'
            }`}
          >
            <span>🔄</span>
            <span>{lang === 'zh' ? '回程路線 (淺藍)' : 'Return (Light Blue)'}</span>
          </button>
        </div>
      </div>

      {/* Detail Cards based on selectedSpot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Meeting and Lunch Area */}
        {(selectedSpot === 'all' || selectedSpot === 'meeting') && (
          <div className="bg-white rounded-xl p-3.5 border-2 border-red-200 hover:border-red-400 transition-colors shadow-xs space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xl">📍</span>
                <strong className="text-stone-900 font-bold text-sm sm:text-base">
                  {lang === 'zh' ? spots.meeting.titleZh : spots.meeting.titleEn}
                </strong>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
                {lang === 'zh' ? '圖中紅箭頭指引' : 'Red Arrow'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {lang === 'zh' ? spots.meeting.descZh : spots.meeting.descEn}
            </p>
            {/* Picnic Photo Thumbnail */}
            <div 
              onClick={() => setActivePhoto(spots.meeting.photo)}
              className="mt-2 rounded-lg overflow-hidden border border-stone-200 relative group cursor-pointer"
            >
              <img
                src={spots.meeting.photo}
                alt="Robert Ryan Park Picnic Area"
                referrerPolicy="no-referrer"
                className="w-full h-32 object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-stone-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{lang === 'zh' ? '點擊查看野餐區實景照片' : 'View Picnic Area Photo'}</span>
              </div>
              <div className="p-1.5 bg-stone-50 text-[11px] text-stone-600 font-medium">
                {lang === 'zh' ? spots.meeting.photoCaptionZh : spots.meeting.photoCaptionEn}
              </div>
            </div>
          </div>
        )}

        {/* Restroom Facility */}
        {(selectedSpot === 'all' || selectedSpot === 'restroom') && (
          <div className="bg-white rounded-xl p-3.5 border-2 border-blue-200 hover:border-blue-400 transition-colors shadow-xs space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🚻</span>
                <strong className="text-stone-900 font-bold text-sm sm:text-base">
                  {lang === 'zh' ? spots.restroom.titleZh : spots.restroom.titleEn}
                </strong>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {lang === 'zh' ? '圖中紅箭頭指引' : 'Red Arrow'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {lang === 'zh' ? spots.restroom.descZh : spots.restroom.descEn}
            </p>
            <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                <span>{lang === 'zh' ? '洗手間注意事項' : 'Restroom Notice'}</span>
              </div>
              <div>
                {lang === 'zh'
                  ? '公園洗手間位於野餐出發點北側，步道沿線無其他洗手間，請大家於 9:30 AM 出發前使用。'
                  : 'Located north of the picnic area. No additional restrooms along the trail; please use before departing.'}
              </div>
            </div>
          </div>
        )}

        {/* Outbound Route */}
        {(selectedSpot === 'all' || selectedSpot === 'outbound') && (
          <div className="bg-white rounded-xl p-3.5 border-2 border-sky-200 hover:border-sky-400 transition-colors shadow-xs space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🥾</span>
                <strong className="text-stone-900 font-bold text-sm sm:text-base">
                  {lang === 'zh' ? spots.outbound.titleZh : spots.outbound.titleEn}
                </strong>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-900">
                {lang === 'zh' ? '深藍色箭頭' : 'Dark Blue'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {lang === 'zh' ? spots.outbound.descZh : spots.outbound.descEn}
            </p>
            <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200/70 text-xs text-sky-950">
              {lang === 'zh'
                ? '路線特點：路面平緩好走，適合各年齡層會友與家庭一同健行散步，沿途可欣賞海風與山坡美景。'
                : 'Trail feature: Gentle, well-paved, scenic terrain ideal for all ages and family members.'}
            </div>
          </div>
        )}

        {/* Scenic Overlooks */}
        {(selectedSpot === 'all' || selectedSpot === 'scenic') && (
          <div className="bg-white rounded-xl p-3.5 border-2 border-emerald-200 hover:border-emerald-400 transition-colors shadow-xs space-y-2 sm:col-span-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🌊</span>
                <strong className="text-stone-900 font-bold text-sm sm:text-base">
                  {lang === 'zh' ? spots.scenic.titleZh : spots.scenic.titleEn}
                </strong>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {lang === 'zh' ? '步道終點觀景點' : 'Trail Destination'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {lang === 'zh' ? spots.scenic.descZh : spots.scenic.descEn}
            </p>

            {/* Inset Photo Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div 
                onClick={() => setActivePhoto(spots.scenic.photo)}
                className="rounded-lg overflow-hidden border border-stone-200 relative group cursor-pointer"
              >
                <img
                  src={spots.scenic.photo}
                  alt="Pacific Vista Coastal Bluff View"
                  referrerPolicy="no-referrer"
                  className="w-full h-36 object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-stone-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{lang === 'zh' ? '放大檢視懸崖海景實照' : 'View Coastal Bluff Photo'}</span>
                </div>
                <div className="p-1.5 bg-stone-50 text-[11px] text-stone-600 font-medium">
                  {lang === 'zh' ? '懸崖豪宅與太平洋峽灣海岸景觀' : 'Pacific Vista Coastal Bluffs'}
                </div>
              </div>

              <div 
                onClick={() => setActivePhoto(spots.scenic.photo2)}
                className="rounded-lg overflow-hidden border border-stone-200 relative group cursor-pointer"
              >
                <img
                  src={spots.scenic.photo2}
                  alt="Palos Verdes Golf Course Ocean View"
                  referrerPolicy="no-referrer"
                  className="w-full h-36 object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-stone-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{lang === 'zh' ? '放大檢視高爾夫海景全景' : 'View Ocean Golf Photo'}</span>
                </div>
                <div className="p-1.5 bg-stone-50 text-[11px] text-stone-600 font-medium">
                  {lang === 'zh' ? 'Palos Verdes 高爾夫球場與蔚藍海岸景觀' : 'Palos Verdes Golf & Coastline'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Return Route */}
        {(selectedSpot === 'all' || selectedSpot === 'return') && (
          <div className="bg-white rounded-xl p-3.5 border-2 border-cyan-200 hover:border-cyan-400 transition-colors shadow-xs space-y-2 sm:col-span-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🔄</span>
                <strong className="text-stone-900 font-bold text-sm sm:text-base">
                  {lang === 'zh' ? spots.return.titleZh : spots.return.titleEn}
                </strong>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">
                {lang === 'zh' ? '淺藍色箭頭' : 'Light Blue'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {lang === 'zh' ? spots.return.descZh : spots.return.descEn}
            </p>
            <div className="p-2.5 rounded-lg bg-cyan-50/70 border border-cyan-200 text-xs text-cyan-950">
              {lang === 'zh'
                ? '回程動線：沿 Marne Dr 北行 → 左轉 Cartier Dr 西行 → 接回 Hawthorne Blvd → 進入 Robert Ryan Park 野餐區享用午餐愛筵。'
                : 'Return Path: North on Marne Dr → West on Cartier Dr → South on Hawthorne Blvd back to Robert Ryan Park picnic area.'}
            </div>
          </div>
        )}
      </div>

      {/* Internal Photo Preview Lightbox */}
      {activePhoto && (
        <div 
          className="fixed inset-0 z-[100] bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActivePhoto(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-stone-900 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 z-10 bg-stone-900/80 hover:bg-stone-800 text-white p-2 rounded-full border border-white/20 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activePhoto}
              alt="Enlarged Preview"
              referrerPolicy="no-referrer"
              className="max-h-[80vh] w-auto mx-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
