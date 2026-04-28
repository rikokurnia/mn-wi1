use anchor_lang::prelude::*;

#[constant]
pub const ESCROW_SEED: &[u8] = b"escrow";

#[constant]
pub const ESCROW_TOKEN_SEED: &[u8] = b"escrow_token";

#[constant]
pub const PROTOCOL_FEE_BPS: u64 = 500; // 5% in basis points

#[constant]
pub const BPS_DENOMINATOR: u64 = 10_000;
