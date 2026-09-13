import { WelcomeHeader } from "@/components/WelcomeHeader";
import { QuoteSection } from "@/components/QuoteSection";
import { WeatherCard } from "@/components/WeatherCard";
import { SecondaryClockWeather } from "@/components/SecondaryClockWeather";
import { TertiaryWeather } from "@/components/TertiaryWeather";
import { EventsCarousel } from "@/components/EventsCarousel";
import { FamilyGoals } from "@/components/FamilyGoals";
import { UpcomingEvents } from "@/components/UpcomingEvents";
import { MonthlyCalendar } from "@/components/MonthlyCalendar";
import { TodoList } from "@/components/TodoList";
import { Celebrations } from "@/components/Celebrations";
import { TripPlanner } from "@/components/TripPlanner";
import { getFamilyGoals, getQuotes } from "@/lib/sheets";
import { getAnniversaries, getTrips, getUpcomingEvents } from "@/lib/google";
import { readConfig } from "@/lib/config";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const config = readConfig();
  const {
    primaryLocation,
    secondaryLocation,
    tertiaryLocation,
    events: eventsConfig,
    familyGoals: familyGoalsConfig,
    display: displayConfig,
  } = config;

  const [goals, anniversaries, trips, events, quotes] = await Promise.all([
    getFamilyGoals(),
    getAnniversaries(),
    getTrips(),
    getUpcomingEvents(displayConfig.upcomingEventsCount),
    getQuotes()
  ]);

  return (
    <main className="min-h-screen flex flex-col p-8 pb-20">
      <div className="max-w-[1600px] mx-auto w-full flex flex-col flex-1">

        {/* Header Section */}
        <div className="mb-8 flex flex-col items-center gap-6">
          <WelcomeHeader
            lat={primaryLocation.lat}
            lon={primaryLocation.lon}
            timezone={primaryLocation.timezone}
          />
          <div className="w-full">
            <QuoteSection items={quotes} />
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Column 1 */}
          <div className="space-y-6">
            <WeatherCard
              lat={primaryLocation.lat}
              lon={primaryLocation.lon}
              timezone={primaryLocation.timezone}
              cityName={primaryLocation.name}
            />
            {tertiaryLocation.enabled && (
              <TertiaryWeather
                lat={tertiaryLocation.lat}
                lon={tertiaryLocation.lon}
                timezone={tertiaryLocation.timezone}
                cityName={tertiaryLocation.name}
              />
            )}
            {secondaryLocation.enabled && (
              <SecondaryClockWeather
                lat={secondaryLocation.lat}
                lon={secondaryLocation.lon}
                timezone={secondaryLocation.timezone}
                cityName={secondaryLocation.name}
              />
            )}
          </div>

          {/* Column 2 */}
          <div className="space-y-6">
            {familyGoalsConfig.enabled && <FamilyGoals items={goals} />}
            <TripPlanner items={trips} />
            <TodoList />
          </div>

          {/* Column 3 */}
          <div className="space-y-6">
            <MonthlyCalendar events={events} celebrations={anniversaries} trips={trips} />
            <UpcomingEvents items={events} limit={displayConfig.upcomingEventsCount} />
            <Celebrations items={anniversaries} limit={displayConfig.celebrationsCount} />
          </div>

        </div>

        {/* Events Carousel — full width, vertically centered in remaining space */}
        {eventsConfig.enabled && (
          <div className="flex-1 flex items-center py-4">
            <div className="w-full">
              <EventsCarousel />
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
