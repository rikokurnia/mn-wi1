use anchor_lang::prelude::*;

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
