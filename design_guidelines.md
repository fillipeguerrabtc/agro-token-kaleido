# Design Guidelines: AgroToken-StableBR Platform

## Design Approach
**Reference-Based Approach**: Strict adherence to Kaleido's corporate identity (https://www.kaleido.io) with blockchain-enterprise UX patterns. This is a fintech/blockchain platform requiring professional credibility and data visualization excellence.

## Core Design Elements

### A. Color Palette

**Brand Colors (Kaleido Identity):**
- Primary Gradient: Blue to Purple (240 100% 56% → 270 100% 68%)
- Background: Pure white (0 0% 100%)
- Text Primary: Deep charcoal (220 20% 15%)
- Text Secondary: Medium gray (220 10% 45%)

**Dark Mode:**
- Background: Deep navy (220 25% 8%)
- Surface: Slate (220 20% 12%)
- Gradient overlay: Same blue-purple with 20% opacity
- Text Primary: Off-white (0 0% 95%)
- Text Secondary: Light gray (220 10% 70%)

**Functional Colors:**
- Success (blockchain confirmed): 142 70% 45%
- Warning (pending): 38 92% 50%
- Error (failed transaction): 0 70% 50%
- Info (network status): 200 95% 45%

### B. Typography

**Font Family:**
- Primary: Inter or similar modern sans-serif (Google Fonts)
- Monospace (addresses/hashes): Fira Code or JetBrains Mono

**Scale:**
- Display (Hero): 48px/60px, weight 700
- H1 (Dashboard titles): 32px/40px, weight 600
- H2 (Section headers): 24px/32px, weight 600
- H3 (Card titles): 18px/24px, weight 500
- Body: 16px/24px, weight 400
- Caption (timestamps/metadata): 14px/20px, weight 400
- Code (blockchain data): 14px/20px, monospace, weight 400

### C. Layout System

**Spacing Units (Tailwind):**
- Primary rhythm: 4, 6, 8, 12, 16, 24 (p-4, m-6, gap-8, etc.)
- Section padding: py-12 (mobile), py-20 (desktop)
- Component padding: p-6 (cards), p-8 (modals)

**Container Structure:**
- Max-width: max-w-7xl for dashboards
- Sidebar width: 280px (navigation)
- Content grid: 12-column responsive grid
- Card spacing: gap-6 (mobile), gap-8 (desktop)

### D. Component Library

**Navigation:**
- Fixed sidebar with gradient accent border
- Breadcrumbs for deep navigation
- Language selector (PT-BR/EN flag icons) in top-right
- "Powered by Kaleido" logo lockup in header

**Dashboard Modules:**
- Modular cards with subtle shadow (shadow-lg)
- Rounded corners: rounded-xl
- Gradient borders on hover (blue-purple)
- Stats blocks: 3-4 columns on desktop, stack on mobile

**Blockchain Elements:**
- Transaction cards with monospace hashes (truncated with ellipsis)
- Status badges with colored dots
- Block explorer links (external icon)
- Real-time balance displays with ETH/token icons
- Chart visualizations using clean line graphs

**Forms (Tokenization/Stablecoin):**
- Large input fields with clear labels
- Inline validation (green check/red x)
- Multi-step wizard for token creation
- File upload for asset documentation (drag-drop)
- Confirmation modals before blockchain transactions

**Data Tables:**
- Striped rows for transaction history
- Sortable columns
- Pagination at bottom
- Action buttons (view details, copy hash)
- Responsive: cards on mobile, table on desktop

**CTAs:**
- Primary: Gradient blue-purple background, white text, rounded-lg
- Secondary: Outline with gradient border, text-gradient
- On images/hero: Blurred background (backdrop-blur-sm), no hover modifications

### E. Animations

**Subtle Micro-interactions Only:**
- Card hover: slight scale (scale-105) + shadow increase
- Button press: subtle scale-down (scale-95)
- Loading states: spinning gradient ring
- Transaction confirmation: success checkmark animation
- Page transitions: fade-in (300ms)
- **No** elaborate scroll animations or parallax

## Bilingual Implementation

**Language Switcher:**
- Persistent flag-based toggle in top-right corner
- BR 🇧🇷 / US 🇺🇸 icons
- Saves preference to localStorage
- Updates all text instantly (no page reload)

**Content Strategy:**
- All labels, buttons, error messages in both languages
- Currency formatting: R$ for PT-BR, USD equivalent for EN
- Date/time: DD/MM/YYYY (PT-BR), MM/DD/YYYY (EN)

## Page-Specific Guidelines

### Landing Page
**Hero Section (80vh):**
- Gradient background (blue-purple)
- Bold headline in PT-BR/EN
- Dual CTAs: "Começar Tokenização" / "Ver Dashboard"
- Abstract blockchain network visualization (subtle animated nodes)
- Kaleido co-branding badge

**Features Section:**
- 3-column grid: Tokenização, Stablecoin BRLx, Governança
- Linear icons with gradient accent
- Brief descriptions with "Saiba Mais" links

**Trust Indicators:**
- "Powered by Sepolia Network" badge
- Mock partnership logos (stylized)
- Real transaction counter (synced from blockchain)

### Dashboard Originador
- Left sidebar: Navigation (Meus Ativos, Emitir Token, Histórico)
- Main content: Token creation wizard with progress steps
- Asset type selector: CPR, Recebível, Contrato de Safra (visual cards)
- Form fields: Valor, Vencimento, Descrição, Upload de Documentos
- Preview panel showing token metadata before minting

### Dashboard Investidor
- Portfolio overview cards: Total Value, AgroTokens, BRLx Balance
- Transaction history table with Etherscan links
- Token detail modals with full metadata
- Buy/Sell interface with real-time BRLx conversion

### Stablecoin Module
- Mint/Burn toggle interface
- Input with BRL → BRLx conversion calculator
- Wallet balance display (synced from blockchain)
- Transaction confirmation dialog with gas estimate

### Governança Panel (Mocked Kaleido Integration)
- Firefly workflow visualization (flowchart-style)
- Whitelist management table
- Compliance rules cards
- Mock API status indicators (green dots)

## Images

**Hero Section:**
- Abstract 3D blockchain network visualization with blue-purple gradient overlay
- Glowing nodes connected by lines suggesting tokenization flow
- Blurred, atmospheric background emphasizing text readability

**Dashboard Icons/Illustrations:**
- Agricultural icons: wheat, tractor, soybean for asset types
- Blockchain icons: wallet, token, smart contract
- Use line-style icons matching Kaleido's minimal aesthetic

**Trust/Partnership Section:**
- Kaleido logo (co-branding)
- Sepolia network badge
- Abstract representations of agricultural commodities

## Critical Constraints

- All blockchain data (balances, transactions) must appear as real, not placeholder
- Maintain Kaleido's professional, enterprise-grade aesthetic
- No playful or consumer-facing design elements
- Prioritize data clarity and transaction confidence
- Responsive design that works on tablets (common in agribusiness)
- Accessible color contrast ratios (WCAG AA minimum)
- Fast load times: optimize for low-bandwidth Brazilian networks