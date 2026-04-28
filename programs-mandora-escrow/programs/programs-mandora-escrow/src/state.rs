use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct EscrowAccount {
    pub authority: Pubkey,       // Mandora ops wallet
    pub worker: Pubkey,          // assigned worker (or Pubkey::default if unassigned)
    pub job_id: [u8; 16],
    pub amount: u64,
    pub latitude: i64,
    pub longitude: i64,
    pub radius_m: u32,
    pub deadline: i64,
    pub photo_hash: [u8; 32],
    pub status: EscrowStatus,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, InitSpace)]
pub enum EscrowStatus {
    Created,
    Assigned,
    ProofSubmitted,
    Released,
    Cancelled,
    Disputed,
}
