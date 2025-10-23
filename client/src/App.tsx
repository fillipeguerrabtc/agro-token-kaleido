import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { DeviceProvider } from "@/contexts/DeviceContext";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { WalletButton } from "@/components/WalletButton";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import "./lib/i18n";

import Home from "@/pages/Home";
import Originator from "@/pages/Originator";
import Investor from "@/pages/Investor";
import Marketplace from "@/pages/Marketplace";
import Stablecoin from "@/pages/Stablecoin";
import CrossBorder from "@/pages/CrossBorder";
import Custody from "@/pages/Custody";
import Governance from "@/pages/Governance";
import Transactions from "@/pages/Transactions";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/originator" component={Originator} />
      <Route path="/investor" component={Investor} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/stablecoin" component={Stablecoin} />
      <Route path="/crossborder" component={CrossBorder} />
      <Route path="/custody" component={Custody} />
      <Route path="/governance" component={Governance} />
      <Route path="/transactions" component={Transactions} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <WalletProvider>
          <WebSocketProvider>
            <DeviceProvider>
              <TooltipProvider>
                <SidebarProvider style={style as React.CSSProperties}>
                  <div className="flex h-screen w-full">
                    <AppSidebar />
                    <div className="flex flex-col flex-1 overflow-hidden">
                      <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <SidebarTrigger data-testid="button-sidebar-toggle" />
                        <div className="flex items-center gap-2 md:gap-3">
                          <LanguageSwitcher />
                          <ThemeToggle />
                          <WalletButton />
                        </div>
                      </header>
                      <main className="flex-1 overflow-auto pb-16 md:pb-0">
                        <Router />
                      </main>
                    </div>
                  </div>
                </SidebarProvider>
                <MobileBottomNav />
                <Toaster />
              </TooltipProvider>
            </DeviceProvider>
          </WebSocketProvider>
        </WalletProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
