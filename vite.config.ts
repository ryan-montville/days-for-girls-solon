import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        createNewEvent: resolve(__dirname, 'create-new-event.html'),
        distributedInventory: resolve(__dirname, 'distributed-inventory.html'),
        donate: resolve(__dirname, 'donate.html'),
        donatedInventory: resolve(__dirname, 'donated-inventory.html'),
        eventSignUp: resolve(__dirname, 'event-sign-up.html'),
        events: resolve(__dirname, 'events.html'),
        inventory: resolve(__dirname, 'inventory.html'),
        mailingList: resolve(__dirname, 'mailing-list.html'),
        manageEvent: resolve(__dirname, 'manage-event.html'),
      },
    },
  },
});