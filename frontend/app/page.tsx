import Hero from "./components/hero";
import Navbar from "./components/navbar";
import RoomListings from "./components/roomlist";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <RoomListings />
    </main>
  );
}
