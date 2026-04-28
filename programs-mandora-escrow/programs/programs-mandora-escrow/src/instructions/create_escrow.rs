use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::constants::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(job_id: [u8; 16])]
pub struct CreateEscrow<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + EscrowAccount::INIT_SPACE,
        seeds = [ESCROW_SEED, authority.key().as_ref(), &job_id],
        bump
    )]
    pub escrow: Account<'info, EscrowAccount>,

    #[account(
        init,
        payer = authority,
        seeds = [ESCROW_TOKEN_SEED, escrow.key().as_ref()],
        bump,
        token::mint = mint,
        token::authority = escrow,
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub authority_token_account: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<CreateEscrow>,
    job_id: [u8; 16],
    amount: u64,
    latitude: i64,
    longitude: i64,
    radius_m: u32,
    deadline: i64,
) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;
    let clock = Clock::get()?;

    require!(deadline > clock.unix_timestamp, crate::error::MandoraError::DeadlinePassed);

    // Transfer IDRX from authority to escrow token account
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.key(),
        Transfer {
            from: ctx.accounts.authority_token_account.to_account_info(),
            to: ctx.accounts.escrow_token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        },
    );
    token::transfer(transfer_ctx, amount)?;

    // Initialize escrow state
    escrow.authority = ctx.accounts.authority.key();
    escrow.worker = Pubkey::default();
    escrow.job_id = job_id;
    escrow.amount = amount;
    escrow.latitude = latitude;
    escrow.longitude = longitude;
    escrow.radius_m = radius_m;
    escrow.deadline = deadline;
    escrow.photo_hash = [0u8; 32];
    escrow.status = EscrowStatus::Created;
    escrow.bump = ctx.bumps.escrow;

    msg!("Escrow created for job {:?} with amount {}", job_id, amount);
    Ok(())
}
