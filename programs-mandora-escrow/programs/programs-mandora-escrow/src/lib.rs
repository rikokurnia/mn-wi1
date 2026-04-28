use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("6Dn1r6gSG4MrrvPEZjPk7x4PRxJZybxP6UKw5JKCxxVP");

// ─── Constants ─────────────────────────────────────────────────────────────

#[constant]
pub const ESCROW_SEED: &[u8] = b"escrow";

#[constant]
pub const ESCROW_TOKEN_SEED: &[u8] = b"escrow_token";

#[constant]
pub const PROTOCOL_FEE_BPS: u64 = 500; // 5% in basis points

#[constant]
pub const BPS_DENOMINATOR: u64 = 10_000;

// ─── Errors ─────────────────────────────────────────────────────────────────

#[error_code]
pub enum MandoraError {
    #[msg("Invalid escrow status for this operation")]
    InvalidEscrowStatus,

    #[msg("Worker already assigned")]
    WorkerAlreadyAssigned,

    #[msg("Worker not assigned")]
    WorkerNotAssigned,

    #[msg("Unauthorized worker")]
    UnauthorizedWorker,

    #[msg("Unauthorized authority")]
    UnauthorizedAuthority,

    #[msg("Escrow deadline has passed")]
    DeadlinePassed,

    #[msg("Worker is outside the geofence")]
    OutsideGeofence,

    #[msg("Invalid fee percentage")]
    InvalidFeePercentage,

    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
}

// ─── State ──────────────────────────────────────────────────────────────────

#[account]
#[derive(InitSpace)]
pub struct EscrowAccount {
    pub authority: Pubkey,
    pub worker: Pubkey,
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

// ─── Accounts ───────────────────────────────────────────────────────────────

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

#[derive(Accounts)]
pub struct SubmitProof<'info> {
    #[account(mut)]
    pub worker: Signer<'info>,

    /// CHECK: The escrow authority (ops wallet)
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

#[derive(Accounts)]
pub struct ApproveRelease<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: The assigned worker
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

#[derive(Accounts)]
pub struct CancelEscrow<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [ESCROW_SEED, authority.key().as_ref(), &escrow.job_id],
        bump = escrow.bump,
        constraint = escrow.authority == authority.key() @ MandoraError::UnauthorizedAuthority,
        constraint = escrow.status == EscrowStatus::Created @ MandoraError::InvalidEscrowStatus,
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

// ─── Program ────────────────────────────────────────────────────────────────

#[program]
pub mod programs_mandora_escrow {
    use super::*;

    pub fn create_escrow(
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

        require!(deadline > clock.unix_timestamp, MandoraError::DeadlinePassed);

        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.key(),
            Transfer {
                from: ctx.accounts.authority_token_account.to_account_info(),
                to: ctx.accounts.escrow_token_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, amount)?;

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

    pub fn assign_worker(ctx: Context<AssignWorker>) -> Result<()> {
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

    pub fn submit_proof(
        ctx: Context<SubmitProof>,
        worker_lat: i64,
        worker_lng: i64,
        photo_hash: [u8; 32],
    ) -> Result<()> {
        let escrow_info = ctx.accounts.escrow.to_account_info();
        let escrow = &mut ctx.accounts.escrow;
        let clock = Clock::get()?;

        require!(clock.unix_timestamp <= escrow.deadline, MandoraError::DeadlinePassed);

        let within = is_within_geofence(
            escrow.latitude,
            escrow.longitude,
            worker_lat,
            worker_lng,
            escrow.radius_m,
        );
        require!(within, MandoraError::OutsideGeofence);

        escrow.photo_hash = photo_hash;
        escrow.status = EscrowStatus::ProofSubmitted;

        let fee = escrow
            .amount
            .checked_mul(PROTOCOL_FEE_BPS)
            .and_then(|v| v.checked_div(BPS_DENOMINATOR))
            .ok_or(MandoraError::ArithmeticOverflow)?;

        let worker_payout = escrow
            .amount
            .checked_sub(fee)
            .ok_or(MandoraError::ArithmeticOverflow)?;

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

    pub fn approve_release(ctx: Context<ApproveRelease>) -> Result<()> {
        let escrow_info = ctx.accounts.escrow.to_account_info();
        let escrow = &mut ctx.accounts.escrow;

        let fee = escrow
            .amount
            .checked_mul(PROTOCOL_FEE_BPS)
            .and_then(|v| v.checked_div(BPS_DENOMINATOR))
            .ok_or(MandoraError::ArithmeticOverflow)?;

        let worker_payout = escrow
            .amount
            .checked_sub(fee)
            .ok_or(MandoraError::ArithmeticOverflow)?;

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

    pub fn cancel_escrow(ctx: Context<CancelEscrow>) -> Result<()> {
        let escrow = &ctx.accounts.escrow;
        let amount = escrow.amount;

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

        msg!("Escrow cancelled and refunded: {}", amount);
        Ok(())
    }

    pub fn refund_escrow(ctx: Context<RefundEscrow>) -> Result<()> {
        let escrow = &ctx.accounts.escrow;
        let amount = escrow.amount;

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
}

// ─── Helpers ────────────────────────────────────────────────────────────────

fn is_within_geofence(
    target_lat: i64,
    target_lng: i64,
    worker_lat: i64,
    worker_lng: i64,
    radius_m: u32,
) -> bool {
    let dlat = (worker_lat - target_lat).abs();
    let dlng = (worker_lng - target_lng).abs();

    let dx = (dlng as i128 * 11_132i128) / 1_000_000i128;
    let dy = (dlat as i128 * 11_132i128) / 1_000_000i128;

    let dist_sq = dx * dx + dy * dy;
    let radius_sq = (radius_m as i128) * (radius_m as i128);

    dist_sq <= radius_sq
}
