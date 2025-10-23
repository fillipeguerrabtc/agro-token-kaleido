import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useWallet } from '@/contexts/WalletContext';
import { useDevice } from '@/contexts/DeviceContext';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { KaleidoGradient, MobileGradientHeader } from '@/components/KaleidoGradient';
import { MobileStatsCard } from '@/components/MobileStatsCard';
import { ShoppingCart, TrendingUp, Filter, DollarSign, Calendar, Tag, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface MarketplaceListing {
  id: string;
  agroTokenId: string;
  tokenId: string;
  contractAddress: string;
  sellerAddress: string;
  price: string;
  status: string;
  listedAt: string;
  soldAt: string | null;
  txHash: string | null;
  // Fields from merged AgroToken
  name: string;
  assetType: string;
  value: string;
  maturityDate: string;
  description: string;
  metadata: any;
  ownerAddress: string;
  createdAt: string;
  agroToken?: {
    name: string;
    assetType: string;
    value: string;
    maturityDate: string;
    description?: string;
  };
}

export default function Marketplace() {
  const { t } = useTranslation();
  const { wallet } = useWallet();
  const { isMobile } = useDevice();
  const { toast } = useToast();
  
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: listings, isLoading } = useQuery<MarketplaceListing[]>({
    queryKey: ['/api/marketplace/listings'],
    staleTime: 30000,
  });

  const { data: myListings } = useQuery<MarketplaceListing[]>({
    queryKey: ['/api/marketplace/mylistings'],
    enabled: !!wallet,
    staleTime: 30000,
  });

  const buyMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const response = await apiRequest('POST', `/api/marketplace/buy/${listingId}`, {
        buyerAddress: wallet?.address,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Purchase completed successfully!',
      });
      setSelectedListing(null);
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/mylistings'] });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to purchase token',
        variant: 'destructive',
      });
    },
  });

  const filteredListings = listings?.filter(listing => {
    const matchesType = filterType === 'all' || listing.assetType === filterType;
    const matchesSearch = !searchQuery || 
      listing.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch && listing.status === 'active';
  });

  const stats = {
    totalListings: filteredListings?.length || 0,
    avgPrice: filteredListings?.length 
      ? (filteredListings.reduce((acc, l) => acc + parseFloat(l.price), 0) / filteredListings.length).toFixed(2)
      : '0',
    myListings: myListings?.filter(l => l.status === 'active').length || 0,
  };

  const handleBuy = (listing: MarketplaceListing) => {
    if (!wallet) {
      toast({
        title: t('wallet.no_wallet_error'),
        description: 'Please import a wallet first',
        variant: 'destructive',
      });
      return;
    }
    setSelectedListing(listing);
  };

  const confirmPurchase = () => {
    if (selectedListing) {
      buyMutation.mutate(selectedListing.id);
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen pb-4">
        <MobileGradientHeader>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{t('nav.marketplace')}</h1>
              <p className="text-sm opacity-90 mt-1">Buy & Sell AgroTokens</p>
            </div>
            <ShoppingCart className="h-8 w-8" />
          </div>
        </MobileGradientHeader>

        <div className="px-4 space-y-4 mt-4">
          <div className="grid grid-cols-3 gap-3">
            <MobileStatsCard
              title="Listed"
              value={stats.totalListings}
              icon={Tag}
            />
            <MobileStatsCard
              title="Avg Price"
              value={`R$ ${stats.avgPrice}`}
              icon={DollarSign}
            />
            <MobileStatsCard
              title="My Sales"
              value={stats.myListings}
              icon={TrendingUp}
            />
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              data-testid="input-search"
            />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[120px]" data-testid="select-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="cpr">CPR</SelectItem>
                <SelectItem value="receivable">Receivable</SelectItem>
                <SelectItem value="harvest">Harvest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredListings?.map(listing => (
                <Card key={listing.id} className="hover-elevate" data-testid={`listing-${listing.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{listing.name}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          <Badge variant="outline" className="text-[10px]">
                            {listing.assetType}
                          </Badge>
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">R$ {listing.price}</p>
                        <p className="text-[10px] text-muted-foreground">BRLx</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardFooter className="pt-0 flex gap-2">
                    <Button 
                      className="flex-1" 
                      size="sm"
                      onClick={() => handleBuy(listing)}
                      data-testid={`button-buy-${listing.id}`}
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Buy Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <KaleidoGradient />
      
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('nav.marketplace')}</h1>
            <p className="text-muted-foreground mt-1">
              Buy and sell tokenized agricultural assets
            </p>
          </div>
          <ShoppingCart className="h-10 w-10 text-primary" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalListings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Available for purchase
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Price</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.avgPrice}</div>
              <p className="text-xs text-muted-foreground mt-1">
                BRLx per token
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Listings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.myListings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Tokens for sale
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
              data-testid="input-search"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[200px]" data-testid="select-filter">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="cpr">CPR</SelectItem>
              <SelectItem value="receivable">Receivable</SelectItem>
              <SelectItem value="harvest">Harvest Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : filteredListings && filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map(listing => (
              <Card key={listing.id} className="hover-elevate active-elevate-2" data-testid={`listing-${listing.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{listing.name}</CardTitle>
                      <CardDescription className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          {listing.assetType}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Asset Value</span>
                    <span className="font-medium">R$ {listing.value}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">List Price</span>
                    <span className="font-bold text-primary text-lg">R$ {listing.price}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Maturity
                    </span>
                    <span className="font-medium">
                      {listing.maturityDate && format(new Date(listing.maturityDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  {listing.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                      {listing.description}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    onClick={() => handleBuy(listing)}
                    data-testid={`button-buy-${listing.id}`}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Buy Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No listings available</h3>
            <p className="text-sm text-muted-foreground">
              Check back later for new AgroTokens on the marketplace
            </p>
          </Card>
        )}
      </div>

      <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
        <DialogContent data-testid="dialog-purchase">
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              Review the details before completing your purchase
            </DialogDescription>
          </DialogHeader>
          
          {selectedListing && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Token Name</Label>
                <p className="text-sm font-medium">{selectedListing.agroToken?.name}</p>
              </div>
              
              <div className="space-y-2">
                <Label>Asset Type</Label>
                <p className="text-sm">
                  <Badge variant="outline">{selectedListing.agroToken?.assetType}</Badge>
                </p>
              </div>

              <div className="space-y-2">
                <Label>Purchase Price</Label>
                <p className="text-2xl font-bold text-primary">R$ {selectedListing.price}</p>
                <p className="text-xs text-muted-foreground">Payment will be made in BRLx tokens</p>
              </div>

              <div className="space-y-2">
                <Label>Seller</Label>
                <p className="text-xs font-mono bg-muted px-3 py-2 rounded">
                  {selectedListing.sellerAddress}
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-xs text-muted-foreground">
                  This transaction will transfer {selectedListing.price} BRLx from your wallet to the seller,
                  and the AgroToken NFT will be transferred to your address.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setSelectedListing(null)}
              data-testid="button-cancel-purchase"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmPurchase}
              disabled={buyMutation.isPending}
              data-testid="button-confirm-purchase"
            >
              {buyMutation.isPending ? 'Processing...' : 'Confirm Purchase'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
