import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Printer, Download, Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { MedicalCardData, EmergencyContact } from '@/types';
import { generateMedicalAlert, generateMedicalRescueText } from '@/services/aiService';
import { exportAsImage, printCard } from '@/utils/exportImage';
import AILoading from '@/components/AILoading';

const defaultCard: MedicalCardData = {
  name: '',
  birthDate: '',
  emergencyContacts: [
    { name: '', phone: '', relationship: '父母' },
    { name: '', phone: '', relationship: '父母' },
  ],
  bloodType: '不详',
  severeAllergies: '',
  majorDiseases: '',
  dailyMedications: '',
  surgeryHistory: '',
  aiAlertText: '',
  aiRescueText: '',
};

const bloodTypes = ['A型', 'B型', 'O型', 'AB型', '不详'];
const relationships = ['父母', '配偶', '子女', '兄弟姐妹', '其他'];

export default function MedicalCard() {
  const [cardData, setCardData] = useState<MedicalCardData>(defaultCard);
  const [loadingAlert, setLoadingAlert] = useState(false);
  const [loadingRescue, setLoadingRescue] = useState(false);

  const updateField = <K extends keyof MedicalCardData>(key: K, value: MedicalCardData[K]) => {
    setCardData((prev) => ({ ...prev, [key]: value }));
  };

  const updateContact = (index: number, field: keyof EmergencyContact, value: string) => {
    setCardData((prev) => {
      const contacts = [...prev.emergencyContacts];
      contacts[index] = { ...contacts[index], [field]: value };
      return { ...prev, emergencyContacts: contacts };
    });
  };

  const handleGenerateAlert = async () => {
    const keywords = [cardData.severeAllergies, cardData.majorDiseases].filter(Boolean).join('；');
    if (!keywords) return;
    setLoadingAlert(true);
    try {
      const res = await generateMedicalAlert(keywords);
      if (res.parsedJSON?.alertText) {
        updateField('aiAlertText', res.parsedJSON.alertText as string);
      } else {
        updateField('aiAlertText', res.content);
      }
    } finally {
      setLoadingAlert(false);
    }
  };

  const handleGenerateRescue = async () => {
    const history = [
      cardData.severeAllergies && `过敏：${cardData.severeAllergies}`,
      cardData.majorDiseases && `疾病：${cardData.majorDiseases}`,
      cardData.dailyMedications && `用药：${cardData.dailyMedications}`,
      cardData.surgeryHistory && `手术：${cardData.surgeryHistory}`,
    ].filter(Boolean).join('；');
    if (!history) return;
    setLoadingRescue(true);
    try {
      const res = await generateMedicalRescueText(history);
      if (res.parsedJSON?.rescueText) {
        updateField('aiRescueText', res.parsedJSON.rescueText as string);
      } else {
        updateField('aiRescueText', res.content);
      }
    } finally {
      setLoadingRescue(false);
    }
  };

  const handleExport = () => {
    exportAsImage('medical-card-preview', `医疗应急卡_${cardData.name || '未命名'}`);
  };

  const handlePrint = () => {
    alert('建议选择A4纸打印，裁剪后过塑保存');
    printCard();
  };

  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition';
  const labelCls = 'block text-sm font-medium text-dark-text/80 mb-1';

  return (
    <div className="pb-20 md:pb-0">
      <div className="flex items-center gap-3 mb-4">
        <Link to="/home-plan" className="p-2 rounded-lg hover:bg-gray-100 text-dark-text/60 hover:text-dark-text transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-title text-2xl text-brand-orange">个人医疗应急卡</h1>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-6 flex items-center gap-2">
        <Shield size={18} className="text-orange-500 shrink-0" />
        <p className="text-sm text-orange-700">🔒 您的信息仅用于本地生成卡片，不会被保存或上传。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-medium text-dark-text mb-3">基本信息</h3>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>姓名</label>
                <input type="text" className={inputCls} value={cardData.name} onChange={(e) => updateField('name', e.target.value)} placeholder="请输入姓名" />
              </div>
              <div>
                <label className={labelCls}>出生日期</label>
                <input type="date" className={inputCls} value={cardData.birthDate} onChange={(e) => updateField('birthDate', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>血型</label>
                <select className={inputCls} value={cardData.bloodType} onChange={(e) => updateField('bloodType', e.target.value)}>
                  {bloodTypes.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-medium text-dark-text mb-3">紧急联系人</h3>
            {[0, 1].map((idx) => (
              <div key={idx} className={idx === 0 ? 'space-y-3 mb-4 pb-4 border-b border-gray-100' : 'space-y-3'}>
                <p className="text-xs text-dark-text/50">联系人 {idx + 1}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>姓名</label>
                    <input type="text" className={inputCls} value={cardData.emergencyContacts[idx].name} onChange={(e) => updateContact(idx, 'name', e.target.value)} placeholder="姓名" />
                  </div>
                  <div>
                    <label className={labelCls}>电话</label>
                    <input type="tel" className={inputCls} value={cardData.emergencyContacts[idx].phone} onChange={(e) => updateContact(idx, 'phone', e.target.value)} placeholder="电话" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>关系</label>
                  <select className={inputCls} value={cardData.emergencyContacts[idx].relationship} onChange={(e) => updateContact(idx, 'relationship', e.target.value)}>
                    {relationships.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-medium text-dark-text mb-3">医疗信息</h3>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>严重过敏史</label>
                <textarea className={`${inputCls} resize-none`} rows={2} value={cardData.severeAllergies} onChange={(e) => updateField('severeAllergies', e.target.value)} placeholder="如：青霉素、花生等" />
              </div>
              <div>
                <label className={labelCls}>重大疾病史</label>
                <textarea className={`${inputCls} resize-none`} rows={2} value={cardData.majorDiseases} onChange={(e) => updateField('majorDiseases', e.target.value)} placeholder="如：糖尿病、高血压等" />
              </div>
              <div>
                <label className={labelCls}>日常用药</label>
                <textarea className={`${inputCls} resize-none`} rows={2} value={cardData.dailyMedications} onChange={(e) => updateField('dailyMedications', e.target.value)} placeholder="如：二甲双胍 500mg 每日两次" />
              </div>
              <div>
                <label className={labelCls}>手术史</label>
                <textarea className={`${inputCls} resize-none`} rows={2} value={cardData.surgeryHistory} onChange={(e) => updateField('surgeryHistory', e.target.value)} placeholder="如：阑尾切除术 2020年" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-medium text-dark-text mb-3">AI 智能生成</h3>
            <div className="space-y-3">
              <div>
                <button onClick={handleGenerateAlert} disabled={loadingAlert || (!cardData.severeAllergies && !cardData.majorDiseases)} className="flex items-center gap-2 px-4 py-2 bg-danger-red text-white rounded-lg text-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition">
                  <Sparkles size={16} />
                  生成核心警示语
                </button>
                {loadingAlert && <AILoading text="正在生成核心警示语..." />}
              </div>
              <div>
                <button onClick={handleGenerateRescue} disabled={loadingRescue || (!cardData.severeAllergies && !cardData.majorDiseases && !cardData.dailyMedications && !cardData.surgeryHistory)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition">
                  <Sparkles size={16} />
                  生成给救援者的话
                </button>
                {loadingRescue && <AILoading text="正在生成救援参考..." />}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-dark-text">卡片预览</h3>
          <div id="medical-card-preview" className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden" style={{ aspectRatio: '90/55', maxWidth: 540 }}>
            <div className="bg-danger-red px-4 py-2 flex items-center justify-between">
              <span className="text-white font-bold text-sm tracking-wider">医疗应急卡</span>
              {cardData.bloodType !== '不详' && (
                <span className="bg-white text-danger-red font-bold text-xs px-2 py-0.5 rounded">{cardData.bloodType}</span>
              )}
            </div>

            {cardData.aiAlertText && (
              <div className="bg-red-50 px-4 py-1.5 border-b border-red-100">
                <div className="flex items-start gap-1.5">
                  <AlertTriangle size={14} className="text-danger-red shrink-0 mt-0.5" />
                  <p className="text-xs text-danger-red font-bold leading-snug">{cardData.aiAlertText}</p>
                </div>
              </div>
            )}

            <div className="px-4 py-3 space-y-3">
              <div className="flex items-baseline gap-4">
                <div>
                  <span className="text-[10px] text-dark-text/50">姓名</span>
                  <p className="text-sm font-bold text-dark-text">{cardData.name || '—'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-dark-text/50">出生日期</span>
                  <p className="text-sm text-dark-text">{cardData.birthDate || '—'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-dark-text/50">血型</span>
                  <p className="text-sm font-bold text-danger-red">{cardData.bloodType}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-dark-text/50">紧急联系人</span>
                <div className="space-y-1 mt-1">
                  {cardData.emergencyContacts.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-dark-text">
                      <span className="font-medium">{c.name || '—'}</span>
                      <span className="text-dark-text/50">{c.relationship}</span>
                      <span>{c.phone || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                {cardData.severeAllergies && (
                  <div>
                    <span className="text-[10px] text-dark-text/50">过敏史</span>
                    <p className="text-dark-text leading-snug">{cardData.severeAllergies}</p>
                  </div>
                )}
                {cardData.majorDiseases && (
                  <div>
                    <span className="text-[10px] text-dark-text/50">疾病史</span>
                    <p className="text-dark-text leading-snug">{cardData.majorDiseases}</p>
                  </div>
                )}
                {cardData.dailyMedications && (
                  <div>
                    <span className="text-[10px] text-dark-text/50">日常用药</span>
                    <p className="text-dark-text leading-snug">{cardData.dailyMedications}</p>
                  </div>
                )}
                {cardData.surgeryHistory && (
                  <div>
                    <span className="text-[10px] text-dark-text/50">手术史</span>
                    <p className="text-dark-text leading-snug">{cardData.surgeryHistory}</p>
                  </div>
                )}
              </div>

              {cardData.aiRescueText && (
                <div className="bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
                  <span className="text-[10px] text-blue-600 font-medium">给救援者的话</span>
                  <p className="text-xs text-blue-800 leading-snug mt-0.5">{cardData.aiRescueText}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleExport} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-brand-orange text-white rounded-xl font-medium hover:bg-orange-600 transition">
              <Download size={18} />
              生成卡片
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-dark-text text-white rounded-xl font-medium hover:bg-gray-800 transition">
              <Printer size={18} />
              打印卡片
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
