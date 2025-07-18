import { Networking } from '@flamework/networking';

interface ClientToServerFunctions {
	function(param1: string): number;
}

interface ServerToClientFunctions {
	function(param1: string): number;
}

export const GlobalFunctions = Networking.createFunction<ClientToServerFunctions, ServerToClientFunctions>();
