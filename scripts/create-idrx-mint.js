const { Connection, Keypair, PublicKey } = require('@solana/web3.js')
const { createMint, getOrCreateAssociatedTokenAccount, mintTo } = require('@solana/spl-token')
const fs = require('fs')

const RPC = 'https://api.devnet.solana.com'
const connection = new Connection(RPC, 'confirmed')

// Load payer from the funded devnet keypair
const secretKey = JSON.parse(fs.readFileSync(process.env.HOME + '/.config/solana/mandora-devnet.json', 'utf8'))
const payer = Keypair.fromSecretKey(new Uint8Array(secretKey))

async function main() {
  console.log('Payer:', payer.publicKey.toBase58())
  const balance = await connection.getBalance(payer.publicKey)
  console.log('Balance:', balance / 1e9, 'SOL')

  // Create mint with 6 decimals (like IDRX)
  const mint = await createMint(
    connection,
    payer,
    payer.publicKey, // mint authority
    payer.publicKey, // freeze authority
    6
  )
  console.log('✅ IDRX Mint created:', mint.toBase58())

  // Create ATA for payer
  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  )
  console.log('ATA:', ata.address.toBase58())

  // Mint 1,000,000 IDRX to payer
  await mintTo(
    connection,
    payer,
    mint,
    ata.address,
    payer.publicKey,
    1_000_000 * 1_000_000 // 1M tokens with 6 decimals
  )
  console.log('✅ Minted 1,000,000 IDRX to payer')

  // Create ATA for fee collector
  const feeAta = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    new PublicKey('8n47cN4y56W61c81xxiFWxrn8nR4Y3VRcc8TCq92VJaM') // protocol fee wallet
  )
  console.log('Fee ATA:', feeAta.address.toBase58())

  console.log('\n--- Add this to .env.local ---')
  console.log('NEXT_PUBLIC_IDRX_MINT=' + mint.toBase58())
}

main().catch(console.error)
