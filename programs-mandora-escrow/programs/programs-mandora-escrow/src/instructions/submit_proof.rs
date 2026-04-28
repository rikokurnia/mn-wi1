use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::constants::*;
use crate::error::MandoraError;
use crate::state::*;

#[derive(Accounts)]
pub struct SubmitProof<'info> {
    #[account(mut)]
    pub worker: Signer<'info>,

    /// CHECK: The escrow authority (ops wallet) — used for fee transfer
    #[account(mut)]
    pub authority: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [ESCROW_SEED, escrow.authority.as_ref(), &escrow.job_id],
        bump = escrow.bump,
        constraint = escrow.worker == worker.key() @ MandoraError::UnauthorizedWorker,
        constraint = escrow.status == EscrowStatus::Assigned @ MandoraError::InvalidEscrowStatus,
    )]
    pub escrow: Account<'info, EscrowAccount>,

    #[account(
        mut,
        seeds = [ESCROW_TOKEN_SEED, escrow.key().as_ref()],
        bump,
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = worker_token_account.owner == worker.key(),
    )]
    pub worker_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = authority_token_account.owner == authority.key(),
    )]
    pub authority_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(
    ctx: Context<SubmitProof>,
    worker_lat: i64,
    worker_lng: i64,
    photo_hash: [u8; 32],
) -> Result<()> {
    let escrow_info = ctx.accounts.escrow.to_account_info();
    let escrow = &mut ctx.accounts.escrow;
    let clock = Clock::get()?;

    require!(clock.unix_timestamp <= escrow.deadline, MandoraError::DeadlinePassed);

    // Check geofence
    let within = is_within_geofence(
        escrow.latitude,
        escrow.longitude,
        worker_lat,
        worker_lng,
        escrow.radius_m,
    );
    require!(within, MandoraError::OutsideGeofence);

    // Record proof
    escrow.photo_hash = photo_hash;
    escrow.status = EscrowStatus::ProofSubmitted;

    // Calculate payouts
    let fee = escrow
        .amount
        .checked_mul(PROTOCOL_FEE_BPS)
        .and_then(|v| v.checked_div(BPS_DENOMINATOR))
        .ok_or(MandoraError::ArithmeticOverflow)?;

    let worker_payout = escrow
        .amount
        .checked_sub(fee)
        .ok_or(MandoraError::ArithmeticOverflow)?;

    // PDA signer seeds for escrow_token_account
    let _escrow_key = escrow.key();
    let bump = escrow.bump;
    let authority_key = escrow.authority;
    let job_id = escrow.job_id;
    let escrow_seeds: &[&[u8]] = &[
        ESCROW_SEED,
        authority_key.as_ref(),
        &job_id,
        &[bump],
    ];
    let signer_seeds = &[&escrow_seeds[..]];

    // Transfer to worker
    let worker_transfer = CpiContext::new_with_signer(
        ctx.accounts.token_program.key(),
        Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.worker_token_account.to_account_info(),
            authority: escrow_info.clone(),
        },
        signer_seeds,
    );
    token::transfer(worker_transfer, worker_payout)?;

    // Transfer fee to authority (Mandora ops)
    let fee_transfer = CpiContext::new_with_signer(
        ctx.accounts.token_program.key(),
        Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.authority_token_account.to_account_info(),
            authority: escrow_info,
        },
        signer_seeds,
    );
    token::transfer(fee_transfer, fee)?;

    escrow.status = EscrowStatus::Released;

    msg!(
        "Proof submitted and released: worker={}, fee={}",
        worker_payout,
        fee
    );
    Ok(())
}

/// Equirectangular approximation for GPS distance (valid for <100km).
/// All coordinates are fixed-point * 1e7.
fn is_within_geofence(
    target_lat: i64,
    target_lng: i64,
    worker_lat: i64,
    worker_lng: i64,
    radius_m: u32,
) -> bool {
    let dlat = (worker_lat - target_lat).abs();
    let dlng = (worker_lng - target_lng).abs();

    // 1 degree = 111_320 meters.
    // Fixed-point scale = 1e7, so:
    //   meters = (delta * 111_320) / 1e7  =  (delta * 11_132) / 1_000_000
    let dx = (dlng as i128 * 11_132i128) / 1_000_000i128;
    let dy = (dlat as i128 * 11_132i128) / 1_000_000i128;

    let dist_sq = dx * dx + dy * dy;
    let radius_sq = (radius_m as i128) * (radius_m as i128);

    dist_sq <= radius_sq
}
