interface ServiceWorkerRegistration {
  sync: {
    register: (tag: string) => Promise<void>;
    unregister: (tag: string) => Promise<void>;
  };
  periodicSync: {
    register: (tag: string, options: { minInterval: number }) => Promise<void>;
    unregister: (tag: string) => Promise<void>;
  };
}
