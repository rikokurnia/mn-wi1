import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, amount = 10000 } = await request.json();

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    const userWallet = new PublicKey(walletAddress);
    const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com', 'confirmed');
    
    // Load payer from env var (for Vercel) or fallback to local filesystem (for local dev)
    let secretKeyArray;
    if (process.env.OPS_WALLET_PRIVATE_KEY) {
      // Assuming it's a comma-separated string or JSON array
      const keyStr = process.env.OPS_WALLET_PRIVATE_KEY;
      secretKeyArray = keyStr.startsWith('[') ? JSON.parse(keyStr) : keyStr.split(',').map(Number);
    } else {
      // Local fallback
      try {
        const homeDir = process.env.HOME || process.env.USERPROFILE;
        const secretKeyRaw = fs.readFileSync(`${homeDir}/.config/solana/mandora-devnet.json`, 'utf8');
        secretKeyArray = JSON.parse(secretKeyRaw);
      } catch (err) {
        return NextResponse.json({ error: 'Ops wallet not configured. Please add OPS_WALLET_PRIVATE_KEY to .env' }, { status: 500 });
      }
    }

    const payer = Keypair.fromSecretKey(new Uint8Array(secretKeyArray));
    const mint = new PublicKey(process.env.NEXT_PUBLIC_IDRX_MINT!);

    // Get or Create ATA
    const ata = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      userWallet
    );

    // Mint tokens
    const txSignature = await mintTo(
      connection,
      payer,
      mint,
      ata.address,
      payer, // mint authority
      amount * 1_000_000 // Multiply by decimals (6)
    );

    return NextResponse.json({ 
      success: true, 
      txSignature, 
      message: `Minted ${amount} IDRX successfully` 
    });

  } catch (error: any) {
    console.error('Minting error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
