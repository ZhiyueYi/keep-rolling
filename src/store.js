import { writable } from 'svelte/store';

export const settings = writable({
  rollingItems: [
    {
      label: '1st Prize',
      probability: 10,
    },
    {
      label: '2nd Prize',
      probability: 20,
    },
    {
      label: '3rd Prize',
      probability: 30,
    },
    {
      label: 'Thank You',
      probability: 40,
    },
  ],
});

export const rolling = writable(false);

export const activeItem = writable(0);
