const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { getOrCreateAssociatedTokenAccount, mintTo } = require('@solana/spl-token');
const fs = require('fs');

async function main() {
  const args = process.argv.slice(2);
  if (!args[0]) {
    console.error('Usage: node scripts/mint-to-user.js <PHANTOM_WALLET_ADDRESS>');
    process.exit(1);
  }

  const userWallet = new PublicKey(args[0]);
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Load payer
  const secretKey = JSON.parse(fs.readFileSync(process.env.HOME + '/.config/solana/mandora-devnet.json', 'utf8'));
  const payer = Keypair.fromSecretKey(new Uint8Array(secretKey));
  
  const mint = new PublicKey(process.env.NEXT_PUBLIC_IDRX_MINT || '34umxXyTBxxzNj2snnbCJ9s6BAUTnV94uVNGHP9Jz7nX');

  console.log('Minting to:', userWallet.toBase58());
  console.log('Using Mint:', mint.toBase58());

  // Create or get ATA for user
  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    userWallet
  );
  console.log('User ATA created/found:', ata.address.toBase58());

  // Mint 10,000 IDRX to the user
  const txSignature = await mintTo(
    connection,
    payer,
    mint,
    ata.address,
    payer, // mint authority is payer
    10_000 * 1_000_000 // 10k tokens with 6 decimals
  );
  
  console.log('✅ Successfully minted 10,000 IDRX!');
  console.log('Tx Signature:', txSignature);
}

main().catch(console.error);
