import { serve } from "inngest/next";
import { inngest, syncUsersCreation, syncUsersUpdate, syncUsersDeletion } from "@/config/inngest";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    syncUsersCreation,
    syncUsersUpdate,
    syncUsersDeletion
  ],
});
