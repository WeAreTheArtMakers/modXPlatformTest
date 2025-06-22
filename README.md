# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/6e2b0788-d2c4-4860-be18-dedb5f91b494

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/6e2b0788-d2c4-4860-be18-dedb5f91b494) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/6e2b0788-d2c4-4860-be18-dedb5f91b494) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

---
## 📝 Geliştirme Notları (Oturum Özeti)

Aşağıdaki önemli değişiklikler yerelde uygulandı ve takip edilmesi önerilir:

- **userActivePoolIds fallback**: `useStaking.tsx` içinde `userActivePoolIds` geri dönerken hata (revert) alınması durumunda `getUserStakeInfo` kullanarak manuel aktif havuz ID listesi oluşturuldu.
- **Etkinlik geçmişi chunk’lı çekim**: `fetchTransactionHistory` fonksiyonu, BSC Testnet RPC limit aşımını önlemek için 5.000 blokluk segmentlerle `Staked`, `Unstaked` ve `RewardsClaimed` olaylarını topluyor.
- **Tekrarlı UI yenileme**: Stake/unstake/claim işlemleri için `tx.wait()` sonrası `fetchStakes()`, `fetchPools()`, `fetchBalance()` ve `fetchTransactionHistory()` çağrıları eklendi.
- **Hata bildirimleri**: Critical kontrat çağrıları (`userActivePoolIds`, `fetchTransactionHistory` vb.) `try/catch` içinde toast mesajlarıyla kullanıcıya iletiliyor.
- **Pool kart güncellemesi**: Havuz kartlarında APY, kilit süresi, toplam stake tutarı ve aktif/pasif durumu gösteriliyor.

### 🚀 Sonraki Adımlar

1. `src/hooks/useStaking.tsx` içindeki `deploymentBlock` değerini gerçek deploy bloğunuzla güncelleyin.
2. `npm install` ile bağımlılıkları yükleyin.
3. `npm run dev` komutuyla yerel geliştirme sunucusunu başlatın.
4. Tarayıcıda http://localhost:5173 adresini açın, MetaMask üzerinden BSC Testnet’e bağlanın ve stake arayüzünü kontrol edin.

Bu notlar, bilgisayar yeniden başlatıldığında kaldığınız yerden hızla devam etmenize yardımcı olacaktır.
