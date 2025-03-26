import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bistro Admin - Dashboard",
};

import ContactsTable from "@/components/contacts-table";

export default function Page() {
  return <ContactsTable />;
}
