import { Suspense } from "react";
import RoomDetailsClient from "./Roomdetailsclient";

export default async function RoomDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-[#5c3d2e]">
          Loading...
        </div>
      }
    >
      <RoomDetailsClient roomId={id} />
    </Suspense>
  );
}
