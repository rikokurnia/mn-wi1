import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import bs58 from 'bs58';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json({ error: 'walletAddress is required' }, { status: 400 });
    }

    if (!process.env.OPS_WALLET_PRIVATE_KEY) {
      return NextResponse.json({ error: 'OPS_WALLET_PRIVATE_KEY not configured' }, { status: 500 });
    }

    const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC!, 'confirmed');
    const opsKeypair = Keypair.fromSecretKey(bs58.decode(process.env.OPS_WALLET_PRIVATE_KEY));
    const toPubkey = new PublicKey(walletAddress);

    // 1. Fund SOL for gas
    const balance = await connection.getBalance(toPubkey);
    const TARGET_BALANCE = 5000000; // 0.005 SOL
    
    if (balance < TARGET_BALANCE) {
      const amountToFund = TARGET_BALANCE - balance;
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: opsKeypair.publicKey,
          toPubkey: toPubkey,
          lamports: amountToFund,
        })
      );
      await sendAndConfirmTransaction(connection, tx, [opsKeypair]);
    }

    // 2. Create IDRX token account for worker (so submitProof never fails with 0x1)
    try {
      const mint = new PublicKey(process.env.NEXT_PUBLIC_IDRX_MINT!);
      await getOrCreateAssociatedTokenAccount(
        connection,
        opsKeypair,   // payer
        mint,
        toPubkey      // owner
      );
    } catch (ataErr: any) {
      // Non-fatal — log it but don't block worker login
      console.warn('ATA creation warning:', ataErr.message);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Funding error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

