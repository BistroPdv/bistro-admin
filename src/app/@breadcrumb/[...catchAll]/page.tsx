import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";

type Props = {
  params: {
    catchAll: string[];
  };
};
export default function BreadcrumbsSlot({ params: { catchAll } }: Props) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          {catchAll.map((cat) => {
            console.log(cat);
            return (
              <BreadcrumbLink href="/">
                <span className="sr-only">{cat}</span>
              </BreadcrumbLink>
            );
          })}
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
