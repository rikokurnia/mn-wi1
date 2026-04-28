use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::constants::*;
use crate::error::MandoraError;
use crate::state::*;

#[derive(Accounts)]
pub struct RefundEscrow<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [ESCROW_SEED, authority.key().as_ref(), &escrow.job_id],
        bump = escrow.bump,
        constraint = escrow.authority == authority.key() @ MandoraError::UnauthorizedAuthority,
        constraint = escrow.status == EscrowStatus::Disputed @ MandoraError::InvalidEscrowStatus,
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
        constraint = authority_token_account.owner == authority.key(),
    )]
    pub authority_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<RefundEscrow>) -> Result<()> {
    let escrow = &ctx.accounts.escrow;
    let amount = escrow.amount;

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

    // Refund full amount to authority
    let refund = CpiContext::new_with_signer(
        ctx.accounts.token_program.key(),
        Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.authority_token_account.to_account_info(),
            authority: ctx.accounts.escrow.to_account_info(),
        },
        signer_seeds,
    );
    token::transfer(refund, amount)?;

    let escrow_mut = &mut ctx.accounts.escrow;
    escrow_mut.status = EscrowStatus::Cancelled;

    msg!("Escrow refunded after dispute: {}", amount);
    Ok(())
}
