import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, User, Heart, Search, Users, Zap, Briefcase, Smile, PenTool } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LifeStage {
  stage: string;
  description: string;
  bgColor: string;
  iconColor: string;
}

interface Character {
  id: number;
  name: string;
  role: string;
  icon: React.ReactNode;
  bgGradient: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  lifeStages: LifeStage[];
  engaged?: boolean;
}

const CharacterShowcase: React.FC = () => {
  const [currentCharacter, setCurrentCharacter] = useState(0);
  const [engagedCharacter, setEngagedCharacter] = useState<number | null>(null);
  const [selectedLifeStage, setSelectedLifeStage] = useState<{ [key: number]: number }>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const lastScrollTime = useRef<number>(0);

  // Load engaged character from localStorage
  const loadEngagedCharacter = (): {
    characterId: number;
    role: string;
    lifeStage: { stage: string; description: string };
  } | null => {
    const saved = localStorage.getItem('engagedCharacter');
    if (!saved) return null;

    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  };


  // Save engaged character to localStorage
  const saveEngagedCharacter = (
    characterId: number | null,
    lifeStageIndex?: number
  ) => {
    if (characterId === null || lifeStageIndex === undefined) {
      localStorage.removeItem('engagedCharacter');
    } else {
      const character = characters.find(c => c.id === characterId);
      if (!character) return;

      const lifeStage = character.lifeStages[lifeStageIndex];
      if (!lifeStage) return;

      const dataToSave = {
        characterId,
        role: character.role,
        lifeStage: {
          stage: lifeStage.stage,
          description: lifeStage.description,
        }
      };

      localStorage.setItem('engagedCharacter', JSON.stringify(dataToSave));
    }
  };


  const characters: Character[] = [
    {
      id: 1,
      name: "Zara",
      role: "Teacher",
      icon: <User className="w-12 h-12" />,
      bgGradient: "from-blue-400 via-indigo-400 to-purple-500",
      primaryColor: "text-white",
      secondaryColor: "bg-blue-300",
      accentColor: "bg-indigo-600",
      lifeStages: [
        {
          stage: "Child",
          description: "I'm a mini teacher with a serious crayon addiction. Homework? It's just drawings of cats!",
          bgColor: "bg-yellow-200",
          iconColor: "text-yellow-600"
        },
        {
          stage: "Teen",
          description: "I'll teach you algebra and sarcasm—both essential for survival in school.",
          bgColor: "bg-orange-200",
          iconColor: "text-orange-600"
        },
        {
          stage: "Adult",
          description: "I've got lesson plans, life hacks, and enough coffee to run a small school.",
          bgColor: "bg-blue-200",
          iconColor: "text-blue-600"
        },
        {
          stage: "Senior",
          description: "I've seen chalkboards, whiteboards, and smartboards—wisdom? I invented that syllabus.",
          bgColor: "bg-purple-200",
          iconColor: "text-purple-600"
        }
      ]
    },
    {
      id: 2,
      name: "Jade",
      role: "Psychologist",
      icon: <Heart className="w-12 h-12" />,
      bgGradient: "from-emerald-400 via-teal-400 to-cyan-500",
      primaryColor: "text-white",
      secondaryColor: "bg-emerald-300",
      accentColor: "bg-teal-600",
      lifeStages: [
        {
          stage: "Child",
          description: "Tell me how you feel... using crayon colors or cookie choices. I won't judge.",
          bgColor: "bg-pink-200",
          iconColor: "text-pink-600"
        },
        {
          stage: "Teen",
          description: "I speak fluent overthinking—let's untangle your brain spaghetti together.",
          bgColor: "bg-green-200",
          iconColor: "text-green-600"
        },
        {
          stage: "Adult",
          description: "Therapy, but with metaphors and maybe snacks. Let's talk grown-up chaos.",
          bgColor: "bg-teal-200",
          iconColor: "text-teal-600"
        },
        {
          stage: "Senior",
          description: "I offer calm, understanding, and emotional support drawn from a lifetime of listening.",
          bgColor: "bg-emerald-200",
          iconColor: "text-emerald-600"
        }
      ]
    },
    {
      id: 3,
      name: "Alex",
      role: "Detective",
      icon: <Search className="w-12 h-12" />,
      bgGradient: "from-gray-400 via-slate-400 to-zinc-500",
      primaryColor: "text-white",
      secondaryColor: "bg-gray-300",
      accentColor: "bg-slate-600",
      lifeStages: [
        {
          stage: "Child",
          description: "I'm a curious little sleuth who loves solving puzzles and finding hidden clues!",
          bgColor: "bg-yellow-200",
          iconColor: "text-yellow-600"
        },
        {
          stage: "Teen",
          description: "I notice the details others miss—let's uncover the truth together.",
          bgColor: "bg-blue-200",
          iconColor: "text-blue-600"
        },
        {
          stage: "Adult",
          description: "I'm sharp and analytical, helping you solve real-life mysteries with logic and intuition.",
          bgColor: "bg-gray-200",
          iconColor: "text-gray-600"
        },
        {
          stage: "Senior",
          description: "I'm a seasoned investigator with years of experience in reading between the lines.",
          bgColor: "bg-slate-200",
          iconColor: "text-slate-600"
        }
      ]
    },
    {
      id: 4,
      name: "Clara",
      role: "Friend",
      icon: <Users className="w-12 h-12" />,
      bgGradient: "from-pink-400 via-rose-400 to-red-500",
      primaryColor: "text-white",
      secondaryColor: "bg-pink-300",
      accentColor: "bg-rose-600",
      lifeStages: [
        {
          stage: "Child",
          description: "I'm your fun and loyal buddy, always ready to play, share snacks, and cheer you up!",
          bgColor: "bg-pink-200",
          iconColor: "text-pink-600"
        },
        {
          stage: "Teen",
          description: "I'm here through every mood swing, heartbreak, and meme—just a message away.",
          bgColor: "bg-purple-200",
          iconColor: "text-purple-600"
        },
        {
          stage: "Adult",
          description: "Count on me to be your support system, no matter how hectic life gets.",
          bgColor: "bg-rose-200",
          iconColor: "text-rose-600"
        },
        {
          stage: "Senior",
          description: "I'm the friend who's stayed through decades—warm, trustworthy, and always nearby.",
          bgColor: "bg-red-200",
          iconColor: "text-red-600"
        }
      ]
    },
    {
      id: 5,
      name: "Rick",
      role: "Motivator",
      icon: <Zap className="w-12 h-12" />,
      bgGradient: "from-orange-400 via-amber-400 to-yellow-500",
      primaryColor: "text-white",
      secondaryColor: "bg-orange-300",
      accentColor: "bg-amber-600",
      lifeStages: [
        {
          stage: "Child",
          description: "I cheer you on with high-fives and smiles—you can do anything you dream of!",
          bgColor: "bg-yellow-200",
          iconColor: "text-yellow-600"
        },
        {
          stage: "Teen",
          description: "I inspire you to push through pressure and believe in your unique spark.",
          bgColor: "bg-orange-200",
          iconColor: "text-orange-600"
        },
        {
          stage: "Adult",
          description: "I'm your inner fire—igniting confidence and purpose in everything you do.",
          bgColor: "bg-amber-200",
          iconColor: "text-amber-600"
        },
        {
          stage: "Senior",
          description: "I help you stay energized and positive, reminding you it's never too late to shine.",
          bgColor: "bg-yellow-200",
          iconColor: "text-yellow-600"
        }
      ]
    },
    {
      id: 6,
      name: "Mark",
      role: "Professional",
      icon: <Briefcase className="w-12 h-12" />,
      bgGradient: "from-slate-400 via-gray-500 to-zinc-600",
      primaryColor: "text-white",
      secondaryColor: "bg-slate-300",
      accentColor: "bg-gray-700",
      lifeStages: [
        {
          stage: "Child",
          description: "I help you dream big—pretending to be a doctor, astronaut, or anything you imagine!",
          bgColor: "bg-blue-200",
          iconColor: "text-blue-600"
        },
        {
          stage: "Teen",
          description: "I guide you toward your career goals with smart planning and real-world prep.",
          bgColor: "bg-indigo-200",
          iconColor: "text-indigo-600"
        },
        {
          stage: "Adult",
          description: "I bring focus, structure, and confidence to your professional journey.",
          bgColor: "bg-slate-200",
          iconColor: "text-slate-600"
        },
        {
          stage: "Senior",
          description: "I honor your achievements and help you pass on your legacy with grace.",
          bgColor: "bg-gray-200",
          iconColor: "text-gray-600"
        }
      ]
    },
    {
      id: 7,
      name: "Ria",
      role: "Funny",
      icon: <Smile className="w-12 h-12" />,
      bgGradient: "from-lime-400 via-green-400 to-emerald-500",
      primaryColor: "text-white",
      secondaryColor: "bg-lime-300",
      accentColor: "bg-green-600",
      lifeStages: [
        {
          stage: "Child",
          description: "I tell knock-knock jokes, wear socks on my hands, and believe giggles are magic spells.",
          bgColor: "bg-lime-200",
          iconColor: "text-lime-600"
        },
        {
          stage: "Teen",
          description: "I roast my friends (with love), do impressions of teachers, and make memes out of math problems.",
          bgColor: "bg-green-200",
          iconColor: "text-green-600"
        },
        {
          stage: "Adult",
          description: "I survive life with bad puns, coffee-fueled sarcasm, and the occasional dance in the kitchen.",
          bgColor: "bg-emerald-200",
          iconColor: "text-emerald-600"
        },
        {
          stage: "Senior",
          description: "I've got jokes older than your playlist—and yes, I still laugh at them louder than anyone else!",
          bgColor: "bg-teal-200",
          iconColor: "text-teal-600"
        }
      ]
    },
    {
      id: 8,
      name: "Tina",
      role: "Poet",
      icon: <PenTool className="w-12 h-12" />,
      bgGradient: "from-violet-400 via-purple-400 to-fuchsia-500",
      primaryColor: "text-white",
      secondaryColor: "bg-violet-300",
      accentColor: "bg-purple-600",
      lifeStages: [
        {
          stage: "Child",
          description: "I see the world in colors and rhymes, turning playground stories into tiny poems.",
          bgColor: "bg-violet-200",
          iconColor: "text-violet-600"
        },
        {
          stage: "Teen",
          description: "I scribble feelings in secret notebooks, chasing the music of words and teenage dreams.",
          bgColor: "bg-purple-200",
          iconColor: "text-purple-600"
        },
        {
          stage: "Adult",
          description: "I craft verses that capture life's chaos and beauty—sometimes serious, sometimes playful.",
          bgColor: "bg-fuchsia-200",
          iconColor: "text-fuchsia-600"
        },
        {
          stage: "Senior",
          description: "I weave memories into gentle poems, sharing wisdom wrapped in metaphor and melody.",
          bgColor: "bg-pink-200",
          iconColor: "text-pink-600"
        }
      ]
    }
  ];

  // Add custom styles to document head
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        33% { transform: translateY(-15px) rotate(5deg); }
        66% { transform: translateY(-5px) rotate(-5deg); }
      }
      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.3); }
        50% { box-shadow: 0 0 30px rgba(255, 255, 255, 0.6); }
      }
      .float-animation {
        animation: float ease-in-out infinite;
      }
      .pulse-glow {
        animation: pulse-glow 2s ease-in-out infinite;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Load engaged character on component mount
  useEffect(() => {
    const savedEngaged = loadEngagedCharacter();
    if (savedEngaged) {
      setEngagedCharacter(savedEngaged.characterId);
      // Optionally, set a state for role and lifeStage if you want to use them in UI
      // e.g. setEngagedRole(savedEngaged.role)
      // e.g. setEngagedLifeStage(savedEngaged.lifeStage)
    } else {
      setEngagedCharacter(null);
    }
  }, []);


  const currentCharacterData = characters[currentCharacter];
  const currentLifeStageIndex = selectedLifeStage[currentCharacter] || 0;
  const currentLifeStage = currentCharacterData.lifeStages[currentLifeStageIndex];

  const handleScroll = (direction: 'up' | 'down') => {
    const now = Date.now();
    if (now - lastScrollTime.current < 1000) return;
    
    lastScrollTime.current = now;
    setIsTransitioning(true);
    
    setTimeout(() => {
      if (direction === 'down' && currentCharacter < characters.length - 1) {
        setCurrentCharacter(prev => prev + 1);
      } else if (direction === 'up' && currentCharacter > 0) {
        setCurrentCharacter(prev => prev - 1);
      }
      setIsTransitioning(false);
    }, 300);
  };

  const handleLifeStageChange = (stageIndex: number) => {
    setSelectedLifeStage(prev => ({
      ...prev,
      [currentCharacter]: stageIndex
    }));
  };

  const handleToggleEngage = (characterId: number) => {
    const newEngaged = engagedCharacter === characterId ? null : characterId;

    // Assume you track selected life stage index for each character:
    const lifeStageIndex = selectedLifeStage[characterId] ?? 0;

    setEngagedCharacter(newEngaged);
    saveEngagedCharacter(newEngaged, lifeStageIndex);
  };


  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      handleScroll('down');
    } else {
      handleScroll('up');
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleScroll('down');
      } else {
        handleScroll('up');
      }
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentCharacter]);

  const FloatingElements = ({ character }: { character: Character }) => (
    <div className="absolute inset-0 pointer-events-none">
      {/* Floating character-themed elements */}
      <div 
        className={`absolute top-20 left-16 w-16 h-16 ${character.secondaryColor} rounded-full opacity-60 transition-all duration-1000 float-animation`}
        style={{ animationDuration: '6s', animationDelay: '0s' }}
      />
      <div 
        className={`absolute top-32 right-20 w-12 h-12 ${character.secondaryColor} rounded-full opacity-50 transition-all duration-1000 float-animation`}
        style={{ animationDuration: '4s', animationDelay: '1s' }}
      />
      <div 
        className={`absolute bottom-40 left-10 w-20 h-20 ${character.secondaryColor} rounded-full opacity-40 transition-all duration-1000 float-animation`}
        style={{ animationDuration: '5s', animationDelay: '2s' }}
      />
      <div 
        className={`absolute top-1/2 right-16 w-14 h-14 ${character.secondaryColor} rounded-full opacity-45 transition-all duration-1000 float-animation`}
        style={{ animationDuration: '7s', animationDelay: '0.5s' }}
      />
    </div>
  );

  const CharacterCard = ({ character, lifeStage, isEngaged, onToggle }: { 
    character: Character; 
    lifeStage: LifeStage; 
    isEngaged: boolean;
    onToggle: (id: number) => void;
  }) => (
    <div 
      className={`relative transition-all duration-1000 cursor-pointer ${
        isTransitioning ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
      } ${
        isEngaged ? 'z-50 scale-105' : 'z-10 scale-100'
      }`}
      onClick={() => onToggle(character.id)}
    >
      {/* Character Card */}
      <div className={`w-80 h-96 bg-white rounded-3xl relative overflow-hidden transition-all duration-300 ${
        isEngaged ? 'shadow-2xl shadow-black/20' : 'shadow-none'
      } hover:shadow-lg`}>
        {/* Status Label */}
        <div className="absolute top-4 left-4 z-20">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              isEngaged
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {isEngaged ? 'Engaged' : 'Not Engaged'}
          </span>
        </div>

        {/* Character illustration area */}
        <div className={`h-48 ${lifeStage.bgColor} flex items-center justify-center transition-all duration-500`}>
          <div className={`${lifeStage.iconColor} transition-all duration-500 pulse-glow`}>
            {character.icon}
          </div>
        </div>
        
        {/* Character info */}
        <div className="p-6 h-48 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold text-gray-800">{character.name}</h2>
              <span className={`px-3 py-1 ${character.secondaryColor} text-gray-700 rounded-full text-sm font-medium`}>
                {character.role}
              </span>
            </div>
            <div className="mb-4">
              <span className={`px-2 py-1 ${lifeStage.bgColor} ${lifeStage.iconColor} rounded-full text-xs font-semibold`}>
                {lifeStage.stage}
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {lifeStage.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  

  const navigate = useNavigate();

  return (
    <div 
      ref={containerRef}
      className={`min-h-screen bg-gradient-to-br ${currentCharacterData.bgGradient} relative overflow-hidden transition-all duration-1000`}
    >
      <FloatingElements character={currentCharacterData} />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center p-6">
        <div className="flex items-center gap-4">
          <h1 className={`text-2xl font-bold ${currentCharacterData.primaryColor}`}>
            Character Explorer
          </h1>
        </div>
        
        <div 
            className="character-logo bg-arcane rounded-full w-8 h-8 flex items-center justify-center text-white cursor-pointer select-none"
            onClick={() => navigate('/')}
          >
            🤖
          </div>
      </div>

      {/* Navigation arrows */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-20 flex flex-col gap-4">
        <button 
          onClick={() => handleScroll('up')}
          disabled={currentCharacter === 0}
          className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-opacity-30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronUp className="w-6 h-6 text-white" />
        </button>
        <button 
          onClick={() => handleScroll('down')}
          disabled={currentCharacter === characters.length - 1}
          className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-opacity-30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronDown className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Character indicator dots */}
      <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-20 flex flex-col gap-3">
        {characters.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentCharacter(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentCharacter 
                ? 'bg-white shadow-lg' 
                : 'bg-white bg-opacity-40 hover:bg-opacity-60'
            }`}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between px-6 lg:px-16 py-8 min-h-screen">
        
        {/* Left side - Character info */}
        <div className={`flex-1 max-w-md mb-8 lg:mb-0 transition-all duration-1000 ${isTransitioning ? 'opacity-0 transform translate-x-8' : 'opacity-100 transform translate-x-0'}`}>
          <h1 className={`text-5xl lg:text-6xl font-bold ${currentCharacterData.primaryColor} mb-4 leading-tight`}>
            Meet<br />{currentCharacterData.name}
          </h1>
          <p className={`text-xl ${currentCharacterData.primaryColor} mb-6 opacity-90`}>
            The {currentCharacterData.role}
          </p>
          <p className={`${currentCharacterData.primaryColor} text-opacity-80 leading-relaxed text-lg`}>
            Explore {currentCharacterData.name}'s journey through different life stages using the controls on the right.
          </p>
        </div>

        {/* Center - Character card */}
        <div className="flex-1 flex justify-center items-center relative mb-8 lg:mb-0">
          <CharacterCard 
            character={currentCharacterData} 
            lifeStage={currentLifeStage}
            isEngaged={engagedCharacter === currentCharacterData.id}
            onToggle={handleToggleEngage}
          />
        </div>

        {/* Right side - Life stage selector */}
        <div className={`flex-1 max-w-md flex flex-col items-end transition-all duration-1000 ${isTransitioning ? 'opacity-0 transform -translate-x-8' : 'opacity-100 transform translate-x-0'}`}>
          <div className="mb-8 mr-4">
            <h3 className={`text-xl font-semibold ${currentCharacterData.primaryColor} mb-4 text-center`}>
              Life Stages
            </h3>
            <div className="flex flex-col gap-3 bg-white bg-opacity-20 p-4 rounded-2xl backdrop-blur-sm">
              {currentCharacterData.lifeStages.map((stage, index) => (
                <button
                  key={stage.stage}
                  onClick={() => handleLifeStageChange(index)}
                  className={`px-6 py-3 rounded-xl text-sm font-medium transition-all transform hover:scale-105 ${
                    index === currentLifeStageIndex
                      ? 'bg-white text-gray-700 shadow-lg'
                      : `${currentCharacterData.primaryColor} hover:bg-white hover:bg-opacity-10`
                  }`}
                >
                  {stage.stage}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className={`relative z-10 flex justify-center items-center px-6 lg:px-16 pb-8 transition-all duration-1000 ${isTransitioning ? 'opacity-0 transform translate-y-8' : 'opacity-100 transform translate-y-0'}`}>
        <div className="text-center">
          <div className="flex gap-2 justify-center mb-4">
            {characters.map((_, index) => (
              <div
                key={index}
                className={`${
                  index === currentCharacter 
                    ? 'w-8 h-2 bg-white' 
                    : 'w-2 h-2 bg-white bg-opacity-50'
                } rounded-full transition-all duration-300`}
              />
            ))}
          </div>
          <p className={`text-sm ${currentCharacterData.primaryColor} opacity-60`}>
            Scroll or swipe to explore more characters
          </p>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex flex-col items-center text-white text-opacity-60">
          <div className="w-1 h-8 bg-white bg-opacity-30 rounded-full relative overflow-hidden">
            <div 
              className="w-full h-2 bg-white rounded-full absolute float-animation"
              style={{ animationDuration: '2s' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterShowcase;