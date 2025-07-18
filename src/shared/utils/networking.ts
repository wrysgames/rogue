import { Networking } from "@flamework/networking";

interface ClientToServerFunctions {
	function(param1: string): number;
}

interface ServerToClientFunctions {
	function(param1: string): number;
}

export const GlobalFunctions = Networking.createFunction<ClientToServerFunctions, ServerToClientFunctions>();

export const ServerFunctions = GlobalFunctions.createServer({ /* server config */ });
export const ClientFunctions = GlobalFunctions.createClient({ /* client config */ });