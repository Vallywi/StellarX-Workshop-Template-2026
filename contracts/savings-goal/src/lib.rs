#![no_std]
//! Bayanihan Fund — a tiny Soroban contract for the StellarX PUP workshop.
//!
//! It tracks a fundraising *target* and the running *raised* total.

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Env};

#[contracttype]
#[derive(Clone)]
pub struct State {
    pub raised: i128,
    pub target: i128,
}

#[contracttype]
pub enum DataKey {
    Raised,
    Target,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    InvalidAmount = 3,
}

#[contract]
pub struct BayanihanFundContract;

#[contractimpl]
impl BayanihanFundContract {
    pub fn init(env: Env, target: i128) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Target) {
            return Err(Error::AlreadyInitialized);
        }
        if target <= 0 {
            return Err(Error::InvalidAmount);
        }
        env.storage().instance().set(&DataKey::Target, &target);
        env.storage().instance().set(&DataKey::Raised, &0i128);
        env.storage().instance().extend_ttl(1000, 5000);
        Ok(())
    }

    pub fn contribute(env: Env, amount: i128) -> Result<i128, Error> {
        if !env.storage().instance().has(&DataKey::Target) {
            return Err(Error::NotInitialized);
        }
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        let raised: i128 = env.storage().instance().get(&DataKey::Raised).unwrap_or(0);
        let new_raised = raised + amount;
        env.storage().instance().set(&DataKey::Raised, &new_raised);
        env.storage().instance().extend_ttl(1000, 5000);
        Ok(new_raised)
    }

    pub fn get_state(env: Env) -> State {
        State {
            raised: env.storage().instance().get(&DataKey::Raised).unwrap_or(0),
            target: env.storage().instance().get(&DataKey::Target).unwrap_or(0),
        }
    }
}

mod test;
