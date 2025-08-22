export interface EmotionConfig {
  color: string;
  icon: string;
  bgColor: string;
  textColor: string;
}

export const emotionColorMap: Record<string, EmotionConfig> = {
  joy: { 
    color: "text-yellow-400", 
    icon: "😊", 
    bgColor: "bg-yellow-900", 
    textColor: "text-yellow-300" 
  },
  happiness: { 
    color: "text-yellow-400", 
    icon: "😊", 
    bgColor: "bg-yellow-900", 
    textColor: "text-yellow-300" 
  },
  excitement: { 
    color: "text-orange-400", 
    icon: "🤩", 
    bgColor: "bg-orange-900", 
    textColor: "text-orange-300" 
  },
  gratitude: { 
    color: "text-green-400", 
    icon: "🙏", 
    bgColor: "bg-green-900", 
    textColor: "text-green-300" 
  },
  love: { 
    color: "text-pink-400", 
    icon: "💖", 
    bgColor: "bg-pink-900", 
    textColor: "text-pink-300" 
  },
  pride: { 
    color: "text-purple-400", 
    icon: "😌", 
    bgColor: "bg-purple-900", 
    textColor: "text-purple-300" 
  },
  optimism: { 
    color: "text-blue-400", 
    icon: "😇", 
    bgColor: "bg-blue-900", 
    textColor: "text-blue-300" 
  },
  sadness: { 
    color: "text-blue-400", 
    icon: "😢", 
    bgColor: "bg-blue-900", 
    textColor: "text-blue-300" 
  },
  grief: { 
    color: "text-gray-400", 
    icon: "😔", 
    bgColor: "bg-gray-900", 
    textColor: "text-gray-300" 
  },
  disappointment: { 
    color: "text-gray-400", 
    icon: "😞", 
    bgColor: "bg-gray-900", 
    textColor: "text-gray-300" 
  },
  remorse: { 
    color: "text-gray-400", 
    icon: "😣", 
    bgColor: "bg-gray-900", 
    textColor: "text-gray-300" 
  },
  anxiety: { 
    color: "text-indigo-400", 
    icon: "😰", 
    bgColor: "bg-indigo-900", 
    textColor: "text-indigo-300" 
  },
  fear: { 
    color: "text-red-400", 
    icon: "😨", 
    bgColor: "bg-red-900", 
    textColor: "text-red-300" 
  },
  nervousness: { 
    color: "text-indigo-400", 
    icon: "😬", 
    bgColor: "bg-indigo-900", 
    textColor: "text-indigo-300" 
  },
  anger: { 
    color: "text-red-400", 
    icon: "😠", 
    bgColor: "bg-red-900", 
    textColor: "text-red-300" 
  },
  annoyance: { 
    color: "text-orange-400", 
    icon: "😤", 
    bgColor: "bg-orange-900", 
    textColor: "text-orange-300" 
  },
  frustration: { 
    color: "text-red-400", 
    icon: "😤", 
    bgColor: "bg-red-900", 
    textColor: "text-red-300" 
  },
  confusion: { 
    color: "text-gray-400", 
    icon: "😕", 
    bgColor: "bg-gray-900", 
    textColor: "text-gray-300" 
  },
  curiosity: { 
    color: "text-purple-400", 
    icon: "🤔", 
    bgColor: "bg-purple-900", 
    textColor: "text-purple-300" 
  },
  surprise: { 
    color: "text-yellow-400", 
    icon: "😲", 
    bgColor: "bg-yellow-900", 
    textColor: "text-yellow-300" 
  },
  neutral: { 
    color: "text-gray-400", 
    icon: "😐", 
    bgColor: "bg-gray-900", 
    textColor: "text-gray-300" 
  },
  caring: { 
    color: "text-green-400", 
    icon: "🤗", 
    bgColor: "bg-green-900", 
    textColor: "text-green-300" 
  },
  admiration: { 
    color: "text-purple-400", 
    icon: "😍", 
    bgColor: "bg-purple-900", 
    textColor: "text-purple-300" 
  },
  amusement: { 
    color: "text-yellow-400", 
    icon: "😄", 
    bgColor: "bg-yellow-900", 
    textColor: "text-yellow-300" 
  },
  approval: { 
    color: "text-green-400", 
    icon: "👍", 
    bgColor: "bg-green-900", 
    textColor: "text-green-300" 
  },
  desire: { 
    color: "text-pink-400", 
    icon: "💭", 
    bgColor: "bg-pink-900", 
    textColor: "text-pink-300" 
  },
  disapproval: { 
    color: "text-red-400", 
    icon: "👎", 
    bgColor: "bg-red-900", 
    textColor: "text-red-300" 
  },
  disgust: { 
    color: "text-green-400", 
    icon: "🤢", 
    bgColor: "bg-green-900", 
    textColor: "text-green-300" 
  },
  embarrassment: { 
    color: "text-pink-400", 
    icon: "😳", 
    bgColor: "bg-pink-900", 
    textColor: "text-pink-300" 
  },
  relief: { 
    color: "text-blue-400", 
    icon: "😌", 
    bgColor: "bg-blue-900", 
    textColor: "text-blue-300" 
  },
  realization: { 
    color: "text-yellow-400", 
    icon: "💡", 
    bgColor: "bg-yellow-900", 
    textColor: "text-yellow-300" 
  }
};

export const getEmotionConfig = (emotion: string): EmotionConfig => {
  return emotionColorMap[emotion.toLowerCase()] || emotionColorMap.neutral;
};

export const getEmotionColor = (emotion: string): string => {
  return getEmotionConfig(emotion).textColor;
};
