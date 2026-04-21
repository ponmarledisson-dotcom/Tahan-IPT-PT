export default function Hero() {
  return (
    <section className="bg-[#5c3d2e] py-16 px-8 text-center">
      <h2 className="text-4xl font-bold text-white mb-2">
        Find Your Perfect Room
      </h2>
      <p className="text-white mb-8">
        Affordable and comfortable rooms for everyone
      </p>
      <div className="text-white flex justify-center items-center gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search rooms..."
          className="text-white px-4 py-2 border border-gray-300 rounded-lg text-base w-72 focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <button className="px-5 py-2 border-2 border-white rounded-lg font-bold hover:bg-[#5c3d2e] hover:text-white transition">
          All
        </button>
        <button className="px-5 py-2 border-2 border-white rounded-lg font-bold hover:bg-[#5c3d2e] hover:text-white transition">
          Bedspacer
        </button>
        <button className="px-5 py-2 border-2 border-white rounded-lg font-bold hover:bg-[#5c3d2e] hover:text-white transition">
          Private
        </button>
      </div>
    </section>
  );
}
