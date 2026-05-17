import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Heart, Home, Shield, ChevronRight } from 'lucide-react';
import ElephantMascot from '@/components/ElephantMascot';
import { useAppStore } from '@/stores/appStore';
import { provinces } from '@/data/provinces';
import { calculateSupplies } from '@/utils/calculateSupplies';
import { setFamilyInfo, setCalculatedSupplies } from '@/services/storageService';
import type { FamilyInfo } from '@/types';

const housingOptions: { value: FamilyInfo['housingType']; label: string }[] = [
  { value: 'apartment', label: '高层公寓' },
  { value: 'house', label: '多层住宅' },
  { value: 'dormitory', label: '平房' },
  { value: 'other', label: '农村自建房/其他' },
];

const initialForm: FamilyInfo = {
  totalPeople: 3,
  elderly: 0,
  children: 0,
  infants: 0,
  hasChronicDisease: false,
  chronicDetails: '',
  housingType: 'apartment',
  disasters: [],
};

export default function SuppliesForm() {
  const navigate = useNavigate();
  const province = useAppStore((s) => s.province);

  const [form, setForm] = useState<FamilyInfo>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const disasterOptions = useMemo(() => {
    const found = provinces.find((p) => p.name === province);
    return found ? found.commonDisasters : ['地震', '洪水', '火灾', '台风'];
  }, [province]);

  const updateField = <K extends keyof FamilyInfo>(key: K, value: FamilyInfo[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const toggleDisaster = (disaster: string) => {
    setForm((prev) => ({
      ...prev,
      disasters: prev.disasters.includes(disaster)
        ? prev.disasters.filter((d) => d !== disaster)
        : [...prev.disasters, disaster],
    }));
    if (errors.disasters) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.disasters;
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const specialSum = form.elderly + form.children + form.infants;
    if (form.totalPeople < specialSum) {
      newErrors.totalPeople = '总人数不能少于老人+儿童+婴儿之和';
    }
    if (form.totalPeople < 1) {
      newErrors.totalPeople = '至少需要1人';
    }
    if (form.disasters.length === 0) {
      newErrors.disasters = '请至少选择一种灾害';
    }
    if (form.hasChronicDisease && !form.chronicDetails.trim()) {
      newErrors.chronicDetails = '请填写慢性病详情';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const supplies = calculateSupplies(form);
    setFamilyInfo(form);
    setCalculatedSupplies(supplies);
    navigate('/supplies/result');
  };

  return (
    <div className="max-w-2xl mx-auto pb-24 md:pb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-2 mb-8"
      >
        <ElephantMascot
          mood="excited"
          size="lg"
          message="告诉我你家的情况，我来帮你准备应急包！"
        />
      </motion.div>

      <div className="space-y-6">
        {/* 家庭成员 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-brand-orange/10 text-brand-orange">
              <Users size={20} />
            </div>
            <h3 className="font-title text-lg text-dark-text">家庭成员</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-dark-text/70 mb-1">家庭总人数</label>
              <input
                type="number"
                min={1}
                max={20}
                value={form.totalPeople}
                onChange={(e) => updateField('totalPeople', Math.max(1, parseInt(e.target.value) || 1))}
                className={`w-full px-3 py-2 rounded-xl border bg-warm-white text-dark-text outline-none transition-colors ${
                  errors.totalPeople ? 'border-danger-red' : 'border-gray-200 focus:border-brand-orange'
                }`}
              />
              {errors.totalPeople && (
                <p className="text-danger-red text-xs mt-1">{errors.totalPeople}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-dark-text/70 mb-1">老人数</label>
              <input
                type="number"
                min={0}
                max={10}
                value={form.elderly}
                onChange={(e) => updateField('elderly', Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-warm-white text-dark-text outline-none focus:border-brand-orange transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-dark-text/70 mb-1">儿童数</label>
              <input
                type="number"
                min={0}
                max={10}
                value={form.children}
                onChange={(e) => updateField('children', Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-warm-white text-dark-text outline-none focus:border-brand-orange transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-dark-text/70 mb-1">婴儿数</label>
              <input
                type="number"
                min={0}
                max={5}
                value={form.infants}
                onChange={(e) => updateField('infants', Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-warm-white text-dark-text outline-none focus:border-brand-orange transition-colors"
              />
            </div>
          </div>
        </motion.section>

        {/* 健康状况 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-danger-red/10 text-danger-red">
              <Heart size={20} />
            </div>
            <h3 className="font-title text-lg text-dark-text">健康状况</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-text/70">是否有慢性病患者</span>
              <button
                type="button"
                onClick={() => updateField('hasChronicDisease', !form.hasChronicDisease)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  form.hasChronicDisease ? 'bg-brand-orange' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    form.hasChronicDisease ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {form.hasChronicDisease && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm text-dark-text/70 mb-1">慢性病详情</label>
                <input
                  type="text"
                  value={form.chronicDetails}
                  onChange={(e) => updateField('chronicDetails', e.target.value)}
                  placeholder="如：高血压、糖尿病等"
                  className={`w-full px-3 py-2 rounded-xl border bg-warm-white text-dark-text outline-none transition-colors ${
                    errors.chronicDetails ? 'border-danger-red' : 'border-gray-200 focus:border-brand-orange'
                  }`}
                />
                {errors.chronicDetails && (
                  <p className="text-danger-red text-xs mt-1">{errors.chronicDetails}</p>
                )}
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* 住宅类型 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Home size={20} />
            </div>
            <h3 className="font-title text-lg text-dark-text">住宅类型</h3>
          </div>

          <select
            value={form.housingType}
            onChange={(e) => updateField('housingType', e.target.value as FamilyInfo['housingType'])}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-warm-white text-dark-text outline-none focus:border-brand-orange transition-colors appearance-none"
          >
            {housingOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </motion.section>

        {/* 防范灾害 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-safety-green/10 text-safety-green">
              <Shield size={20} />
            </div>
            <h3 className="font-title text-lg text-dark-text">防范灾害</h3>
          </div>

          {errors.disasters && (
            <p className="text-danger-red text-xs mb-3">{errors.disasters}</p>
          )}

          <div className="flex flex-wrap gap-2">
            {disasterOptions.map((disaster) => {
              const selected = form.disasters.includes(disaster);
              return (
                <button
                  key={disaster}
                  type="button"
                  onClick={() => toggleDisaster(disaster)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selected
                      ? 'bg-brand-orange text-white shadow-sm'
                      : 'bg-gray-100 text-dark-text/60 hover:bg-gray-200'
                  }`}
                >
                  {disaster}
                </button>
              );
            })}
          </div>

          {province && (
            <p className="text-dark-text/40 text-xs mt-3">
              基于{province}地区常见灾害推荐
            </p>
          )}
        </motion.section>
      </div>

      {/* 提交按钮 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <button
          onClick={handleSubmit}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-orange to-orange-400 text-white font-title text-lg shadow-lg shadow-brand-orange/30 hover:shadow-xl hover:shadow-brand-orange/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          生成我的应急物资清单
          <ChevronRight size={20} />
        </button>
      </motion.div>
    </div>
  );
}
