import { TradeType } from '@jaguarswap/sdk-core';
import { PERMIT2_ADDRESS } from '@uniswap/universal-router-sdk';
import { BigNumber } from 'ethers/lib/ethers';
import { SwapType } from '../routers';
import { Erc20__factory } from '../types/other/factories/Erc20__factory';
import { Permit2__factory } from '../types/other/factories/Permit2__factory';
import { log, SWAP_ROUTER_02_ADDRESSES, } from '../util';
export var SimulationStatus;
(function (SimulationStatus) {
    SimulationStatus[SimulationStatus["NotSupported"] = 0] = "NotSupported";
    SimulationStatus[SimulationStatus["Failed"] = 1] = "Failed";
    SimulationStatus[SimulationStatus["Succeeded"] = 2] = "Succeeded";
    SimulationStatus[SimulationStatus["InsufficientBalance"] = 3] = "InsufficientBalance";
    SimulationStatus[SimulationStatus["NotApproved"] = 4] = "NotApproved";
})(SimulationStatus || (SimulationStatus = {}));
/**
 * Provider for dry running transactions.
 *
 * @export
 * @class Simulator
 */
export class Simulator {
    /**
     * Returns a new SwapRoute with simulated gas estimates
     * @returns SwapRoute
     */
    constructor(provider, portionProvider, chainId) {
        this.chainId = chainId;
        this.provider = provider;
        this.portionProvider = portionProvider;
    }
    async simulate(fromAddress, swapOptions, swapRoute, amount, quote, providerConfig) {
        if (await this.userHasSufficientBalance(fromAddress, swapRoute.trade.tradeType, amount, quote)) {
            log.info('User has sufficient balance to simulate. Simulating transaction.');
            try {
                return this.simulateTransaction(fromAddress, swapOptions, swapRoute, providerConfig);
            }
            catch (e) {
                log.error({ e }, 'Error simulating transaction');
                return {
                    ...swapRoute,
                    simulationStatus: SimulationStatus.Failed,
                };
            }
        }
        else {
            log.error('User does not have sufficient balance to simulate.');
            return {
                ...swapRoute,
                simulationStatus: SimulationStatus.InsufficientBalance,
            };
        }
    }
    async userHasSufficientBalance(fromAddress, tradeType, amount, quote) {
        try {
            const neededBalance = tradeType == TradeType.EXACT_INPUT ? amount : quote;
            let balance;
            if (neededBalance.currency.isNative) {
                balance = await this.provider.getBalance(fromAddress);
            }
            else {
                const tokenContract = Erc20__factory.connect(neededBalance.currency.address, this.provider);
                balance = await tokenContract.balanceOf(fromAddress);
            }
            const hasBalance = balance.gte(BigNumber.from(neededBalance.quotient.toString()));
            log.info({
                fromAddress,
                balance: balance.toString(),
                neededBalance: neededBalance.quotient.toString(),
                neededAddress: neededBalance.wrapped.currency.address,
                hasBalance,
            }, 'Result of balance check for simulation');
            return hasBalance;
        }
        catch (e) {
            log.error(e, 'Error while checking user balance');
            return false;
        }
    }
    async checkTokenApproved(fromAddress, inputAmount, swapOptions, provider) {
        // Check token has approved Permit2 more than expected amount.
        const tokenContract = Erc20__factory.connect(inputAmount.currency.wrapped.address, provider);
        if (swapOptions.type == SwapType.UNIVERSAL_ROUTER) {
            const permit2Allowance = await tokenContract.allowance(fromAddress, PERMIT2_ADDRESS);
            // If a permit has been provided we don't need to check if UR has already been allowed.
            if (swapOptions.inputTokenPermit) {
                log.info({
                    permitAllowance: permit2Allowance.toString(),
                    inputAmount: inputAmount.quotient.toString(),
                }, 'Permit was provided for simulation on UR, checking that Permit2 has been approved.');
                return permit2Allowance.gte(BigNumber.from(inputAmount.quotient.toString()));
            }
            // Check UR has been approved from Permit2.
            const permit2Contract = Permit2__factory.connect(PERMIT2_ADDRESS, provider);
            const { amount: universalRouterAllowance, expiration: tokenExpiration } = await permit2Contract.allowance(fromAddress, inputAmount.currency.wrapped.address, SWAP_ROUTER_02_ADDRESSES(this.chainId));
            const nowTimestampS = Math.round(Date.now() / 1000);
            const inputAmountBN = BigNumber.from(inputAmount.quotient.toString());
            const permit2Approved = permit2Allowance.gte(inputAmountBN);
            const universalRouterApproved = universalRouterAllowance.gte(inputAmountBN);
            const expirationValid = tokenExpiration > nowTimestampS;
            log.info({
                permitAllowance: permit2Allowance.toString(),
                tokenAllowance: universalRouterAllowance.toString(),
                tokenExpirationS: tokenExpiration,
                nowTimestampS,
                inputAmount: inputAmount.quotient.toString(),
                permit2Approved,
                universalRouterApproved,
                expirationValid,
            }, `Simulating on UR, Permit2 approved: ${permit2Approved}, UR approved: ${universalRouterApproved}, Expiraton valid: ${expirationValid}.`);
            return permit2Approved && universalRouterApproved && expirationValid;
        }
        else if (swapOptions.type == SwapType.SWAP_ROUTER_02) {
            if (swapOptions.inputTokenPermit) {
                log.info({
                    inputAmount: inputAmount.quotient.toString(),
                }, 'Simulating on SwapRouter02 info - Permit was provided for simulation. Not checking allowances.');
                return true;
            }
            const allowance = await tokenContract.allowance(fromAddress, SWAP_ROUTER_02_ADDRESSES(this.chainId));
            const hasAllowance = allowance.gte(BigNumber.from(inputAmount.quotient.toString()));
            log.info({
                hasAllowance,
                allowance: allowance.toString(),
                inputAmount: inputAmount.quotient.toString(),
            }, `Simulating on SwapRouter02 - Has allowance: ${hasAllowance}`);
            // Return true if token allowance is greater than input amount
            return hasAllowance;
        }
        throw new Error(`Unsupported swap type ${swapOptions}`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltdWxhdGlvbi1wcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcm92aWRlcnMvc2ltdWxhdGlvbi1wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQVcsU0FBUyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDMUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ2hFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUU5QyxPQUFPLEVBQTBCLFFBQVEsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUM5RCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDekUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDN0UsT0FBTyxFQUVMLEdBQUcsRUFDSCx3QkFBd0IsR0FDekIsTUFBTSxTQUFTLENBQUM7QUFVakIsTUFBTSxDQUFOLElBQVksZ0JBTVg7QUFORCxXQUFZLGdCQUFnQjtJQUMxQix1RUFBZ0IsQ0FBQTtJQUNoQiwyREFBVSxDQUFBO0lBQ1YsaUVBQWEsQ0FBQTtJQUNiLHFGQUF1QixDQUFBO0lBQ3ZCLHFFQUFlLENBQUE7QUFDakIsQ0FBQyxFQU5XLGdCQUFnQixLQUFoQixnQkFBZ0IsUUFNM0I7QUFFRDs7Ozs7R0FLRztBQUNILE1BQU0sT0FBZ0IsU0FBUztJQUk3Qjs7O09BR0c7SUFDSCxZQUFZLFFBQXlCLEVBQUUsZUFBaUMsRUFBWSxPQUFnQjtRQUFoQixZQUFPLEdBQVAsT0FBTyxDQUFTO1FBQ2xHLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO0lBQ3pDLENBQUM7SUFFTSxLQUFLLENBQUMsUUFBUSxDQUNuQixXQUFtQixFQUNuQixXQUF3QixFQUN4QixTQUFvQixFQUNwQixNQUFzQixFQUN0QixLQUFx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