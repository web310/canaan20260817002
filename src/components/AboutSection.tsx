import React, { useState } from 'react';
import { Language } from '../types';
import { CHURCH_INFO, CHURCH_HISTORY_MILESTONES, STATEMENT_OF_FAITH } from '../data/churchData';
import { ShieldCheck, History, BookOpen, Heart, Award, CheckCircle2, UserCheck, ArrowUpRight } from 'lucide-react';
import fellowshipImg from '../assets/images/canaan_fellowship_1786434097997.jpg';

interface AboutProps {
  lang: Language;
}

export const AboutSection: React.FC<AboutProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<'welcome' | 'history' | 'faith'>('welcome');

  return (
    <section id="about" className="py-20 bg-slate-50 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>{lang === 'zh' ? '關於加南新生基督教會' : 'About Canaan Shin Sheng'}</span>
          </div>
          
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
            {lang === 'zh' ? '在恩典中紮根 • 在基督裡同行' : 'Rooted in Grace • Walking in Unity'}
          </h2>

          <p className="text-slate-600 text-base leading-relaxed">
            {lang === 'zh' 
              ? '加南新生基督教會 (Canaan Shin Sheng Christian Church) 創立於 1984 年，為獨立基督教會 (Independent Christian Church)。四十多年來在 Harbor City 忠心敬拜神、培育信徒、廣傳福音。'
              : 'Established in 1984 as an independent Christian church, Canaan Shin Sheng Christian Church serves the South Bay community with faithful Bible preaching and warm fellowship.'}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300/60 max-w-md w-full">
            <button
              onClick={() => setActiveTab('welcome')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'welcome' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'zh' ? '長執同工的話' : 'Welcome'}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'history' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'zh' ? '教會歷史沿革' : 'Our History'}
            </button>
            <button
              onClick={() => setActiveTab('faith')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'faith' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'zh' ? '信仰宣言' : 'Statement of Faith'}
            </button>
          </div>
        </div>

        {/* Tab 1: Pastor Welcome */}
        {activeTab === 'welcome' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm">
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border-4 border-amber-50 shadow-md aspect-4/3 sm:aspect-square bg-slate-100">
                <img 
                  src={fellowshipImg} 
                  alt="Canaan Shin Sheng Church Community" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="absolute -bottom-4 -right-2 bg-amber-900 text-white p-4 rounded-2xl shadow-xl max-w-xs border border-amber-700 hidden sm:block">
                <div className="text-xs text-amber-300 font-semibold uppercase">{CHURCH_INFO.denominationZh}</div>
                <div className="text-sm font-bold">{lang === 'zh' ? '長執同工會與團契團隊' : 'Elders & Deacons Board'}</div>
                <div className="text-xs text-amber-200">{lang === 'zh' ? '加南新生基督教會' : 'Canaan Shin Sheng Church'}</div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-2">
                <div className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                  {lang === 'zh' ? '長執同工會的話' : 'Message from Church Leadership'}
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                  {lang === 'zh' ? '加南新生基督教會 長執同工會' : 'Canaan Shin Sheng Leadership Board'}
                </h3>
              </div>

              <blockquote className="border-l-4 border-amber-600 pl-4 py-1 text-slate-700 italic text-base leading-relaxed bg-amber-50/50 rounded-r-xl">
                {lang === 'zh' 
                  ? '「若有人在基督裡，他就是新造的人，舊事已過，都變成新的了。」（哥林多後書 5:17）加南新生基督教會誠摯歡迎您來到神的家中，與我們一同學習真理、同享愛宴、彼此服事！'
                  : '"Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!" (2 Corinthians 5:17). We warmly invite you to join our family in Christ.'
                }
              </blockquote>

              <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
                <p>
                  {lang === 'zh'
                    ? '加南新生基督教會 (Canaan Shin Sheng Christian Church) 自1984年創立以來，始終秉持聖經真理，致力於建造健全屬靈生命。我們擁有豐富的主日學教導、聖歌隊獻詩、週四線上禱告會以及溫馨團契愛宴。'
                    : 'Since 1984, Canaan Shin Sheng Christian Church has been dedicated to biblical teaching, choir worship, vibrant prayer meetings, and warm multi-generational community fellowship in Harbor City, CA.'
                  }
                </p>
                <p>
                  {lang === 'zh'
                    ? '作為獨立基督教會，我們由長執同工會與教牧同工團隊同心帶領，廣傳福音、深化教牧與肢體連結。無論您是尋求信仰真理的新朋友，或是尋找屬靈家園的弟兄姊妹，我們都竭誠歡迎您！'
                    : 'As an independent Christian church, our leadership board and ministry teams operate in unity to preach the Gospel and care for our members. Whether you are seeking faith for the first time or looking for a church home, you are welcome here.'
                  }
                </p>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-4 border-t border-slate-100 text-xs">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium text-slate-800">{lang === 'zh' ? '無障礙通道設施' : 'Wheelchair Accessible'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium text-slate-800">{lang === 'zh' ? '雙語與中文崇拜' : 'Bilingual / Chinese Worship'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium text-slate-800">{lang === 'zh' ? '獨立基督教會 (Independent)' : 'Independent Church'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium text-slate-800">{lang === 'zh' ? '愛宴聚餐與詩班團契' : 'Fellowship Lunch & Choir'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Church History */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-8">
            <div className="max-w-2xl">
              <h3 className="font-serif text-2xl font-bold text-slate-900 mb-2">
                {lang === 'zh' ? '加南新生基督教會 發展里程碑' : 'Church History Milestones'}
              </h3>
              <p className="text-slate-600 text-sm">
                {lang === 'zh' 
                  ? '從1984年創立至今日，見證上帝無數豐盛的引導與海港城 (Harbor City) 的福音事工。'
                  : 'Tracing God\'s faithful guidance from our founding in 1984 to our present ministry in Harbor City, CA.'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              {CHURCH_HISTORY_MILESTONES.map((item, idx) => (
                <div key={idx} className="bg-slate-50 rounded-2xl p-6 border border-slate-200 relative group hover:border-amber-400 transition-colors">
                  <div className="text-3xl font-serif font-extrabold text-amber-700 mb-2">
                    {item.year}
                  </div>
                  <h4 className="font-bold text-slate-900 text-base mb-2">
                    {lang === 'zh' ? item.titleZh : item.titleEn}
                  </h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {lang === 'zh' ? item.descZh : item.descEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Statement of Faith */}
        {activeTab === 'faith' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-6">
            <div className="max-w-2xl mb-6">
              <h3 className="font-serif text-2xl font-bold text-slate-900 mb-2">
                {lang === 'zh' ? '我們信仰的核心告白' : 'Our Core Statement of Faith'}
              </h3>
              <p className="text-slate-600 text-sm">
                {lang === 'zh' 
                  ? '加南新生基督教會堅守聖經真理，以下為我們信仰的核心告白：'
                  : 'Rooted in historic Christian orthodoxy and evangelical truth.'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {STATEMENT_OF_FAITH.map((faith, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-2">
                  <div className="flex items-center space-x-2 text-amber-900 font-serif text-lg font-bold">
                    <BookOpen className="w-5 h-5 text-amber-700 shrink-0" />
                    <span>{lang === 'zh' ? faith.titleZh : faith.title}</span>
                  </div>
                  <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                    {lang === 'zh' ? faith.contentZh : faith.content}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {faith.verses.map((verse, vIdx) => (
                      <span key={vIdx} className="bg-amber-100 text-amber-900 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-amber-300/60">
                        {verse}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
