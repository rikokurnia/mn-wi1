use anchor_lang::prelude::*;

use crate::constants::*;
use crate::error::MandoraError;
use crate::state::*;

#[derive(Accounts)]
pub struct AssignWorker<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    pub worker: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [ESCROW_SEED, authority.key().as_ref(), &escrow.job_id],
        bump = escrow.bump,
        constraint = escrow.authority == authority.key() @ MandoraError::UnauthorizedAuthority,
    )]
    pub escrow: Account<'info, EscrowAccount>,
}

pub fn handler(ctx: Context<AssignWorker>) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;

    require!(
        escrow.status == EscrowStatus::Created,
        MandoraError::InvalidEscrowStatus
    );
    require!(
        escrow.worker == Pubkey::default(),
        MandoraError::WorkerAlreadyAssigned
    );

    escrow.worker = ctx.accounts.worker.key();
    escrow.status = EscrowStatus::Assigned;

    msg!("Worker {:?} assigned to escrow", escrow.worker);
    Ok(())
}
