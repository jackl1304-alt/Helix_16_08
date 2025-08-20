import { DraggableDashboard } from "@/components/customer/draggable-dashboard";
import { CustomerLayout } from "@/components/customer/customer-layout";

export default function CustomerArea() {
  return (
    <CustomerLayout>
      <DraggableDashboard />
    </CustomerLayout>
  );
}