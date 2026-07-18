import DashboardWrapper from "../dashboardWrapper";

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardWrapper>{children}</DashboardWrapper>;
}
