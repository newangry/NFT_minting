"use client"
import Landing from "@/components/Landing";
import styles from "./page.module.css";
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';

export default function Home() {
  return (
    <MantineProvider >
      <Notifications />
      <ModalsProvider>
        <Landing />
      </ModalsProvider>
    </MantineProvider>
  );
}
