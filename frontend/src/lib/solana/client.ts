// @ts-nocheck
import { AnchorProvider, Program, web3, BN } from '@coral-xyz/anchor'
import { Connection, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js'
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token'
import idl from './idl.json'

export const PROGRAM_ID = new PublicKey('6Dn1r6gSG4MrrvPEZjPk7x4PRxJZybxP6UKw5JKCxxVP')
export const ESCROW_SEED = Buffer.from('escrow')
export const ESCROW_TOKEN_SEED = Buffer.from('escrow_token')

/**
 * Converts a UUID v4 string to a 16-byte Uint8Array for use as job_id on-chain.
 * On-chain expects exactly [u8; 16]. UUIDs are 36 chars (32 hex + 4 hyphens).
 * We hash the first 16 bytes of the hex representation via SHA-256, then take the first 16 bytes.
 */
export async function uuidToJobId(uuid: string): Promise<Uint8Array> {
  // Strip hyphens so we have 32 hex chars
  const hex = uuid.replace(/-/g, '')
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  // Simple deterministic hash: XOR-fold the 32 bytes down to 16 bytes
  const out = new Uint8Array(16)
  for (let i = 0; i < 16; i++) {
    out[i] = bytes[i] ^ bytes[i + 16]
  }
  return out
}

/** Sync version — derives jobId from uuid synchronously (uses hex XOR fold). */
export function uuidToJobIdSync(uuid: string): Uint8Array {
  const hex = uuid.replace(/-/g, '')
  const bytes = new Uint8Array(16)
  for (let i = 0; i < 16; i++) {
    const hi = parseInt(hex.slice(i * 2, i * 2 + 2) || '00', 16)
    const lo = parseInt(hex.slice((i + 16) * 2, (i + 16) * 2 + 2) || '00', 16)
    bytes[i] = hi ^ lo
  }
  return bytes
}

export function getProgram(connection: Connection, wallet: any) {
  const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' })
  return new Program(idl as any, provider) as any
}

export function getEscrowPDA(authority: PublicKey, jobId: Uint8Array) {
  return PublicKey.findProgramAddressSync(
    [ESCROW_SEED, authority.toBuffer(), jobId],
    PROGRAM_ID
  )
}

export function getEscrowTokenPDA(escrow: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [ESCROW_TOKEN_SEED, escrow.toBuffer()],
    PROGRAM_ID
  )
}

export async function createEscrowTx(
  program: any,
  authority: PublicKey,
  authorityTokenAccount: PublicKey,
  mint: PublicKey,
  jobId: Uint8Array,
  amount: BN,
  latitude: BN,
  longitude: BN,
  radiusM: number,
  deadline: BN
) {
  const [escrowPDA] = getEscrowPDA(authority, jobId)
  const [escrowTokenPDA] = getEscrowTokenPDA(escrowPDA)

  return program.methods
    .createEscrow(Array.from(jobId), amount, latitude, longitude, radiusM, deadline)
    .accounts({
      authority,
      escrow: escrowPDA,
      escrowTokenAccount: escrowTokenPDA,
      authorityTokenAccount,
      mint,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    } as any)
    .rpc()
}

export async function assignWorkerTx(
  program: Program<any>,
  authority: PublicKey,
  worker: PublicKey,
  jobId: Uint8Array
) {
  const [escrowPDA] = getEscrowPDA(authority, jobId)

  return program.methods
    .assignWorker()
    .accounts({
      authority,
      worker,
      escrow: escrowPDA,
    } as any)
    .rpc()
}

export async function submitProofTx(
  program: Program<any>,
  worker: PublicKey,
  authority: PublicKey,
  workerTokenAccount: PublicKey,
  authorityTokenAccount: PublicKey,
  jobId: Uint8Array,
  workerLat: BN,
  workerLng: BN,
  photoHash: Uint8Array
) {
  const [escrowPDA] = getEscrowPDA(authority, jobId)
  const [escrowTokenPDA] = getEscrowTokenPDA(escrowPDA)

  return program.methods
    .submitProof(workerLat, workerLng, Array.from(photoHash))
    .accounts({
      worker,
      authority,
      escrow: escrowPDA,
      escrowTokenAccount: escrowTokenPDA,
      workerTokenAccount,
      authorityTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
    } as any)
    .rpc()
}

export async function approveReleaseTx(
  program: Program<any>,
  authority: PublicKey,
  worker: PublicKey,
  workerTokenAccount: PublicKey,
  authorityTokenAccount: PublicKey,
  jobId: Uint8Array
) {
  const [escrowPDA] = getEscrowPDA(authority, jobId)
  const [escrowTokenPDA] = getEscrowTokenPDA(escrowPDA)

  return program.methods
    .approveRelease()
    .accounts({
      authority,
      worker,
      escrow: escrowPDA,
      escrowTokenAccount: escrowTokenPDA,
      workerTokenAccount,
      authorityTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
    } as any)
    .rpc()
}

export async function cancelEscrowTx(
  program: Program<any>,
  authority: PublicKey,
  authorityTokenAccount: PublicKey,
  jobId: Uint8Array
) {
  const [escrowPDA] = getEscrowPDA(authority, jobId)
  const [escrowTokenPDA] = getEscrowTokenPDA(escrowPDA)

  return program.methods
    .cancelEscrow()
    .accounts({
      authority,
      escrow: escrowPDA,
      escrowTokenAccount: escrowTokenPDA,
      authorityTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
    } as any)
    .rpc()
}
