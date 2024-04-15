import _ from 'lodash';
import { ITokenValidator__factory } from '../types/other/factories/ITokenValidator__factory';
import { log, metric, MetricLoggerUnit, WRAPPED_NATIVE_CURRENCY } from '../util';
export const DEFAULT_ALLOWLIST = new Set([
    // RYOSHI. Does not allow transfers between contracts so fails validation.
    '0x777E2ae845272a2F540ebf6a3D03734A5a8f618e'.toLowerCase(),
]);
export var TokenValidationResult;
(function (TokenValidationResult) {
    TokenValidationResult[TokenValidationResult["UNKN"] = 0] = "UNKN";
    TokenValidationResult[TokenValidationResult["FOT"] = 1] = "FOT";
    TokenValidationResult[TokenValidationResult["STF"] = 2] = "STF";
})(TokenValidationResult || (TokenValidationResult = {}));
const TOKEN_VALIDATOR_ADDRESS = '0xb5ee1690b7dcc7859771148d0889be838fe108e0';
const AMOUNT_TO_FLASH_BORROW = '1000';
const GAS_LIMIT_PER_VALIDATE = 1000000;
export class TokenValidatorProvider {
    constructor(chainId, multicall2Provider, tokenValidationCache, tokenValidatorAddress = TOKEN_VALIDATOR_ADDRESS, gasLimitPerCall = GAS_LIMIT_PER_VALIDATE, amountToFlashBorrow = AMOUNT_TO_FLASH_BORROW, allowList = DEFAULT_ALLOWLIST) {
        this.chainId = chainId;
        this.multicall2Provider = multicall2Provider;
        this.tokenValidationCache = tokenValidationCache;
        this.tokenValidatorAddress = tokenValidatorAddress;
        this.gasLimitPerCall = gasLimitPerCall;
        this.amountToFlashBorrow = amountToFlashBorrow;
        this.allowList = allowList;
        this.CACHE_KEY = (chainId, address) => `token-${chainId}-${address}`;
        this.BASES = [WRAPPED_NATIVE_CURRENCY[this.chainId].address];
    }
    async validateTokens(tokens, providerConfig) {
        const tokenAddressToToken = _.keyBy(tokens, 'address');
        const addressesRaw = _(tokens)
            .map((token) => token.address)
            .uniq()
            .value();
        const addresses = [];
        const tokenToResult = {};
        // Check if we have cached token validation results for any tokens.
        for (const address of addressesRaw) {
            if (await this.tokenValidationCache.has(this.CACHE_KEY(this.chainId, address))) {
                tokenToResult[address.toLowerCase()] =
                    (await this.tokenValidationCache.get(this.CACHE_KEY(this.chainId, address)));
                metric.putMetric(`TokenValidatorProviderValidateCacheHitResult${tokenToResult[address.toLowerCase()]}`, 1, MetricLoggerUnit.Count);
            }
            else {
                addresses.push(address);
            }
        }
        log.info(`Got token validation results for ${addressesRaw.length - addresses.length} tokens from cache. Getting ${addresses.length} on-chain.`);
        const functionParams = _(addresses)
            .map((address) => [address, this.BASES, this.amountToFlashBorrow])
            .value();
        // We use the validate function instead of batchValidate to avoid poison pill problem.
        // One token that consumes too much gas could cause the entire batch to fail.
        const multicallResult = await this.multicall2Provider.callSameFunctionOnContractWithMultipleParams({
            address: this.tokenValidatorAddress,
            contractInterface: ITokenValidator__factory.createInterface(),
            functionName: 'validate',
            functionParams: functionParams,
            providerConfig,
            additionalConfig: {
                gasLimitPerCallOverride: this.gasLimitPerCall,
            },
        });
        for (let i = 0; i < multicallResult.results.length; i++) {
            const resultWrapper = multicallResult.results[i];
            const tokenAddress = addresses[i];
            const token = tokenAddressToToken[tokenAddress];
            if (this.allowList.has(token.address.toLowerCase())) {
                tokenToResult[token.address.toLowerCase()] = TokenValidationResult.UNKN;
                await this.tokenValidationCache.set(this.CACHE_KEY(this.chainId, token.address.toLowerCase()), tokenToResult[token.address.toLowerCase()]);
                continue;
            }
            // Could happen if the tokens transfer consumes too much gas so we revert. Just
            // drop the token in that case.
            if (!resultWrapper.success) {
                metric.putMetric("TokenValidatorProviderValidateFailed", 1, MetricLoggerUnit.Count);
                log.error({ result: resultWrapper }, `Failed to validate token ${token.symbol}`);
                continue;
            }
            metric.putMetric("TokenValidatorProviderValidateSuccess", 1, MetricLoggerUnit.Count);
            const validationResult = resultWrapper.result[0];
            tokenToResult[token.address.toLowerCase()] =
                validationResult;
            await this.tokenValidationCache.set(this.CACHE_KEY(this.chainId, token.address.toLowerCase()), tokenToResult[token.address.toLowerCase()]);
            metric.putMetric(`TokenValidatorProviderValidateCacheMissResult${validationResult}`, 1, MetricLoggerUnit.Count);
        }
        return {
            getValidationByToken: (token) => tokenToResult[token.address.toLowerCase()],
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW4tdmFsaWRhdG9yLXByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Byb3ZpZGVycy90b2tlbi12YWxpZGF0b3ItcHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxDQUFDLE1BQU0sUUFBUSxDQUFDO0FBRXZCLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLG1EQUFtRCxDQUFDO0FBQzdGLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLGdCQUFnQixFQUFFLHVCQUF1QixFQUFFLE1BQU0sU0FBUyxDQUFDO0FBTWpGLE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFHLElBQUksR0FBRyxDQUFTO0lBQy9DLDBFQUEwRTtJQUMxRSw0Q0FBNEMsQ0FBQyxXQUFXLEVBQUU7Q0FDM0QsQ0FBQyxDQUFDO0FBRUgsTUFBTSxDQUFOLElBQVkscUJBSVg7QUFKRCxXQUFZLHFCQUFxQjtJQUMvQixpRUFBUSxDQUFBO0lBQ1IsK0RBQU8sQ0FBQTtJQUNQLCtEQUFPLENBQUE7QUFDVCxDQUFDLEVBSlcscUJBQXFCLEtBQXJCLHFCQUFxQixRQUloQztBQU1ELE1BQU0sdUJBQXVCLEdBQUcsNENBQTRDLENBQUM7QUFDN0UsTUFBTSxzQkFBc0IsR0FBRyxNQUFNLENBQUM7QUFDdEMsTUFBTSxzQkFBc0IsR0FBRyxPQUFTLENBQUM7QUFzQnpDLE1BQU0sT0FBTyxzQkFBc0I7SUFNakMsWUFDWSxPQUFnQixFQUNoQixrQkFBc0MsRUFDeEMsb0JBQW1ELEVBQ25ELHdCQUF3Qix1QkFBdUIsRUFDL0Msa0JBQWtCLHNCQUFzQixFQUN4QyxzQkFBc0Isc0JBQXNCLEVBQzVDLFlBQVksaUJBQWlCO1FBTjNCLFlBQU8sR0FBUCxPQUFPLENBQVM7UUFDaEIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtRQUN4Qyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQStCO1FBQ25ELDBCQUFxQixHQUFyQixxQkFB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