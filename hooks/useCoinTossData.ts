import { Address, TonClient, fromNano, toNano } from "@ton/ton";
import type { OpenedContract } from "@ton/ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { CoinToss } from "../wrappers/CoinToss"; // Предполагается, что у вас есть этот файл
import { useTonConnect } from "./useTonConnect";
import { CHAIN } from "@tonconnect/ui-react";

const CONTRACT_ADDRESS: string = "EQCJ0Rvn88QvdGiEnXuTykgA8mSm00e4IIqnecy56nvGx8Ga"; // Замените на ваш реальный адрес контракта

export async function getStaticData() {
  const endpoint = await getHttpEndpoint({ network: "testnet" });
  const client = new TonClient({ endpoint });

  const contract_instance = new CoinToss(Address.parse(CONTRACT_ADDRESS));
  const coinTossContract: OpenedContract<CoinToss> = client.open(contract_instance);

  const [availableBalance, serviceBalance, adminAddr, lastNumber, hash] = await coinTossContract.getInfo();

  const data = {
    contract_address: coinTossContract.address.toString(),
    admin_address: adminAddr.toString(),
    available_balance: Number(fromNano(availableBalance)),
    service_balance: Number(fromNano(serviceBalance)),
    last_number: lastNumber.toString(),
    hash: hash.toString()
  };

  return data;
}

export function useCoinTossData() {
  const { sender, connected, wallet, network } = useTonConnect();

  const getDynamicData = async () => {
    if (!connected || network !== CHAIN.TESTNET) {
      throw new Error("Wallet not connected or not on testnet");
    }

    const endpoint = await getHttpEndpoint({ network: "testnet" });
    const client = new TonClient({ endpoint });

    const contract_instance = new CoinToss(Address.parse(CONTRACT_ADDRESS));
    const coinTossContract: OpenedContract<CoinToss> = client.open(contract_instance);

    const [availableBalance, serviceBalance, adminAddr, lastNumber, hash] = await coinTossContract.getInfo();

    return {
      available_balance: Number(fromNano(availableBalance)),
      service_balance: Number(fromNano(serviceBalance)),
      admin_address: adminAddr.toString(),
      last_number: lastNumber.toString(),
      hash: hash.toString(),
      wallet: wallet,
      sendAddBalance: async (amount: number) => {
        return coinTossContract.sendAddBalance(sender, toNano(amount));
      },
      sendWithdraw: async (amount: number) => {
        return coinTossContract.sendWithdraw(sender, toNano(amount));
      },
      sendMaintain: async (address: string) => {
        return coinTossContract.sendMaintain(sender, Address.parse(address));
      }
    };
  };

  return {
    getDynamicData,
    connected,
    wallet,
    network,
    sender
  };
}