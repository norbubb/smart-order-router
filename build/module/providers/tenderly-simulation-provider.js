import { MaxUint256 } from '@ethersproject/constants';
import { PERMIT2_ADDRESS, UNIVERSAL_ROUTER_ADDRESS, } from '@uniswap/universal-router-sdk';
import axios from 'axios';
import { BigNumber } from 'ethers/lib/ethers';
import { metric, MetricLoggerUnit, SwapType, } from '../routers';
import { Erc20__factory } from '../types/other/factories/Erc20__factory';
import { Permit2__factory } from '../types/other/factories/Permit2__factory';
import { log, MAX_UINT160, SWAP_ROUTER_02_ADDRESSES } from '../util';
import { APPROVE_TOKEN_FOR_TRANSFER } from '../util/callData';
import { calculateGasUsed, initSwapRouteFromExisting, } from '../util/gas-factory-helpers';
import { SimulationStatus, Simulator, } from './simulation-provider';
var TenderlySimulationType;
(function (TenderlySimulationType) {
    TenderlySimulationType["QUICK"] = "quick";
    TenderlySimulationType["FULL"] = "full";
    TenderlySimulationType["ABI"] = "abi";
})(TenderlySimulationType || (TenderlySimulationType = {}));
const TENDERLY_BATCH_SIMULATE_API = (tenderlyBaseUrl, tenderlyUser, tenderlyProject) => `${tenderlyBaseUrl}/api/v1/account/${tenderlyUser}/project/${tenderlyProject}/simulate-batch`;
// We multiply tenderly gas limit by this to overestimate gas limit
const DEFAULT_ESTIMATE_MULTIPLIER = 1.3;
export class FallbackTenderlySimulator extends Simulator {
    constructor(chainId, provider, portionProvider, tenderlySimulator, ethEstimateGasSimulator) {
        super(provider, portionProvider, chainId);
        this.tenderlySimulator = tenderlySimulator;
        this.ethEstimateGasSimulator = ethEstimateGasSimulator;
    }
    async simulateTransaction(fromAddress, swapOptions, swapRoute, providerConfig) {
        // Make call to eth estimate gas if possible
        // For erc20s, we must check if the token allowance is sufficient
        const inputAmount = swapRoute.trade.inputAmount;
        if (inputAmount.currency.isNative ||
            (await this.checkTokenApproved(fromAddress, inputAmount, swapOptions, this.provider))) {
            log.info('Simulating with eth_estimateGas since token is native or approved.');
            try {
                const swapRouteWithGasEstimate = await this.ethEstimateGasSimulator.ethEstimateGas(fromAddress, swapOptions, swapRoute, providerConfig);
                return swapRouteWithGasEstimate;
            }
            catch (err) {
                log.info({ err: err }, 'Error simulating using eth_estimateGas');
                return { ...swapRoute, simulationStatus: SimulationStatus.Failed };
            }
        }
        try {
            return await this.tenderlySimulator.simulateTransaction(fromAddress, swapOptions, swapRoute, providerConfig);
        }
        catch (err) {
            log.info({ err: err }, 'Failed to simulate via Tenderly');
            return { ...swapRoute, simulationStatus: SimulationStatus.Failed };
        }
    }
}
export class TenderlySimulator extends Simulator {
    constructor(chainId, tenderlyBaseUrl, tenderlyUser, tenderlyProject, tenderlyAccessKey, v2PoolProvider, v3PoolProvider, provider, portionProvider, overrideEstimateMultiplier, tenderlyRequestTimeout) {
        super(provider, portionProvider, chainId);
        this.tenderlyBaseUrl = tenderlyBaseUrl;
        this.tenderlyUser = tenderlyUser;
        this.tenderlyProject = tenderlyProject;
        this.tenderlyAccessKey = tenderlyAccessKey;
        this.v2PoolProvider = v2PoolProvider;
        this.v3PoolProvider = v3PoolProvider;
        this.overrideEstimateMultiplier = overrideEstimateMultiplier !== null && overrideEstimateMultiplier !== void 0 ? overrideEstimateMultiplier : {};
        this.tenderlyRequestTimeout = tenderlyRequestTimeout;
    }
    async simulateTransaction(fromAddress, swapOptions, swapRoute, providerConfig) {
        var _a;
        const currencyIn = swapRoute.trade.inputAmount.currency;
        const tokenIn = currencyIn.wrapped;
        const chainId = this.chainId;
        if (!swapRoute.methodParameters) {
            const msg = 'No calldata provided to simulate transaction';
            log.info(msg);
            throw new Error(msg);
        }
        const { calldata } = swapRoute.methodParameters;
        log.info({
            calldata: swapRoute.methodParameters.calldata,
            fromAddress: fromAddress,
            chainId: chainId,
            tokenInAddress: tokenIn.address,
            router: swapOptions.type,
        }, 'Simulating transaction on Tenderly');
        let estimatedGasUsed;
        const estimateMultiplier = (_a = this.overrideEstimateMultiplier[chainId]) !== null && _a !== void 0 ? _a : DEFAULT_ESTIMATE_MULTIPLIER;
        if (swapOptions.type == SwapType.UNIVERSAL_ROUTER) {
            // Do initial onboarding approval of Permit2.
            const erc20Interface = Erc20__factory.createInterface();
            const approvePermit2Calldata = erc20Interface.encodeFunctionData('approve', [PERMIT2_ADDRESS, MaxUint256]);
            // We are unsure if the users calldata contains a permit or not. We just
            // max approve the Univeral Router from Permit2 instead, which will cover both cases.
            const permit2Interface = Permit2__factory.createInterface();
            const approveUniversalRouterCallData = permit2Interface.encodeFunctionData('approve', [
                tokenIn.address,
                UNIVERSAL_ROUTER_ADDRESS(this.chainId),
                MAX_UINT160,
                Math.floor(new Date().getTime() / 1000) + 10000000,
            ]);
            const approvePermit2 = {
                network_id: chainId,
                estimate_gas: true,
                input: approvePermit2Calldata,
                to: tokenIn.address,
                value: '0',
                from: fromAddress,
                simulation_type: TenderlySimulationType.QUICK,
                save_if_fails: providerConfig === null || providerConfig === void 0 ? void 0 : providerConfig.saveTenderlySimulationIfFailed,
            };
            const approveUniversalRouter = {
                network_id: chainId,
                estimate_gas: true,
                input: approveUniversalRouterCallData,
                to: PERMIT2_ADDRESS,
                value: '0',
                from: fromAddress,
                simulation_type: TenderlySimulationType.QUICK,
                save_if_fails: providerConfig === null || providerConfig === void 0 ? void 0 : providerConfig.saveTenderlySimulationIfFailed,
            };
            const swap = {
                network_id: chainId,
                input: calldata,
                estimate_gas: true,
                to: UNIVERSAL_ROUTER_ADDRESS(this.chainId),
                value: currencyIn.isNative ? swapRoute.methodParameters.value : '0',
                from: fromAddress,
                block_number: undefined,
                simulation_type: TenderlySimulationType.QUICK,
                save_if_fails: providerConfig === null || providerConfig === void 0 ? void 0 : providerConfig.saveTenderlySimulationIfFailed,
            };
            const body = {
                simulations: [approvePermit2, approveUniversalRouter, swap],
                estimate_gas: true,
            };
            const opts = {
                headers: {
                    'X-Access-Key': this.tenderlyAccessKey,
                },
                timeout: this.tenderlyRequestTimeout,
            };
            const url = TENDERLY_BATCH_SIMULATE_API(this.tenderlyBaseUrl, this.tenderlyUser, this.tenderlyProject);
            const before = Date.now();
            const resp = (await axios.post(url, body, opts)).data;
            const latencies = Date.now() - before;
            log.info(`Tenderly simulation universal router request body: ${body}, having latencies ${latencies} in milliseconds.`);
            metric.putMetric('TenderlySimulationUniversalRouterLatencies', Date.now() - before, MetricLoggerUnit.Milliseconds);
            // Validate tenderly response body
            if (!resp ||
                resp.simulation_results.length < 3 ||
                !resp.simulation_results[2].transaction ||
                resp.simulation_results[2].transaction.error_message) {
                this.logTenderlyErrorResponse(resp);
                return { ...swapRoute, simulationStatus: SimulationStatus.Failed };
            }
            // Parse the gas used in the simulation response object, and then pad it so that we overestimate.
            estimatedGasUsed = BigNumber.from((resp.simulation_results[2].transaction.gas * estimateMultiplier).toFixed(0));
            log.info({
                body,
                approvePermit2GasUsed: resp.simulation_results[0].transaction.gas_used,
                approveUniversalRouterGasUsed: resp.simulation_results[1].transaction.gas_used,
                swapGasUsed: resp.simulation_results[2].transaction.gas_used,
                approvePermit2Gas: resp.simulation_results[0].transaction.gas,
                approveUniversalRouterGas: resp.simulation_results[1].transaction.gas,
                swapGas: resp.simulation_results[2].transaction.gas,
                swapWithMultiplier: estimatedGasUsed.toString(),
            }, 'Successfully Simulated Approvals + Swap via Tenderly for Universal Router. Gas used.');
            log.info({
                body,
                swapSimulation: resp.simulation_results[2].simulation,
                swapTransaction: resp.simulation_results[2].transaction,
            }, 'Successful Tenderly Swap Simulation for Universal Router');
        }
        else if (swapOptions.type == SwapType.SWAP_ROUTER_02) {
            const approve = {
                network_id: chainId,
                input: APPROVE_TOKEN_FOR_TRANSFER,
                estimate_gas: true,
                to: tokenIn.address,
                value: '0',
                from: fromAddress,
                simulation_type: TenderlySimulationType.QUICK,
            };
            const swap = {
                network_id: chainId,
                input: calldata,
                to: SWAP_ROUTER_02_ADDRESSES(chainId),
                estimate_gas: true,
                value: currencyIn.isNative ? swapRoute.methodParameters.value : '0',
                from: fromAddress,
                // TODO: This is a Temporary fix given by Tenderly team, remove once resolved on their end.
                block_number: undefined,
                simulation_type: TenderlySimulationType.QUICK,
            };
            const body = { simulations: [approve, swap] };
            const opts = {
                headers: {
                    'X-Access-Key': this.tenderlyAccessKey,
                },
                timeout: this.tenderlyRequestTimeout,
            };
            const url = TENDERLY_BATCH_SIMULATE_API(this.tenderlyBaseUrl, this.tenderlyUser, this.tenderlyProject);
            const before = Date.now();
            const resp = (await axios.post(url, body, opts)).data;
            const latencies = Date.now() - before;
            log.info(`Tenderly simulation swap router02 request body: ${body}, having latencies ${latencies} in milliseconds.`);
            metric.putMetric('TenderlySimulationSwapRouter02Latencies', latencies, MetricLoggerUnit.Milliseconds);
            // Validate tenderly response body
            if (!resp ||
                resp.simulation_results.length < 2 ||
                !resp.simulation_results[1].transaction ||
                resp.simulation_results[1].transaction.error_message) {
                const msg = `Failed to Simulate Via Tenderly!: ${resp.simulation_results[1].transaction.error_message}`;
                log.info({ err: resp.simulation_results[1].transaction.error_message }, msg);
                return { ...swapRoute, simulationStatus: SimulationStatus.Failed };
            }
            // Parse the gas used in the simulation response object, and then pad it so that we overestimate.
            estimatedGasUsed = BigNumber.from((resp.simulation_results[1].transaction.gas * estimateMultiplier).toFixed(0));
            log.info({
                body,
                approveGasUsed: resp.simulation_results[0].transaction.gas_used,
                swapGasUsed: resp.simulation_results[1].transaction.gas_used,
                approveGas: resp.simulation_results[0].transaction.gas,
                swapGas: resp.simulation_results[1].transaction.gas,
                swapWithMultiplier: estimatedGasUsed.toString(),
            }, 'Successfully Simulated Approval + Swap via Tenderly for SwapRouter02. Gas used.');
            log.info({
                body,
                swapTransaction: resp.simulation_results[1].transaction,
                swapSimulation: resp.simulation_results[1].simulation,
            }, 'Successful Tenderly Swap Simulation for SwapRouter02');
        }
        else {
            throw new Error(`Unsupported swap type: ${swapOptions}`);
        }
        const { estimatedGasUsedUSD, estimatedGasUsedQuoteToken, quoteGasAdjusted, } = await calculateGasUsed(chainId, swapRoute, estimatedGasUsed, this.v2PoolProvider, this.v3PoolProvider, providerConfig);
        return {
            ...initSwapRouteFromExisting(swapRoute, this.v2PoolProvider, this.v3PoolProvider, this.portionProvider, quoteGasAdjusted, estimatedGasUsed, estimatedGasUsedQuoteToken, estimatedGasUsedUSD, swapOptions),
            simulationStatus: SimulationStatus.Succeeded,
        };
    }
    logTenderlyErrorResponse(resp) {
        log.info({
            resp,
        }, 'Failed to Simulate on Tenderly');
        log.info({
            err: resp.simulation_results.length >= 1
                ? resp.simulation_results[0].transaction
                : {},
        }, 'Failed to Simulate on Tenderly #1 Transaction');
        log.info({
            err: resp.simulation_results.length >= 1
                ? resp.simulation_results[0].simulation
                : {},
        }, 'Failed to Simulate on Tenderly #1 Simulation');
        log.info({
            err: resp.simulation_results.length >= 2
                ? resp.simulation_results[1].transaction
                : {},
        }, 'Failed to Simulate on Tenderly #2 Transaction');
        log.info({
            err: resp.simulation_results.length >= 2
                ? resp.simulation_results[1].simulation
                : {},
        }, 'Failed to Simulate on Tenderly #2 Simulation');
        log.info({
            err: resp.simulation_results.length >= 3
                ? resp.simulation_results[2].transaction
                : {},
        }, 'Failed to Simulate on Tenderly #3 Transaction');
        log.info({
            err: resp.simulation_results.length >= 3
                ? resp.simulation_results[2].simulation
                : {},
        }, 'Failed to Simulate on Tenderly #3 Simulation');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVuZGVybHktc2ltdWxhdGlvbi1wcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcm92aWRlcnMvdGVuZGVybHktc2ltdWxhdGlvbi1wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFHdEQsT0FBTyxFQUNMLGVBQWUsRUFDZix3QkFBd0IsR0FDekIsTUFBTSwrQkFBK0IsQ0FBQztBQUN2QyxPQUFPLEtBQTZCLE1BQU0sT0FBTyxDQUFDO0FBQ2xELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUU5QyxPQUFPLEVBQ0wsTUFBTSxFQUNOLGdCQUFnQixFQUdoQixRQUFRLEdBQ1QsTUFBTSxZQUFZLENBQUM7QUFDcEIsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQ3pFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBQzdFLE9BQU8sRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzlELE9BQU8sRUFDTCxnQkFBZ0IsRUFDaEIseUJBQXlCLEdBQzFCLE1BQU0sNkJBQTZCLENBQUM7QUFLckMsT0FBTyxFQUVMLGdCQUFnQixFQUNoQixTQUFTLEdBQ1YsTUFBTSx1QkFBdUIsQ0FBQztBQXNCL0IsSUFBSyxzQkFJSjtBQUpELFdBQUssc0JBQXNCO0lBQ3pCLHlDQUFlLENBQUE7SUFDZix1Q0FBYSxDQUFBO0lBQ2IscUNBQVcsQ0FBQTtBQUNiLENBQUMsRUFKSSxzQkFBc0IsS0FBdEIsc0JBQXNCLFFBSTFCO0FBbUJELE1BQU0sMkJBQTJCLEdBQUcsQ0FDbEMsZUFBdUIsRUFDdkIsWUFBb0IsRUFDcEIsZUFBdUIsRUFDdkIs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