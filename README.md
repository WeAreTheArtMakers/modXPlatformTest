# modX Platform

<div align="center">

![modX Logo](https://img.shields.io/badge/modX-DeFi%20Platform-00ff88?style=for-the-badge&logo=ethereum&logoColor=white)

**Next-generation DeFi platform on BSC Testnet**

[![License](https://img.shields.io/badge/License-W.A.T.A.M.-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev/)

[Demo](#demo) • [Features](#features) • [Installation](#installation) • [Deployment](#deployment)

</div>

---

## Features

- **🔒 Staking** - Stake modX tokens with flexible lock periods and earn rewards
- **🔄 Token Swap** - Instant token exchange via PancakeSwap integration
- **💧 Liquidity Pools** - Add/remove liquidity and earn trading fees
- **🎨 NFT Dashboard** - Mint, transfer, and manage licensed NFTs
- **📊 Market Data** - Real-time price tracking from Binance API
- **🌐 Multi-language** - English & Turkish support (extensible)
- **🌙 Dark Mode** - Eye-friendly dark theme

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| Blockchain | ethers.js v6, BSC Testnet |
| State | TanStack Query, React Context |
| Backend | Supabase |

## Installation

### Prerequisites

- Node.js 18+
- npm or bun
- MetaMask wallet

### Setup

```bash
# Clone repository
git clone https://github.com/your-username/modx-platform.git
cd modx-platform

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your values

# Start development server
npm run dev
```

### Environment Variables

```env
VITE_MODX_NFT_ADDRESS=0x_your_nft_contract_address
NEXT_PUBLIC_UPLOAD_API_URL=https://your-api.com/upload
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Deployment

### Netlify (Recommended)

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** 18
3. Add environment variables in Netlify dashboard
4. Deploy!

The `netlify.toml` file is pre-configured for SPA routing.

### Manual Deployment

```bash
npm run build
# Upload 'dist' folder to your hosting provider
```

## Smart Contracts (BSC Testnet)

| Contract | Address |
|----------|---------|
| modX Token | `0xB6322eD8561604Ca2A1b9c17e4d02B957EB242fe` |
| Staking | `0xab3544A6f2aF70064c5B5D3f0E74323DB9a81945` |
| PancakeSwap Router | `0x9ac64cc6e4415144c455bd8e4837fea55603e5c3` |

## Project Structure

```
src/
├── components/     # UI components
├── context/        # React contexts (Web3, Language, Theme)
├── hooks/          # Custom hooks (useStaking, useSwap, useLiquidity)
├── pages/          # Route pages
├── lib/            # Utilities
└── config/         # Constants & configuration
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## License

This project is licensed under the **W.A.T.A.M. License** - see [LICENSE](LICENSE) file.

---

<div align="center">

**W.A.T.A.M.** - We Are The Anonymous Minds

Building the decentralized future, one block at a time.

</div>
