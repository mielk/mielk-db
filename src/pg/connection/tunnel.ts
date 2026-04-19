import { createTunnel, TunnelOptions, ForwardOptions, SshOptions, ServerOptions } from 'tunnel-ssh';
import { AddressInfo } from 'net';
import { Msg } from '../../internal/messaging/messageTags.js';

const tunnelOptions: TunnelOptions = {
	autoClose: true,
	reconnectOnError: true,
};

const serverOptions: ServerOptions = {};

export async function openSshTunnel(sshOptions: SshOptions, dstPort: number): Promise<number> {
	try {
		const forwardOptions: ForwardOptions = { dstPort };
		const [server] = await createTunnel(tunnelOptions, serverOptions, sshOptions, forwardOptions);
		const port: number = (server.address() as AddressInfo).port;
		return port;
	} catch (err) {
		console.error(Msg.ssh.tunnelFailed, err);
		throw err;
	}
}
