import React, { useEffect } from 'react';
import { Shield, AlertTriangle, Map, Users, TrendingUp, ArrowRight, UserPlus, LogIn, Waves, Fish, Umbrella, Anchor, Home, Phone, Mail, MapPin, Clock, Satellite, Brain, Radio, User, Star } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export default function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  useEffect(() => {
    // Enhanced intersection observer for animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #020617 100%)',
      color: '#ffffff',
      lineHeight: '1.6',
      fontSize: '0.95rem'
    }}>
      {/* Ocean Theme Animated Background */}
      <div className="fixed top-0 left-0 w-full h-full z-[-3]" style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0a1628 100%)',
        animation: 'oceanFlow 20s ease-in-out infinite'
      }}></div>
      
      {/* Enhanced Animated Background Waves */}
      <div className="fixed top-0 left-0 w-[200%] h-full z-[-1]" style={{
        backgroundImage: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1000 200\"><path d=\"M0 100 Q250 60 500 100 T1000 100 V200 H0Z\" fill=\"rgba(6,182,212,0.08)\"/><path d=\"M0 120 Q250 80 500 120 T1000 120 V200 H0Z\" fill=\"rgba(14,165,233,0.06)\"/><path d=\"M0 140 Q250 100 500 140 T1000 140 V200 H0Z\" fill=\"rgba(8,145,178,0.04)\"/></svg>')",
        backgroundRepeat: 'repeat-x',
        animation: 'oceanWaveFlow 30s linear infinite'
      }}></div>
      
      <style jsx>{`
        @keyframes oceanFlow {
          0%, 100% { 
            background: linear-gradient(135deg, #0a1628 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0a1628 100%);
          }
          50% { 
            background: linear-gradient(135deg, #334155 0%, #1e293b 25%, #0a1628 50%, #1e293b 75%, #334155 100%);
          }
        }
        @keyframes oceanWaveFlow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-fade-in-up {
          opacity: 1;
          transform: translateY(0);
        }
        .fade-in {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease;
        }
      `}</style>

      {/* Clean Navigation */}
      <nav className="fixed top-0 w-full py-4 z-[1000] transition-all duration-400" style={{
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '2px solid transparent',
        borderImage: 'linear-gradient(135deg, #0ea5e9 0%, #0891b2 50%, #0c4a6e 100%) 1'
      }}>
        <div className="max-w-[1300px] mx-auto flex justify-between items-center px-8">
          <a href="#" className="flex items-center font-bold text-[1.4rem] text-decoration-none" style={{
            fontFamily: "'Poppins', sans-serif",
            background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #54a0ff)',
            backgroundSize: '200% 200%',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'logoShimmer 3s ease-in-out infinite'
          }}>
            <div className="w-8 h-8 mr-3 rounded-full" style={{
              background: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><circle cx=\"50\" cy=\"50\" r=\"45\" fill=\"%2306b6d4\" stroke=\"%23ffffff\" stroke-width=\"2\"/><path d=\"M30 50 Q40 30 50 50 Q60 70 70 50\" stroke=\"%23ffffff\" stroke-width=\"3\" fill=\"none\"/><circle cx=\"35\" cy=\"45\" r=\"2\" fill=\"%23ffffff\"/><circle cx=\"55\" cy=\"55\" r=\"2\" fill=\"%23ffffff\"/><circle cx=\"65\" cy=\"45\" r=\"2\" fill=\"%23ffffff\"/></svg>') no-repeat center / contain",
              animation: 'siteIconFloat 4s ease-in-out infinite',
              filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))'
            }}></div>
            Coastalytics
          </a>
          <ul className="hidden md:flex list-none gap-8">
            <li><a href="#hero" className="text-[#cbd5e1] no-underline font-medium text-[0.9rem] py-2 relative transition-all duration-300 hover:text-white hover:transform hover:-translate-y-0.5" style={{
              position: 'relative'
            }} onMouseEnter={(e) => {
              const after = document.createElement('div');
              after.style.cssText = 'position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(135deg, #0ea5e9 0%, #0891b2 50%, #0c4a6e 100%); border-radius: 2px; transition: width 0.3s ease;';
              e.currentTarget.appendChild(after);
            }}>Home</a></li>
            <li><a href="#how-it-works" className="text-[#cbd5e1] no-underline font-medium text-[0.9rem] py-2 relative transition-all duration-300 hover:text-white hover:transform hover:-translate-y-0.5">How It Works</a></li>
            <li><a href="#testimonials" className="text-[#cbd5e1] no-underline font-medium text-[0.9rem] py-2 relative transition-all duration-300 hover:text-white hover:transform hover:-translate-y-0.5">Testimonials</a></li>
            <li><a href="#organizations" className="text-[#cbd5e1] no-underline font-medium text-[0.9rem] py-2 relative transition-all duration-300 hover:text-white hover:transform hover:-translate-y-0.5">Partners</a></li>
            <li><a href="#communities" className="text-[#cbd5e1] no-underline font-medium text-[0.9rem] py-2 relative transition-all duration-300 hover:text-white hover:transform hover:-translate-y-0.5">Communities</a></li>
            <li><a href="#contact" className="text-[#cbd5e1] no-underline font-medium text-[0.9rem] py-2 relative transition-all duration-300 hover:text-white hover:transform hover:-translate-y-0.5">Contact</a></li>
          </ul>
        </div>
      </nav>
      
      <style jsx>{`
        @keyframes logoShimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes siteIconFloat {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg);
            filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.6));
          }
          50% { 
            transform: translateY(-3px) rotate(5deg);
            filter: drop-shadow(0 0 15px rgba(6, 182, 212, 0.9));
          }
        }
      `}</style>

      {/* Enhanced Hero Section */}
      <section id="hero" className="min-h-[90vh] flex items-center pt-24 pb-12 px-8 relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 58, 138, 0.7) 30%, rgba(6, 182, 212, 0.6) 70%, rgba(8, 145, 178, 0.8) 100%)'
      }}>
        <div className="absolute inset-0 z-[1]" style={{
          background: 'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(8, 145, 178, 0.15) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)',
          animation: 'communityGlow 12s ease-in-out infinite'
        }}></div>
        
        <div className="max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-[2]">
          <div>
            <h1 className="font-bold text-white mb-6 leading-[1.1] tracking-[-0.02em] relative" style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '4.2rem',
              fontWeight: '800',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
            }}>
              Protecting Coastal Communities Together
            </h1>
            <p className="text-[1.2rem] mb-8 leading-[1.6] font-normal" style={{
              color: 'rgba(203, 213, 225, 0.9)'
            }}>
              A revolutionary platform where communities report hazards with precision location tags, authorities verify reports instantly, and everyone stays safer through real-time coastal emergency awareness powered by AI and community intelligence.
            </p>
            
            <div className="flex gap-4 mt-8">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 rounded-[30px] font-semibold text-white flex items-center gap-2 transition-all duration-300 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #14b8a6 0%, #10b981 50%, #059669 100%)',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
                }}
              >
                <UserPlus className="w-5 h-5" />
                <span>Sign Up</span>
              </button>
              <button
                onClick={onSignIn}
                className="px-8 py-4 rounded-[30px] font-semibold text-white flex items-center gap-2 transition-all duration-300 border-2" style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = '';
                }}
              >
                <LogIn className="w-5 h-5" />
                <span>Login</span>
              </button>
            </div>
          </div>
          
          {/* Interactive Community Network Visualization */}
          <div className="relative h-[400px] flex items-center justify-center rounded-[20px] overflow-hidden" style={{
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0891b2 25%, #0c4a6e 50%, #1e40af 75%, #3730a3 100%)',
            boxShadow: '0 20px 40px rgba(14, 165, 233, 0.3)',
            animation: 'oceanVisualPulse 8s ease-in-out infinite'
          }}>
            <div className="absolute w-full h-full top-0 left-0">
              {/* Community Network Nodes */}
              <div className="absolute w-[60px] h-[60px] rounded-full flex items-center justify-center text-[1.5rem] text-white cursor-pointer transition-all duration-300 hover:scale-150 hover:z-10" style={{
                background: 'radial-gradient(circle, #06b6d4, #0891b2)',
                top: '20%',
                left: '20%',
                boxShadow: '0 0 30px #06b6d4',
                animation: 'nodeFloat 6s ease-in-out infinite'
              }} title="Coastal Communities">
                <Waves className="w-6 h-6" />
              </div>
              
              <div className="absolute w-[60px] h-[60px] rounded-full flex items-center justify-center text-[1.5rem] text-white cursor-pointer transition-all duration-300 hover:scale-150 hover:z-10" style={{
                background: 'radial-gradient(circle, #10b981, #059669)',
                top: '25%',
                left: '75%',
                boxShadow: '0 0 30px #10b981',
                animation: 'nodeFloat 6s ease-in-out infinite',
                animationDelay: '1s'
              }} title="Fishing Villages">
                <Fish className="w-6 h-6" />
              </div>
              
              <div className="absolute w-[60px] h-[60px] rounded-full flex items-center justify-center text-[1.5rem] text-white cursor-pointer transition-all duration-300 hover:scale-150 hover:z-10" style={{
                background: 'radial-gradient(circle, #f59e0b, #f97316)',
                top: '65%',
                left: '25%',
                boxShadow: '0 0 30px #f59e0b',
                animation: 'nodeFloat 6s ease-in-out infinite',
                animationDelay: '2s'
              }} title="Tourist Areas">
                <Umbrella className="w-6 h-6" />
              </div>
              
              <div className="absolute w-[60px] h-[60px] rounded-full flex items-center justify-center text-[1.5rem] text-white cursor-pointer transition-all duration-300 hover:scale-150 hover:z-10" style={{
                background: 'radial-gradient(circle, #8b5cf6, #7c3aed)',
                top: '70%',
                left: '70%',
                boxShadow: '0 0 30px #8b5cf6',
                animation: 'nodeFloat 6s ease-in-out infinite',
                animationDelay: '3s'
              }} title="Port Cities">
                <Anchor className="w-6 h-6" />
              </div>
              
              <div className="absolute w-[80px] h-[80px] rounded-full flex items-center justify-center text-[1.5rem] cursor-pointer transition-all duration-300 hover:scale-150 hover:z-10" style={{
                background: 'radial-gradient(circle, #ffffff, #e5e7eb)',
                top: '45%',
                left: '47.5%',
                boxShadow: '0 0 40px rgba(255, 255, 255, 0.8)',
                animation: 'nodeFloat 6s ease-in-out infinite',
                animationDelay: '0.5s',
                color: '#1f2937'
              }} title="OceanGuard Hub">
                <Shield className="w-8 h-8" />
              </div>
              
              {/* Dynamic Connection Lines */}
              <div className="absolute h-[2px] opacity-30 transform origin-left" style={{
                top: '32%',
                left: '26%',
                width: '22%',
                transform: 'rotate(12deg)',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
                animation: 'connectionFlow 4s ease-in-out infinite'
              }}></div>
              
              <div className="absolute h-[2px] opacity-30 transform origin-left" style={{
                top: '35%',
                left: '52%',
                width: '25%',
                transform: 'rotate(-18deg)',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
                animation: 'connectionFlow 4s ease-in-out infinite',
                animationDelay: '1s'
              }}></div>
              
              <div className="absolute h-[2px] opacity-30 transform origin-left" style={{
                top: '55%',
                left: '31%',
                width: '18%',
                transform: 'rotate(-35deg)',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
                animation: 'connectionFlow 4s ease-in-out infinite',
                animationDelay: '2s'
              }}></div>
              
              <div className="absolute h-[2px] opacity-30 transform origin-left" style={{
                top: '58%',
                left: '47%',
                width: '24%',
                transform: 'rotate(22deg)',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
                animation: 'connectionFlow 4s ease-in-out infinite',
                animationDelay: '3s'
              }}></div>
              
              {/* Data Flow Indicators */}
              <div className="absolute w-2 h-2 rounded-full" style={{
                top: '30%',
                left: '25%',
                background: 'radial-gradient(circle, #22d3ee, #06b6d4)',
                animation: 'dataFlowMove 3s linear infinite',
                animationDelay: '0s'
              }}></div>
              
              <div className="absolute w-2 h-2 rounded-full" style={{
                top: '33%',
                left: '75%',
                background: 'radial-gradient(circle, #22d3ee, #06b6d4)',
                animation: 'dataFlowMove 3s linear infinite',
                animationDelay: '1s'
              }}></div>
              
              <div className="absolute w-2 h-2 rounded-full" style={{
                top: '67%',
                left: '30%',
                background: 'radial-gradient(circle, #22d3ee, #06b6d4)',
                animation: 'dataFlowMove 3s linear infinite',
                animationDelay: '2s'
              }}></div>
            </div>
          </div>
        </div>
      </section>
      
      <style jsx>{`
        @keyframes communityGlow {
          0%, 100% { 
            opacity: 0.5;
            transform: scale(1);
          }
          33% { 
            opacity: 0.8;
            transform: scale(1.05);
          }
          66% { 
            opacity: 0.6;
            transform: scale(1.02);
          }
        }
        @keyframes oceanVisualPulse {
          0%, 100% { 
            box-shadow: 0 20px 40px rgba(14, 165, 233, 0.3);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 30px 60px rgba(14, 165, 233, 0.5);
            transform: scale(1.02);
          }
        }
        @keyframes nodeFloat {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg);
            filter: brightness(1);
          }
          33% { 
            transform: translateY(-8px) rotate(5deg);
            filter: brightness(1.2);
          }
          66% { 
            transform: translateY(-4px) rotate(-3deg);
            filter: brightness(1.1);
          }
        }
        @keyframes connectionFlow {
          0%, 100% { 
            opacity: 0.3;
            transform: scaleX(0);
          }
          50% { 
            opacity: 1;
            transform: scaleX(1);
          }
        }
        @keyframes dataFlowMove {
          0% { 
            transform: scale(0);
            opacity: 0;
          }
          25% { 
            transform: scale(1);
            opacity: 1;
          }
          75% { 
            transform: scale(1.2);
            opacity: 0.8;
          }
          100% { 
            transform: scale(0);
            opacity: 0;
          }
        }
      `}</style>

      {/* Enhanced How It Works Section */}
      <section id="how-it-works" className="relative py-20 px-8" style={{
        background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.2) 0%, rgba(6, 182, 212, 0.15) 50%, rgba(14, 165, 233, 0.1) 100%)'
      }}>
        <div className="absolute inset-0 z-[1]" style={{
          background: 'radial-gradient(circle at 20% 80%, rgba(8, 145, 178, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)',
          animation: 'sectionGlow 10s ease-in-out infinite'
        }}></div>
        
        <div className="max-w-[1300px] mx-auto relative z-[2]">
          <div className="text-center mb-16">
            <h2 className="text-[3rem] font-bold mb-4 fade-in" style={{
              fontFamily: "'Poppins', sans-serif",
              background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #54a0ff)',
              backgroundSize: '200% 200%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'titleShimmer 4s ease-in-out infinite'
            }}>
              How It Works
            </h2>
            <p className="text-[1.1rem] max-w-[600px] mx-auto fade-in" style={{
              color: 'rgba(203, 213, 225, 0.8)'
            }}>
              Advanced coastal protection through community collaboration
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
            <div className="text-center p-10 rounded-[20px] transition-all duration-300 border-2 border-transparent relative overflow-hidden fade-in" style={{
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
              e.currentTarget.style.borderColor = 'rgba(8, 145, 178, 0.5)';
              const before = e.currentTarget.querySelector('.hover-bg');
              if (before) before.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.borderColor = 'transparent';
              const before = e.currentTarget.querySelector('.hover-bg');
              if (before) before.style.opacity = '0';
            }}>
              <div className="hover-bg absolute inset-0 rounded-[20px] opacity-0 transition-opacity duration-300 z-[-1]" style={{
                background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.2) 0%, rgba(6, 182, 212, 0.1) 100%)'
              }}></div>
              
              <div className="w-[100px] h-[100px] rounded-full flex items-center justify-center text-[2.5rem] text-white mx-auto mb-6 relative z-[2] border-4" style={{
                background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #54a0ff)',
                backgroundSize: '200% 200%',
                animation: 'iconFloat 6s ease-in-out infinite, iconShimmer 3s ease-in-out infinite',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                boxShadow: '0 10px 30px rgba(8, 145, 178, 0.3)'
              }}>
                <Satellite className="w-10 h-10" />
              </div>
              
              <h3 className="text-[1.4rem] font-semibold mb-4 text-white relative z-[2]" style={{
                fontFamily: "'Poppins', sans-serif"
              }}>Smart Detection</h3>
              
              <p className="text-[1rem] leading-[1.6] relative z-[2]" style={{
                color: 'rgba(203, 213, 225, 0.8)'
              }}>
                AI-powered sensors and community reports detect coastal hazards in real-time with precise location tagging and severity assessment.
              </p>
            </div>
            
            <div className="text-center p-10 rounded-[20px] transition-all duration-300 border-2 border-transparent relative overflow-hidden fade-in" style={{
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
              e.currentTarget.style.borderColor = 'rgba(8, 145, 178, 0.5)';
              const before = e.currentTarget.querySelector('.hover-bg');
              if (before) before.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.borderColor = 'transparent';
              const before = e.currentTarget.querySelector('.hover-bg');
              if (before) before.style.opacity = '0';
            }}>
              <div className="hover-bg absolute inset-0 rounded-[20px] opacity-0 transition-opacity duration-300 z-[-1]" style={{
                background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.2) 0%, rgba(6, 182, 212, 0.1) 100%)'
              }}></div>
              
              <div className="w-[100px] h-[100px] rounded-full flex items-center justify-center text-[2.5rem] text-white mx-auto mb-6 relative z-[2] border-4" style={{
                background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #54a0ff)',
                backgroundSize: '200% 200%',
                animation: 'iconFloat 6s ease-in-out infinite, iconShimmer 3s ease-in-out infinite',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                boxShadow: '0 10px 30px rgba(8, 145, 178, 0.3)'
              }}>
                <Brain className="w-10 h-10" />
              </div>
              
              <h3 className="text-[1.4rem] font-semibold mb-4 text-white relative z-[2]" style={{
                fontFamily: "'Poppins', sans-serif"
              }}>Intelligent Verification</h3>
              
              <p className="text-[1rem] leading-[1.6] relative z-[2]" style={{
                color: 'rgba(203, 213, 225, 0.8)'
              }}>
                Machine learning algorithms and expert authorities verify threats instantly, ensuring accurate and reliable emergency information.
              </p>
            </div>
            
            <div className="text-center p-10 rounded-[20px] transition-all duration-300 border-2 border-transparent relative overflow-hidden fade-in" style={{
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
              e.currentTarget.style.borderColor = 'rgba(8, 145, 178, 0.5)';
              const before = e.currentTarget.querySelector('.hover-bg');
              if (before) before.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.borderColor = 'transparent';
              const before = e.currentTarget.querySelector('.hover-bg');
              if (before) before.style.opacity = '0';
            }}>
              <div className="hover-bg absolute inset-0 rounded-[20px] opacity-0 transition-opacity duration-300 z-[-1]" style={{
                background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.2) 0%, rgba(6, 182, 212, 0.1) 100%)'
              }}></div>
              
              <div className="w-[100px] h-[100px] rounded-full flex items-center justify-center text-[2.5rem] text-white mx-auto mb-6 relative z-[2] border-4" style={{
                background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #54a0ff)',
                backgroundSize: '200% 200%',
                animation: 'iconFloat 6s ease-in-out infinite, iconShimmer 3s ease-in-out infinite',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                boxShadow: '0 10px 30px rgba(8, 145, 178, 0.3)'
              }}>
                <Radio className="w-10 h-10" />
              </div>
              
              <h3 className="text-[1.4rem] font-semibold mb-4 text-white relative z-[2]" style={{
                fontFamily: "'Poppins', sans-serif"
              }}>Instant Alerts</h3>
              
              <p className="text-[1rem] leading-[1.6] relative z-[2]" style={{
                color: 'rgba(203, 213, 225, 0.8)'
              }}>
                Multi-channel alert system delivers warnings through mobile apps, SMS, sirens, and local media for maximum community reach.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <style jsx>{`
        @keyframes sectionGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes titleShimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes iconFloat {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg);
          }
          33% { 
            transform: translateY(-8px) rotate(2deg);
          }
          66% { 
            transform: translateY(-5px) rotate(-1deg);
          }
        }
        @keyframes iconShimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative py-20 overflow-hidden" style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.1) 50%, rgba(109, 40, 217, 0.15) 100%)'
      }}>
        <div className="absolute inset-0 z-[1]" style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
          animation: 'testimonialGlow 8s ease-in-out infinite'
        }}></div>
        
        <div className="max-w-[1300px] mx-auto px-8 relative z-[2]">
          <div className="text-center mb-16">
            <h2 className="text-[3rem] font-bold mb-4 text-white fade-in" style={{
              fontFamily: "'Poppins', sans-serif",
              background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #54a0ff)',
              backgroundSize: '200% 200%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'titleShimmer 4s ease-in-out infinite'
            }}>
              What Communities Say
            </h2>
            <p className="text-[1.1rem] max-w-[600px] mx-auto fade-in" style={{
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              Real experiences from coastal communities across India
            </p>
          </div>
          
          <div className="relative mt-12">
            <div className="overflow-hidden relative">
              <div className="flex gap-6" style={{
                animation: 'slide-testimonials 30s linear infinite'
              }}>
                {/* Testimonial Cards */}
                <div className="min-w-[280px] max-w-[280px] bg-white/95 p-6 rounded-[15px] shadow-xl border-2 border-purple-500/20 flex-shrink-0 transition-transform duration-300 hover:scale-105" style={{
                  color: '#0f172a',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-[45px] h-[45px] bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-[1.2rem] text-white flex-shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[1rem] mb-1">Rajesh Kumar</h4>
                      <p className="text-[#334155] text-[0.8rem]">Fisherman, Kochi</p>
                    </div>
                  </div>
                  <div className="text-[#f59e0b] mb-3 text-[0.9rem]">★★★★★</div>
                  <p className="italic leading-[1.5] text-[#334155] text-[0.9rem]">
                    "OceanGuard saved our fishing fleet during the last cyclone. The early warning helped us move to safety hours before official alerts."
                  </p>
                </div>
                
                <div className="min-w-[280px] max-w-[280px] bg-white/95 p-6 rounded-[15px] shadow-xl border-2 border-purple-500/20 flex-shrink-0 transition-transform duration-300 hover:scale-105" style={{
                  color: '#0f172a',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-[45px] h-[45px] bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-[1.2rem] text-white flex-shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[1rem] mb-1">Priya Sharma</h4>
                      <p className="text-[#334155] text-[0.8rem]">Village Leader, Visakhapatnam</p>
                    </div>
                  </div>
                  <div className="text-[#f59e0b] mb-3 text-[0.9rem]">★★★★★</div>
                  <p className="italic leading-[1.5] text-[#334155] text-[0.9rem]">
                    "The multilingual support made it accessible to everyone in our community. Even elderly residents can use it easily."
                  </p>
                </div>
                
                <div className="min-w-[280px] max-w-[280px] bg-white/95 p-6 rounded-[15px] shadow-xl border-2 border-purple-500/20 flex-shrink-0 transition-transform duration-300 hover:scale-105" style={{
                  color: '#0f172a',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-[45px] h-[45px] bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-[1.2rem] text-white flex-shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[1rem] mb-1">Dr. Anand Rao</h4>
                      <p className="text-[#334155] text-[0.8rem]">Emergency Coordinator, Chennai</p>
                    </div>
                  </div>
                  <div className="text-[#f59e0b] mb-3 text-[0.9rem]">★★★★★</div>
                  <p className="italic leading-[1.5] text-[#334155] text-[0.9rem]">
                    "The real-time verification system helps us deploy resources more efficiently. Response times improved by 60%."
                  </p>
                </div>
                
                <div className="min-w-[280px] max-w-[280px] bg-white/95 p-6 rounded-[15px] shadow-xl border-2 border-purple-500/20 flex-shrink-0 transition-transform duration-300 hover:scale-105" style={{
                  color: '#0f172a',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-[45px] h-[45px] bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-[1.2rem] text-white flex-shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[1rem] mb-1">Maya Desai</h4>
                      <p className="text-[#334155] text-[0.8rem]">NGO Worker, Mumbai</p>
                    </div>
                  </div>
                  <div className="text-[#f59e0b] mb-3 text-[0.9rem]">★★★★★</div>
                  <p className="italic leading-[1.5] text-[#334155] text-[0.9rem]">
                    "OceanGuard connects communities with help during emergencies. It's transforming disaster response."
                  </p>
                </div>
                
                <div className="min-w-[280px] max-w-[280px] bg-white/95 p-6 rounded-[15px] shadow-xl border-2 border-purple-500/20 flex-shrink-0 transition-transform duration-300 hover:scale-105" style={{
                  color: '#0f172a',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-[45px] h-[45px] bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-[1.2rem] text-white flex-shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[1rem] mb-1">Captain Singh</h4>
                      <p className="text-[#334155] text-[0.8rem]">Coast Guard Officer</p>
                    </div>
                  </div>
                  <div className="text-[#f59e0b] mb-3 text-[0.9rem]">★★★★★</div>
                  <p className="italic leading-[1.5] text-[#334155] text-[0.9rem]">
                    "The platform's accuracy and speed have revolutionized our emergency response operations across coastal regions."
                  </p>
                </div>
                
                <div className="min-w-[280px] max-w-[280px] bg-white/95 p-6 rounded-[15px] shadow-xl border-2 border-purple-500/20 flex-shrink-0 transition-transform duration-300 hover:scale-105" style={{
                  color: '#0f172a',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-[45px] h-[45px] bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-[1.2rem] text-white flex-shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[1rem] mb-1">Sunita Patel</h4>
                      <p className="text-[#334155] text-[0.8rem]">Tourist Guide, Goa</p>
                    </div>
                  </div>
                  <div className="text-[#f59e0b] mb-3 text-[0.9rem]">★★★★★</div>
                  <p className="italic leading-[1.5] text-[#334155] text-[0.9rem]">
                    "Keeping tourists safe is our priority. OceanGuard's real-time alerts help us make informed decisions daily."
                  </p>
                </div>
                
                {/* Duplicate cards for seamless loop */}
                <div className="min-w-[280px] max-w-[280px] bg-white/95 p-6 rounded-[15px] shadow-xl border-2 border-purple-500/20 flex-shrink-0 transition-transform duration-300 hover:scale-105" style={{
                  color: '#0f172a',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-[45px] h-[45px] bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-[1.2rem] text-white flex-shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[1rem] mb-1">Rajesh Kumar</h4>
                      <p className="text-[#334155] text-[0.8rem]">Fisherman, Kochi</p>
                    </div>
                  </div>
                  <div className="text-[#f59e0b] mb-3 text-[0.9rem]">★★★★★</div>
                  <p className="italic leading-[1.5] text-[#334155] text-[0.9rem]">
                    "OceanGuard saved our fishing fleet during the last cyclone. The early warning helped us move to safety hours before official alerts."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <style jsx>{`
        @keyframes testimonialGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        @keyframes slide-testimonials {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Organizations Section */}
      <section id="organizations" className="relative py-20" style={{
        background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(234, 88, 12, 0.1) 50%, rgba(220, 38, 38, 0.15) 100%)'
      }}>
        <div className="absolute inset-0 z-[1]" style={{
          background: 'radial-gradient(circle at 70% 30%, rgba(249, 115, 22, 0.1) 0%, transparent 50%)',
          animation: 'orgGlow 7s ease-in-out infinite'
        }}></div>
        
        <div className="max-w-[1300px] mx-auto px-8 relative z-[2]">
          <div className="text-center mb-16">
            <h2 className="text-[3rem] font-bold mb-4 text-white fade-in" style={{
              fontFamily: "'Poppins', sans-serif",
              background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #54a0ff)',
              backgroundSize: '200% 200%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'titleShimmer 4s ease-in-out infinite'
            }}>
              Partner Organizations
            </h2>
            <p className="text-[1.1rem] max-w-[600px] mx-auto fade-in" style={{
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              Trusted by leading institutions and government agencies
            </p>
          </div>
          
          <div className="relative mt-12 overflow-hidden">
            <div className="flex gap-12 items-center" style={{
              animation: 'slide-orgs 25s linear infinite'
            }}>
              <div className="min-w-[200px] h-[100px] bg-white/95 rounded-[15px] flex items-center justify-center text-[1.5rem] font-bold flex-shrink-0 transition-transform duration-300 hover:scale-105" style={{
                color: '#334155',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)',
                backdropFilter: 'blur(10px)'
              }}>
                <i className="fas fa-university mr-2"></i>
                INCOIS
              </div>
              
              <div className="min-w-[200px] h-[100px] bg-white/95 rounded-[15px] flex items-center justify-center text-[1.5rem] font-bold flex-shrink-0 transition-transform duration-300 hover:scale-105" style={{
                color: '#334155',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)',
                backdropFilter: 'blur(10px)'
              }}>
                <i className="fas fa-globe mr-2"></i>
                NDMA
              </div>
              
              <div className="min-w-[200px] h-[100px] bg-white/95 rounded-[15px] flex items-center justify-center text-[1.5rem] font-bold flex-shrink-0 transition-transform duration-300 hover:scale-105" style={{
                color: '#334155',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)',
                backdropFilter: 'blur(10px)'
              }}>
                <Anchor className="w-6 h-6 mr-2" />
                Coast Guard
              </div>
              
              <div className="min-w-[200px] h-[100px] bg-white/95 rounded-[15px] flex items-center justify-center text-[1.5rem] font-bold flex-shrink-0 transition-transform duration-300 hover:scale-105" style={{
                color: '#334155',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)',
                backdropFilter: 'blur(10px)'
              }}>
                <Satellite className="w-6 h-6 mr-2" />
                ISRO
              </div>
              
              <div className="min-w-[200px] h-[100px] bg-white/95 rounded-[15px] flex items-center justify-center text-[1.5rem] font-bold flex-shrink-0 transition-transform duration-300 hover:scale-105" style={{
                color: '#334155',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)',
                backdropFilter: 'blur(10px)'
              }}>
                <i className="fas fa-cloud mr-2"></i>
                IMD
              </div>
              
              <div className="min-w-[200px] h-[100px] bg-white/95 rounded-[15px] flex items-center justify-center text-[1.5rem] font-bold flex-shrink-0 transition-transform duration-300 hover:scale-105" style={{
                color: '#334155',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)',
                backdropFilter: 'blur(10px)'
              }}>
                <i className="fas fa-hands-helping mr-2"></i>
                UNESCO
              </div>
              
              {/* Duplicates for seamless loop */}
              <div className="min-w-[200px] h-[100px] bg-white/95 rounded-[15px] flex items-center justify-center text-[1.5rem] font-bold flex-shrink-0 transition-transform duration-300 hover:scale-105" style={{
                color: '#334155',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)',
                backdropFilter: 'blur(10px)'
              }}>
                <i className="fas fa-university mr-2"></i>
                INCOIS
              </div>
              
              <div className="min-w-[200px] h-[100px] bg-white/95 rounded-[15px] flex items-center justify-center text-[1.5rem] font-bold flex-shrink-0 transition-transform duration-300 hover:scale-105" style={{
                color: '#334155',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)',
                backdropFilter: 'blur(10px)'
              }}>
                <i className="fas fa-globe mr-2"></i>
                NDMA
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <style jsx>{`
        @keyframes orgGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes slide-orgs {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      
      {/* Enhanced Communities Section with Icon Effects */}
      <section id="communities" className="relative py-20" style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 50%, rgba(4, 120, 87, 0.15) 100%)'
      }}>
        <div className="max-w-[1300px] mx-auto px-8 relative z-[2]">
          <div className="text-center mb-16">
            <h2 className="text-[3rem] font-bold mb-4 text-white fade-in" style={{
              fontFamily: "'Poppins', sans-serif",
              background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #54a0ff)',
              backgroundSize: '200% 200%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'titleShimmer 4s ease-in-out infinite'
            }}>
              Communities We Protect
            </h2>
            <p className="text-[1.1rem] max-w-[600px] mx-auto fade-in" style={{
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              Making coastal areas safer across India
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="bg-white/95 p-8 rounded-[20px] text-center shadow-xl border-2 border-emerald-500/20 hover:scale-105 transition-transform duration-300 relative overflow-hidden fade-in" style={{
              color: '#0f172a',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
              e.currentTarget.style.boxShadow = '0 20px 50px rgba(16, 185, 129, 0.3)';
              const before = e.currentTarget.querySelector('.hover-bg');
              if (before) before.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
              const before = e.currentTarget.querySelector('.hover-bg');
              if (before) before.style.opacity = '0';
            }}>
              <div className="hover-bg absolute inset-0 opacity-0 transition-opacity duration-300 z-[-1]" style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, transparent 50%, rgba(5, 150, 105, 0.1) 100%)'
              }}></div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-[70px] h-[70px] rounded-full flex items-center justify-center text-white text-[1.8rem] relative transition-all duration-400 cursor-pointer" style={{
                  background: 'linear-gradient(135deg, #14b8a6 0%, #10b981 50%, #059669 100%)',
                  backgroundSize: '200% 200%',
                  animation: 'communityIconPulse 4s ease-in-out infinite',
                  boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.2) rotate(15deg)';
                  e.currentTarget.style.boxShadow = '0 25px 60px rgba(16, 185, 129, 0.6), inset 0 0 30px rgba(0, 0, 0, 0.2)';
                  e.currentTarget.style.animationPlayState = 'paused';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.animationPlayState = 'running';
                }}>
                  <Fish className="w-7 h-7" style={{
                    animation: 'iconBreathe 3s ease-in-out infinite',
                    zIndex: 2,
                    position: 'relative'
                  }} />
                </div>
                <h3 className="text-lg font-semibold relative z-[2]" style={{
                  fontFamily: "'Poppins', sans-serif"
                }}>Fishing Communities</h3>
              </div>
              
              <p className="mb-4 relative z-[2]">Supporting traditional fishing villages with early storm warnings and safe return notifications.</p>
              
              <div className="flex gap-4 relative z-[2]">
                <div className="text-center flex-1">
                  <div className="text-[1.8rem] font-bold" style={{
                    background: 'linear-gradient(135deg, #14b8a6 0%, #10b981 50%, #059669 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'numberGlow 4s ease-in-out infinite'
                  }}>12,000+</div>
                  <div className="text-[0.85rem]" style={{ color: '#334155' }}>Fishermen</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-[1.8rem] font-bold" style={{
                    background: 'linear-gradient(135deg, #14b8a6 0%, #10b981 50%, #059669 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'numberGlow 4s ease-in-out infinite'
                  }}>45</div>
                  <div className="text-[0.85rem]" style={{ color: '#334155' }}>Villages</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-[1.8rem] font-bold" style={{
                    background: 'linear-gradient(135deg, #14b8a6 0%, #10b981 50%, #059669 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'numberGlow 4s ease-in-out infinite'
                  }}>8</div>
                  <div className="text-[0.85rem]" style={{ color: '#334155' }}>States</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/95 p-8 rounded-[20px] text-center shadow-xl border-2 border-emerald-500/20 hover:scale-105 transition-transform duration-300 relative overflow-hidden fade-in" style={{
              color: '#0f172a',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
              e.currentTarget.style.boxShadow = '0 20px 50px rgba(16, 185, 129, 0.3)';
              const before = e.currentTarget.querySelector('.hover-bg');
              if (before) before.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
              const before = e.currentTarget.querySelector('.hover-bg');
              if (before) before.style.opacity = '0';
            }}>
              <div className="hover-bg absolute inset-0 opacity-0 transition-opacity duration-300 z-[-1]" style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, transparent 50%, rgba(5, 150, 105, 0.1) 100%)'
              }}></div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-[70px] h-[70px] rounded-full flex items-center justify-center text-white text-[1.8rem] relative transition-all duration-400 cursor-pointer" style={{
                  background: 'linear-gradient(135deg, #14b8a6 0%, #10b981 50%, #059669 100%)',
                  backgroundSize: '200% 200%',
                  animation: 'communityIconPulse 4s ease-in-out infinite',
                  boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.2) rotate(15deg)';
                  e.currentTarget.style.boxShadow = '0 25px 60px rgba(16, 185, 129, 0.6), inset 0 0 30px rgba(0, 0, 0, 0.2)';
                  e.currentTarget.style.animationPlayState = 'paused';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.animationPlayState = 'running';
                }}>
                  <Umbrella className="w-7 h-7" style={{
                    animation: 'iconBreathe 3s ease-in-out infinite',
                    zIndex: 2,
                    position: 'relative'
                  }} />
                </div>
                <h3 className="text-lg font-semibold relative z-[2]" style={{
                  fontFamily: "'Poppins', sans-serif"
                }}>Tourist Areas</h3>
              </div>
              
              <p className="mb-4 relative z-[2]">Keeping tourists safe with real-time beach conditions and emergency evacuation guidance.</p>
              
              <div className="flex gap-4 relative z-[2]">
                <div className="text-center flex-1">
                  <div className="text-[1.8rem] font-bold" style={{
                    background: 'linear-gradient(135deg, #14b8a6 0%, #10b981 50%, #059669 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'numberGlow 4s ease-in-out infinite'
                  }}>500K+</div>
                  <div className="text-[0.85rem]" style={{ color: '#334155' }}>Tourists</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-[1.8rem] font-bold" style={{
                    background: 'linear-gradient(135deg, #14b8a6 0%, #10b981 50%, #059669 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'numberGlow 4s ease-in-out infinite'
                  }}>120</div>
                  <div className="text-[0.85rem]" style={{ color: '#334155' }}>Resorts</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-[1.8rem] font-bold" style={{
                    background: 'linear-gradient(135deg, #14b8a6 0%, #10b981 50%, #059669 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'numberGlow 4s ease-in-out infinite'
                  }}>15</div>
                  <div className="text-[0.85rem]" style={{ color: '#334155' }}>Beaches</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/95 p-8 rounded-[20px] text-center shadow-xl border-2 border-emerald-500/20 hover:scale-105 transition-transform duration-300 relative overflow-hidden fade-in" style={{
              color: '#0f172a',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
              e.currentTarget.style.boxShadow = '0 20px 50px rgba(16, 185, 129, 0.3)';
              const before = e.currentTarget.querySelector('.hover-bg');
              if (before) before.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
              const before = e.currentTarget.querySelector('.hover-bg');
              if (before) before.style.opacity = '0';
            }}>
              <div className="hover-bg absolute inset-0 opacity-0 transition-opacity duration-300 z-[-1]" style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, transparent 50%, rgba(5, 150, 105, 0.1) 100%)'
              }}></div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-[70px] h-[70px] rounded-full flex items-center justify-center text-white text-[1.8rem] relative transition-all duration-400 cursor-pointer" style={{
                  background: 'linear-gradient(135deg, #14b8a6 0%, #10b981 50%, #059669 100%)',
                  backgroundSize: '200% 200%',
                  animation: 'communityIconPulse 4s ease-in-out infinite',
                  boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.2) rotate(15deg)';
                  e.currentTarget.style.boxShadow = '0 25px 60px rgba(16, 185, 129, 0.6), inset 0 0 30px rgba(0, 0, 0, 0.2)';
                  e.currentTarget.style.animationPlayState = 'paused';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.animationPlayState = 'running';
                }}>
                  <Anchor className="w-7 h-7" style={{
                    animation: 'iconBreathe 3s ease-in-out infinite',
                    zIndex: 2,
                    position: 'relative'
                  }} />
                </div>
                <h3 className="text-lg font-semibold relative z-[2]" style={{
                  fontFamily: "'Poppins', sans-serif"
                }}>Port Cities</h3>
              </div>
              
              <p className="mb-4 relative z-[2]">Protecting major ports and shipping operations with advanced weather monitoring systems.</p>
              
              <div className="flex gap-4 relative z-[2]">
                <div className="text-center flex-1">
                  <div className="text-[1.8rem] font-bold" style={{
                    background: 'linear-gradient(135deg, #14b8a6 0%, #10b981 50%, #059669 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'numberGlow 4s ease-in-out infinite'
                  }}>2M+</div>
                  <div className="text-[0.85rem]" style={{ color: '#334155' }}>Residents</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-[1.8rem] font-bold" style={{
                    background: 'linear-gradient(135deg, #14b8a6 0%, #10b981 50%, #059669 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'numberGlow 4s ease-in-out infinite'
                  }}>25</div>
                  <div className="text-[0.85rem]" style={{ color: '#334155' }}>Ports</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-[1.8rem] font-bold" style={{
                    background: 'linear-gradient(135deg, #14b8a6 0%, #10b981 50%, #059669 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'numberGlow 4s ease-in-out infinite'
                  }}>12</div>
                  <div className="text-[0.85rem]" style={{ color: '#334155' }}>Cities</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/95 p-8 rounded-[20px] text-center shadow-xl border-2 border-emerald-500/20 hover:scale-105 transition-transform duration-300 relative overflow-hidden fade-in" style={{
              color: '#0f172a',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
              e.currentTarget.style.boxShadow = '0 20px 50px rgba(16, 185, 129, 0.3)';
              const before = e.currentTarget.querySelector('.hover-bg');
              if (before) before.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
              const before = e.currentTarget.querySelector('.hover-bg');
              if (before) before.style.opacity = '0';
            }}>
              <div className="hover-bg absolute inset-0 opacity-0 transition-opacity duration-300 z-[-1]" style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, transparent 50%, rgba(5, 150, 105, 0.1) 100%)'
              }}></div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-[70px] h-[70px] rounded-full flex items-center justify-center text-white text-[1.8rem] relative transition-all duration-400 cursor-pointer" style={{
                  background: 'linear-gradient(135deg, #14b8a6 0%, #10b981 50%, #059669 100%)',
                  backgroundSize: '200% 200%',
                  animation: 'communityIconPulse 4s ease-in-out infinite',
                  boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.2) rotate(15deg)';
                  e.currentTarget.style.boxShadow = '0 25px 60px rgba(16, 185, 129, 0.6), inset 0 0 30px rgba(0, 0, 0, 0.2)';
                  e.currentTarget.style.animationPlayState = 'paused';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.animationPlayState = 'running';
                }}>
                  <Home className="w-7 h-7" style={{
                    animation: 'iconBreathe 3s ease-in-out infinite',
                    zIndex: 2,
                    position: 'relative'
                  }} />
                </div>
                <h3 className="text-lg font-semibold relative z-[2]" style={{
                  fontFamily: "'Poppins', sans-serif"
                }}>Coastal Residents</h3>
              </div>
              
              <p className="mb-4 relative z-[2]">Safeguarding families living near coastlines with flood warnings and evacuation routes.</p>
              
              <div className="flex gap-4 relative z-[2]">
                <div className="text-center flex-1">
                  <div className="text-[1.8rem] font-bold" style={{
                    background: 'linear-gradient(135deg, #14b8a6 0%, #10b981 50%, #059669 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'numberGlow 4s ease-in-out infinite'
                  }}>800K+</div>
                  <div className="text-[0.85rem]" style={{ color: '#334155' }}>Families</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-[1.8rem] font-bold" style={{
                    background: 'linear-gradient(135deg, #14b8a6 0%, #10b981 50%, #059669 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'numberGlow 4s ease-in-out infinite'
                  }}>200</div>
                  <div className="text-[0.85rem]" style={{ color: '#334155' }}>Villages</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-[1.8rem] font-bold" style={{
                    background: 'linear-gradient(135deg, #14b8a6 0%, #10b981 50%, #059669 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'numberGlow 4s ease-in-out infinite'
                  }}>20</div>
                  <div className="text-[0.85rem]" style={{ color: '#334155' }}>Districts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <style jsx>{`
        @keyframes communityGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.9; }
        }
        @keyframes communityIconPulse {
          0%, 100% { 
            transform: scale(1) rotate(0deg);
            background-position: 0% 50%;
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
          }
          25% { 
            transform: scale(1.05) rotate(2deg);
            background-position: 50% 25%;
            box-shadow: 0 15px 35px rgba(16, 185, 129, 0.6);
          }
          50% { 
            transform: scale(1.1) rotate(0deg);
            background-position: 100% 50%;
            box-shadow: 0 20px 45px rgba(16, 185, 129, 0.8);
          }
          75% { 
            transform: scale(1.05) rotate(-2deg);
            background-position: 150% 75%;
            box-shadow: 0 15px 35px rgba(16, 185, 129, 0.6);
          }
        }
        @keyframes iconBreathe {
          0%, 100% { 
            transform: scale(1);
            filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.3));
          }
          50% { 
            transform: scale(1.1);
            filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.6));
          }
        }
        @keyframes numberGlow {
          0%, 100% { 
            filter: drop-shadow(0 0 5px rgba(16, 185, 129, 0.4));
          }
          50% { 
            filter: drop-shadow(0 0 15px rgba(16, 185, 129, 0.8));
          }
        }
      `}</style>

      {/* Contact Section */}
      <section id="contact" className="relative z-10 py-20 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-4">
              Get In Touch
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Ready to make your coastal community safer?
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold text-white mb-6">Contact Information</h3>
              <p className="text-slate-300 mb-8 leading-relaxed">
                Reach out to us for partnerships, technical support, or to learn more about implementing Coastalytics in your community.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Email</div>
                    <div className="text-slate-300">contact@coastalytics.in</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Phone</div>
                    <div className="text-slate-300">+91 800-COAST-1 (800-262-781)</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Address</div>
                    <div className="text-slate-300">Marine Drive, Coastal Tech Hub<br />Mumbai, Maharashtra 400001</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Emergency Hotline</div>
                    <div className="text-slate-300">24/7 Support: +91 112</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Send us a message</h3>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Organization"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <textarea
                  rows={4}
                  placeholder="How can we help your community?"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                ></textarea>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all"
                >
                  <Mail className="w-5 h-5" />
                  <span>Send Message</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 py-20 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-teal-500/20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Enhance Coastal Safety?
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Join our platform and help protect coastal communities through advanced monitoring and AI-powered predictions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-4 rounded-xl font-semibold inline-flex items-center justify-center space-x-2 transition-all transform hover:scale-105 shadow-lg"
            >
              <UserPlus className="w-5 h-5" />
              <span>Get Started Today</span>
            </button>
            <button
              onClick={onSignIn}
              className="bg-slate-700/50 hover:bg-slate-600/50 text-white border border-slate-600 hover:border-cyan-400 px-8 py-4 rounded-xl font-semibold inline-flex items-center justify-center space-x-2 transition-all backdrop-blur-sm"
            >
              <LogIn className="w-5 h-5" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-900/90 backdrop-blur-lg border-t border-cyan-500/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Coastalytics
              </span>
            </div>
            
            <nav className="flex justify-center space-x-8 mb-8">
              <a href="#features" className="text-slate-400 hover:text-cyan-400 transition-colors">Features</a>
              <a href="#testimonials" className="text-slate-400 hover:text-cyan-400 transition-colors">Testimonials</a>
              <a href="#communities" className="text-slate-400 hover:text-cyan-400 transition-colors">Communities</a>
              <a href="#contact" className="text-slate-400 hover:text-cyan-400 transition-colors">Contact</a>
              <span className="text-slate-400">Privacy Policy</span>
              <span className="text-slate-400">Terms of Service</span>
            </nav>
            
            <p className="text-slate-400 text-center max-w-2xl mx-auto">
              © 2025 Coastalytics. Revolutionizing coastal safety through AI-powered community intelligence.
              <br />
              <span className="text-cyan-400 text-sm">Built for Smart India Hackathon 2025</span>
            </p>
          </div>
        </div>
      </footer>
      <style jsx global>{`
        .fade-in {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease;
        }
        .fade-in.animate-fade-in-up {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
