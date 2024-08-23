import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, toNano } from '@ton/core';

export type CoinTossConfig = {
    available_balance : bigint;
    service_balance: bigint;
    admin_addr: Address;
    last_number: bigint;
    hash: bigint;
};

export function coinTossConfigToCell(config: CoinTossConfig): Cell {
    return (
        beginCell()
            .storeCoins(config.available_balance)
            .storeCoins(config.service_balance)
            .storeAddress(config.admin_addr)
            .storeUint(config.last_number, 64)
            .storeUint(config.hash, 256)
        .endCell()
    );
}

export class CoinToss implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new CoinToss(address);
    }

    static createFromConfig(config: CoinTossConfig, code: Cell, workchain = 0) {
        const data = coinTossConfigToCell(config);
        const init = { code, data };
        return new CoinToss(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
    async sendAddBalance(provider:ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body:
                beginCell()
                    .storeUint(0x567, 32)
                .endCell(),
        });
    }

    async sendWithdraw(provider:ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value: value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body:
            beginCell()
                .storeUint(0x700, 32)
                .storeCoins(toNano("1"))
            .endCell(),
        });
    }


    async sendMaintain(provider:ContractProvider, via:Sender, address: Address) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            value: toNano("0.1"),
            body: 
                beginCell()
                    .storeUint(0x555, 32)
                    .storeUint(128, 8)
                    .storeRef(
                        beginCell()
                            .storeUint(0x18, 6)
                            .storeAddress(address)
                            .storeCoins(0)
                            .storeUint(0, 1 + 4 + 4 + 64 + 32 + 1 + 1)
                        .endCell()
                    )
                .endCell()
        });
    } 
  
    async getInfo(provider: ContractProvider): Promise<[bigint,bigint,Address,bigint,bigint]> {
        const res = await provider.get('get_info', []);

        let data: [bigint,bigint,Address,bigint,bigint]
        data = [
        res.stack.readBigNumber(),
        res.stack.readBigNumber(),
        res.stack.readAddress(),
        res.stack.readBigNumber(),
        res.stack.readBigNumber()
        ]
    
        return data;
    
    }
}
