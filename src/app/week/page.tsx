import { PixelShifter } from "@/components/PixelShifter";
// FIX: Import 'Clock', not 'ClockWidget'
import { Clock } from "@/components/ClockWidget"; 
import { WeekGrid } from "@/components/WeekGrid";

export default function WeekPage() {
  return (
    <PixelShifter>
      <div className="p-8 text-white">
        <div className="mb-8">
           {/* FIX: Use <Clock /> here */}
           <Clock />
        </div>
        <WeekGrid />
      </div>
    </PixelShifter>
  );
}