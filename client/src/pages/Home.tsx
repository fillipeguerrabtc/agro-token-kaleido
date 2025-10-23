import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsTicker } from '@/components/StatsTicker';
import { ArrowRight, Building2, Coins, Shield, Sparkles } from 'lucide-react';

export default function Home() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Building2,
      titleKey: 'hero.feature_tokenization',
      descKey: 'hero.feature_tokenization_desc',
    },
    {
      icon: Coins,
      titleKey: 'hero.feature_stablecoin',
      descKey: 'hero.feature_stablecoin_desc',
    },
    {
      icon: Shield,
      titleKey: 'hero.feature_governance',
      descKey: 'hero.feature_governance_desc',
    },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Animated Gradient Background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-[hsl(252,95%,62%)] via-[hsl(260,90%,64%)] to-[hsl(270,85%,65%)] opacity-[0.03] dark:opacity-[0.08] animate-gradient pointer-events-none" 
        aria-hidden="true"
      />
      
      {/* Hero Section */}
      <section className="relative py-24 px-6 lg:px-8 overflow-hidden">
        {/* Decorative gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-[hsl(252,95%,62%)] to-transparent opacity-20 blur-3xl rounded-full pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-[hsl(270,85%,65%)] to-transparent opacity-20 blur-3xl rounded-full pointer-events-none" aria-hidden="true" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6 hover-elevate transition-all">
              <Sparkles className="h-4 w-4" />
              {t('hero.powered_by')}
            </div>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-[hsl(252,95%,62%)] via-[hsl(260,90%,64%)] to-[hsl(270,85%,65%)] bg-clip-text text-transparent animate-gradient pb-2">
            {t('hero.title')}
          </h1>
          
          <p className="text-xl lg:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            {t('hero.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" className="text-base" asChild data-testid="button-cta-tokenize">
              <Link href="/marketplace">
                {t('hero.cta_tokenize')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base backdrop-blur-sm" asChild data-testid="button-cta-dashboard">
              <Link href="/investor">
                {t('hero.cta_dashboard')}
              </Link>
            </Button>
          </div>

          {/* Live Stats Ticker */}
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                {t('stats.live_metrics')}
              </div>
            </div>
            <StatsTicker />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover-elevate transition-all border-2" data-testid={`feature-card-${index}`}>
                  <CardHeader>
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[hsl(252,95%,62%)] to-[hsl(270,85%,65%)] flex items-center justify-center mb-6 shadow-lg">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl">
                      {t(feature.titleKey)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {t(feature.descKey)}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform Info Section */}
      <section className="relative py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-3">
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[hsl(252,95%,62%)] to-[hsl(270,85%,65%)] bg-clip-text text-transparent">
                {t('hero.stat_blockchain')}
              </div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {t('hero.blockchain_network')}
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[hsl(252,95%,62%)] to-[hsl(270,85%,65%)] bg-clip-text text-transparent">
                {t('hero.stat_realtime')}
              </div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {t('hero.realtime_sync')}
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[hsl(252,95%,62%)] to-[hsl(270,85%,65%)] bg-clip-text text-transparent">
                {t('hero.stat_enterprise')}
              </div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {t('hero.enterprise_platform')}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
