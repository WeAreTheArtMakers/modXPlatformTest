
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/context/LanguageContext';
import { Wallet, Mail, Lock, User, Github, Send, Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Authentication logic will be implemented here
    console.log('Auth form submitted:', formData);
  };

  const handleWalletConnect = () => {
    // Wallet connection logic will be implemented here
    console.log('Connecting wallet...');
  };

  const handleSocialAuth = (provider: string) => {
    // Social authentication logic will be implemented here
    console.log(`Authenticating with ${provider}...`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 font-orbitron gradient-text">
              {isLogin ? 'Welcome Back' : 'Join modX'}
            </h1>
            <p className="text-lg text-foreground/70 font-roboto">
              {isLogin 
                ? 'Sign in to your account to continue' 
                : 'Create your account and start earning rewards'
              }
            </p>
          </div>

          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-center text-xl font-orbitron">
                {isLogin ? 'Sign In' : 'Sign Up'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Wallet Connect */}
              <Button 
                onClick={handleWalletConnect}
                className="w-full cyber-glow bg-gradient-to-r from-green-500 via-cyan-500 to-blue-500 hover:from-green-600 hover:via-cyan-600 hover:to-blue-600 py-6 text-lg font-roboto font-medium"
              >
                <Wallet className="w-5 h-5 mr-3" />
                Connect Wallet
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-foreground/60 font-roboto">Or continue with</span>
                </div>
              </div>

              {/* Social Auth */}
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => handleSocialAuth('google')}
                  className="hover-glow border-green-400/30 text-green-400 font-roboto"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Google
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleSocialAuth('github')}
                  className="hover-glow border-cyan-400/30 text-cyan-400 font-roboto"
                >
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-foreground/60 font-roboto">Or with email</span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium mb-2 font-roboto">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/50" />
                      <Input
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="pl-10 bg-background/50 border-green-400/30 focus:border-green-400 font-roboto"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2 font-roboto">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/50" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="pl-10 bg-background/50 border-green-400/30 focus:border-green-400 font-roboto"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 font-roboto">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/50" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="pl-10 pr-10 bg-background/50 border-green-400/30 focus:border-green-400 font-roboto"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium mb-2 font-roboto">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/50" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className="pl-10 bg-background/50 border-green-400/30 focus:border-green-400 font-roboto"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                {isLogin && (
                  <div className="flex justify-end">
                    <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-roboto">
                      Forgot password?
                    </a>
                  </div>
                )}

                <Button 
                  type="submit"
                  className="w-full cyber-glow bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 py-6 text-lg font-roboto font-medium"
                >
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Button>
              </form>

              {/* Terms and Privacy for Sign Up */}
              {!isLogin && (
                <p className="text-xs text-foreground/60 text-center font-roboto">
                  By creating an account, you agree to our{' '}
                  <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    Privacy Policy
                  </a>
                </p>
              )}

              {/* Switch between Login/Register */}
              <div className="text-center pt-4 border-t border-border/20">
                <p className="text-sm text-foreground/60 font-roboto">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20 rounded-lg px-4 py-2">
              <Lock className="w-4 h-4 text-green-400" />
              <span className="text-sm text-foreground/70 font-roboto">
                Your data is encrypted and secure
              </span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
