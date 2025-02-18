export function toWei(num: number): bigint {
    return BigInt(Math.floor(10 ** 9 * num)) * (10n ** 9n);
}

