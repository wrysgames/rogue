import { Networking } from '@flamework/networking';

interface ClientToServerEvents {
	hitHumanoid(humanoid: Humanoid): void;
}

interface ServerToClientEvents {
	event(param1: string): void;
}

// Returns an object containing a `server` and `client` field.
export const GlobalEvents = Networking.createEvent<ClientToServerEvents, ServerToClientEvents>();
