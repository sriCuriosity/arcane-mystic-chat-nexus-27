import React, { useState, useEffect, useRef } from 'react';
import { Palette, Wallet, Brain, Sprout, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  velocity: { x: number; y: number };
}

interface JourneyCard {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  hoverColors: string;
  iconColor: string;
}

const JourneySelector = () => {
  const [selectedJourney, setSelectedJourney] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const navigate = useNavigate();

  const journeyCards: JourneyCard[] = [
    {
      id: 'creative',
      icon: <Palette className="w-6 h-6" />,
      title: 'Fun / Creative',
      subtitle: 'Unleash your imagination',
      description: 'Creative writing, art ideas, and imaginative projects',
      hoverColors: 'from-pink-400 via-rose-400 to-orange-400',
      iconColor: 'text-pink-300'
    },
    {
      id: 'finance',
      icon: <Wallet className="w-6 h-6" />,
      title: 'Finance / Management',
      subtitle: 'Master your money',
      description: 'Budgeting tools, saving strategies, and investment guidance',
      hoverColors: 'from-blue-400 via-cyan-400 to-teal-400',
      iconColor: 'text-orange-300'
    },
    {
      id: 'learning',
      icon: <Brain className="w-6 h-6" />,
      title: 'Learning / Education',
      subtitle: 'Expand your knowledge',
      description: 'Study help, explanations, and skill development',
      hoverColors: 'from-green-400 via-emerald-400 to-teal-400',
      iconColor: 'text-blue-300'
    },
    {
      id: 'wellness',
      icon: <Sprout className="w-6 h-6" />,
      title: 'Health / Wellness',
      subtitle: 'Nurture your wellbeing',
      description: 'Mental health, fitness, and lifestyle guidance',
      hoverColors: 'from-orange-400 via-amber-400 to-yellow-400',
      iconColor: 'text-green-400'
    }
  ];

  useEffect(() => {
    // Initialize particles
    const initialParticles: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      initialParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 4 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        velocity: {
          x: (Math.random() - 0.5) * 0.5,
          y: -Math.random() * 0.5 - 0.2
        }
      });
    }
    setParticles(initialParticles);

    const animate = () => {
      setParticles(prevParticles => 
        prevParticles.map(particle => {
          let newX = particle.x + particle.velocity.x;
          let newY = particle.y + particle.velocity.y;

          // Mouse interaction
          const dx = mousePos.x - particle.x;
          const dy = mousePos.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const force = (100 - distance) / 100;
            newX += dx * force * 0.01;
            newY += dy * force * 0.01;
          }

          // Reset particle if it goes off screen
          if (newY < -10) {
            newY = window.innerHeight + 10;
            newX = Math.random() * window.innerWidth;
          }
          if (newX < -10 || newX > window.innerWidth + 10) {
            newX = Math.random() * window.innerWidth;
          }

          return {
            ...particle,
            x: newX,
            y: newY
          };
        })
      );
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mousePos]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleCardClick = (journeyId: string) => {
    setSelectedJourney(journeyId);
    setShowModal(true);
    
    // Store the selected journey in localStorage
    localStorage.setItem('selectedJourney', journeyId);

    // Navigate to chat page after a brief delay
    setTimeout(() => {
      navigate('/chat');
    }, 2000);
  };

  return (
    <div 
      ref={containerRef}
      className="h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 relative overflow-hidden"
      onMouseMove={handleMouseMove}
      style={{
        background: 'linear-gradient(135deg, #1a0b2e 0%, #2d1b4e 50%, #0f051a 100%)'
      }}
    >
      {/* Particle System */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 2}px rgba(255, 255, 255, ${particle.opacity * 0.5})`
          }}
        />
      ))}

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center h-full px-4">
        <div className="text-center mb-6 fade-in-up">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 tracking-tight">
            Choose Your Journey
          </h1>
          <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto">
            Select the type of assistance you'd like from your AI companion
          </p>
        </div>

        {/* Journey Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl w-full">
          {journeyCards.map((card, index) => (
            <div
              key={card.id}
              className="group relative p-4 rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10 cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-white/10"
              style={{
                animationDelay: `${index * 0.1}s`
              }}
              onClick={() => handleCardClick(card.id)}
            >
              {/* Hover Gradient Overlay */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${card.hoverColors} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
              
              {/* Glow Effect */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${card.hoverColors} blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10`} />

              <div className="relative z-10">
                {/* Icon */}
                <div className={`${card.iconColor} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  {card.icon}
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-white mb-1">{card.title}</h3>
                <p className="text-white/80 font-medium mb-2 text-sm">{card.subtitle}</p>
                <p className="text-white/60 text-xs mb-4 leading-relaxed">{card.description}</p>

                {/* Button */}
                <button className="px-3 py-1.5 rounded-lg bg-white/10 text-white/80 text-xs font-medium hover:bg-white/20 hover:text-white transition-all duration-300 group-hover:scale-105">
                  Click to select
                </button>
              </div>

              {/* Selection Indicator */}
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>

      {/* Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-purple-900/90 to-purple-800/90 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center animate-scale-in">
            <motion.div 
              layoutId="star-transition"
              className="text-yellow-400 mb-3 flex justify-center"
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Star className="w-10 h-10 animate-pulse" />
            </motion.div>
            <h3 className="text-xl font-bold text-white mb-2">Perfect Choice!</h3>
            <p className="text-white/70 text-sm">Preparing your AI assistant...</p>
          </div>
        </div>
      )}

      {/* Add keyframes for slide-in animation */}
      <style>
        {`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        `}
      </style>
    </div>
  );
};

export default JourneySelector;
