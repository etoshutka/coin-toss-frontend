import { Address, toNano } from "@ton/ton";
import { useCoinTossData } from "../hooks/useCoinTossData";
import { CHAIN } from "@tonconnect/ui-react";
import {
  Card,
  FlexBoxCol,
  FlexBoxRow,
  Button,
  Ellipsis,
} from "./styled/styled";
import React from "react";
import { CopyAddress } from "./CopyAddress";

// Задаем адрес контракта вручную
const CONTRACT_ADDRESS = "EQCJ0Rvn88QvdGiEnXuTykgA8mSm00e4IIqnecy56nvGx8Ga";
const ADMIN_ADDRESS = "UQBo1BaEKOSxKOvI6Kl-M5jp8ijUOLNIDloamD5rD75ZEr2W";


export function CoinToss() {
  const { getDynamicData, connected, wallet, network, sender } = useCoinTossData();
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (connected && network === CHAIN.TESTNET) {
      getDynamicData().then(setData).catch(console.error);
    }
  }, [connected, network]);

  const handleSendTon = async () => {
    console.log("handleSendTon called");
    console.log("Connected:", connected);
    console.log("Sender:", sender);
    console.log("Contract address:", CONTRACT_ADDRESS);

    if (!connected || !sender) {
      setError("Wallet not connected");
      console.error("Wallet not connected");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Preparing to send transaction...");
      console.log("Sender type:", typeof sender);
      console.log("Sender methods:", Object.keys(sender));

      if (typeof sender.send !== 'function') {
        throw new Error("sender.send is not a function");
      }

      const transactionDetails = {
        to: Address.parse(CONTRACT_ADDRESS),
        value: toNano("1"),
        bounce: false,
      };
      console.log("Transaction details:", transactionDetails);

      const result = await sender.send(transactionDetails);
      console.log("Transaction result:", result);

      // Ждем немного перед обновлением данных
      await new Promise(resolve => setTimeout(resolve, 5000));

      console.log("Updating data...");
      const newData = await getDynamicData();
      console.log("New data:", newData);
      setData(newData);
    } catch (err: unknown) {
      console.error("Error sending TON:", err);
      if (err instanceof Error) {
        setError(`Failed to send transaction: ${err.message}`);
      } else {
        setError("An unknown error occurred while sending the transaction");
      }
    } finally {
      setIsLoading(false);
    }
  };


  const handleSendMaintain = async () => {
    console.log("handleSendMaintain called");
    console.log("Connected:", connected);
    console.log("Sender:", sender);

    if (!connected || !sender || !data?.sendMaintain) {
      setError("Wallet not connected or contract not initialized");
      console.error("Wallet not connected or contract not initialized");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Preparing to send maintain transaction...");

      const adminAddress = Address.parse(ADMIN_ADDRESS);
      
      console.log("Admin address:", adminAddress.toString());
      console.log("Admin address type:", typeof adminAddress);
      console.log("Admin address instanceof Address:", adminAddress instanceof Address);

      // Проверяем, что sendMaintain это функция
      if (typeof data.sendMaintain !== 'function') {
        throw new Error("sendMaintain is not a function");
      }

      // Вызываем sendMaintain с правильными аргументами
      const result = await data.sendMaintain(ADMIN_ADDRESS);
      console.log("Maintain transaction result:", result);

      // Ждем немного перед обновлением данных
      await new Promise(resolve => setTimeout(resolve, 5000));

      console.log("Updating data...");
      const newData = await getDynamicData();
      console.log("New data:", newData);
      setData(newData);
    } catch (err: unknown) {
      console.error("Error sending maintain transaction:", err);
      if (err instanceof Error) {
        setError(`Failed to send maintain transaction: ${err.message}`);
      } else {
        setError("An unknown error occurred while sending the maintain transaction");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="CoinToss">
      <FlexBoxCol>
        <h3>CoinToss Contract</h3>
        <FlexBoxRow>
          Wallet
          <Ellipsis>{wallet ? Address.parse(wallet as string).toString() : "Not connected"}</Ellipsis>
        </FlexBoxRow>
        <FlexBoxRow>
          Network
          <div>{network || "Not connected"}</div>
        </FlexBoxRow>
        <FlexBoxRow>
          Contract Address
          <CopyAddress address={CONTRACT_ADDRESS} />
        </FlexBoxRow>
        <FlexBoxRow>
          Available Balance
          <div>{data?.available_balance ?? "Loading..."}</div>
        </FlexBoxRow>
        <FlexBoxRow>
          Service Balance
          <div>{data?.service_balance ?? "Loading..."}</div>
        </FlexBoxRow>
        <FlexBoxRow>
          Last Number
          <div>{data?.last_number ?? "Loading..."}</div>
        </FlexBoxRow>
        <Button
          disabled={!connected || network !== CHAIN.TESTNET || isLoading}
          onClick={handleSendTon}>
          {isLoading ? "Flipping..." : "Flip Coin"}
        </Button>
        <Button
          disabled={!connected || network !== CHAIN.TESTNET || isLoading}
          onClick={handleSendMaintain}>
          {isLoading ? "Withdrawing..." : "Withdraw Balance (Admin)"}
        </Button>
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </FlexBoxCol>
    </Card>
  );
}