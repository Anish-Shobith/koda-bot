import { SapphireClient, LogLevel } from '@sapphire/framework';
import { ClientOptions, User, Team } from 'discord.js';
import { isNullOrUndefined } from '@sapphire/utilities';
import {  envParseString } from '#env/parser';
import { TaskStore } from './task/TaskStore';

export class KodaClient extends SapphireClient {
	public tasks: TaskStore;
	public constructor(options: ClientOptions) {
		super({
			defaultPrefix: envParseString('PREFIX', process.env.PREFIX) || 'k!',
			regexPrefix: new RegExp(`^((hey|yo|howdy|sup|hi) +)?${envParseString('BOT_NAME', process.env.BOT_NAME) || 'BOT'}[,! ]`, 'i'),
			caseInsensitiveCommands: true,
			loadMessageCommandListeners: true,
			logger: {
				level: LogLevel.Debug
			},
			hmr: {
				enabled: process.env.NODE_ENV !== 'production',
				silent: true

			},
			...options
		});
		this.tasks = new TaskStore();
		this.stores.register(this.tasks);

	}


	public override async destroy() {
		this.logger.warn('Destroying client in 5 seconds...');
		super.destroy();
		setTimeout(() => {
			this.logger.info('Destroyed Client.');
			process.exit(0);
		}, 5000);
	}


  /**
   * The owner user of this client.
   */
   public override get owner(): User | null {
    return this.isReady() && !isNullOrUndefined(this.application.owner)
      ? this.application.owner instanceof Team
        ? !isNullOrUndefined(this.application.owner.owner)
          ? this.users.resolve(this.application.owner.owner.id)
          : null
        : this.users.resolve(this.application.owner.id)
      : null;
  }
}

declare module '@sapphire/framework' {
	interface StoreRegistryEntries {
	  tasks: TaskStore;
	}
}

declare module 'discord.js' {
	interface Client<Ready extends boolean = boolean> {
	  readonly owner: If<Ready, User>;
	}

	interface ClientOptions {
		botName?: string;
	}
}

