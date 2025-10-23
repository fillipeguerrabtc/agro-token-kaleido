import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Shield, CheckCircle, AlertTriangle, XCircle, Workflow } from 'lucide-react';

export default function Governance() {
  const { t } = useTranslation();

  const { data: whitelists = [] } = useQuery({
    queryKey: ['/api/governance/whitelists'],
  });

  const { data: workflows = [] } = useQuery({
    queryKey: ['/api/governance/firefly-workflows'],
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: 'default' as const, icon: CheckCircle, color: 'text-chart-3' },
      suspended: { variant: 'outline' as const, icon: AlertTriangle, color: 'text-chart-4' },
      revoked: { variant: 'destructive' as const, icon: XCircle, color: 'text-destructive' },
    };
    const config = variants[status as keyof typeof variants] || variants.active;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {t(`governance.${status}`)}
      </Badge>
    );
  };

  const getLevelBadge = (level: string) => {
    const colors = {
      basic: 'bg-blue-500/10 text-blue-500 border-blue-500',
      verified: 'bg-chart-3/10 text-chart-3 border-chart-3',
      institutional: 'bg-purple-500/10 text-purple-500 border-purple-500',
    };
    return (
      <Badge variant="outline" className={colors[level as keyof typeof colors]}>
        {t(`governance.${level}`)}
      </Badge>
    );
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="heading-governance">
          {t('governance.title')}
        </h1>
        <p className="text-muted-foreground">{t('governance.subtitle')}</p>
      </div>

      <Tabs defaultValue="whitelists" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="whitelists" data-testid="tab-whitelists">
            <Shield className="h-4 w-4 mr-2" />
            {t('governance.whitelists')}
          </TabsTrigger>
          <TabsTrigger value="firefly" data-testid="tab-firefly">
            <Workflow className="h-4 w-4 mr-2" />
            {t('governance.firefly')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="whitelists" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('governance.whitelists')}</CardTitle>
              <CardDescription>
                Endereços aprovados para participar da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('governance.address')}</TableHead>
                    <TableHead>{t('governance.level')}</TableHead>
                    <TableHead>{t('governance.status')}</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {whitelists.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Nenhum endereço na whitelist
                      </TableCell>
                    </TableRow>
                  ) : (
                    whitelists.map((item: any, index: number) => (
                      <TableRow key={item.id} data-testid={`whitelist-row-${index}`}>
                        <TableCell className="font-mono text-sm">{item.address}</TableCell>
                        <TableCell>{getLevelBadge(item.complianceLevel)}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(item.addedAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="firefly" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('governance.firefly')}</CardTitle>
              <CardDescription>
                Fluxos de aprovação e orquestração Kaleido FireFly (Mockado)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflows.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum workflow ativo
                  </p>
                ) : (
                  workflows.map((workflow: any, index: number) => (
                    <div
                      key={workflow.id}
                      className="p-4 border rounded-lg hover-elevate"
                      data-testid={`workflow-${index}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{workflow.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{workflow.description}</p>
                          <p className="text-xs text-muted-foreground font-mono mt-2">
                            ID: {workflow.fireflyId}
                          </p>
                        </div>
                        {getStatusBadge(workflow.status)}
                      </div>
                    </div>
                  ))
                )}

                {/* Mock FireFly Integration Info */}
                <Card className="border-primary/20 bg-primary/5 mt-6">
                  <CardHeader>
                    <CardTitle className="text-base">Kaleido FireFly Integration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">API Status:</span>
                      <Badge variant="outline" className="bg-chart-3/10 text-chart-3 border-chart-3">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Endpoint:</span>
                      <span className="font-mono text-xs">https://api.kaleido.io/firefly/v1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Organization:</span>
                      <span className="font-medium">AgroToken StableBR</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
