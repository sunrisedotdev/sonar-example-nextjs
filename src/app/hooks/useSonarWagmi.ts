import { useAccount } from "wagmi";
import {
  ConnectionState,
  type UseSonarEntityResult,
  useSonarEntity,
} from "./useSonarEntity";

export { ConnectionState };

export function useSonarWagmi(args: {
  saleUUID: string;
}): UseSonarEntityResult {
  const { address, isConnected } = useAccount();

  return useSonarEntity({
    saleUUID: args.saleUUID,
    wallet: { address, isConnected },
  });
}
