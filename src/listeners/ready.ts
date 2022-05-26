import { Events, Listener, Store, type ListenerOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { blue, gray, green, magenta, magentaBright, white, yellow, cyan } from 'colorette';
import { capitalize } from '#lib/utils/capitalize';
import { pluralise } from '#lib/utils/pluralise';

const dev = process.env.NODE_ENV !== 'production';

@ApplyOptions<ListenerOptions>({
	event: Events.ClientReady,
	once: true
})
export class ReadyEvent extends Listener {
	private readonly style = dev ? yellow : blue;

	public async run() {
		this.printBanner();
		this.printStoreDebugInformation();
		this.container.client.logger.info(`Logged in as ${green(this.container.client.user?.username!)}.`);
		await this.runTasks();
	}

	public async runTasks() {
		for (const task of this.container.stores.get('tasks').values()) {
			await task.run();
		}
	}

	private printBanner() {

		const llc = dev ? magentaBright : white;
		const blc = dev ? magenta : blue;

		console.log(
			String.raw`
${cyan('Version:')} ${blc((this.container.package.version!))}
${dev ? `${blc('<')}${llc('/')}${blc('>')} ${llc('DEVELOPMENT MODE')}` : 'PRODUCTION MODE'}
		`.trim()
		);
	}

	private printStoreDebugInformation() {
		const { client, logger } = this.container;
		const stores = [...client.stores.values()]
		.filter(val => val.size !== 0)
		.sort((a, b) => a.size - b.size);

		const first = stores.shift()!;
		const last = stores.pop()!;

		logger.info(this.styleStore(first, true, false));
		for (const store of stores) logger.info(this.styleStore(store, false, false));
		logger.info(this.styleStore(last, false, true));
	}

	private styleStore(store: Store<any>, start: boolean, last: boolean) {
		return gray(`${start ? '┌─' : last ? '└─' : '├─'} Loaded ${this.style(store.size.toString().padEnd(3, ' '))} ${magentaBright(capitalize(pluralise(store.name.slice(0, -1), store.size)))}.`);
	}
}
