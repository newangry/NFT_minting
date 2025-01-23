"use client"
import Landing from "@/components/Landing";
import styles from "./page.module.css";
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { useEffect, useState } from "react";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  useEffect(() => {
    setIsLoaded(true);
  }, [])
  return (
    <MantineProvider >
      <Notifications />
      <ModalsProvider>
        {
          isLoaded && <Landing />
        }
      </ModalsProvider>
    </MantineProvider>
  );
}
