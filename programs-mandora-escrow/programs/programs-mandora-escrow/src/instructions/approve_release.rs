use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::constants::*;
use crate::error::MandoraError;
use crate::state::*;

#[derive(Accounts)]
pub struct ApproveRelease<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: The assigned worker — used for payout destination
    #[account(mut)]
    pub worker: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [ESCROW_SEED, authority.key().as_ref(), &escrow.job_id],
        bump = escrow.bump,
        constraint = escrow.authority == authority.key() @ MandoraError::UnauthorizedAuthority,
        constraint = escrow.status == EscrowStatus::ProofSubmitted @ MandoraError::InvalidEscrowStatus,
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

pub fn handler(ctx: Context<ApproveRelease>) -> Result<()> {
    let escrow_info = ctx.accounts.escrow.to_account_info();
    let escrow = &mut ctx.accounts.escrow;

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

    // PDA signer seeds
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

    // Transfer fee to authority
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

    msg!("Escrow approved and released manually");
    Ok(())
}
