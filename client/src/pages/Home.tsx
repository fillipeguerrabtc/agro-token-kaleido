import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KaleidoGradient } from '@/components/KaleidoGradient';
import { ArrowRight, Building2, Coins, Shield, TrendingUp } from 'lucide-react';

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
    <div className="relative">
      <KaleidoGradient />
      
      {/* Hero Section */}
      <section className="relative py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
              <TrendingUp className="h-4 w-4" />
              {t('hero.powered_by')}
            </div>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-[hsl(252,95%,62%)] to-[hsl(270,85%,65%)] bg-clip-text text-transparent">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild data-testid="button-cta-tokenize">
              <Link href="/originator">
                {t('hero.cta_tokenize')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild data-testid="button-cta-dashboard">
              <Link href="/investor">
                {t('hero.cta_dashboard')}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover-elevate" data-testid={`feature-card-${index}`}>
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[hsl(252,95%,62%)] to-[hsl(270,85%,65%)] flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle>
                      {t(feature.titleKey)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      {t(feature.descKey)}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">{t('hero.stat_blockchain')}</div>
              <div className="text-sm text-muted-foreground">{t('hero.blockchain_network')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">{t('hero.stat_realtime')}</div>
              <div className="text-sm text-muted-foreground">{t('hero.realtime_sync')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">{t('hero.stat_enterprise')}</div>
              <div className="text-sm text-muted-foreground">{t('hero.enterprise_platform')}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
