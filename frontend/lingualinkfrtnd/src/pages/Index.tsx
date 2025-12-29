import { motion } from 'framer-motion';
import { Languages, MessageSquare, Globe, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Globe,
    title: 'Real-time Translation',
    description: 'Chat in your language, receive messages in theirs. Auto-translated instantly.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'WebSocket-powered messaging for instant delivery and live typing indicators.',
  },
  {
    icon: MessageSquare,
    title: 'Seamless Experience',
    description: 'Beautiful, intuitive interface designed for effortless communication.',
  },
];

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(185_80%_50%/0.1),transparent_50%)]" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '-3s' }} />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Languages className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <span className="text-lg sm:text-xl font-display font-bold">LinguaLink</span>
        </div>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
          <Button variant="glow" size="sm" asChild>
            <Link to="/signup">Get Started</Link>
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 relative z-10 py-8 sm:py-0">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-2 sm:gap-3"
          >
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 text-xs sm:text-sm text-primary">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
              Real-time Translation Powered
            </div>
            <div className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-secondary/80 border border-border text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="hidden sm:inline">Lite Version • Currently supporting 10+ languages • More coming soon</span>
              <span className="sm:hidden">10+ languages supported</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-7xl font-display font-bold leading-tight mb-4 sm:mb-6"
          >
            Break Language
            <br />
            <span className="gradient-text">Barriers Instantly</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-10 px-2"
          >
            Chat with anyone in the world in your native language. 
            Messages are translated in real-time, making global communication effortless.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            <Button variant="glow" size="lg" className="sm:size-xl" asChild>
              <Link to="/signup">
                Start Chatting Free
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </Button>
            <Button variant="glass" size="lg" className="sm:size-xl hidden sm:inline-flex" asChild>
              <Link to="/login">
                Sign In
              </Link>
            </Button>
          </motion.div>
        </div>
      </main>

      {/* Features */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="glass-panel p-6 hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-display font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-sm text-muted-foreground border-t border-border">
        <p>&copy; {new Date().getFullYear()} LinguaLink. Breaking barriers, one message at a time.</p>
      </footer>
    </div>
  );
}
