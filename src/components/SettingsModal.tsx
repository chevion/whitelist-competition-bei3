import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Globe, Trash2 } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { provinces } from '@/data/provinces';
import { setApiKey as saveApiKey, setBaseUrl as saveBaseUrl, setProvince as saveProvince, getApiKey, getBaseUrl, getProvince, clearAll } from '@/services/storageService';

export default function SettingsModal() {
  const { showSettings, setShowSettings, setProvince, setApiKey, setBaseUrl } = useAppStore();

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [baseUrlInput, setBaseUrlInput] = useState('');
  const [provinceInput, setProvinceInput] = useState('');

  useEffect(() => {
    if (showSettings) {
      setApiKeyInput(getApiKey());
      setBaseUrlInput(getBaseUrl() || 'https://api.openai.com/v1');
      setProvinceInput(getProvince() || useAppStore.getState().province);
    }
  }, [showSettings]);

  const handleSave = () => {
    saveApiKey(apiKeyInput);
    saveBaseUrl(baseUrlInput);
    saveProvince(provinceInput);
    setApiKey(apiKeyInput);
    setBaseUrl(baseUrlInput);
    setProvince(provinceInput);
    setShowSettings(false);
  };

  const handleClear = () => {
    if (confirm('确定要清除所有本地数据吗？这将删除你的API密钥和所有保存的信息。')) {
      clearAll();
      setApiKeyInput('');
      setProvinceInput('');
      setProvince('');
      setApiKey('');
      setBaseUrl('');
    }
  };

  return (
    <AnimatePresence>
      {showSettings && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4"
          onClick={() => setShowSettings(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-title text-xl text-brand-orange">设置</h2>
              <button onClick={() => setShowSettings(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-dark-text/60">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-dark-text mb-2">
                  <Globe size={16} className="text-brand-orange" />
                  所在省份
                </label>
                <select
                  value={provinceInput}
                  onChange={(e) => setProvinceInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-warm-white text-dark-text outline-none focus:border-brand-orange transition-colors"
                >
                  <option value="">请选择省份</option>
                  {provinces.map((p) => (
                    <option key={p.name} value={p.name}>{p.name}</option>
                  ))}
                </select>
                <p className="text-xs text-dark-text/40 mt-1">用于匹配你所在地区的常见灾害风险</p>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-dark-text mb-2">
                  <Key size={16} className="text-brand-orange" />
                  API 密钥
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="输入你的 OpenAI 兼容 API Key"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-warm-white text-dark-text outline-none focus:border-brand-orange transition-colors"
                />
                <p className="text-xs text-dark-text/40 mt-1">密钥仅存储在本地浏览器中，不会上传到任何服务器</p>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-dark-text mb-2">
                  API 基础地址
                </label>
                <input
                  type="url"
                  value={baseUrlInput}
                  onChange={(e) => setBaseUrlInput(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-warm-white text-dark-text outline-none focus:border-brand-orange transition-colors"
                />
                <p className="text-xs text-dark-text/40 mt-1">支持 OpenAI 兼容格式的 API 地址</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-orange-400 text-white font-medium hover:shadow-lg active:scale-[0.98] transition-all"
                >
                  保存设置
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-dark-text/60 hover:bg-red-50 hover:text-danger-red hover:border-danger-red/30 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 size={16} />
                  清除数据
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
