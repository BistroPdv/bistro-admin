import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { RiDashboard2Line } from "@remixicon/react";
import Link from "next/link";
import React from "react";

type Props = {
  params: {
    catchAll?: string[];
  };
};

export default async function BreadcrumbsSlot({ params }: Props) {
  const resolvedParams = await Promise.resolve(params);
  const segments = resolvedParams.catchAll || [];
  const paths = segments.map((segment, index) => {
    const path = segments.slice(0, index + 1);
    return {
      href: `/${path.join("/")}`,
      label:
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
    };
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">
              <RiDashboard2Line className="h-4 w-4" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {paths.length > 0 && (
          <>
            {paths.map(({ href, label }) => (
              <React.Fragment key={href}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={href}>{label}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
