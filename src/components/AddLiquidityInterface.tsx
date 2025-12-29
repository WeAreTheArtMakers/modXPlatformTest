import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useSwap } from '@/hooks/useSwap';
import { Plus } from 'lucide-react';

const AddLiquidityInterface = () => {
  const { addLiquidity, isLoading, tokens, bnbBalance } = useSwap();
  const [modXAmount, setModXAmount] = useState('');
  const [bnbAmount, setBnbAmount] = useState('');

  const modXToken = tokens.find(t => t.symbol === 'modX');

  const handleAdd = async () => {
    await addLiquidity(modXAmount, bnbAmount);
    setModXAmount('');
    setBnbAmount('');
  };

  return (
    <Card className="cyber-card">
      <CardHeader>
        <CardTitle>Likidite Ekle (modX/BNB)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* MODX Input */}
        <div className="p-4 bg-background/30 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-lg">modX</span>
            <span className="text-sm text-foreground/60">
              Bakiye: {modXToken ? parseFloat(modXToken.balance).toFixed(4) : '0.00'}
            </span>
          </div>
          <Input
            type="number"
            value={modXAmount}
            onChange={(e) => setModXAmount(e.target.value)}
            placeholder="0.0"
            className="text-2xl bg-transparent border-0 focus:ring-0 p-0"
          />
        </div>

        <div className="flex justify-center my-[-10px]">
          <Plus className="w-6 h-6 text-foreground/50" />
        </div>

        {/* BNB Input */}
        <div className="p-4 bg-background/30 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-lg">BNB</span>
            <span className="text-sm text-foreground/60">
              Bakiye: {parseFloat(bnbBalance).toFixed(4)}
            </span>
          </div>
          <Input
            type="number"
            value={bnbAmount}
            onChange={(e) => setBnbAmount(e.target.value)}
            placeholder="0.0"
            className="text-2xl bg-transparent border-0 focus:ring-0 p-0"
          />
        </div>
        
        <div className="text-center text-foreground/70 text-sm">
          Likidite eklerken, girdiğiniz token miktarları havuzun o anki fiyat oranını belirleyecektir.
        </div>

        <Button 
          onClick={handleAdd} 
          disabled={isLoading || !modXAmount || !bnbAmount || Number(modXAmount) <= 0 || Number(bnbAmount) <= 0} 
          className="w-full"
        >
          {isLoading ? 'Likidite Ekleniyor...' : 'Likidite Ekle'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AddLiquidityInterface;
