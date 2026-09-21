import { useEffect, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { usePressStore } from "@/lib/pressroom/store";

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    void Promise.resolve(usePressStore.persist.rehydrate()).then(() => {
      usePressStore.getState().markHydrated();
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200}>
        {children}
        <Toaster position="bottom-center" richColors={false} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
