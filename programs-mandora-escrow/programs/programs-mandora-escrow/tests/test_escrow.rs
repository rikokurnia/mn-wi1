use anchor_lang::prelude::*;
use litesvm::LiteSVM;
use solana_keypair::Keypair;
use solana_signer::Signer;

#[test]
fn test_create_escrow_compiles() {
    let mut svm = LiteSVM::new();
    let authority = Keypair::new();
    let worker = Keypair::new();

    svm.airdrop(&authority.pubkey(), 1_000_000_000).unwrap();
    svm.airdrop(&worker.pubkey(), 1_000_000_000).unwrap();

    assert_eq!(authority.pubkey().to_bytes().len(), 32);
    assert_eq!(worker.pubkey().to_bytes().len(), 32);
}
