import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, AlertCircle, MapPin, Check, X, Siren, Ambulance, Flame, RefreshCw, Copy, CheckCircle } from 'lucide-react';

type EmergencyType = 110 | 120 | 119;

interface EmergencyService {
  type: EmergencyType;
  name: string;
  icon: typeof Ambulance;
  color: string;
  description: string;
  bgColor: string;
}

const emergencyServices: EmergencyService[] = [
  {
    type: 110,
    name: '报警',
    icon: Siren,
    color: 'text-red-500',
    bgColor: 'bg-red-500',
    description: '刑事案件、治安案件、灾害事故',
  },
  {
    type: 120,
    name: '急救',
    icon: Ambulance,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500',
    description: '人员伤亡、突发疾病、意外事故',
  },
  {
    type: 119,
    name: '火警',
    icon: Flame,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
    description: '火灾、救援、危险品泄漏',
  },
];

interface EmergencyCallProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmergencyCall({ isOpen, onClose }: EmergencyCallProps) {
  const [step, setStep] = useState<'confirm' | 'select' | 'location' | 'complete'>('confirm');
  const [selectedType, setSelectedType] = useState<EmergencyType | null>(null);
  const [location, setLocation] = useState<string>('');
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [manualAddress, setManualAddress] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('confirm');
      setSelectedType(null);
      setLocation('');
      setLocationCoords(null);
      setLocationError(null);
      setManualAddress('');
      setShowManualInput(false);
      setCopied(false);
      setConfirmed(false);
    }
  }, [isOpen]);

  const getCurrentLocation = () => {
    setLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('您的浏览器不支持定位功能');
      setLoadingLocation(false);
      setShowManualInput(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocationCoords({ lat: latitude, lng: longitude });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=zh`
          );
          const data = await response.json();
          if (data.display_name) {
            const addressParts = data.display_name.split(',').slice(0, 4).join(',');
            setLocation(addressParts);
          } else {
            setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          }
        } catch {
          setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }

        setLoadingLocation(false);
      },
      (error) => {
        setLoadingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('定位权限被拒绝，请手动输入地址');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('无法获取位置信息，请手动输入地址');
            break;
          case error.TIMEOUT:
            setLocationError('定位请求超时，请手动输入地址');
            break;
          default:
            setLocationError('定位失败，请手动输入地址');
        }
        setShowManualInput(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  const handleConfirm = () => {
    setConfirmed(true);
    setStep('select');
  };

  const handleSelectType = (type: EmergencyType) => {
    setSelectedType(type);
    setStep('location');
  };

  const handleConfirmLocation = () => {
    if (location || manualAddress) {
      setStep('complete');
    }
  };

  const handleCopyAddress = () => {
    const addressToCopy = manualAddress || location;
    if (addressToCopy) {
      navigator.clipboard.writeText(addressToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCall = () => {
    if (selectedType) {
      window.location.href = `tel:${selectedType}`;
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            <div className={`p-4 ${selectedType ? emergencyServices.find(s => s.type === selectedType)?.bgColor : 'bg-gradient-to-r from-red-500 to-orange-500'} text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone size={20} />
                  <span className="font-title text-lg">一键报警</span>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-5">
              {step === 'confirm' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <AlertCircle size={24} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-700 mb-1">请确认是否真正需要报警</h3>
                      <p className="text-sm text-yellow-600/80">
                        一键报警功能仅在真正发生紧急情况时使用。虚假报警将浪费公共资源，可能影响真正需要帮助的人。
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={confirmed}
                        onChange={(e) => setConfirmed(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
                      />
                      <span className="text-sm text-dark-text">
                        我确认当前确实发生了紧急情况，需要报警求助
                      </span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleClose}
                      className="flex-1 py-3 rounded-xl bg-gray-100 text-dark-text/70 font-medium hover:bg-gray-200 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={!confirmed}
                      className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                        confirmed
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      确认报警
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 'select' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <p className="text-sm text-dark-text/60 text-center mb-4">
                    请选择您需要的报警类型
                  </p>

                  <div className="space-y-3">
                    {emergencyServices.map((service) => (
                      <motion.button
                        key={service.type}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectType(service.type)}
                        className={`w-full p-4 rounded-xl border-2 border-gray-100 hover:border-gray-200 transition-colors text-left flex items-center gap-4`}
                      >
                        <div className={`w-12 h-12 ${service.bgColor} rounded-xl flex items-center justify-center`}>
                          <service.icon size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-title text-lg text-dark-text">{service.type}</span>
                            <span className="text-sm text-dark-text/60">{service.name}</span>
                          </div>
                          <p className="text-xs text-dark-text/50 mt-0.5">{service.description}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 ${service.color} border-current flex items-center justify-center`}>
                          <Check size={14} />
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <button
                    onClick={() => setStep('confirm')}
                    className="w-full py-2 text-sm text-dark-text/50 hover:text-dark-text/70 transition-colors"
                  >
                    返回上一步
                  </button>
                </motion.div>
              )}

              {step === 'location' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-4">
                    <p className="text-sm text-dark-text/60">正在获取您的位置信息</p>
                  </div>

                  {loadingLocation && (
                    <div className="flex flex-col items-center py-6">
                      <RefreshCw size={32} className="text-brand-orange animate-spin mb-3" />
                      <p className="text-sm text-dark-text/60">正在定位...</p>
                    </div>
                  )}

                  {locationError && !showManualInput && (
                    <div className="flex flex-col items-center py-4">
                      <AlertCircle size={32} className="text-yellow-500 mb-3" />
                      <p className="text-sm text-yellow-600 text-center mb-3">{locationError}</p>
                      <button
                        onClick={() => setShowManualInput(true)}
                        className="px-4 py-2 bg-brand-orange/10 text-brand-orange rounded-lg text-sm hover:bg-brand-orange/20 transition-colors"
                      >
                        手动输入地址
                      </button>
                    </div>
                  )}

                  {(location || showManualInput) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-start gap-2 mb-2">
                          <MapPin size={18} className="text-brand-orange mt-0.5" />
                          <span className="text-sm font-medium text-dark-text">
                            {showManualInput ? '手动输入地址' : '您的位置'}
                          </span>
                        </div>
                        {showManualInput ? (
                          <textarea
                            value={manualAddress}
                            onChange={(e) => setManualAddress(e.target.value)}
                            placeholder="请输入您的详细地址，如：XX省XX市XX区XX路XX号"
                            className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
                            rows={3}
                          />
                        ) : (
                          <p className="text-sm text-dark-text/70 leading-relaxed">{location}</p>
                        )}
                        {locationCoords && !showManualInput && (
                          <p className="text-xs text-dark-text/40 mt-2">
                            坐标: {locationCoords.lat.toFixed(6)}, {locationCoords.lng.toFixed(6)}
                          </p>
                        )}
                      </div>

                      {!showManualInput && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowManualInput(true)}
                            className="flex-1 py-2.5 text-sm text-dark-text/60 hover:text-dark-text bg-gray-50 rounded-lg transition-colors"
                          >
                            修改地址
                          </button>
                          <button
                            onClick={getCurrentLocation}
                            className="flex-1 py-2.5 text-sm text-brand-orange hover:bg-brand-orange/5 rounded-lg transition-colors flex items-center justify-center gap-1"
                          >
                            <RefreshCw size={14} />
                            重新定位
                          </button>
                        </div>
                      )}

                      {showManualInput && (
                        <button
                          onClick={getCurrentLocation}
                          className="w-full py-2.5 text-sm text-brand-orange hover:bg-brand-orange/5 rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <MapPin size={14} />
                          使用当前位置
                        </button>
                      )}
                    </motion.div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setStep('select')}
                      className="flex-1 py-3 rounded-xl bg-gray-100 text-dark-text/70 font-medium hover:bg-gray-200 transition-colors"
                    >
                      返回
                    </button>
                    <button
                      onClick={handleConfirmLocation}
                      disabled={!location && !manualAddress}
                      className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                        location || manualAddress
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      确认位置
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 'complete' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="text-center py-2">
                    <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
                    <h3 className="font-title text-lg text-dark-text mb-1">报警信息已准备就绪</h3>
                    <p className="text-sm text-dark-text/60">
                      点击下方按钮拨打电话，准确报告您所在位置
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-dark-text/60">报警类型</span>
                      <span className={`font-bold text-lg ${
                        selectedType === 110 ? 'text-red-500' :
                        selectedType === 120 ? 'text-orange-500' : 'text-blue-500'
                      }`}>
                        {selectedType}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-brand-orange mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm text-dark-text/60">报警地址</span>
                        <p className="text-sm text-dark-text mt-0.5">
                          {manualAddress || location}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCopyAddress}
                      className="mt-2 flex items-center gap-1 text-xs text-brand-orange hover:text-brand-orange/80 transition-colors"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? '已复制' : '复制地址'}
                    </button>
                  </div>

                  <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                    <p className="text-xs text-yellow-700">
                      <strong>提示：</strong>拨打报警电话后，请准确报告：1. 灾害类型和情况 2. 您的详细地址 3. 您的联系方式 4. 是否有人员伤亡
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCall}
                    className={`w-full py-4 rounded-xl text-white font-title text-xl flex items-center justify-center gap-3 ${
                      selectedType === 110 ? 'bg-red-500 hover:bg-red-600' :
                      selectedType === 120 ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-500 hover:bg-blue-600'
                    } transition-colors shadow-lg`}
                  >
                    <Phone size={24} />
                    立即拨打 {selectedType}
                  </motion.button>

                  <button
                    onClick={handleClose}
                    className="w-full py-2 text-sm text-dark-text/50 hover:text-dark-text/70 transition-colors"
                  >
                    关闭
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
